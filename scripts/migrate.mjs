// Applies db/schema.sql then db/seed.sql to your Neon database.
// Usage:  npm run db:migrate           (reads DATABASE_URL from .env.local)
//     or  DATABASE_URL=... node scripts/migrate.mjs
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

function getUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
    if (m && m[1].trim()) return m[1].trim();
  } catch {
    /* no .env.local */
  }
  return "";
}

const url = getUrl();
if (!url) {
  console.error(
    "✗ No DATABASE_URL found. Set it in .env.local or pass it inline.",
  );
  process.exit(1);
}

const sql = neon(url);

// Neon's HTTP endpoint runs one statement per call, so split the files on
// semicolons (our SQL has none inside string values). Strip line comments first.
function statements(file) {
  const text = readFileSync(new URL("../" + file, import.meta.url), "utf8")
    .replace(/^\s*--.*$/gm, "");
  return text
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

for (const file of ["db/schema.sql", "db/seed.sql"]) {
  const stmts = statements(file);
  for (const st of stmts) await sql.query(st);
  console.log(`✓ ${file} — ${stmts.length} statements`);
}
console.log("✓ Neon database is ready.");
