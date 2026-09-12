import Topbar from "@/components/Topbar";
import { getInvoices, getLeads } from "@/lib/queries";
import { REVENUE, ACTIVITY } from "@/lib/sample-data";
import { moneyK } from "@/lib/format";
import {
  IconLeads,
  IconEstimates,
  IconSchedule,
  IconInvoices,
} from "@/components/icons";

const TODAY = [
  { time: "7:00a", name: "Delgado — Tear-off & install", meta: "Crew A · Miguel R. · 4114 Cedar Bluff Dr", tag: ["clay", "In progress"] },
  { time: "10:30a", name: "Marsh — Repair inspection", meta: "Devon K. · 12 Hollow Springs", tag: ["good", "Scheduled"] },
  { time: "1:00p", name: "Barrett — Adjuster meeting", meta: "Devon K. · 1720 Lark Meadow", tag: ["slate", "Scheduled"] },
  { time: "3:30p", name: "Castellano — Final walkthrough", meta: "Crew B · Andre T. · 77 Miller Grove", tag: ["warn", "Tentative"] },
];

// Always render on request so the page reflects the live database.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Server-side data fetch — runs on the server, before the page is sent.
  const [leads, invoices] = await Promise.all([getLeads(), getInvoices()]);

  const openLeads = leads.filter((l) => l.stage !== "won").length;
  const pipeline = leads
    .filter((l) => l.stage !== "won")
    .reduce((a, l) => a + l.value, 0);
  const outstanding = invoices.reduce((a, v) => a + v.balance, 0);
  const maxRev = Math.max(...REVENUE.map((r) => r.value));

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Tuesday, September 9 · Summit Ridge Roofing, Austin TX"
      />
      <div className="content">
        <div className="kpis">
          <div className="kpi">
            <div className="k-label"><IconLeads />Open leads</div>
            <div className="k-val">{openLeads}</div>
            <div className="k-trend up">▲ 3 new this week</div>
          </div>
          <div className="kpi">
            <div className="k-label"><IconEstimates />Pipeline value</div>
            <div className="k-val">{moneyK(pipeline)}</div>
            <div className="k-trend up">▲ 18% vs. last mo.</div>
          </div>
          <div className="kpi">
            <div className="k-label"><IconSchedule />Jobs this week</div>
            <div className="k-val">7</div>
            <div className="k-trend up">2 crews · 4 booked</div>
          </div>
          <div className="kpi">
            <div className="k-label"><IconInvoices />Outstanding A/R</div>
            <div className="k-val">{moneyK(outstanding)}</div>
            <div className="k-trend down">1 invoice overdue</div>
          </div>
        </div>

        <div className="dash-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="section-head" style={{ padding: "18px 20px 0", marginBottom: 0 }}>
                <div>
                  <h3>Revenue collected</h3>
                  <div className="page-sub">Last 6 months · thousands USD</div>
                </div>
                <button className="link">View report →</button>
              </div>
              <div className="chart-wrap">
                <div className="bars">
                  {REVENUE.map((r) => {
                    const h = Math.round((r.value / maxRev) * 100);
                    const cur = r.month === "Sep";
                    return (
                      <div className="bar-col" key={r.month}>
                        <div className="bar-val">{r.value}</div>
                        <div className="bar" style={{ height: "100%" }}>
                          <div
                            className="fill"
                            style={{
                              height: `${h}%`,
                              ...(cur ? {} : { background: "var(--slate)" }),
                            }}
                          />
                        </div>
                        <div className="bar-x">{r.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-head" style={{ padding: "18px 20px 0", marginBottom: 0 }}>
                <h3>Today&apos;s schedule</h3>
                <span className="pill slate">
                  <span className="dot" style={{ background: "var(--slate)" }} />
                  2 crews active
                </span>
              </div>
              <div className="row-list">
                {TODAY.map((j) => (
                  <div className="row-item" key={j.name}>
                    <div className="row-time">{j.time}</div>
                    <div className="row-main">
                      <div className="row-title">{j.name}</div>
                      <div className="row-meta">{j.meta}</div>
                    </div>
                    <span className={`pill ${j.tag[0]}`}>
                      <span className="dot" style={{ background: "currentColor" }} />
                      {j.tag[1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ alignSelf: "start" }}>
            <div className="section-head" style={{ padding: "18px 20px 0", marginBottom: 0 }}>
              <h3>Activity</h3>
              <button className="link">All</button>
            </div>
            <div className="timeline">
              {ACTIVITY.map((a, i) => (
                <div className="tl-item" key={i}>
                  <div className="tl-dot" style={{ background: a.color }} />
                  <div>
                    <div
                      className="tl-text"
                      dangerouslySetInnerHTML={{ __html: a.text }}
                    />
                    <div className="tl-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
