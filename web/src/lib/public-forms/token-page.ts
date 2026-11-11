// Shared plumbing for the newsletter token routes (plan §212).
//
// Both routes are PUBLIC and require no login — the signed HMAC token is the
// proof. They exist as GET routes because the links arrive in an email and are
// opened directly in a browser, and both are idempotent: re-opening a
// confirmation email reports the same success rather than an error, because a
// visitor who clicks twice has done nothing wrong.
//
// The token is verified timing-safe BEFORE any database access, so neither
// route can be used as an oracle to enumerate which subscriber ids exist.

import { getServiceClient } from "@/lib/supabase/admin";
import { verifyToken } from "./tokens";

export type Outcome = { ok: boolean; heading: string; body: string };

export const INVALID: Outcome = {
  ok: false,
  heading: "This link is not valid",
  body: "The link may have expired or been altered. Please subscribe again from the blog page to get a fresh one.",
};

/**
 * Renders the plain-HTML response for a token link.
 *
 * Deliberately a plain document rather than a React page: the visitor arrived
 * from an email and needs only a confirmation, so this ships no client JS and
 * is explicitly `no-store` — a token-bearing response must never sit in a
 * shared cache.
 */
export function page({ ok, heading, body }: Outcome): Response {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${heading} | AorySoft</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif&display=swap" rel="stylesheet" />
    <style>
      :root {
        --canvas: #000000;
        --surface: #0b0f14;
        --line: #1e2836;
        --ink: #f4f7fa;
        --ink-muted: #a8b3c2;
        --signal: #06b6d4;
      }
      body {
        font-family: "DM Sans", system-ui, sans-serif;
        background: var(--canvas);
        color: var(--ink);
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
      }
      main {
        max-width: 32rem;
        text-align: center;
        border: 1px solid var(--line);
        background: var(--surface);
        border-radius: 10px;
        padding: 2rem 1.5rem;
      }
      .mark {
        width: 2.5rem;
        height: 2.5rem;
        margin: 0 auto;
        border-radius: 6px;
        border: 1px solid var(--line);
        display: grid;
        place-items: center;
        color: var(--signal);
        font-size: 1rem;
        font-weight: 600;
      }
      h1 {
        font-family: "Instrument Serif", Georgia, serif;
        font-weight: 400;
        font-size: 1.75rem;
        letter-spacing: -0.02em;
        margin: 1rem 0 0.5rem;
      }
      p { color: var(--ink-muted); line-height: 1.65; }
      a { color: var(--signal); text-underline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <div class="mark" aria-hidden="true">${ok ? "OK" : "!"}</div>
      <h1>${heading}</h1>
      <p>${body}</p>
      <p><a href="/">Back to aorysoft.com</a></p>
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Resolves a token to a live subscriber row, or null if it does not verify. */
export async function loadSubscriber(
  token: unknown,
): Promise<{ id: string; status: string } | null> {
  const id = verifyToken(token);
  if (!id) return null;

  const supabase = getServiceClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[newsletter] lookup failed:", error.message);
    return null;
  }
  // A row deleted since the link was sent returns "not valid" — identical to
  // a bad token, so deletion is not observable from outside.
  return data ?? null;
}

/** Reads the `token` query parameter from a request URL. */
export function tokenFromRequest(request: Request): string | null {
  return new URL(request.url).searchParams.get("token");
}

/** Applies a status transition, reporting a friendly failure on error. */
export async function setStatus(
  id: string,
  status: "confirmed" | "unsubscribed",
  outcome: Outcome,
): Promise<Response> {
  const supabase = getServiceClient();
  if (!supabase) return page(INVALID);

  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status,
      // Consent timestamp is recorded on confirmation for compliance (§4.4).
      ...(status === "confirmed" ? { consent_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);

  if (error) {
    console.error("[newsletter] status update failed:", error.message);
    return page({
      ok: false,
      heading: "Something went wrong",
      body: "We could not update your subscription just now. Please try the link again in a moment.",
    });
  }

  return page(outcome);
}
