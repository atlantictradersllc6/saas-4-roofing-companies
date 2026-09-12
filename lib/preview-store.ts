import { SAMPLE_LEADS, SAMPLE_INVOICES, SAMPLE_ESTIMATES } from "./sample-data";
import type {
  Lead,
  LeadStage,
  Invoice,
  Estimate,
  EstimateLine,
} from "./types";

/**
 * In-memory store used ONLY in preview mode (no Supabase keys).
 *
 * It lets the "New ___" buttons visibly work in the demo. But notice the
 * limits — this is state in the running server process: it resets when the dev
 * server restarts and isn't shared across serverless instances in production.
 * That is exactly *why* real persistence needs the database. Once Supabase is
 * connected, this file is bypassed entirely (see lib/queries.ts).
 *
 * We hang it off globalThis so it survives dev-server hot reloads.
 */
type Store = {
  leads?: Lead[];
  invoices?: Invoice[];
  estimates?: Estimate[];
};
const g = globalThis as unknown as { __ridgeline?: Store };
if (!g.__ridgeline) g.__ridgeline = {};
const store = g.__ridgeline;

if (!store.leads) store.leads = SAMPLE_LEADS.map((l) => ({ ...l }));
if (!store.invoices) store.invoices = SAMPLE_INVOICES.map((i) => ({ ...i }));
if (!store.estimates)
  store.estimates = SAMPLE_ESTIMATES.map((e) => ({
    ...e,
    lines: e.lines.map((l) => ({ ...l })),
  }));

// ---------- leads ----------
export const getPreviewLeads = (): Lead[] => store.leads!;
export const addPreviewLead = (lead: Lead) => store.leads!.unshift(lead);

/** Move a lead to a different pipeline stage. False if the lead is gone. */
export function updatePreviewLeadStage(id: string, stage: LeadStage): boolean {
  const lead = store.leads!.find((l) => l.id === id);
  if (!lead) return false;
  lead.stage = stage;
  return true;
}

// ---------- invoices ----------
export const getPreviewInvoices = (): Invoice[] => store.invoices!;
export const addPreviewInvoice = (inv: Invoice) => store.invoices!.unshift(inv);

// ---------- estimates ----------
export const getPreviewEstimates = (): Estimate[] => store.estimates!;
export const addPreviewEstimate = (est: Estimate) =>
  store.estimates!.unshift(est);

/** Replace one estimate's line items. Returns false if the estimate is gone. */
export function updatePreviewEstimateLines(
  id: string,
  lines: EstimateLine[],
): boolean {
  const est = store.estimates!.find((e) => e.id === id);
  if (!est) return false;
  est.lines = lines.map((l) => ({ ...l }));
  return true;
}
