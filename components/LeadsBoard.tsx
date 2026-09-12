"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import type { Lead, LeadStage } from "@/lib/types";
import { money, moneyK } from "@/lib/format";
import { updateLeadStage } from "@/app/(app)/leads/actions";
import { IconClose, IconPhone } from "./icons";

const STAGES: { key: LeadStage; name: string; color: string }[] = [
  { key: "new", name: "New", color: "var(--slate)" },
  { key: "contacted", name: "Contacted", color: "#6B4E8C" },
  { key: "inspection", name: "Inspection", color: "var(--warn)" },
  { key: "quoted", name: "Quoted", color: "var(--clay)" },
  { key: "won", name: "Won", color: "var(--good)" },
];

export default function LeadsBoard({ leads }: { leads: Lead[] }) {
  const [active, setActive] = useState<Lead | null>(null);
  const [, startTransition] = useTransition();

  // Optimistic list: when a card is dropped, we reflect the move immediately;
  // the Server Action persists it and the revalidated data replaces this.
  const [optimisticLeads, moveLead] = useOptimistic(
    leads,
    (state, { id, stage }: { id: string; stage: LeadStage }) =>
      state.map((l) => (l.id === id ? { ...l, stage } : l)),
  );

  // Drag state — a ref for the payload (survives re-renders) plus UI flags.
  const dragged = useRef<Lead | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);

  const stageOf = (l: Lead) => STAGES.find((s) => s.key === l.stage)!;

  const onDrop = (stage: LeadStage) => {
    const lead = dragged.current;
    setOverStage(null);
    setDraggingId(null);
    dragged.current = null;
    if (!lead || lead.stage === stage) return;

    startTransition(async () => {
      moveLead({ id: lead.id, stage });
      const res = await updateLeadStage(lead.id, stage);
      if (!res.ok) console.error("Failed to move lead:", res.error);
    });
  };

  return (
    <>
      <div className="kanban">
        {STAGES.map((st) => {
          const items = optimisticLeads.filter((l) => l.stage === st.key);
          const sum = items.reduce((a, l) => a + l.value, 0);
          return (
            <div
              key={st.key}
              className={"kcol-wrap" + (overStage === st.key ? " drag-over" : "")}
              onDragOver={(e) => {
                e.preventDefault(); // required to allow a drop
                if (overStage !== st.key) setOverStage(st.key);
              }}
              onDragLeave={(e) => {
                // Only clear when leaving the column, not its children.
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  setOverStage((s) => (s === st.key ? null : s));
              }}
              onDrop={() => onDrop(st.key)}
            >
              <div className="col-head">
                <span
                  className="col-swatch"
                  style={{ background: st.color }}
                  aria-hidden
                />
                <span className="ch-name">{st.name}</span>
                <span className="ch-count">{items.length}</span>
                <span className="ch-sum">{sum ? moneyK(sum) : ""}</span>
              </div>
              <div className="kcol">
                {items.map((l) => (
                  <button
                    key={l.id}
                    className={
                      "lead-card" + (draggingId === l.id ? " dragging" : "")
                    }
                    style={{ "--stage": st.color } as React.CSSProperties}
                    draggable
                    onDragStart={(e) => {
                      dragged.current = l;
                      setDraggingId(l.id);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", l.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setOverStage(null);
                      dragged.current = null;
                    }}
                    onClick={() => setActive(l)}
                  >
                    <div className="lc-name">{l.name}</div>
                    <div className="lc-addr">{l.address}</div>
                    <div className="lc-row">
                      <span className="lc-val">{money(l.value)}</span>
                      <span className="pill neutral">
                        {l.scope.split("·")[0].trim()}
                      </span>
                    </div>
                    <div className="lc-src">
                      <span className="dot" style={{ background: st.color }} />
                      {l.source}
                    </div>
                  </button>
                ))}
                {items.length === 0 && (
                  <div className="kcol-empty">Drop a lead here</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {active && (
        <>
          <div className="drawer-scrim" onClick={() => setActive(null)} />
          <aside className="drawer" role="dialog" aria-label={active.name}>
            <div className="drawer-head">
              <button
                className="icon-btn close-x"
                onClick={() => setActive(null)}
                aria-label="Close"
              >
                <IconClose />
              </button>
              <span
                className="pill"
                style={{ background: stageOf(active).color, color: "#fff" }}
              >
                {stageOf(active).name}
              </span>
              <h2 style={{ fontSize: 22, marginTop: 12 }}>{active.name}</h2>
              <div className="page-sub" style={{ marginTop: 4 }}>
                {active.address}
              </div>
            </div>
            <div className="drawer-body">
              <div className="kv-grid">
                <div className="field">
                  <div className="f-label">Est. value</div>
                  <div className="f-val mono">{money(active.value)}</div>
                </div>
                <div className="field">
                  <div className="f-label">Source</div>
                  <div className="f-val">{active.source}</div>
                </div>
                <div className="field">
                  <div className="f-label">Phone</div>
                  <div className="f-val mono">{active.phone}</div>
                </div>
                <div className="field">
                  <div className="f-label">Stage</div>
                  <StageSelect
                    lead={active}
                    onMove={(stage) => {
                      setActive({ ...active, stage });
                      startTransition(async () => {
                        moveLead({ id: active.id, stage });
                        await updateLeadStage(active.id, stage);
                      });
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <div className="f-label">Scope</div>
                <div className="f-val" style={{ fontWeight: 400 }}>
                  {active.scope}
                </div>
              </div>
              <div className="field">
                <div className="f-label">Notes</div>
                <div className="note-box">{active.notes}</div>
              </div>
            </div>
            <div className="drawer-foot">
              <button className="btn primary" style={{ flex: 1 }}>
                Build estimate
              </button>
              <button className="btn">
                <IconPhone />
                Call
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// Accessible, keyboard-friendly way to change stage from the drawer — a
// counterpart to drag-and-drop (which is pointer-only).
function StageSelect({
  lead,
  onMove,
}: {
  lead: Lead;
  onMove: (stage: LeadStage) => void;
}) {
  return (
    <select
      className="input"
      value={lead.stage}
      onChange={(e) => onMove(e.target.value as LeadStage)}
      style={{ marginBottom: 0, padding: "6px 10px", fontSize: 13 }}
    >
      {STAGES.map((s) => (
        <option key={s.key} value={s.key}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
