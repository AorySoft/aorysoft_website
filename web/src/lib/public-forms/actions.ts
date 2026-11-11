"use server";

// Public form server actions (plan §7). SERVER ONLY — uses the service-role
// key, which bypasses RLS.
//
// SECURITY MODEL (plan §5.5): there are deliberately NO public INSERT policies
// on `submissions` or `newsletter_subscribers`. The anon key held by the
// browser can never write. Every write happens here, behind this order:
//
//   honeypot → Turnstile → rate limit → validate → insert (service role)
//
// Turnstile is verified BEFORE any database write, so a bot that passes the
// honeypot still cannot create rows without a valid token.
//
// Error handling is split deliberately:
//   - The browser gets a GENERIC message. It never sees SQL errors, constraint
//     text, or whether an email address already exists in a way that would
//     let an attacker enumerate the subscriber list.
//   - The server log gets the real reason, so the owner can diagnose it.

import "server-only";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  isEmailConfigured,
  sendContactNotification,
  sendNewsletterConfirmation,
  sendQuoteNotification,
} from "./email";
import { checkRateLimit } from "./rate-limit";
import { verifyTurnstile } from "./turnstile";
import { signToken } from "./tokens";
import { loadOpenInvite } from "./review-invites";
import {
  validateContactForm,
  validateQuoteForm,
  validateReviewForm,
  validEmail,
  type ValidContact,
  type ValidQuote,
} from "./validate";
import { type FormState } from "./state";

// NOTE: every export in this file must be an async function — it is a
// "use server" module, and Next.js rejects any other kind of export.
// FormState and the idle value live in ./state for that reason.

const GENERIC_FAILURE =
  "We could not send your message right now. Please try again, or email us directly at info@aorysoft.com.";

function fieldErrorState(
  errors: { field: string; message: string }[],
): FormState {
  const fieldErrors: Record<string, string> = {};
  for (const error of errors) fieldErrors[error.field] ??= error.message;
  return {
    status: "error",
    message: "Please fix the highlighted fields and try again.",
    fieldErrors,
  };
}

/**
 * Reads the visitor's IP from the request headers. `x-forwarded-for` is the
 * first hop when behind Vercel/Cloudflare. May be empty — the rate limiter
 * treats a missing IP as "skip the IP bucket", never as a bypass, because the
 * per-email bucket still applies.
 */
async function clientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headerStore.get("x-real-ip") ?? "";
}

/** Honeypot field: humans never see or fill it, bots routinely do. */
function honeypotTripped(fields: Record<string, unknown>): boolean {
  const value = fields.website;
  return typeof value === "string" && value.trim() !== "";
}

type Submission = ValidContact | ValidQuote;

async function persistSubmission(submission: Submission): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase.from("submissions").insert({
    type: submission.type,
    name: submission.name,
    email: submission.email,
    company: submission.company,
    phone: submission.type === "quote" ? submission.phone : null,
    service: submission.service,
    message: submission.message,
    details: submission.type === "quote" ? submission.details : {},
    status: "new",
  });

  if (error) throw new Error(`Insert failed: ${error.message}`);
}

/**
 * Shared gate for both forms. Returns a FormState when the request should be
 * rejected, or null when it may proceed to persistence.
 */
async function guard(
  fields: Record<string, unknown>,
  email: string,
): Promise<FormState | null> {
  // 1. Honeypot — cheapest check, run first.
  if (honeypotTripped(fields)) {
    // Pretend success so the bot gets no signal to adapt to.
    return { status: "success", message: "Thanks! We'll be in touch within 24 hours." };
  }

  // 2. Turnstile — verified BEFORE any write. Production fails closed when
  // the secret is missing (see verifyTurnstile); development may skip.
  const turnstile = await verifyTurnstile(fields.turnstileToken);
  if (!turnstile.ok) {
    console.error("[forms] Turnstile verification failed:", turnstile.reason);
    return {
      status: "error",
      message:
        turnstile.reason === "not_configured"
          ? "Forms are temporarily unavailable. Please email info@aorysoft.com."
          : "Spam check failed. Please try again.",
    };
  }

  // 3. Rate limit — per IP and per email (persistent via Supabase RPC).
  const rate = await checkRateLimit(await clientIp(), email);
  if (!rate.ok) {
    console.warn(`[forms] rate limit hit (scope: ${rate.scope})`);
    return {
      status: "error",
      message: "Too many requests. Please wait a few minutes and try again.",
    };
  }

  return null;
}

export async function submitContact(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    console.error("[forms] submitContact: Supabase is not configured.");
    return { status: "error", message: GENERIC_FAILURE };
  }

  const fields = Object.fromEntries(formData.entries());
  const validated = validateContactForm(fields);
  if (!validated.ok) return fieldErrorState(validated.errors);

  const blocked = await guard(fields, validated.value.email);
  if (blocked) return blocked;

  try {
    await persistSubmission(validated.value);
  } catch (error) {
    console.error("[forms] contact insert failed:", error);
    return { status: "error", message: GENERIC_FAILURE };
  }

  // Email failure does NOT fail the submission — the row is saved, which is
  // what actually matters to the visitor. The owner sees the log.
  if (isEmailConfigured()) {
    const outcome = await sendContactNotification({
      name: validated.value.name,
      email: validated.value.email,
      company: validated.value.company,
      subject: validated.value.service,
      message: validated.value.message,
    });
    if (!outcome.ok) console.error("[forms] contact email failed:", outcome.error);
  } else {
    console.warn("[forms] email not configured — submission stored, no notification sent.");
  }

  revalidatePath("/admin/submissions");

  return {
    status: "success",
    message: "Thanks! Your message is on its way. We'll reply within 24 hours.",
  };
}

export async function submitQuote(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    console.error("[forms] submitQuote: Supabase is not configured.");
    return { status: "error", message: GENERIC_FAILURE };
  }

  const fields = Object.fromEntries(formData.entries());
  // Multi-selects arrive as repeated keys; normalise before validating.
  const technologies = formData.getAll("technologies");
  const integrations = formData.getAll("integrations");

  const validated = validateQuoteForm({
    ...fields,
    technologies,
    integrations,
  });
  if (!validated.ok) return fieldErrorState(validated.errors);

  const blocked = await guard(fields, validated.value.email);
  if (blocked) return blocked;

  try {
    await persistSubmission(validated.value);
  } catch (error) {
    console.error("[forms] quote insert failed:", error);
    return { status: "error", message: GENERIC_FAILURE };
  }

  if (isEmailConfigured()) {
    const outcome = await sendQuoteNotification({
      name: validated.value.name,
      email: validated.value.email,
      company: validated.value.company,
      phone: validated.value.phone,
      details: validated.value.details,
    });
    if (!outcome.ok) console.error("[forms] quote email failed:", outcome.error);
  } else {
    console.warn("[forms] email not configured — submission stored, no notification sent.");
  }

  revalidatePath("/admin/submissions");

  return {
    status: "success",
    message: "Thanks! Your quote request is in. We'll get back to you within 24 hours.",
  };
}

export async function subscribeNewsletter(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    console.error("[forms] subscribeNewsletter: Supabase is not configured.");
    return { status: "error", message: GENERIC_FAILURE };
  }

  const fields = Object.fromEntries(formData.entries());
  const email = validEmail(fields.email);
  if (!email.ok) return fieldErrorState(email.errors);

  const blocked = await guard(fields, email.value);
  if (blocked) return blocked;

  const supabase = getServiceClient()!;
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.value, status: "pending" })
    .select("id, status")
    .single();

  if (error) {
    // 23505 = unique_violation. The address already exists. We return the SAME
    // generic success as a new signup so an attacker cannot use this endpoint
    // to enumerate which addresses are subscribed (plan §4.4).
    if (error.code === "23505") {
      console.info("[forms] duplicate newsletter signup suppressed");
      return {
        status: "success",
        message: "Thanks! Check your inbox to confirm your subscription.",
      };
    }
    console.error("[forms] newsletter insert failed:", error);
    return { status: "error", message: GENERIC_FAILURE };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const token = signToken(data!.id);

  if (isEmailConfigured()) {
    const outcome = await sendNewsletterConfirmation({
      email: email.value,
      confirmUrl: `${baseUrl}/newsletter/confirm?token=${encodeURIComponent(token)}`,
      unsubscribeUrl: `${baseUrl}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`,
    });
    if (!outcome.ok) console.error("[forms] newsletter confirmation email failed:", outcome.error);
  } else {
    console.warn("[forms] email not configured — subscriber stored as pending, no confirmation sent.");
  }

  return {
    status: "success",
    message: "Thanks! Check your inbox to confirm your subscription.",
  };
}

/**
 * Invite-only review submission → `reviews` row with status=pending.
 * Requires a valid open invite token (no public homepage form).
 * Admin must confirm permission and publish before public display.
 */
export async function submitReview(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isSupabaseConfigured()) {
    console.error("[forms] submitReview: Supabase is not configured.");
    return { status: "error", message: GENERIC_FAILURE };
  }

  const fields = Object.fromEntries(formData.entries());
  const invite = await loadOpenInvite(fields.inviteToken);
  if (!invite.ok) {
    return {
      status: "error",
      message:
        "This feedback link is invalid or no longer available. Ask AorySoft for a new invite.",
    };
  }

  const validated = validateReviewForm(fields);
  if (!validated.ok) return fieldErrorState(validated.errors);

  const blocked = await guard(fields, validated.value.email);
  if (blocked) return blocked;

  const supabase = getServiceClient()!;
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      display_name: validated.value.displayName,
      review_text: validated.value.reviewText,
      rating: validated.value.rating,
      source: "website",
      project_or_service:
        validated.value.projectOrService ?? invite.invite.project_or_service,
      attribution: "Client invite",
      submitter_email: validated.value.email,
      permission_confirmed: false,
      featured: false,
      status: "pending",
      sort_order: 0,
    })
    .select("id")
    .single();

  if (error || !review) {
    console.error("[forms] review insert failed:", error);
    return { status: "error", message: GENERIC_FAILURE };
  }

  const { error: inviteError } = await supabase
    .from("review_invites")
    .update({
      status: "used",
      used_at: new Date().toISOString(),
      review_id: review.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invite.invite.id)
    .eq("status", "open");

  if (inviteError) {
    // Review is saved; invite mark-used failure is logged for ops.
    console.error("[forms] review invite redeem failed:", inviteError);
  }

  revalidatePath("/admin/reviews");

  return {
    status: "success",
    message:
      "Thanks! Your feedback was received. It will appear on the site only after we review and publish it.",
  };
}
