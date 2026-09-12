"use client";

import { useActionState, useEffect, useState } from "react";
import { createLead, type LeadFormState } from "@/app/(app)/leads/actions";
import { IconPlus, IconClose } from "./icons";

const INITIAL: LeadFormState = { ok: false };

export default function NewLeadButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <IconPlus />
        New lead
      </button>
      {open && <NewLeadDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function NewLeadDialog({ onClose }: { onClose: () => void }) {
  // useActionState wires the form to the Server Action and hands back the
  // returned state plus a pending flag — no manual fetch/loading bookkeeping.
  const [state, formAction, pending] = useActionState(createLead, INITIAL);

  // When the action reports success, close the dialog. The server has already
  // revalidated /leads, so the new card is on the board behind us.
  useEffect(() => {
    if (state.ok) onClose();
  }, [state.ok, onClose]);

  // Close on Escape.
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
        aria-label="New lead"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>New lead</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <form action={formAction}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row full">
                <label htmlFor="nl-name">Customer name</label>
                <input
                  id="nl-name"
                  className="input"
                  name="name"
                  placeholder="e.g. Delgado Residence"
                  required
                  autoFocus
                />
              </div>
              <div className="form-row full">
                <label htmlFor="nl-address">Property address</label>
                <input
                  id="nl-address"
                  className="input"
                  name="address"
                  placeholder="4114 Cedar Bluff Dr"
                  required
                />
              </div>
              <div className="form-row">
                <label htmlFor="nl-value">Est. value ($)</label>
                <input
                  id="nl-value"
                  className="input num"
                  name="value"
                  type="number"
                  min="0"
                  step="100"
                  placeholder="18400"
                  defaultValue={0}
                />
              </div>
              <div className="form-row">
                <label htmlFor="nl-stage">Stage</label>
                <select id="nl-stage" className="input" name="stage" defaultValue="new">
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="inspection">Inspection</option>
                  <option value="quoted">Quoted</option>
                  <option value="won">Won</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="nl-source">Source</label>
                <input
                  id="nl-source"
                  className="input"
                  name="source"
                  placeholder="Referral, Website…"
                />
              </div>
              <div className="form-row">
                <label htmlFor="nl-phone">Phone</label>
                <input
                  id="nl-phone"
                  className="input"
                  name="phone"
                  placeholder="(512) 555-0100"
                />
              </div>
              <div className="form-row full">
                <label htmlFor="nl-scope">Scope</label>
                <input
                  id="nl-scope"
                  className="input"
                  name="scope"
                  placeholder="Full replacement · 28 sq · 6/12"
                />
              </div>
              <div className="form-row full">
                <label htmlFor="nl-notes">Notes</label>
                <textarea
                  id="nl-notes"
                  className="input"
                  name="notes"
                  placeholder="How did they come in? Any damage, timeline, adjuster…"
                />
              </div>
            </div>
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
              {pending ? "Saving…" : "Add lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
