import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  escapeHtml,
  isEmailConfigured,
  sendContactNotification,
  sendNewsletterConfirmation,
} from "./email";

const KEYS = ["RESEND_API_KEY", "TO_EMAIL", "FROM_EMAIL"] as const;
const saved: Record<string, string | undefined> = {};

function setEnv(values: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
}

const CONFIGURED = {
  RESEND_API_KEY: "re_test_key",
  TO_EMAIL: "inbox@example.com",
  FROM_EMAIL: "site@example.com",
};

describe("email module", () => {
  beforeEach(() => {
    for (const key of KEYS) saved[key] = process.env[key];
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    setEnv(saved as Record<string, string | undefined>);
    vi.unstubAllGlobals();
  });

  describe("isEmailConfigured", () => {
    it("is false while the keys are empty", () => {
      setEnv({});
      expect(isEmailConfigured()).toBe(false);
    });

    it("requires the API key, recipient and sender", () => {
      setEnv(CONFIGURED);
      expect(isEmailConfigured()).toBe(true);
      setEnv({ ...CONFIGURED, RESEND_API_KEY: undefined });
      expect(isEmailConfigured()).toBe(false);
    });
  });

  describe("escapeHtml", () => {
    it("neutralises tag and attribute breakouts", () => {
      expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
        "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
      );
      expect(escapeHtml(`it's & <b>`)).toBe("it&#39;s &amp; &lt;b&gt;");
    });

    it("handles nullish and non-string input without throwing", () => {
      expect(escapeHtml(null)).toBe("");
      expect(escapeHtml(undefined)).toBe("");
      expect(escapeHtml(42)).toBe("42");
    });
  });

  describe("sendContactNotification", () => {
    it("fails honestly when email is not configured, without calling Resend", async () => {
      setEnv({});
      const fetchSpy = vi.fn();
      vi.stubGlobal("fetch", fetchSpy);

      const result = await sendContactNotification({
        name: "Ada",
        email: "ada@example.com",
        company: null,
        subject: "general",
        message: "Hello",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toMatch(/not configured/i);
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("posts a structured payload with the visitor as reply-to", async () => {
      setEnv(CONFIGURED);
      const fetchSpy = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ id: "email_123" }), { status: 200 }));
      vi.stubGlobal("fetch", fetchSpy);

      const result = await sendContactNotification({
        name: "Ada <evil>",
        email: "ada@example.com",
        company: "Analytical Engines",
        subject: "project",
        message: "Line one\nLine two",
      });

      expect(result).toEqual({ ok: true, id: "email_123" });

      const [url, init] = fetchSpy.mock.calls[0];
      expect(String(url)).toContain("api.resend.com");
      // Authorization header carries the key; it must never reach a URL or body.
      expect(String(url)).not.toContain(CONFIGURED.RESEND_API_KEY);
      expect(String(init.body)).not.toContain(CONFIGURED.RESEND_API_KEY);

      const payload = JSON.parse(init.body);
      expect(payload.to).toEqual([CONFIGURED.TO_EMAIL]);
      expect(payload.from).toBe(CONFIGURED.FROM_EMAIL);
      expect(payload.reply_to).toBe("ada@example.com");
      // Name is escaped inside the HTML body, never parsed as a header.
      expect(payload.html).toContain("Ada &lt;evil&gt;");
      expect(payload.text).toContain("Ada <evil>");
    });

    it("returns a failure (not a throw) when Resend answers non-2xx", async () => {
      setEnv(CONFIGURED);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(JSON.stringify({ message: "API key is invalid" }), { status: 401 }),
        ),
      );

      const result = await sendContactNotification({
        name: "Ada",
        email: "ada@example.com",
        company: null,
        subject: "general",
        message: "Hello",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toContain("401");
    });

    it("returns a failure when the request throws at the network layer", async () => {
      setEnv(CONFIGURED);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("ECONNRESET")),
      );

      const result = await sendContactNotification({
        name: "Ada",
        email: "ada@example.com",
        company: null,
        subject: "general",
        message: "Hello",
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toContain("ECONNRESET");
    });

    it("succeeds even when the response body is not JSON", async () => {
      setEnv(CONFIGURED);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(new Response("Accepted", { status: 200 })),
      );

      const result = await sendContactNotification({
        name: "Ada",
        email: "ada@example.com",
        company: null,
        subject: "general",
        message: "Hello",
      });

      expect(result).toEqual({ ok: true });
    });
  });

  describe("sendNewsletterConfirmation", () => {
    it("addresses the subscriber, not the owner inbox", async () => {
      setEnv(CONFIGURED);
      const fetchSpy = vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify({ id: "e" }), { status: 200 }));
      vi.stubGlobal("fetch", fetchSpy);

      const result = await sendNewsletterConfirmation({
        email: "reader@example.com",
        confirmUrl: "https://example.com/newsletter/confirm?token=abc",
        unsubscribeUrl: "https://example.com/newsletter/unsubscribe?token=abc",
      });

      expect(result.ok).toBe(true);
      const payload = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(payload.to).toEqual(["reader@example.com"]);
      expect(payload.html).toContain("https://example.com/newsletter/confirm?token=abc");
      // Every newsletter email carries an unsubscribe link (plan §212).
      expect(payload.html).toContain("unsubscribe");
    });
  });
});
