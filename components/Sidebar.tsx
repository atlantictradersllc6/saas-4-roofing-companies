"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOutAction } from "@/app/actions";
import { initials } from "@/lib/format";
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
  { href: "/leads", label: "Leads & CRM", Icon: IconLeads, badge: null },
  { href: "/estimates", label: "Estimates", Icon: IconEstimates, badge: null },
  { href: "/schedule", label: "Schedule", Icon: IconSchedule, badge: null },
  { href: "/invoices", label: "Invoices", Icon: IconInvoices, badge: null },
];

export default function Sidebar({
  user,
}: {
  user?: { name: string | null; email: string | null } | null;
}) {
  const pathname = usePathname();
  const label = user?.name || user?.email || "";

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><IconRoof /></div>
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
            <Link key={href} href={href} className={"nav-item" + (active ? " active" : "")}>
              <Icon />
              {label}
              {badge && <span className="nav-badge">{badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        {user && (
          <div className="user-card">
            <span className="avatar" style={{ background: "var(--slate)" }}>
              {initials(label) || "?"}
            </span>
            <div className="user-meta">
              <div className="user-name">{user.name || "Signed in"}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <form action={signOutAction}>
              <button className="signout-btn" type="submit" title="Sign out" aria-label="Sign out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
