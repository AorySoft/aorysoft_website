// Render-boundary test: whatever an admin (or a compromised admin account)
// stores, the ONLY HTML render path produces inert DOM.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import SafeHtml from "@/components/SafeHtml";

describe("SafeHtml render boundary", () => {
  it("renders safe content as HTML", () => {
    const { container } = render(
      <SafeHtml html="<p>Great <strong>insight</strong></p>" />,
    );
    expect(container.querySelector("strong")?.textContent).toBe("insight");
  });

  it("renders a stored <script> payload inert (no script element, no execution surface)", () => {
    const { container } = render(
      <SafeHtml html={'<p>before</p><script>window.__pwned = true;</script>'} />,
    );
    // Even if a script tag survived (it must not), jsdom would not execute
    // it here — the assertion is on the DOM shape itself.
    expect(container.querySelector("script")).toBeNull();
    expect((globalThis as Record<string, unknown>).__pwned).toBeUndefined();
  });

  it("strips event-handler attributes from rendered elements", () => {
    const { container } = render(
      <SafeHtml html={'<p onmouseover="window.__pwned=1">hover me</p>'} />,
    );
    const p = container.querySelector("p");
    expect(p).not.toBeNull();
    expect(p?.getAttribute("onmouseover")).toBeNull();
    expect((globalThis as Record<string, unknown>).__pwned).toBeUndefined();
  });

  it("does not render injected iframes or images", () => {
    const { container } = render(
      <SafeHtml html={'<iframe src="https://evil.example"></iframe><img src=x onerror="window.__pwned=1">safe'} />,
    );
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.textContent).toContain("safe");
  });

  it("rewrites links with rel/target and drops javascript: hrefs", () => {
    const { container } = render(
      <>
        <SafeHtml html={'<a href="javascript:window.__pwned=1">click</a>'} />
        <SafeHtml html={'<a href="https://example.com">safe</a>'} />
      </>,
    );
    const [badLink, goodLink] = Array.from(container.querySelectorAll("a"));
    const badHref = badLink?.getAttribute("href") ?? null;
    expect(badHref === null || !badHref.includes("javascript:")).toBe(true);
    expect(goodLink?.getAttribute("href")).toBe("https://example.com");
    expect(goodLink?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(goodLink?.getAttribute("target")).toBe("_blank");
  });
});
