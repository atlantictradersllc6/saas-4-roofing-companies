"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconLeads,
  IconEstimates,
  IconSchedule,
  IconInvoices,
  IconRoof,
} from "./icons";

const NAV = [
  { href: "/dashboard", label: "Dashboard", Icon: IconDashboard, badge: null },
  { href: "/leads", label: "Leads & CRM", Icon: IconLeads, badge: "12" },
  { href: "/estimates", label: "Estimates", Icon: IconEstimates, badge: "5" },
  { href: "/schedule", label: "Schedule", Icon: IconSchedule, badge: null },
  { href: "/invoices", label: "Invoices", Icon: IconInvoices, badge: "3" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <IconRoof />
        </div>
        <div>
          <div className="brand-name">Ridgeline</div>
          <div className="brand-sub">Roofing OS</div>
        </div>
      </div>

      <div className="nav-label">Workspace</div>
      <nav>
        {NAV.map(({ href, label, Icon, badge }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={"nav-item" + (active ? " active" : "")}
            >
              <Icon />
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <div className="nav-label">On the roof now</div>
        <div className="crew-card">
          <div className="cc-top">
            <span className="dot" style={{ background: "var(--good)" }} />
            <b>Crew A — Miguel R.</b>
          </div>
          <div style={{ color: "var(--muted)", marginTop: 5 }}>
            Delgado tear-off · 28 sq
          </div>
          <div style={{ color: "var(--muted)", marginTop: 2 }}>
            4114 Cedar Bluff Dr
          </div>
        </div>
      </div>
    </aside>
  );
}
