import Topbar from "@/components/Topbar";
import NewInvoiceButton from "@/components/NewInvoiceButton";
import { getInvoices } from "@/lib/queries";
import { money, moneyK, initials, avatarColor } from "@/lib/format";
import type { InvoiceStatus } from "@/lib/types";

const STATUS_PILL: Record<InvoiceStatus, [string, string]> = {
  draft: ["slate", "Draft"],
  deposit: ["warn", "Deposit paid"],
  paid: ["good", "Paid"],
  overdue: ["bad", "Overdue"],
};

// Always render on request so the page reflects the live database.
export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  const outstanding = invoices.reduce((a, v) => a + v.balance, 0);
  const collected = invoices
    .filter((v) => v.status === "paid")
    .reduce((a, v) => a + v.amount, 0);

  return (
    <>
      <Topbar
        title="Invoices"
        subtitle={`${moneyK(outstanding)} outstanding · ${moneyK(collected)} collected`}
      />
      <div className="content">
        <div className="section-head">
          <div>
            <h3 style={{ fontSize: 16 }}>Invoices &amp; payments</h3>
            <div className="page-sub">
              {moneyK(outstanding)} outstanding · {moneyK(collected)} collected (paid to date)
            </div>
          </div>
          <NewInvoiceButton />
        </div>

        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Job</th>
                <th className="r">Amount</th>
                <th className="r">Balance</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((v, i) => {
                const [cls, label] = STATUS_PILL[v.status];
                return (
                  <tr key={v.id}>
                    <td className="num" style={{ fontWeight: 600 }}>
                      {v.ref}
                    </td>
                    <td>
                      <div className="cust">
                        <span
                          className="avatar"
                          style={{ background: avatarColor(i) }}
                        >
                          {initials(v.customer)}
                        </span>
                        <div>
                          <b>{v.customer}</b>
                          <div className="cust-sub">{v.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--muted)" }}>{v.job}</td>
                    <td className="r num">{money(v.amount)}</td>
                    <td
                      className="r num"
                      style={{
                        fontWeight: 600,
                        color: v.balance > 0 ? "var(--ink)" : "var(--muted)",
                      }}
                    >
                      {money(v.balance)}
                    </td>
                    <td className="num" style={{ color: "var(--muted)" }}>
                      {v.due}
                    </td>
                    <td>
                      <span className={`pill ${cls}`}>
                        <span className="dot" style={{ background: "currentColor" }} />
                        {label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
