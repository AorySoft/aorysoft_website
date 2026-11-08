import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin sign in — AorySoft",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const envConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          AorySoft admin
        </h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
        <div className="mt-6">
          {envConfigured ? (
            <LoginForm />
          ) : (
            <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              Supabase is not configured yet. Copy{" "}
              <code className="font-mono">web/.env.example</code> to{" "}
              <code className="font-mono">web/.env.local</code> and fill in
              your project values.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
