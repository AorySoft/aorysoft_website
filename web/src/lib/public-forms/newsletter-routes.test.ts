// Route-handler tests for the newsletter double opt-in flows (plan §212).
//
// These exercise the PUBLIC GET routes opened from the confirmation email:
//   /newsletter/confirm?token=...
//   /newsletter/unsubscribe?token=...
//
// The token signing/verification is the REAL implementation (a genuine HMAC
// round-trip); only the database is mocked, as a small stateful store, so the
// full lifecycle is asserted: pending → confirmed (consent recorded) →
// unsubscribed, plus idempotency and the invalid/forged-token cases that must
// not become a subscriber-enumeration oracle.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { signToken } from "./tokens";
import { GET as confirm } from "@/app/newsletter/confirm/route";
import { GET as unsubscribe } from "@/app/newsletter/unsubscribe/route";

// A tiny in-memory stand-in for newsletter_subscribers, supporting the exact
// query shapes token-page.ts issues: select().eq().maybeSingle() and
// update().eq().
type Row = { id: string; status: string; consent_at?: string | null };

const db = new Map<string, Row>();

vi.mock("@/lib/supabase/admin", () => ({
  isSupabaseConfigured: () => true,
  isPublicSupabaseConfigured: () => true,
  getServiceClient: () => ({
    from: (table: string) => {
      if (table !== "newsletter_subscribers") throw new Error(`unexpected table ${table}`);
      return {
        select: () => ({
          eq: (_col: string, id: string) => ({
            maybeSingle: async () => ({ data: db.get(id) ?? null, error: null }),
          }),
        }),
        update: (patch: Partial<Row>) => ({
          eq: (_col: string, id: string) => {
            const row = db.get(id);
            if (row) Object.assign(row, patch);
            return Promise.resolve({ error: null });
          },
        }),
      };
    },
  }),
}));

function request(path: string, token: string | null): Request {
  const url = `http://localhost${path}${token === null ? "" : `?token=${encodeURIComponent(token)}`}`;
  return new Request(url);
}

beforeEach(() => {
  db.clear();
});

describe("newsletter/confirm", () => {
  it("confirms a pending subscriber and records consent", async () => {
    db.set("sub-1", { id: "sub-1", status: "pending", consent_at: null });
    const res = await confirm(request("/newsletter/confirm", signToken("sub-1")));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const html = await res.text();
    expect(html).toMatch(/confirmed/i);
    expect(db.get("sub-1")!.status).toBe("confirmed");
    expect(db.get("sub-1")!.consent_at).toBeTruthy();
  });

  it("is idempotent — a second confirm returns the same success", async () => {
    db.set("sub-2", { id: "sub-2", status: "pending", consent_at: null });
    const token = signToken("sub-2");
    await confirm(request("/newsletter/confirm", token));
    const again = await confirm(request("/newsletter/confirm", token));
    expect(again.status).toBe(200);
    expect(await again.text()).toMatch(/confirmed/i);
    expect(db.get("sub-2")!.status).toBe("confirmed");
  });

  it("lets an unsubscribed user re-subscribe (change of mind)", async () => {
    db.set("sub-3", { id: "sub-3", status: "unsubscribed" });
    await confirm(request("/newsletter/confirm", signToken("sub-3")));
    expect(db.get("sub-3")!.status).toBe("confirmed");
  });

  it("rejects a forged/tampered token without touching the database", async () => {
    db.set("sub-4", { id: "sub-4", status: "pending" });
    const forged = "sub-4.AAAAforgedAAAA";
    const res = await confirm(request("/newsletter/confirm", forged));
    expect(res.status).toBe(200);
    expect(await res.text()).toMatch(/not valid/i);
    // Unchanged: the row is still pending, proving no write happened.
    expect(db.get("sub-4")!.status).toBe("pending");
  });

  it("rejects a missing token", async () => {
    const res = await confirm(request("/newsletter/confirm", null));
    expect(await res.text()).toMatch(/not valid/i);
  });

  it("treats a deleted row as invalid (no enumeration signal)", async () => {
    // Token verifies for a real-looking id, but no row exists.
    const res = await confirm(request("/newsletter/confirm", signToken("ghost-id")));
    expect(await res.text()).toMatch(/not valid/i);
  });
});

describe("newsletter/unsubscribe", () => {
  it("unsubscribes a confirmed subscriber", async () => {
    db.set("sub-5", { id: "sub-5", status: "confirmed", consent_at: "2026-01-01" });
    const res = await unsubscribe(request("/newsletter/unsubscribe", signToken("sub-5")));
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.text()).toMatch(/unsubscribed/i);
    expect(db.get("sub-5")!.status).toBe("unsubscribed");
    // Consent timestamp is preserved on unsubscribe (audit trail).
    expect(db.get("sub-5")!.consent_at).toBe("2026-01-01");
  });

  it("is idempotent — repeat unsubscribe stays unsubscribed", async () => {
    db.set("sub-6", { id: "sub-6", status: "confirmed" });
    const token = signToken("sub-6");
    await unsubscribe(request("/newsletter/unsubscribe", token));
    const again = await unsubscribe(request("/newsletter/unsubscribe", token));
    expect(again.status).toBe(200);
    expect(db.get("sub-6")!.status).toBe("unsubscribed");
  });

  it("rejects a forged token", async () => {
    db.set("sub-7", { id: "sub-7", status: "confirmed" });
    const res = await unsubscribe(request("/newsletter/unsubscribe", "sub-7.forged"));
    expect(await res.text()).toMatch(/not valid/i);
    expect(db.get("sub-7")!.status).toBe("confirmed");
  });
});
