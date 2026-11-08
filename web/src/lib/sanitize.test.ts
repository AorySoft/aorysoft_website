import { describe, expect, it } from "vitest";
import { sanitizeContent, toPlainText } from "./sanitize";

describe("sanitizeContent (stored-XSS defense)", () => {
  it("keeps the safe formatting subset", () => {
    const html =
      "<p>Hello <strong>world</strong></p><ul><li>one</li></ul><h2>Title</h2>";
    expect(sanitizeContent(html)).toBe(html);
  });

  it("strips script tags entirely", () => {
    const out = sanitizeContent('<p>hi</p><script>alert(1)</script>');
    expect(out).not.toContain("script");
    expect(out).not.toContain("alert(1)");
    expect(out).toBe("<p>hi</p>");
  });

  it("strips event handlers from allowed tags", () => {
    const out = sanitizeContent('<p onclick="alert(1)">text</p>');
    expect(out).toBe("<p>text</p>");
  });

  it("strips img/iframe/style tags", () => {
    const out = sanitizeContent(
      '<img src=x onerror=alert(1)><iframe src="https://evil.example"></iframe><style>*{display:none}</style><p>ok</p>',
    );
    expect(out).toBe("<p>ok</p>");
  });

  it("removes javascript: URLs but keeps http/https/mailto links", () => {
    expect(sanitizeContent('<a href="javascript:alert(1)">x</a>')).not.toContain(
      "javascript:",
    );
    const good = sanitizeContent('<a href="https://example.com">x</a>');
    expect(good).toContain('href="https://example.com"');
    expect(good).toContain('rel="noopener noreferrer"');
    expect(sanitizeContent('<a href="mailto:a@b.com">x</a>')).toContain(
      "mailto:a@b.com",
    );
  });

  it("neutralizes svg/math namespace smuggling", () => {
    const out = sanitizeContent(
      '<svg><script>alert(1)</script></svg><p>text</p>',
    );
    expect(out).not.toContain("svg");
    expect(out).not.toContain("alert(1)");
    expect(out).toContain("<p>text</p>");
  });

  it("handles empty input", () => {
    expect(sanitizeContent("")).toBe("");
  });
});

describe("toPlainText", () => {
  it("removes all markup and escapes angle brackets", () => {
    const out = toPlainText('<script>alert("x")</script>hello');
    expect(out).not.toContain("<");
    expect(out).toContain("hello");
  });
});
