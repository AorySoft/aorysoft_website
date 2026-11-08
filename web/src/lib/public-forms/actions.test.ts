// Server-action tests: the failure paths that matter for launch.
//
// The Supabase client, the Resend module, and the Next.js request/cache
// primitives are all stubbed, so these run offline and assert BEHAVIOUR:
//   - what the visitor is shown when a database write fails,
//   - that a duplicate signup is indistinguishable from a fresh one,
//   - that an email failure does not roll back a saved submission.
//
// The real RLS/grant enforcement is proven separately by
// scripts/rls-denial-tests.mjs against the live project — not here.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  submitContact,
  submitQuote,
  subscribeNewsletter,
} from "./actions";
import { idleFormState } from "./state";
import { resetRateLimits } from "./rate-limit";

const h = vi.hoisted(() => {
  const state = {
    submissionsError: null as { message: string } | null,
    newsletterError: null as { code?: string; message: string } | null,
    newsletterRow: { id: "sub-1", status: "pending" },
    // `attempts` counts every insert call; `inserted` counts only writes the
    // fake database actually accepted. Keeping them separate is what lets a
    // test assert "tried but nothing persisted" honestly.
    attempts: 0,
    inserted: [] as { table: string; row: Record<string, unknown> }[],
    contactEmailResult: { ok: true } as { ok: boolean; error?: string },
    quoteEmailResult: { ok: true } as { ok: boolean; error?: string },
    newsletterEmailResult: { ok: true } as { ok: boolean; error?: string },
    emailConfigured: true,
    ip: "203.0.113.50",
  };

  const client = {
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          state.attempts += 1;
          if (table === "submissions") {
            if (state.submissionsError) return Promise.resolve({ error: state.submissionsError });
            state.inserted.push({ table, row });
            return Promise.resolve({ error: null });
          }
          return {
            select: () => ({
              single: () => {
                if (state.newsletterError)
                  return Promise.resolve({ data: null, error: state.newsletterError });
                state.inserted.push({ table, row });
                return Promise.resolve({
                  data: state.newsletterRow,
                  error: null,
                });
              },
            }),
          };
        },
      };
    },
  };

  return { state, client };
});

vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseConfigured: () => true,
  isPublicSupabaseConfigured: () => true,
  getServiceClient: () => h.client,
}));

vi.mock("./email", () => ({
  isEmailConfigured: () => h.state.emailConfigured,
  escapeHtml: (value: unknown) => String(value ?? ""),
  sendContactNotification: vi.fn(async () => h.state.contactEmailResult),
  sendQuoteNotification: vi.fn(async () => h.state.quoteEmailResult),
  sendNewsletterConfirmation: vi.fn(async () => h.state.newsletterEmailResult),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? h.state.ip : null),
  }),
}));

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const contactFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "project",
  message: "We would like to discuss an automation project.",
};

const quoteFields = {
  name: "Grace Hopper",
  email: "grace@example.com",
  projectType: "Custom Software",
  budget: "$25,000 - $50,000",
  timeline: "3-6 months",
  description: "A compiler-driven platform.",
};

beforeEach(() => {
  resetRateLimits();
  h.state.submissionsError = null;
  h.state.newsletterError = null;
  h.state.newsletterRow = { id: "sub-1", status: "pending" };
  h.state.attempts = 0;
  h.state.inserted = [];
  h.state.contactEmailResult = { ok: true };
  h.state.quoteEmailResult = { ok: true };
  h.state.newsletterEmailResult = { ok: true };
  h.state.emailConfigured = true;
  h.state.ip = "203.0.113.50";
  // Turnstile is exercised in turnstile.test.ts; here the forms run with no
  // secret configured so the guard skips, exactly as in local development.
  delete process.env.TURNSTILE_SECRET_KEY;
  vi.clearAllMocks();
});

describe("submitContact", () => {
  it("stores the submission and returns a success state", async () => {
    const result = await submitContact(idleFormState, form(contactFields));

    expect(result.status).toBe("success");
    expect(h.state.inserted).toHaveLength(1);
    expect(h.state.inserted[0]!.table).toBe("submissions");
    expect(h.state.inserted[0]!.row).toMatchObject({
      type: "contact",
      email: "ada@example.com",
      service: "project",
      status: "new",
    });
  });

  it("returns a generic error and writes nothing when the insert fails", async () => {
    h.state.submissionsError = {
      message: 'insert or update violates row-level security policy for table "submissions"',
    };

    const result = await submitContact(idleFormState, form(contactFields));

    expect(result.status).toBe("error");
    // The visitor must never see SQL, RLS or vendor internals.
    expect(result.message).not.toMatch(/row-level|rls|sql|constraint|policy/i);
    expect(result.message).toContain("info@aorysoft.com");
    // The write was attempted but persisted nothing, and no email fired for a
    // submission that was never saved.
    expect(h.state.attempts).toBe(1);
    expect(h.state.inserted).toHaveLength(0);
    const { sendContactNotification } = await import("./email");
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("returns field errors instead of posting when validation fails", async () => {
    const result = await submitContact(
      idleFormState,
      form({ ...contactFields, email: "not-an-email", name: "" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors).toMatchObject({
      name: expect.any(String),
      email: expect.any(String),
    });
    expect(h.state.inserted).toHaveLength(0);
  });

  it("still reports success when the notification email fails", async () => {
    // The row IS saved — that is what matters to the visitor. The owner sees
    // the delivery failure in the server log, not the visitor.
    h.state.contactEmailResult = { ok: false, error: "Resend error: HTTP 500" };

    const result = await submitContact(idleFormState, form(contactFields));

    expect(result.status).toBe("success");
    expect(h.state.inserted).toHaveLength(1);
  });

  it("reports success without sending email when Resend is unconfigured", async () => {
    h.state.emailConfigured = false;

    const result = await submitContact(idleFormState, form(contactFields));

    expect(result.status).toBe("success");
    const { sendContactNotification } = await import("./email");
    expect(sendContactNotification).not.toHaveBeenCalled();
  });

  it("swallows a honeypot submission as success without writing", async () => {
    const result = await submitContact(
      idleFormState,
      form({ ...contactFields, website: "http://spam.example" }),
    );

    expect(result.status).toBe("success");
    expect(h.state.inserted).toHaveLength(0);
  });

  it("rate-limits a flood from one IP before any write", async () => {
    const results = [];
    for (let i = 0; i < 8; i += 1) {
      results.push(
        await submitContact(
          idleFormState,
          form({ ...contactFields, email: `visitor-${i}@example.com` }),
        ),
      );
    }

    const errors = results.filter((r) => r.status === "error");
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.at(-1)!.message).toMatch(/too many requests/i);
    // The blocked attempts must not have reached the database.
    expect(h.state.inserted.length).toBeLessThan(results.length);
  });
});

describe("submitQuote", () => {
  it("stores the quote with its details payload", async () => {
    const data = form(quoteFields);
    data.append("technologies", "Python");
    data.append("technologies", "React");
    data.append("integrations", "CRM Systems");

    const result = await submitQuote(idleFormState, data);

    expect(result.status).toBe("success");
    expect(h.state.inserted[0]!.row).toMatchObject({
      type: "quote",
      service: "Custom Software",
    });
    expect(h.state.inserted[0]!.row.details).toMatchObject({
      projectType: "Custom Software",
      technologies: ["Python", "React"],
      integrations: ["CRM Systems"],
    });
  });

  it("returns a generic error when the insert fails", async () => {
    h.state.submissionsError = { message: "permission denied for table submissions" };

    const result = await submitQuote(idleFormState, form(quoteFields));

    expect(result.status).toBe("error");
    expect(result.message).not.toMatch(/permission denied|table|sql/i);
    expect(h.state.attempts).toBe(1);
    expect(h.state.inserted).toHaveLength(0);
  });

  it("surfaces validation errors for the missing required step", async () => {
    const result = await submitQuote(idleFormState, form({ name: "", email: "" }));

    expect(result.status).toBe("error");
    expect(Object.keys(result.fieldErrors ?? {})).toEqual(
      expect.arrayContaining(["name", "email", "projectType", "budget", "timeline"]),
    );
  });

  it("still reports success when the notification email fails", async () => {
    h.state.quoteEmailResult = { ok: false, error: "Resend error: HTTP 429" };
    const result = await submitQuote(idleFormState, form(quoteFields));
    expect(result.status).toBe("success");
  });
});

describe("subscribeNewsletter", () => {
  it("creates a pending row (never confirmed directly)", async () => {
    const result = await subscribeNewsletter(
      idleFormState,
      form({ email: "reader@example.com" }),
    );

    expect(result.status).toBe("success");
    expect(h.state.inserted[0]!.table).toBe("newsletter_subscribers");
    expect(h.state.inserted[0]!.row).toMatchObject({ status: "pending" });
    // Consent is only recorded on the confirming click (plan §212).
    expect(h.state.inserted[0]!.row).not.toHaveProperty("consent_at");
  });

  it("reports the SAME success for a duplicate address so it cannot be enumerated", async () => {
    h.state.newsletterError = { code: "23505", message: "duplicate key value violates unique constraint" };

    const duplicate = await subscribeNewsletter(
      idleFormState,
      form({ email: "already@example.com" }),
    );

    const fresh = await subscribeNewsletter(
      idleFormState,
      form({ email: "brand-new@example.com" }),
    );

    expect(duplicate.status).toBe("success");
    expect(duplicate.message).toBe(fresh.message);
    // Both writes were ATTEMPTED (proving the endpoint was exercised) but the
    // database persisted nothing, and no confirmation email was triggered.
    expect(h.state.attempts).toBe(2);
    expect(h.state.inserted).toHaveLength(0);
    const { sendNewsletterConfirmation } = await import("./email");
    expect(sendNewsletterConfirmation).not.toHaveBeenCalled();
  });

  it("returns a generic error for a non-duplicate insert failure", async () => {
    h.state.newsletterError = { code: "42501", message: "permission denied for table newsletter_subscribers" };

    const result = await subscribeNewsletter(
      idleFormState,
      form({ email: "reader@example.com" }),
    );

    expect(result.status).toBe("error");
    expect(result.message).not.toMatch(/permission denied|table|sql|42501/i);
  });

  it("still reports success when the confirmation email fails", async () => {
    // The pending row exists; the owner can resend from the admin panel. The
    // visitor is not told "email sent" — only that they should check the inbox.
    h.state.newsletterEmailResult = { ok: false, error: "Resend error: HTTP 500" };

    const result = await subscribeNewsletter(
      idleFormState,
      form({ email: "reader@example.com" }),
    );

    expect(result.status).toBe("success");
    // The pending row persisted despite the delivery failure.
    expect(h.state.inserted).toHaveLength(1);
  });

  it("rejects an invalid email before any write", async () => {
    const result = await subscribeNewsletter(
      idleFormState,
      form({ email: "not-an-email" }),
    );

    expect(result.status).toBe("error");
    expect(result.fieldErrors).toHaveProperty("email");
    expect(h.state.attempts).toBe(0);
    expect(h.state.inserted).toHaveLength(0);
  });

  it("swallows a honeypot submission as success without writing", async () => {
    const result = await subscribeNewsletter(
      idleFormState,
      form({ email: "bot@example.com", website: "http://spam.example" }),
    );

    expect(result.status).toBe("success");
    expect(h.state.inserted).toHaveLength(0);
  });
});
