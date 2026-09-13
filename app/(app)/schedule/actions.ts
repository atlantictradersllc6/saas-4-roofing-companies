"use server";

import { revalidatePath } from "next/cache";
import { sql, isDbConfigured } from "@/lib/db";
import { currentCompanyId } from "@/lib/tenant";
import { addPreviewJob } from "@/lib/preview-store";
import type { JobType } from "@/lib/types";

export type JobFormState = { ok: boolean; error?: string };

const TYPES: JobType[] = ["install", "repair", "inspection", "tentative"];

export async function createJob(
  _prev: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const crewIndex = Math.max(0, Math.round(Number(formData.get("crewIndex")) || 0));
  const dayIndex = Math.max(0, Math.round(Number(formData.get("dayIndex")) || 0));
  const name = String(formData.get("name") ?? "").trim();
  const meta = String(formData.get("meta") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "install") as JobType;
  const type = TYPES.includes(typeRaw) ? typeRaw : "install";

  if (!name) return { ok: false, error: "Job name is required." };

  if (isDbConfigured() && sql) {
    const companyId = await currentCompanyId();
    if (!companyId) return { ok: false, error: "Not signed in." };
    await sql`
      insert into scheduled_jobs (company_id, crew_index, day_index, name, meta, type)
      values (${companyId}, ${crewIndex}, ${dayIndex}, ${name}, ${meta}, ${type})
    `;
  } else {
    addPreviewJob({ id: `local-${Date.now()}`, crewIndex, dayIndex, name, meta, type });
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return { ok: true };
}
