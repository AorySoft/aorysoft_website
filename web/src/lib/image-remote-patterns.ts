// Image optimizer allowlist (FRONTEND_AUDIT F16). Only our own Supabase
// project's public storage path may be proxied through /_next/image — never a
// wildcard host, which would let any Supabase project use our optimizer.
// Kept dependency-free so next.config.ts can import it with a relative path.

export type SupabaseImagePattern = {
  protocol: "https" | "http";
  hostname: string;
  port?: string;
  pathname: string;
};

export const SUPABASE_PUBLIC_STORAGE_PATH = "/storage/v1/object/public/**";

/**
 * Build the single remotePattern for the configured Supabase project.
 * Throws with a clear message when the URL is missing or malformed so a
 * production build cannot ship with broken (or overly broad) image rules.
 */
export function supabaseImagePattern(
  supabaseUrl: string | undefined,
): SupabaseImagePattern {
  if (!supabaseUrl || !supabaseUrl.trim()) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set. It is required at build time to allow Supabase Storage images (next.config.ts images.remotePatterns).",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(supabaseUrl.trim());
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${supabaseUrl}".`,
    );
  }

  const protocol = parsed.protocol.replace(":", "");
  if (protocol !== "https" && protocol !== "http") {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must use http or https, got "${parsed.protocol}".`,
    );
  }

  return {
    protocol,
    hostname: parsed.hostname,
    ...(parsed.port ? { port: parsed.port } : {}),
    pathname: SUPABASE_PUBLIC_STORAGE_PATH,
  };
}
