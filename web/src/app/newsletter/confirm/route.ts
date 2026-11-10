// Newsletter double opt-in confirmation (plan §212).
// Public GET route opened from the confirmation email; the signed token is
// the proof. Idempotent — clicking twice reports the same success.

import {
  INVALID,
  loadSubscriber,
  page,
  setStatus,
  tokenFromRequest,
} from "@/lib/public-forms/token-page";

const CONFIRMED = {
  ok: true,
  heading: "Subscription confirmed",
  body: "You're on the list. We'll send occasional notes on AI and automation, never more than once a week.",
};

const WELCOME_BACK = {
  ok: true,
  heading: "Welcome back!",
  body: "You're subscribed to the AorySoft newsletter again. Every email carries a one-click unsubscribe link.",
};

export async function GET(request: Request): Promise<Response> {
  const subscriber = await loadSubscriber(tokenFromRequest(request));
  if (!subscriber) return page(INVALID);

  // Confirming after unsubscribing is a legitimate change of mind: flip back
  // to confirmed rather than rejecting the click.
  if (subscriber.status === "unsubscribed")
    return setStatus(subscriber.id, "confirmed", WELCOME_BACK);

  // Idempotent: an already-confirmed row reports the same success.
  return setStatus(subscriber.id, "confirmed", CONFIRMED);
}
