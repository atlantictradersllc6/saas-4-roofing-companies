"use server";

import { revalidatePath } from "next/cache";
import { sql, isDbConfigured } from "@/lib/db";
import { addPreviewInvoice } from "@/lib/preview-store";
import { getInvoices } from "@/lib/queries";
import { nextRef } from "@/lib/format";
import type { InvoiceStatus } from "@/lib/types";

export type InvoiceFormState = { ok: boolean; error?: string };

const STATUSES: InvoiceStatus[] = ["draft", "deposit", "paid", "overdue"];

export async function createInvoice(
  _prev: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  const customer = String(formData.get("customer") ?? "").trim();
  const sub = String(formData.get("sub") ?? "").trim();
  const job = String(formData.get("job") ?? "").trim();
  const amount = Math.max(0, Math.round(Number(formData.get("amount")) || 0));
  const statusRaw = String(formData.get("status") ?? "draft") as InvoiceStatus;
  const status = STATUSES.includes(statusRaw) ? statusRaw : "draft";
  const due = String(formData.get("due") ?? "").trim();

  if (!customer) return { ok: false, error: "Customer is required." };
  if (amount <= 0) return { ok: false, error: "Amount must be greater than 0." };

  // A paid invoice has no balance; anything else is owed in full to start.
  const balance = status === "paid" ? 0 : amount;

  // Reuse the query layer so the next number is derived the same way in both
  // preview and connected modes.
  const ref = nextRef(
    (await getInvoices()).map((i) => i.ref),
    "INV",
    2092,
  );

  if (isDbConfigured() && sql) {
    await sql`
      insert into invoices (ref, customer, sub, job, amount, balance, due, status)
      values (${ref}, ${customer}, ${sub}, ${job}, ${amount}, ${balance}, ${due}, ${status})
    `;
  } else {
    addPreviewInvoice({
      id: `local-${Date.now()}`,
      ref,
      customer,
      sub,
      job,
      amount,
      balance,
      due,
      status,
    });
  }

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  return { ok: true };
}
