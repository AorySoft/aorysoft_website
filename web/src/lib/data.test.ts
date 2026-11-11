import { beforeEach, describe, expect, it, vi } from "vitest";

// Capture every column list the public (anon) client requests.
const selects: { table: string; columns: string }[] = [];

function chain(table: string) {
  const builder: Record<string, unknown> = {};
  const self = () => builder;
  builder.select = (columns: string) => {
    selects.push({ table, columns });
    return builder;
  };
  for (const method of ["eq", "order", "returns", "limit"]) builder[method] = self;
  builder.maybeSingle = self;
  builder.then = (resolve: (v: unknown) => void) =>
    resolve({ data: [], error: null });
  return builder;
}

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({ from: (table: string) => chain(table) }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  isPublicSupabaseConfigured: () => true,
}));

import {
  PUBLIC_REVIEW_COLUMNS,
  getActiveJobs,
  getActiveServices,
  getPublishedCaseStudies,
  getPublishedPosts,
  getPublishedReviews,
} from "./data";

const PII_COLUMNS = ["submitter_email", "email", "ip_hash", "client_email", "phone"];

beforeEach(() => {
  selects.length = 0;
});

describe("public data queries", () => {
  it("never request submitter_email for reviews", async () => {
    await getPublishedReviews();
    const review = selects.find((s) => s.table === "reviews");
    expect(review?.columns).toBe(PUBLIC_REVIEW_COLUMNS);
    expect(review?.columns).not.toMatch(/submitter_email/);
  });

  it("request no PII columns from any public table", async () => {
    await Promise.all([
      getPublishedReviews(),
      getPublishedPosts(),
      getActiveServices(),
      getActiveJobs(),
      getPublishedCaseStudies(),
    ]);
    expect(selects.length).toBeGreaterThanOrEqual(5);
    for (const { table, columns } of selects) {
      const names = columns.split(/[\s,()]+/);
      for (const pii of PII_COLUMNS) {
        expect(names, `${table} selects ${pii}`).not.toContain(pii);
      }
    }
  });
});
