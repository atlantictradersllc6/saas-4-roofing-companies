"use server";

import { revalidatePath } from "next/cache";
import { sql, isDbConfigured } from "@/lib/db";
import {
  addPreviewEstimate,
  updatePreviewEstimateLines,
} from "@/lib/preview-store";
import { getEstimates } from "@/lib/queries";
import { nextRef } from "@/lib/format";
import type { EstimateStatus, EstimateLine } from "@/lib/types";

export type EstimateFormState = { ok: boolean; error?: string };

const STATUSES: EstimateStatus[] = ["draft", "sent", "approved", "declined"];

export async function createEstimate(
  _prev: EstimateFormState,
  formData: FormData,
): Promise<EstimateFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const squares = Math.max(0, Math.round(Number(formData.get("squares")) || 0));
  const pitch = String(formData.get("pitch") ?? "").trim() || "6/12";
  const layers = Math.max(1, Math.round(Number(formData.get("layers")) || 1));
  const waste = String(formData.get("waste") ?? "").trim() || "12%";
  const statusRaw = String(formData.get("status") ?? "draft") as EstimateStatus;
  const status = STATUSES.includes(statusRaw) ? statusRaw : "draft";

  if (!name) return { ok: false, error: "Project / customer name is required." };

  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const ref = nextRef(
    (await getEstimates()).map((e) => e.ref),
    "EST",
    1046,
  );

  if (isDbConfigured() && sql) {
    // Insert the header only; line items are added afterward in the builder.
    await sql`
      insert into estimates (ref, name, address, date, status, squares, pitch, layers, waste)
      values (${ref}, ${name}, ${address}, ${date}, ${status}, ${squares}, ${pitch}, ${layers}, ${waste})
    `;
  } else {
    addPreviewEstimate({
      id: `local-${Date.now()}`,
      ref,
      name,
      address,
      date,
      status,
      squares,
      pitch,
      layers,
      waste,
      lines: [],
    });
  }

  revalidatePath("/estimates");
  return { ok: true };
}

export type SaveLinesResult = { ok: boolean; error?: string };

/**
 * Persist the full set of line items for one estimate. Called from the builder
 * with the current lines array (structured args, not FormData — Server Actions
 * serialize arguments for you). We replace the estimate's lines wholesale:
 * simplest correct strategy for an editable list of this size.
 */
export async function saveEstimateLines(
  estimateId: string,
  lines: EstimateLine[],
): Promise<SaveLinesResult> {
  if (!estimateId) return { ok: false, error: "Missing estimate id." };

  // Sanitize on the server — never trust the shape the client sent.
  const clean: EstimateLine[] = lines.map((l) => ({
    description: String(l.description ?? "").trim() || "Untitled item",
    qty: String(l.qty ?? "").trim(),
    rate: Math.max(0, Number(l.rate) || 0),
    amount: Math.max(0, Number(l.amount) || 0),
  }));

  if (isDbConfigured() && sql) {
    // Replace: delete the old rows, insert the new ones in order.
    await sql`delete from estimate_lines where estimate_id = ${estimateId}`;
    for (let position = 0; position < clean.length; position++) {
      const l = clean[position];
      await sql`
        insert into estimate_lines (estimate_id, description, qty, rate, amount, position)
        values (${estimateId}, ${l.description}, ${l.qty}, ${l.rate}, ${l.amount}, ${position})
      `;
    }
  } else {
    const ok = updatePreviewEstimateLines(estimateId, clean);
    if (!ok) return { ok: false, error: "Estimate not found." };
  }

  revalidatePath("/estimates");
  return { ok: true };
}
