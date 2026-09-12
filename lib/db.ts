import { neon } from "@neondatabase/serverless";

/**
 * Neon Postgres client.
 *
 * Neon's HTTP driver is a great fit for Next.js Server Components and Server
 * Actions on serverless (Vercel): each query is a stateless HTTPS call, so
 * there are no connection-pool headaches.
 *
 * `sql` is a tagged-template function that parameterizes automatically:
 *   const rows = await sql`select * from leads where id = ${id}`;
 *
 * When DATABASE_URL isn't set (e.g. local dev before you connect Neon), we
 * expose `null` and the query layer falls back to the in-memory preview store.
 */
export const isDbConfigured = () => !!process.env.DATABASE_URL;

export const sql = isDbConfigured()
  ? neon(process.env.DATABASE_URL!)
  : null;

/** Postgres returns numeric/decimal columns as strings — coerce to number. */
export const num = (v: unknown): number => Number(v ?? 0);
