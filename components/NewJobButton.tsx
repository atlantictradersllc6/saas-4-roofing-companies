"use client";

import { useActionState, useEffect, useState } from "react";
import { createJob, type JobFormState } from "@/app/(app)/schedule/actions";
import type { Crew } from "@/lib/types";
import { IconPlus, IconClose } from "./icons";

const INITIAL: JobFormState = { ok: false };

export default function NewJobButton({
  crews,
  days,
}: {
  crews: Crew[];
  days: string[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <IconPlus />
        Book job
      </button>
      {open && <NewJobDialog crews={crews} days={days} onClose={() => setOpen(false)} />}
    </>
  );
}

function NewJobDialog({
  crews,
  days,
  onClose,
}: {
  crews: Crew[];
  days: string[];
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(createJob, INITIAL);

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
        aria-label="Book job"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Book job</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <form action={formAction}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-row full">
                <label htmlFor="nj-name">Job</label>
                <input id="nj-name" className="input" name="name" placeholder="Delgado tear-off" required autoFocus />
              </div>
              <div className="form-row">
                <label htmlFor="nj-crew">Crew</label>
                <select id="nj-crew" className="input" name="crewIndex" defaultValue="0">
                  {crews.map((c, i) => (
                    <option key={c.id} value={i}>
                      {c.name} — {c.lead}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="nj-day">Day</label>
                <select id="nj-day" className="input" name="dayIndex" defaultValue="0">
                  {days.map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="nj-type">Type</label>
                <select id="nj-type" className="input" name="type" defaultValue="install">
                  <option value="install">Tear-off &amp; install</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="tentative">Tentative</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="nj-meta">Detail</label>
                <input id="nj-meta" className="input" name="meta" placeholder="28 sq · 6/12" />
              </div>
            </div>
          </div>
          <div className="modal-foot">
            {state.error && <span className="form-error">{state.error}</span>}
            <button type="button" className="btn" onClick={onClose} disabled={pending}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={pending}>
              {pending ? "Booking…" : "Book job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
