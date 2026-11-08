// Stored-XSS defense (plan §5.5): admin-authored rich text is sanitized on
// render with a strict allowlist. Anything not listed — <script>, <iframe>,
// <img onerror>, <style>, event handlers, javascript: URLs — is stripped.
// Covered by vitest (sanitize + render-inert tests).
import sanitizeHtml from "sanitize-html";

const ALLOWED_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "b",
    "i",
    "u",
    "s",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "code",
    "pre",
    "a",
  ],
  allowedAttributes: {
    // rel/target are added by the transform below; they must also be
    // allowed here or sanitize-html strips them after transforming.
    a: ["href", "rel", "target"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Links open safely if they leave the site.
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
  disallowedTagsMode: "discard",
};

/** Sanitize admin-authored HTML down to the safe subset above. */
export function sanitizeContent(dirty: string): string {
  if (!dirty) return "";
  return sanitizeHtml(dirty, ALLOWED_OPTIONS);
}

/** Collapse any input to plain text (no markup survives). */
export function toPlainText(input: string): string {
  if (!input) return "";
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} })
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
