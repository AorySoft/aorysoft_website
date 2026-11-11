import { describe, expect, it } from "vitest";
import {
  SUPABASE_PUBLIC_STORAGE_PATH,
  supabaseImagePattern,
} from "./image-remote-patterns";

describe("supabaseImagePattern", () => {
  it("allows only the exact project host and public storage path", () => {
    expect(supabaseImagePattern("https://abcd1234.supabase.co")).toEqual({
      protocol: "https",
      hostname: "abcd1234.supabase.co",
      pathname: SUPABASE_PUBLIC_STORAGE_PATH,
    });
  });

  it("never returns a wildcard host", () => {
    const pattern = supabaseImagePattern("https://abcd1234.supabase.co/");
    expect(pattern.hostname).not.toContain("*");
  });

  it("keeps the port for a local Supabase stack", () => {
    expect(supabaseImagePattern("http://127.0.0.1:54321")).toEqual({
      protocol: "http",
      hostname: "127.0.0.1",
      port: "54321",
      pathname: SUPABASE_PUBLIC_STORAGE_PATH,
    });
  });

  it("throws a clear error when the env var is missing", () => {
    expect(() => supabaseImagePattern(undefined)).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL is not set/,
    );
    expect(() => supabaseImagePattern("  ")).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL is not set/,
    );
  });

  it("throws on a malformed or non-http URL", () => {
    expect(() => supabaseImagePattern("not a url")).toThrow(/not a valid URL/);
    expect(() => supabaseImagePattern("ftp://x.supabase.co")).toThrow(
      /must use http or https/,
    );
  });
});
