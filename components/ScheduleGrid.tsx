"use client";

import { useState } from "react";
import type { Crew, ScheduledJob, JobType } from "@/lib/types";
import { initials, avatarColor } from "@/lib/format";
import { IconClose } from "./icons";

const JOB_COLORS: Record<JobType, [string, string]> = {
  install: ["var(--clay)", "var(--clay-soft)"],
  repair: ["var(--slate)", "var(--slate-soft)"],
  inspection: ["var(--good)", "var(--good-soft)"],
  tentative: ["var(--warn)", "var(--warn-soft)"],
};

export default function ScheduleGrid({
  crews,
  jobs,
  days,
}: {
  crews: Crew[];
  jobs: ScheduledJob[];
  days: string[];
}) {
  const [active, setActive] = useState<
    (ScheduledJob & { crewName: string }) | null
  >(null);

  return (
    <>
      <div
        className="sched"
        style={{ gridTemplateColumns: `130px repeat(${days.length}, 1fr)` }}
      >
        <div className="sched-hcell">Crew</div>
        {days.map((d) => {
          const [dow, dt] = d.split(" ");
          return (
            <div className="sched-hcell" key={d}>
              {dow} <span className="sh-day">{dt}</span>
            </div>
          );
        })}

        {crews.map((c, ci) => (
          <div style={{ display: "contents" }} key={c.id}>
            <div className="crew-label">
              <span className="avatar" style={{ background: avatarColor(ci) }}>
                {initials(c.name)}
              </span>
              <div>
                <div className="cl-name">{c.name}</div>
                <div className="cl-sub">
                  {c.lead} · {c.detail}
                </div>
              </div>
            </div>
            {days.map((_, di) => {
              const cell = jobs.filter(
                (j) => j.crewIndex === ci && j.dayIndex === di,
              );
              return (
                <div className="sched-cell" key={di}>
                  {cell.map((j) => {
                    const [bar, bg] = JOB_COLORS[j.type];
                    return (
                      <button
                        key={j.id}
                        className="job-block"
                        style={
                          { "--jc": bar, "--jc-bg": bg } as React.CSSProperties
                        }
                        onClick={() =>
                          setActive({ ...j, crewName: `${c.name} · ${c.lead}` })
                        }
                      >
                        <div className="jb-name">{j.name}</div>
                        <div className="jb-meta">{j.meta}</div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sched-legend">
        <span><span className="dot" style={{ background: "var(--clay)" }} />Tear-off &amp; install</span>
        <span><span className="dot" style={{ background: "var(--slate)" }} />Repair</span>
        <span><span className="dot" style={{ background: "var(--good)" }} />Inspection</span>
        <span><span className="dot" style={{ background: "var(--warn)" }} />Tentative</span>
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
              <span className="pill clay">Scheduled job</span>
              <h2 style={{ fontSize: 22, marginTop: 12 }}>{active.name}</h2>
              <div className="page-sub" style={{ marginTop: 4 }}>
                {active.crewName}
              </div>
            </div>
            <div className="drawer-body">
              <div className="kv-grid">
                <div className="field">
                  <div className="f-label">Crew</div>
                  <div className="f-val">{active.crewName}</div>
                </div>
                <div className="field">
                  <div className="f-label">Detail</div>
                  <div className="f-val mono">{active.meta}</div>
                </div>
              </div>
              <div className="field">
                <div className="f-label">Site checklist</div>
                <div
                  className="note-box"
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <label style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <input type="checkbox" defaultChecked /> Materials staged on site
                  </label>
                  <label style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <input type="checkbox" defaultChecked /> Dumpster delivered
                  </label>
                  <label style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <input type="checkbox" /> Final photos uploaded
                  </label>
                  <label style={{ display: "flex", gap: 9, alignItems: "center" }}>
                    <input type="checkbox" /> City inspection scheduled
                  </label>
                </div>
              </div>
            </div>
            <div className="drawer-foot">
              <button className="btn primary" style={{ flex: 1 }}>
                Open job file
              </button>
              <button className="btn">Reassign</button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
