// Resend email delivery (plan §7, §162). SERVER ONLY.
//
// Deliberately implemented with `fetch` rather than the `resend` SDK: this is
// one structured POST with two recipients, and an extra dependency is not
// worth the supply-chain surface for it. The payload uses structured `to`/
// `from` fields — never a raw `Subject:` header — so visitor input cannot
// inject headers (plan §7: "no raw header injection").
//
// The API key lives only in `RESEND_API_KEY` and is read from the server env.
// It is never imported by a client component and never returned to the browser.
//
// Email failure NEVER fails the visitor's submission: the row is already
// saved, so the action reports success and logs the delivery error. This is
// the honest behaviour — the visitor's message was in fact recorded — while
// the owner still sees the failure in server logs.

import "server-only";

const RESEND_API_URL = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.TO_EMAIL && process.env.FROM_EMAIL);
}

/** Minimal HTML escaping for values interpolated into an email body. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type SendArgs = {
  subject: string;
  /** Pre-rendered plain-text body. */
  text: string;
  /** Pre-rendered HTML body (already escaped by the caller). */
  html: string;
  /** Reply-to the visitor, so the owner can answer directly. */
  replyTo?: string;
  /**
   * Overrides the default recipient (the owner's TO_EMAIL). Only the
   * double opt-in confirmation legitimately targets the visitor directly;
   * every other email is a notification to the owner.
   */
  to?: string;
};

type SendOutcome = { ok: true; id?: string } | { ok: false; error: string };

async function send(args: SendArgs): Promise<SendOutcome> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.TO_EMAIL;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !to || !from) {
    return { ok: false, error: "Email is not configured (RESEND_API_KEY / TO_EMAIL / FROM_EMAIL)." };
  }

  let response: Response;
  try {
    response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        // A single address in an array, matching Resend's expected shape.
        to: [args.to ?? to],
        ...(args.replyTo ? { reply_to: args.replyTo } : {}),
        subject: args.subject,
        text: args.text,
        html: args.html,
      }),
    });
  } catch (error) {
    // Network-level failure. Never surface internals to the visitor.
    return { ok: false, error: `Resend request failed: ${(error as Error).message}` };
  }

  if (!response.ok) {
    // Resend returns JSON with an `message`; read it for the server log only.
    let detail = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload?.message) detail += ` — ${payload.message}`;
    } catch {
      // Non-JSON error body; the status code is enough for the log.
    }
    return { ok: false, error: `Resend error: ${detail}` };
  }

  try {
    const payload = (await response.json()) as { id?: string };
    return { ok: true, id: payload?.id };
  } catch {
    return { ok: true };
  }
}

/** Notification to the owner that a visitor submitted the contact form. */
export function sendContactNotification(input: {
  name: string;
  email: string;
  company: string | null;
  subject: string;
  message: string;
}): Promise<SendOutcome> {
  const { name, email, company, subject, message } = input;
  return send({
    subject: `[AorySoft] New contact submission: ${subject}`,
    replyTo: email,
    text: [
      "New contact submission from the AorySoft website.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company ?? "—"}`,
      `Subject: ${subject}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: `
      <h2>New contact submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company ?? "—")}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
    `,
  });
}

/** Notification to the owner that a visitor requested a quote. */
export function sendQuoteNotification(input: {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  details: Record<string, unknown>;
}): Promise<SendOutcome> {
  const { name, email, company, phone, details } = input;
  const summary = Object.entries(details)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : (value ?? "—")}`)
    .join("\n");

  return send({
    subject: "[AorySoft] New quote request",
    replyTo: email,
    text: [
      "New quote request from the AorySoft website.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company ?? "—"}`,
      `Phone: ${phone ?? "—"}`,
      "",
      "Details:",
      summary,
    ].join("\n"),
    html: `
      <h2>New quote request</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company ?? "—")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone ?? "—")}</p>
      <h3>Details</h3>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(summary)}</pre>
    `,
  });
}

/**
 * Double opt-in confirmation email (plan §212). Carries a signed link that
 * flips the row from `pending` to `confirmed`.
 */
export function sendNewsletterConfirmation(input: {
  email: string;
  confirmUrl: string;
  unsubscribeUrl: string;
}): Promise<SendOutcome> {
  const { email, confirmUrl, unsubscribeUrl } = input;
  return send({
    subject: "Confirm your AorySoft newsletter subscription",
    text: [
      "Please confirm your subscription to the AorySoft newsletter:",
      "",
      confirmUrl,
      "",
      "If you did not request this, you can ignore this email or unsubscribe:",
      unsubscribeUrl,
    ].join("\n"),
    html: `
      <h2>Confirm your subscription</h2>
      <p>Click the link below to confirm you want AorySoft insights in your inbox.</p>
      <p><a href="${escapeHtml(confirmUrl)}">Confirm subscription</a></p>
      <p style="color:#666;font-size:12px">
        If you did not request this, ignore this email or
        <a href="${escapeHtml(unsubscribeUrl)}">unsubscribe</a>.
      </p>
    `,
    // The confirmation goes to the subscriber, not the owner inbox.
    to: email,
  });
}
