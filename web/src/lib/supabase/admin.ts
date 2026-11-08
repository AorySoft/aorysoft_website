// Service-role Supabase client. SERVER ONLY — this key bypasses RLS (§5.5).
// Allowed uses (plan §5.5): the public-form insert path (Phase 4), seeding,
// ops, role changes. It must never be referenced from a client component;
// the security pass greps for that.
//
// The `server-only` import guard makes any client-bundle import throw at
// build time, not silently leak at runtime.
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Returns a service-role client, or null when the environment is not
 * configured (no project yet). Callers must handle null by showing a setup
 * state — never by faking success.
 */
export function getServiceClient(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** True when both public + service env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/** True when the public (anon) env vars are present (public pages suffice). */
export function isPublicSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
