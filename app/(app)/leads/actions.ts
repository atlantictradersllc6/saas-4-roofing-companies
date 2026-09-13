"use server";

import { revalidatePath } from "next/cache";
import { sql, isDbConfigured } from "@/lib/db";
import { currentCompanyId } from "@/lib/tenant";
import { addPreviewLead, updatePreviewLeadStage } from "@/lib/preview-store";
import type { LeadStage } from "@/lib/types";

/**
 * Server Actions — run ON THE SERVER. Writes persist to Neon (scoped to the
 * signed-in user's company) when DATABASE_URL is set, else to the in-memory
 * preview store.
 */

export type LeadFormState = { ok: boolean; error?: string };

const STAGES: LeadStage[] = ["new", "contacted", "inspection", "quoted", "won"];

export async function createLead(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const value = Math.max(0, Math.round(Number(formData.get("value")) || 0));
  const stageRaw = String(formData.get("stage") ?? "new") as LeadStage;
  const stage = STAGES.includes(stageRaw) ? stageRaw : "new";
  const source = String(formData.get("source") ?? "").trim() || "Manual";
  const phone = String(formData.get("phone") ?? "").trim();
  const scope = String(formData.get("scope") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) return { ok: false, error: "Customer name is required." };
  if (!address) return { ok: false, error: "Address is required." };

  if (isDbConfigured() && sql) {
    const companyId = await currentCompanyId();
    if (!companyId) return { ok: false, error: "Not signed in." };
    await sql`
      insert into leads (company_id, name, address, value, stage, source, phone, scope, notes)
      values (${companyId}, ${name}, ${address}, ${value}, ${stage}, ${source}, ${phone}, ${scope}, ${notes})
    `;
  } else {
    addPreviewLead({
      id: `local-${Date.now()}`, name, address, value, stage, source, phone, scope, notes,
    });
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { ok: true };
}

export type StageResult = { ok: boolean; error?: string };

export async function updateLeadStage(
  leadId: string,
  stage: LeadStage,
): Promise<StageResult> {
  if (!leadId) return { ok: false, error: "Missing lead id." };
  if (!STAGES.includes(stage)) return { ok: false, error: "Invalid stage." };

  if (isDbConfigured() && sql) {
    const companyId = await currentCompanyId();
    if (!companyId) return { ok: false, error: "Not signed in." };
    // The company_id guard makes it impossible to move another tenant's lead.
    await sql`
      update leads set stage = ${stage}
      where id = ${leadId} and company_id = ${companyId}
    `;
  } else {
    const ok = updatePreviewLeadStage(leadId, stage);
    if (!ok) return { ok: false, error: "Lead not found." };
  }

  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return { ok: true };
}
