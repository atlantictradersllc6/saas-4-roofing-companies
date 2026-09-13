import { sql, isDbConfigured, num } from "./db";
import { currentCompanyId } from "./tenant";
import {
  getPreviewLeads,
  getPreviewInvoices,
  getPreviewEstimates,
  getPreviewJobs,
} from "./preview-store";
import { SAMPLE_CREWS } from "./sample-data";
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
 * Two switches:
 *   1. No DATABASE_URL → in-memory preview data (local dev without a DB).
 *   2. DB configured → query Neon, ALWAYS scoped to the signed-in user's
 *      company (multi-tenancy). No company in session → empty result.
 */

export async function getLeads(): Promise<Lead[]> {
  if (!isDbConfigured() || !sql) return getPreviewLeads();
  const companyId = await currentCompanyId();
  if (!companyId) return [];

  const rows = await sql`
    select id, name, address, value, stage, source, phone, scope, notes
    from leads where company_id = ${companyId}
    order by value desc
  `;
  return rows.map((r) => ({ ...r, value: num(r.value) })) as Lead[];
}

export async function getEstimates(): Promise<Estimate[]> {
  if (!isDbConfigured() || !sql) return getPreviewEstimates();
  const companyId = await currentCompanyId();
  if (!companyId) return [];

  const estimates = await sql`
    select id, ref, name, address, date, status, squares, pitch, layers, waste
    from estimates where company_id = ${companyId}
    order by created_at desc
  `;
  const lines = await sql`
    select el.estimate_id, el.description, el.qty, el.rate, el.amount
    from estimate_lines el
    join estimates e on e.id = el.estimate_id
    where e.company_id = ${companyId}
    order by el.position asc
  `;

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
  const companyId = await currentCompanyId();
  if (!companyId) return [];

  const rows = await sql`
    select id, ref, customer, sub, job, amount, balance, due, status
    from invoices where company_id = ${companyId}
  `;
  return rows.map((r) => ({
    ...r,
    amount: num(r.amount),
    balance: num(r.balance),
  })) as Invoice[];
}

export async function getJobs(): Promise<ScheduledJob[]> {
  if (!isDbConfigured() || !sql) return getPreviewJobs();
  const companyId = await currentCompanyId();
  if (!companyId) return [];

  const rows = await sql`
    select id, crew_index as "crewIndex", day_index as "dayIndex", name, meta, type
    from scheduled_jobs where company_id = ${companyId}
  `;
  return rows as ScheduledJob[];
}

export async function getCrews(): Promise<Crew[]> {
  if (!isDbConfigured() || !sql) return SAMPLE_CREWS;
  const companyId = await currentCompanyId();
  if (!companyId) return [];

  const rows = await sql`
    select id, name, lead, detail from crews where company_id = ${companyId}
  `;
  return rows as Crew[];
}
