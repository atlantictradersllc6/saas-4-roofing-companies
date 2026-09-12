import Topbar from "@/components/Topbar";
import LeadsBoard from "@/components/LeadsBoard";
import NewLeadButton from "@/components/NewLeadButton";
import { getLeads } from "@/lib/queries";
import { moneyK } from "@/lib/format";

// Always render on request so the page reflects the live database.
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();
  const open = leads.filter((l) => l.stage !== "won");
  const pipeline = open.reduce((a, l) => a + l.value, 0);

  return (
    <>
      <Topbar title="Leads & CRM" subtitle={`${open.length} open leads across the pipeline`} />
      <div className="content">
        <div className="section-head">
          <div>
            <h3 style={{ fontSize: 16 }}>Sales pipeline</h3>
            <div className="page-sub">
              {open.length} open leads · {moneyK(pipeline)} weighted value
            </div>
          </div>
          <NewLeadButton />
        </div>
        <LeadsBoard leads={leads} />
      </div>
    </>
  );
}
