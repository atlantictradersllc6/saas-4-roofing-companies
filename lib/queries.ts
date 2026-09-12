import { sql, isDbConfigured, num } from "./db";
import {
  getPreviewLeads,
  getPreviewInvoices,
  getPreviewEstimates,
} from "./preview-store";
import { SAMPLE_JOBS, SAMPLE_CREWS } from "./sample-data";
import type {
  Lead,
  Estimate,
  EstimateLine,
  Invoice,
  ScheduledJob,
  Crew,
} from "./types";

/**
 * The data layer. Every page calls these — never the database directly.
 *
 * The pattern to notice: each function checks `isDbConfigured()`.
 *   • No DATABASE_URL → return the in-memory preview data (fully populated UI).
 *   • DATABASE_URL set → query Neon Postgres.
 *
 * Because pages only see the return value, connecting Neon is just setting one
 * env var — no page changes. That's `useDatabase ? realData : sampleData`,
 * centralised here.
 */

export async function getLeads(): Promise<Lead[]> {
  if (!isDbConfigured() || !sql) return getPreviewLeads();

  const rows = await sql`
    select id, name, address, value, stage, source, phone, scope, notes
    from leads
    order by value desc
  `;
  return rows.map((r) => ({ ...r, value: num(r.value) })) as Lead[];
}

export async function getEstimates(): Promise<Estimate[]> {
  if (!isDbConfigured() || !sql) return getPreviewEstimates();

  const estimates = await sql`
    select id, ref, name, address, date, status, squares, pitch, layers, waste
    from estimates
    order by created_at desc
  `;
  const lines = await sql`
    select estimate_id, description, qty, rate, amount
    from estimate_lines
    order by position asc
  `;

  // Group lines under their estimate (one pass, no N+1 queries).
  const byEstimate = new Map<string, EstimateLine[]>();
  for (const l of lines) {
    const list = byEstimate.get(l.estimate_id) ?? [];
    list.push({
      description: l.description,
      qty: l.qty,
      rate: num(l.rate),
      amount: num(l.amount),
    });
    byEstimate.set(l.estimate_id, list);
  }

  return estimates.map((e) => ({
    ...e,
    squares: num(e.squares),
    layers: num(e.layers),
    lines: byEstimate.get(e.id) ?? [],
  })) as Estimate[];
}

export async function getInvoices(): Promise<Invoice[]> {
  if (!isDbConfigured() || !sql) return getPreviewInvoices();

  const rows = await sql`
    select id, ref, customer, sub, job, amount, balance, due, status
    from invoices
  `;
  return rows.map((r) => ({
    ...r,
    amount: num(r.amount),
    balance: num(r.balance),
  })) as Invoice[];
}

export async function getJobs(): Promise<ScheduledJob[]> {
  if (!isDbConfigured() || !sql) return SAMPLE_JOBS;

  // Alias snake_case columns to the camelCase our types use.
  const rows = await sql`
    select id, crew_index as "crewIndex", day_index as "dayIndex", name, meta, type
    from scheduled_jobs
  `;
  return rows as ScheduledJob[];
}

export async function getCrews(): Promise<Crew[]> {
  if (!isDbConfigured() || !sql) return SAMPLE_CREWS;

  const rows = await sql`select id, name, lead, detail from crews`;
  return rows as Crew[];
}
