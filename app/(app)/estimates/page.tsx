import Topbar from "@/components/Topbar";
import EstimateBuilder from "@/components/EstimateBuilder";
import NewEstimateButton from "@/components/NewEstimateButton";
import { getEstimates } from "@/lib/queries";

// Always render on request so the page reflects the live database.
export const dynamic = "force-dynamic";

export default async function EstimatesPage() {
  const estimates = await getEstimates();
  const awaiting = estimates.filter((e) => e.status === "sent").length;

  return (
    <>
      <Topbar
        title="Estimates"
        subtitle={`${estimates.length} active estimates · ${awaiting} awaiting response`}
      />
      <div className="content">
        <div className="section-head">
          <div>
            <h3 style={{ fontSize: 16 }}>Estimates &amp; proposals</h3>
            <div className="page-sub">
              Select an estimate — edit line amounts and the totals recalculate live
            </div>
          </div>
          <NewEstimateButton />
        </div>
        <EstimateBuilder estimates={estimates} />
      </div>
    </>
  );
}
