// The ONLY place admin-authored HTML may be rendered. Everything passes
// through sanitizeContent() (strict allowlist) first, so stored payloads
// (<script>, <img onerror>, javascript: links…) render inert.
// Wired into the blog article view (Phase 5); covered by render tests now.
import { sanitizeContent } from "@/lib/sanitize";

export default function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizeContent(html) }}
    />
  );
}
