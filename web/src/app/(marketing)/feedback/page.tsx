import type { Metadata } from "next";
import ReviewSubmitForm from "@/components/ReviewSubmitForm";
import { loadOpenInvite } from "@/lib/public-forms/review-invites";

export const metadata: Metadata = {
  title: "Share feedback",
  robots: { index: false, follow: false },
};

function InviteError({ message }: { message: string }) {
  return (
    <main className="min-h-screen">
      <section className="section-y">
        <div className="shell max-w-xl">
          <h1 className="display-title">Feedback link unavailable</h1>
          <p className="body-lead mt-5">{message}</p>
          <p className="mt-6 text-sm text-ink-muted">
            Need a new link? Email{" "}
            <a href="mailto:info@aorysoft.com" className="text-signal underline-offset-4 hover:underline">
              info@aorysoft.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <InviteError message="This page is only for clients with a private invite link from AorySoft." />
    );
  }

  const invite = await loadOpenInvite(token);
  if (!invite.ok) {
    const messages = {
      invalid: "This invite link is not valid.",
      used: "This invite was already used.",
      revoked: "This invite was revoked.",
      expired: "This invite has expired.",
      missing: "Feedback is temporarily unavailable. Please try again later.",
    } as const;
    return <InviteError message={messages[invite.reason]} />;
  }

  return (
    <main className="min-h-screen">
      <section className="section-y">
        <div className="shell max-w-xl">
          <h1 className="display-title">Share your feedback</h1>
          <p className="body-lead mt-5">
            Thanks for working with AorySoft. Your note stays private until we
            check permission and publish it.
          </p>
          {invite.invite.label ? (
            <p className="mt-3 text-sm text-ink-subtle">For: {invite.invite.label}</p>
          ) : null}
          <div className="mt-10">
            <ReviewSubmitForm
              inviteToken={token}
              prefill={{
                displayName: invite.invite.client_name ?? undefined,
                email: invite.invite.client_email ?? undefined,
                projectOrService: invite.invite.project_or_service ?? undefined,
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
