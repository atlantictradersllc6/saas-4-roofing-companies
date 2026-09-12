"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createInvoice,
  type InvoiceFormState,
} from "@/app/(app)/invoices/actions";
import { IconPlus, IconClose } from "./icons";

const INITIAL: InvoiceFormState = { ok: false };

export default function NewInvoiceButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <IconPlus />
        New invoice
      </button>
      {open && <NewInvoiceDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function NewInvoiceDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createInvoice, INITIAL);

  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-label="New invoice"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>New invoice</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <form action={formAction}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row full">
                <label htmlFor="ni-customer">Customer</label>
                <input
                  id="ni-customer"
                  className="input"
                  name="customer"
                  placeholder="e.g. Delgado Residence"
                  required
                  autoFocus
                />
              </div>
              <div className="form-row full">
                <label htmlFor="ni-sub">Reference / contact</label>
                <input
                  id="ni-sub"
                  className="input"
                  name="sub"
                  placeholder="State Farm claim #SF-4471 · or a phone number"
                />
              </div>
              <div className="form-row full">
                <label htmlFor="ni-job">Job</label>
                <input
                  id="ni-job"
                  className="input"
                  name="job"
                  placeholder="Full replacement · 28 sq"
                />
              </div>
              <div className="form-row">
                <label htmlFor="ni-amount">Amount ($)</label>
                <input
                  id="ni-amount"
                  className="input num"
                  name="amount"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="18400"
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="ni-status">Status</label>
                <select
                  id="ni-status"
                  className="input"
                  name="status"
                  defaultValue="draft"
                >
                  <option value="draft">Draft</option>
                  <option value="deposit">Deposit paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="form-row full">
                <label htmlFor="ni-due">Due</label>
                <input
                  id="ni-due"
                  className="input"
                  name="due"
                  placeholder="Oct 15"
                />
              </div>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                margin: "14px 0 0",
              }}
            >
              Balance is set automatically — $0 when marked paid, otherwise the
              full amount.
            </p>
          </div>

          <div className="modal-foot">
            {state.error && <span className="form-error">{state.error}</span>}
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={pending}>
              {pending ? "Saving…" : "Create invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
