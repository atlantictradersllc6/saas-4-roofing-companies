"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createEstimate,
  type EstimateFormState,
} from "@/app/(app)/estimates/actions";
import { IconPlus, IconClose } from "./icons";

const INITIAL: EstimateFormState = { ok: false };

export default function NewEstimateButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <IconPlus />
        New estimate
      </button>
      {open && <NewEstimateDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function NewEstimateDialog({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createEstimate, INITIAL);

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
        aria-label="New estimate"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>New estimate</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <form action={formAction}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row full">
                <label htmlFor="ne-name">Project / customer</label>
                <input
                  id="ne-name"
                  className="input"
                  name="name"
                  placeholder="e.g. Whitaker Residence"
                  required
                  autoFocus
                />
              </div>
              <div className="form-row full">
                <label htmlFor="ne-address">Property address</label>
                <input
                  id="ne-address"
                  className="input"
                  name="address"
                  placeholder="908 Palmera Ln, Austin TX"
                />
              </div>
              <div className="form-row">
                <label htmlFor="ne-squares">Roof area (squares)</label>
                <input
                  id="ne-squares"
                  className="input num"
                  name="squares"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="34"
                />
              </div>
              <div className="form-row">
                <label htmlFor="ne-pitch">Pitch</label>
                <input
                  id="ne-pitch"
                  className="input"
                  name="pitch"
                  placeholder="6/12"
                  defaultValue="6/12"
                />
              </div>
              <div className="form-row">
                <label htmlFor="ne-layers">Existing layers</label>
                <input
                  id="ne-layers"
                  className="input num"
                  name="layers"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={1}
                />
              </div>
              <div className="form-row">
                <label htmlFor="ne-waste">Waste factor</label>
                <input
                  id="ne-waste"
                  className="input"
                  name="waste"
                  placeholder="12%"
                  defaultValue="12%"
                />
              </div>
              <div className="form-row full">
                <label htmlFor="ne-status">Status</label>
                <select
                  id="ne-status"
                  className="input"
                  name="status"
                  defaultValue="draft"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="approved">Approved</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "var(--muted)",
                margin: "14px 0 0",
              }}
            >
              Creates the estimate header. Add line items in the builder after
              it&apos;s created.
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
              {pending ? "Saving…" : "Create estimate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
