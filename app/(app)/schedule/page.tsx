import Topbar from "@/components/Topbar";
import ScheduleGrid from "@/components/ScheduleGrid";
import NewJobButton from "@/components/NewJobButton";
import { getCrews, getJobs } from "@/lib/queries";
import { SCHEDULE_DAYS } from "@/lib/sample-data";

// Always render on request so the page reflects the live database.
export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const [crews, jobs] = await Promise.all([getCrews(), getJobs()]);

  return (
    <>
      <Topbar title="Schedule" subtitle={`Week of Sep 8 – 13 · ${crews.length} crews`} />
      <div className="content">
        <div className="section-head">
          <div>
            <h3 style={{ fontSize: 16 }}>Crew schedule</h3>
            <div className="page-sub">
              Week of Sep 8 – 13 · click a job for details
            </div>
          </div>
          <NewJobButton crews={crews} days={SCHEDULE_DAYS} />
        </div>
        <ScheduleGrid crews={crews} jobs={jobs} days={SCHEDULE_DAYS} />
      </div>
    </>
  );
}
