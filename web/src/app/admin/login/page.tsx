import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin sign in | AorySoft",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="surface-panel w-full max-w-sm p-8">
        <h1 className="font-display text-2xl text-ink">AorySoft admin</h1>
        <p className="mt-1 text-sm text-ink-muted">Sign in to continue</p>
        <div className="mt-6">
          {envConfigured ? (
            <LoginForm />
          ) : (
            <p className="rounded-atelier-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              Supabase is not configured yet. Copy{" "}
              <code className="font-mono text-ink">web/.env.example</code> to{" "}
              <code className="font-mono text-ink">web/.env.local</code> and fill
              in your project values.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
