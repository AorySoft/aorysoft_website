// submitReview (invite-only feedback form): honeypot + guard behaviour.
// Supabase, the invite loader, email, and Next primitives are stubbed.
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const state = {
    attempts: 0,
    inserted: [] as { table: string; row: Record<string, unknown> }[],
    inviteOk: true,
  };
  const client = {
    from(table: string) {
      return {
        insert(row: Record<string, unknown>) {
          state.attempts += 1;
          state.inserted.push({ table, row });
          return {
            select: () => ({
              single: () => Promise.resolve({ data: { id: "rev-1" }, error: null }),
            }),
          };
        },
        update() {
          return { eq: () => ({ eq: () => Promise.resolve({ error: null }) }) };
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
vi.mock("./review-invites", () => ({
  loadOpenInvite: async () =>
    h.state.inviteOk
      ? { ok: true, invite: { id: "inv-1", project_or_service: null } }
      : { ok: false, reason: "invalid" },
}));
vi.mock("./email", () => ({
  isEmailConfigured: () => false,
  escapeHtml: (value: unknown) => String(value ?? ""),
  sendContactNotification: vi.fn(),
  sendQuoteNotification: vi.fn(),
  sendNewsletterConfirmation: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.77" : null),
  }),
}));

import { submitReview } from "./actions";
import { idleFormState } from "./state";
import { resetRateLimits } from "./rate-limit";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const reviewFields = {
  inviteToken: "signed-token",
  displayName: "Ada Lovelace",
  email: "ada@example.com",
  reviewText: "Clear communication and a solid delivery.",
  rating: "5",
  consent: "yes",
};

beforeEach(() => {
  h.state.attempts = 0;
  h.state.inserted = [];
  h.state.inviteOk = true;
  resetRateLimits();
});

describe("submitReview honeypot", () => {
  it("rejects a honeypot-filled submission without writing", async () => {
    const result = await submitReview(
      idleFormState,
      form({ ...reviewFields, website: "http://spam.example" }),
    );

    // Same quiet "success" as the other forms so bots learn nothing.
    expect(result.status).toBe("success");
    expect(h.state.attempts).toBe(0);
    expect(h.state.inserted).toHaveLength(0);
  });

  it("accepts a clean submission as a pending, unpermitted review", async () => {
    const result = await submitReview(idleFormState, form(reviewFields));

    expect(result.status).toBe("success");
    expect(h.state.inserted).toHaveLength(1);
    expect(h.state.inserted[0].table).toBe("reviews");
    expect(h.state.inserted[0].row).toMatchObject({
      status: "pending",
      permission_confirmed: false,
    });
  });

  it("rejects an invalid invite before any write", async () => {
    h.state.inviteOk = false;
    const result = await submitReview(idleFormState, form(reviewFields));
    expect(result.status).toBe("error");
    expect(h.state.attempts).toBe(0);
  });
});
