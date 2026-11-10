// Apply a SQL file via DATABASE_URL (pooler-friendly).
// Usage: node --env-file=.env.local scripts/apply-sql.mjs supabase/0009_reviews.sql
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Client } from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-sql.mjs <path-to.sql>");
  process.exit(2);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(2);
}

const sqlPath = resolve(process.cwd(), file);
const sql = readFileSync(sqlPath, "utf8");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 20000,
});

try {
  await client.connect();
  console.log("connected; applying", file);
  await client.query(sql);
  const check = await client.query(
    "select to_regclass('public.reviews') as reviews",
  );
  console.log("OK: reviews =", check.rows[0].reviews);
} catch (error) {
  console.error("FAIL:", error.code ?? "", error.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
