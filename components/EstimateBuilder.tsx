"use client";

import { useMemo, useState, useTransition } from "react";
import type { Estimate, EstimateLine, EstimateStatus } from "@/lib/types";
import { money } from "@/lib/format";
import { saveEstimateLines, sendProposal } from "@/app/(app)/estimates/actions";
import { IconSend, IconPlus, IconClose } from "./icons";

const STATUS_PILL: Record<EstimateStatus, [string, string]> = {
  draft: ["slate", "Draft"],
  sent: ["warn", "Sent"],
  approved: ["good", "Approved"],
  declined: ["bad", "Declined"],
};
const TAX_RATE = 0.0825;

export default function EstimateBuilder({
  estimates,
}: {
  estimates: Estimate[];
}) {
  const [activeId, setActiveId] = useState(estimates[0]?.id);
  // Editable working copy of the selected estimate's line items. This is the
  // whole point of React: change this array and every total below updates
  // itself — no manual DOM syncing.
  const [lines, setLines] = useState<EstimateLine[]>(estimates[0]?.lines ?? []);
  const [dirty, setDirty] = useState(false); // unsaved edits on the current estimate
  const [saved, setSaved] = useState(false); // brief "Saved ✓" confirmation
  const [isSaving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [isSending, startSending] = useTransition();
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const active = estimates.find((e) => e.id === activeId)!;

  const select = (e: Estimate) => {
    setActiveId(e.id);
    setLines(e.lines.map((l) => ({ ...l }))); // fresh copy so edits are isolated
    setDirty(false);
    setSaved(false);
    setSaveError(null);
  };

  // Any edit marks the estimate dirty and clears the "saved" flag.
  const edit = (fn: (prev: EstimateLine[]) => EstimateLine[]) => {
    setLines(fn);
    setDirty(true);
    setSaved(false);
  };

  const updateAmount = (i: number, value: number) =>
    edit((prev) => prev.map((l, idx) => (idx === i ? { ...l, amount: value } : l)));

  const updateDescription = (i: number, value: string) =>
    edit((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, description: value } : l)),
    );

  const removeLine = (i: number) =>
    edit((prev) => prev.filter((_, idx) => idx !== i));

  const addLine = () =>
    edit((prev) => [
      ...prev,
      { description: "New line item", qty: "1 ea", rate: 0, amount: 0 },
    ]);

  const save = () => {
    setSaveError(null);
    startSaving(async () => {
      const res = await saveEstimateLines(activeId, lines);
      if (res.ok) {
        setDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError(res.error ?? "Could not save.");
      }
    });
  };

  const doSend = () => {
    setSendMsg(null);
    startSending(async () => {
      const res = await sendProposal(activeId, sendEmail);
      if (res.ok) {
        setSendOpen(false);
        setSendMsg({ ok: true, text: `Proposal ${active.ref} emailed to ${sendEmail}.` });
        setSendEmail("");
        setTimeout(() => setSendMsg(null), 4000);
      } else {
        setSendMsg({ ok: false, text: res.error ?? "Could not send." });
      }
    });
  };

  const { subtotal, tax, total } = useMemo(() => {
    const subtotal = lines.reduce((a, l) => a + (l.amount || 0), 0);
    const tax = Math.round(subtotal * TAX_RATE);
    return { subtotal, tax, total: subtotal + tax };
  }, [lines]);

  if (estimates.length === 0 || !active) {
    return (
      <div className="card" style={{ padding: "48px 24px", textAlign: "center", color: "var(--muted)" }}>
        No estimates yet — click <b>New estimate</b> to create your first one.
      </div>
    );
  }

  return (
    <div className="est-layout">
      {/* --- left: estimate picker --- */}
      <div>
        {estimates.map((e) => {
          const t =
            e.lines.reduce((a, l) => a + l.amount, 0) * (1 + TAX_RATE);
          const [cls, label] = STATUS_PILL[e.status];
          return (
            <button
              key={e.id}
              className={"est-list-item" + (e.id === activeId ? " active" : "")}
              onClick={() => select(e)}
            >
              <div className="eli-top">
                <span className="eli-name">{e.name}</span>
                <span className={`pill ${cls}`}>{label}</span>
              </div>
              <div className="eli-id">
                {e.ref} · {e.date}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <span className="page-sub" style={{ margin: 0 }}>
                  {e.squares} sq · {e.pitch}
                </span>
                <span className="eli-val">{money(Math.round(t))}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* --- right: the estimate document --- */}
      <div className="card est-doc">
        <div className="est-doc-head">
          <div>
            <div className="page-sub" style={{ margin: "0 0 2px" }}>
              {active.ref} · {active.date}
            </div>
            <h2 style={{ fontSize: 20 }}>{active.name}</h2>
            <div className="page-sub" style={{ marginTop: 3 }}>
              {active.address}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={`pill ${STATUS_PILL[active.status][0]}`}>
              {STATUS_PILL[active.status][1]}
            </span>
            <div className="page-sub" style={{ marginTop: 8 }}>
              Summit Ridge Roofing
              <br />
              License #TX-RCAT-118420
            </div>
          </div>
        </div>

        <div className="measure-grid">
          <div className="measure-cell">
            <div className="mc-label">Roof area</div>
            <div className="mc-val">
              {active.squares}
              <small> squares</small>
            </div>
          </div>
          <div className="measure-cell">
            <div className="mc-label">Pitch</div>
            <div className="mc-val">{active.pitch}</div>
          </div>
          <div className="measure-cell">
            <div className="mc-label">Existing layers</div>
            <div className="mc-val">{active.layers}</div>
          </div>
          <div className="measure-cell">
            <div className="mc-label">Waste factor</div>
            <div className="mc-val">{active.waste}</div>
          </div>
        </div>

        <div className="table-wrap" style={{ padding: "0 4px" }}>
          <table>
            <thead>
              <tr>
                <th style={{ paddingLeft: 24 }}>Line item</th>
                <th className="r">Qty</th>
                <th className="r">Rate</th>
                <th className="r">Amount</th>
                <th style={{ paddingRight: 20, width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i}>
                  <td style={{ paddingLeft: 20, maxWidth: 340 }}>
                    <input
                      value={l.description}
                      onChange={(e) => updateDescription(i, e.target.value)}
                      aria-label="Line item description"
                      style={{
                        width: "100%",
                        border: "1px solid transparent",
                        background: "transparent",
                        borderRadius: 6,
                        padding: "4px 8px",
                        color: "var(--ink)",
                        fontFamily: "inherit",
                        fontSize: 13,
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "var(--line)";
                        e.target.style.background = "var(--surface-2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "transparent";
                        e.target.style.background = "transparent";
                      }}
                    />
                  </td>
                  <td className="r num" style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>
                    {l.qty}
                  </td>
                  <td className="r num" style={{ color: "var(--muted)" }}>
                    ${l.rate.toLocaleString()}
                  </td>
                  <td className="r">
                    <input
                      className="num"
                      type="number"
                      value={l.amount}
                      onChange={(e) => updateAmount(i, Number(e.target.value))}
                      style={{
                        width: 92,
                        textAlign: "right",
                        border: "1px solid var(--line)",
                        background: "var(--surface-2)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        fontWeight: 600,
                        color: "var(--ink)",
                        fontFamily: "var(--mono)",
                      }}
                    />
                  </td>
                  <td style={{ paddingRight: 16, textAlign: "right" }}>
                    <button
                      onClick={() => removeLine(i)}
                      aria-label="Remove line"
                      style={{
                        border: "none",
                        background: "none",
                        color: "var(--faint)",
                        width: 22,
                        height: 22,
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <span style={{ width: 14, height: 14, display: "block" }}>
                        <IconClose />
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "10px 24px 0" }}>
          <button className="btn" onClick={addLine}>
            <IconPlus />
            Add line item
          </button>
        </div>

        <div className="est-total">
          <div className="tot-row">
            <span style={{ color: "var(--muted)" }}>Subtotal</span>
            <span className="num">{money(subtotal)}</span>
          </div>
          <div className="tot-row">
            <span style={{ color: "var(--muted)" }}>Sales tax (8.25%)</span>
            <span className="num">{money(tax)}</span>
          </div>
          <div className="tot-row grand">
            <span>Total</span>
            <span className="num">{money(total)}</span>
          </div>
        </div>

        <div
          style={{
            padding: "0 24px 22px",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <button
            className="btn primary"
            onClick={() => { setSendMsg(null); setSendOpen(true); }}
          >
            <IconSend />
            Send proposal
          </button>
          <button
            className="btn"
            onClick={save}
            disabled={isSaving || (!dirty && !saved)}
          >
            {isSaving ? "Saving…" : saved ? "Saved ✓" : "Save line items"}
          </button>
          {dirty && !isSaving && (
            <span style={{ fontSize: 12, color: "var(--warn)", fontWeight: 600 }}>
              Unsaved changes
            </span>
          )}
          {saveError && (
            <span style={{ fontSize: 12, color: "var(--bad)" }}>{saveError}</span>
          )}
          {sendMsg && (
            <span style={{ fontSize: 12, color: sendMsg.ok ? "var(--good)" : "var(--bad)", fontWeight: 600 }}>
              {sendMsg.text}
            </span>
          )}
        </div>
      </div>

      {sendOpen && (
        <div className="modal-scrim" onClick={() => setSendOpen(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-label="Send proposal"
            style={{ maxWidth: 460 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2>Send proposal</h2>
              <button className="icon-btn" onClick={() => setSendOpen(false)} aria-label="Close">
                <IconClose />
              </button>
            </div>
            <div className="modal-body">
              <p className="page-sub" style={{ marginTop: 0 }}>
                Email a PDF of <b>{active.ref} — {active.name}</b> to your customer.
                The estimate will be marked <b>Sent</b>.
              </p>
              <div className="form-row full">
                <label htmlFor="send-email">Customer email</label>
                <input
                  id="send-email"
                  className="input"
                  type="email"
                  placeholder="customer@example.com"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-foot">
              {sendMsg && !sendMsg.ok && (
                <span className="form-error">{sendMsg.text}</span>
              )}
              <button className="btn" onClick={() => setSendOpen(false)} disabled={isSending}>
                Cancel
              </button>
              <button className="btn primary" onClick={doSend} disabled={isSending}>
                {isSending ? "Sending…" : "Send proposal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
