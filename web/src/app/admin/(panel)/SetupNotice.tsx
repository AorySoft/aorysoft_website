import { AlertTriangle } from "lucide-react";

/** Honest setup state: shown wherever Supabase env vars are not configured. */
export default function SetupNotice({
  what = "Supabase is not configured yet",
}: {
  what?: string;
}) {
  return (
    <div className="flex items-start space-x-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
        aria-hidden="true"
      />
      <div className="text-sm">
        <p className="font-medium text-amber-300">{what}</p>
        <p className="mt-1 text-amber-200/80">
          Add <code className="rounded bg-gray-900/60 px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-gray-900/60 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          and{" "}
          <code className="rounded bg-gray-900/60 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          to <code className="rounded bg-gray-900/60 px-1">web/.env.local</code>, then apply{" "}
          <code className="rounded bg-gray-900/60 px-1">supabase/0001–0004</code> SQL in
          your Supabase project. Nothing here is faked: data appears once a real
          project is connected.
        </p>
      </div>
    </div>
  );
}
