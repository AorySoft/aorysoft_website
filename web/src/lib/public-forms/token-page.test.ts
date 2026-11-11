import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({ getServiceClient: () => null }));

import { INVALID, page } from "./token-page";

describe("token page", () => {
  it("carries the official brand lockup linking home", async () => {
    const html = await page(INVALID).text();
    expect(html).toContain('<a class="brand" href="/" aria-label="AorySoft home">');
    expect(html).toContain("<svg");
    expect(html).toContain("<span>AorySoft</span>");
    expect(html).toContain(INVALID.heading);
  });

  it("stays a no-store, script-free document", async () => {
    const res = page({ ok: true, heading: "Subscription confirmed", body: "Thanks." });
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.text()).not.toContain("<script");
  });
});
