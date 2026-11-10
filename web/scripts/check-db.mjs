// Quick DATABASE_URL connectivity check. Does not print the connection string.
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: DATABASE_URL is not set");
  process.exit(2);
}

let Client;
try {
  ({ Client } = await import("pg"));
} catch {
  console.error("FAIL: `pg` package is not installed. Run: npm i -D pg");
  process.exit(2);
}

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

try {
  await client.connect();
  const meta = await client.query(
    "select current_database() as db, current_user as usr, now() as ts",
  );
  const tables = await client.query(`
    select
      to_regclass('public.reviews') as reviews,
      to_regclass('public.services') as services,
      to_regclass('public.jobs') as jobs
  `);
  console.log("OK: connected");
  console.log("db:", meta.rows[0].db);
  console.log("user:", meta.rows[0].usr);
  console.log("server_time:", meta.rows[0].ts.toISOString?.() ?? meta.rows[0].ts);
  console.log("tables:", tables.rows[0]);
} catch (error) {
  console.error("FAIL:", error.code ?? "", error.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
