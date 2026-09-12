// Domain types for Ridgeline. These mirror the Postgres tables in
// supabase/migrations/0001_init.sql.

export type LeadStage = "new" | "contacted" | "inspection" | "quoted" | "won";
export type EstimateStatus = "draft" | "sent" | "approved" | "declined";
export type InvoiceStatus = "draft" | "deposit" | "paid" | "overdue";
export type JobType = "install" | "repair" | "inspection" | "tentative";

export interface Lead {
  id: string;
  name: string;
  address: string;
  value: number;
  stage: LeadStage;
  source: string;
  phone: string;
  scope: string;
  notes: string;
}

export interface EstimateLine {
  description: string;
  qty: string;
  rate: number;
  amount: number;
}

export interface Estimate {
  id: string;
  ref: string;
  name: string;
  address: string;
  date: string;
  status: EstimateStatus;
  squares: number;
  pitch: string;
  layers: number;
  waste: string;
  lines: EstimateLine[];
}

export interface Invoice {
  id: string;
  ref: string;
  customer: string;
  sub: string;
  job: string;
  amount: number;
  balance: number;
  due: string;
  status: InvoiceStatus;
}

export interface Crew {
  id: string;
  name: string;
  lead: string;
  detail: string;
}

export interface ScheduledJob {
  id: string;
  crewIndex: number;
  dayIndex: number;
  name: string;
  meta: string;
  type: JobType;
}
