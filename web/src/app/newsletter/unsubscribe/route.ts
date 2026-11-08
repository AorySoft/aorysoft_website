// Newsletter one-click unsubscribe (plan §212).
// Public GET route — no login required; the signed token is the proof.
// Status flips to `unsubscribed`, and repeat clicks are idempotent.

import {
  INVALID,
  loadSubscriber,
  page,
  setStatus,
  tokenFromRequest,
} from "@/lib/public-forms/token-page";

const UNSUBSCRIBED = {
  ok: true,
  heading: "You've been unsubscribed",
  body: "You will not receive further newsletter emails. You can resubscribe at any time from the blog page.",
};

export async function GET(request: Request): Promise<Response> {
  const subscriber = await loadSubscriber(tokenFromRequest(request));
  if (!subscriber) return page(INVALID);

  return setStatus(subscriber.id, "unsubscribed", UNSUBSCRIBED);
}
