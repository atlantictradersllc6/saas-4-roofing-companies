"use server";

import { signOut } from "@/auth";
import { sql, isDbConfigured } from "@/lib/db";
import { currentCompanyId } from "@/lib/tenant";
import {
  getPreviewLeads,
  getPreviewEstimates,
  getPreviewInvoices,
} from "@/lib/preview-store";

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export type SearchResult = {
  type: "Lead" | "Estimate" | "Invoice";
  label: string;
  sub: string;
  href: string;
};

/**
 * Global search across the signed-in company's leads, estimates and invoices.
 * Company-scoped, so one tenant can never surface another's records.
 */
export async function searchAll(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  if (isDbConfigured() && sql) {
    const companyId = await currentCompanyId();
    if (!companyId) return [];
    const like = `%${q}%`;

    const [leads, estimates, invoices] = await Promise.all([
      sql`select name, address from leads
          where company_id = ${companyId}
            and (name ilike ${like} or address ilike ${like} or phone ilike ${like})
          limit 5`,
      sql`select ref, name from estimates
          where company_id = ${companyId}
            and (name ilike ${like} or ref ilike ${like} or address ilike ${like})
          limit 5`,
      sql`select ref, customer, job from invoices
          where company_id = ${companyId}
            and (customer ilike ${like} or ref ilike ${like} or job ilike ${like})
          limit 5`,
    ]);

    return [
      ...leads.map((l) => ({ type: "Lead" as const, label: l.name as string, sub: l.address as string, href: "/leads" })),
      ...estimates.map((e) => ({ type: "Estimate" as const, label: `${e.ref} · ${e.name}`, sub: "", href: "/estimates" })),
      ...invoices.map((i) => ({ type: "Invoice" as const, label: `${i.ref} · ${i.customer}`, sub: (i.job as string) ?? "", href: "/invoices" })),
    ];
  }

  // Preview mode
  const ql = q.toLowerCase();
  const has = (...vals: (string | undefined)[]) =>
    vals.some((v) => (v ?? "").toLowerCase().includes(ql));

  const leads = getPreviewLeads()
    .filter((l) => has(l.name, l.address, l.phone))
    .slice(0, 5)
    .map((l) => ({ type: "Lead" as const, label: l.name, sub: l.address, href: "/leads" }));
  const estimates = getPreviewEstimates()
    .filter((e) => has(e.name, e.ref, e.address))
    .slice(0, 5)
    .map((e) => ({ type: "Estimate" as const, label: `${e.ref} · ${e.name}`, sub: "", href: "/estimates" }));
  const invoices = getPreviewInvoices()
    .filter((i) => has(i.customer, i.ref, i.job))
    .slice(0, 5)
    .map((i) => ({ type: "Invoice" as const, label: `${i.ref} · ${i.customer}`, sub: i.job, href: "/invoices" }));

  return [...leads, ...estimates, ...invoices];
}
