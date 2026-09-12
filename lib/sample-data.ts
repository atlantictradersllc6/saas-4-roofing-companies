// Sample data used when Supabase is not yet connected, so the app is fully
// browsable in local dev. Once you add your Supabase keys and run the seed
// migration, the query layer (lib/queries.ts) reads these same shapes from
// Postgres instead.

import type {
  Lead,
  Estimate,
  Invoice,
  Crew,
  ScheduledJob,
} from "./types";

export const SAMPLE_LEADS: Lead[] = [
  { id: "1", name: "Delgado Residence", address: "4114 Cedar Bluff Dr", value: 18400, stage: "won", source: "Referral", phone: "(512) 555-0147", scope: "Full replacement · 28 sq · 6/12", notes: "Hail damage claim approved by State Farm. Deposit collected. Crew A tearing off today." },
  { id: "2", name: "Whitaker, J.", address: "908 Palmera Ln", value: 22750, stage: "quoted", source: "Google Ads", phone: "(512) 555-0192", scope: "Full replacement · 34 sq · 8/12", notes: "Sent proposal Sep 6. Comparing against two other bids — follow up Thursday." },
  { id: "3", name: "Nguyen Property", address: "221 Ashford Oaks", value: 9600, stage: "quoted", source: "Website", phone: "(512) 555-0110", scope: "Partial re-roof · 14 sq", notes: "Wants premium shingle upgrade quote as an alternate." },
  { id: "4", name: "Okafor, C.", address: "55 Windmere Ct", value: 31200, stage: "inspection", source: "Referral", phone: "(737) 555-0166", scope: "Full replacement · 42 sq · 10/12", notes: "Inspection booked Sep 11, 9am. Steep pitch — quote to include safety surcharge." },
  { id: "5", name: "Barrett Home", address: "1720 Lark Meadow", value: 14300, stage: "inspection", source: "Door knock", phone: "(512) 555-0134", scope: "Repair + partial · 19 sq", notes: "Visible ridge cap damage after storm. Adjuster meeting requested." },
  { id: "6", name: "Salinas, M.", address: "3400 Verde Vista", value: 16900, stage: "contacted", source: "Facebook", phone: "(512) 555-0178", scope: "Full replacement · 26 sq", notes: "Left voicemail Sep 8. Interested in metal roof option." },
  { id: "7", name: "Prewitt Ranch", address: "FM 620 & Quarry Rd", value: 47800, stage: "contacted", source: "Referral", phone: "(830) 555-0121", scope: "Metal standing seam · 61 sq", notes: "Large barn + main house. Needs site visit to measure." },
  { id: "8", name: "Kaur Residence", address: "612 Sable Point", value: 12100, stage: "new", source: "Website", phone: "(512) 555-0155", scope: "Unknown — intake pending", notes: "Submitted contact form 2 hrs ago. Reported active leak in master bedroom." },
  { id: "9", name: "Foster, D.", address: "88 Kettle Creek", value: 8800, stage: "new", source: "Google Ads", phone: "(512) 555-0188", scope: "Repair estimate requested", notes: "Missing shingles after windstorm. Wants quick turnaround." },
  { id: "10", name: "Underwood Home", address: "2405 Bristle Cone", value: 20500, stage: "new", source: "Referral", phone: "(512) 555-0199", scope: "Full replacement · ~30 sq", notes: "Neighbor of Delgado job. Asked crew for a card." },
  { id: "11", name: "Reyes Property", address: "170 Copper Fall", value: 13750, stage: "contacted", source: "Website", phone: "(512) 555-0102", scope: "Full replacement · 21 sq", notes: "Scheduling inspection — prefers next week." },
  { id: "12", name: "Holloway, T.", address: "944 Stone Harbor", value: 26400, stage: "quoted", source: "Referral", phone: "(512) 555-0173", scope: "Full replacement · 36 sq · 7/12", notes: "Verbal yes. Sending contract for e-signature." },
];

export const SAMPLE_ESTIMATES: Estimate[] = [
  {
    id: "e1", ref: "EST-1043", name: "Whitaker Residence", address: "908 Palmera Ln, Austin TX", date: "Sep 6, 2026", status: "sent",
    squares: 34, pitch: "8/12", layers: 1, waste: "12%",
    lines: [
      { description: "Tear-off existing 3-tab, haul & dispose (30-yd dumpster)", qty: "34 sq", rate: 55, amount: 1870 },
      { description: "GAF Timberline HDZ architectural shingles — Weathered Wood", qty: "34 sq", rate: 118, amount: 4012 },
      { description: "Synthetic underlayment (FeltBuster)", qty: "34 sq", rate: 16, amount: 544 },
      { description: "Ice & water shield — eaves & valleys", qty: "8 sq", rate: 62, amount: 496 },
      { description: "Ridge cap shingles (Seal-A-Ridge)", qty: "96 lf", rate: 6.5, amount: 624 },
      { description: "Drip edge, aluminum", qty: "220 lf", rate: 3.2, amount: 704 },
      { description: "Pipe boots & flashing kit", qty: "6 ea", rate: 38, amount: 228 },
      { description: "Labor — install (2-day, Crew A)", qty: "34 sq", rate: 210, amount: 7140 },
      { description: "Permit & final inspection", qty: "1 ea", rate: 285, amount: 285 },
    ],
  },
  {
    id: "e2", ref: "EST-1041", name: "Okafor Residence", address: "55 Windmere Ct, Austin TX", date: "Sep 4, 2026", status: "draft",
    squares: 42, pitch: "10/12", layers: 2, waste: "15%",
    lines: [
      { description: "Tear-off — 2 layers, haul & dispose", qty: "42 sq", rate: 78, amount: 3276 },
      { description: "Steep-pitch safety surcharge (10/12)", qty: "42 sq", rate: 24, amount: 1008 },
      { description: "GAF Timberline HDZ — Charcoal", qty: "42 sq", rate: 118, amount: 4956 },
      { description: "Synthetic underlayment", qty: "42 sq", rate: 16, amount: 672 },
      { description: "Ice & water shield — full coverage", qty: "42 sq", rate: 62, amount: 2604 },
      { description: "Ridge cap + hip caps", qty: "140 lf", rate: 6.5, amount: 910 },
      { description: "Labor — install (3-day, Crew B)", qty: "42 sq", rate: 245, amount: 10290 },
      { description: "Permit & final inspection", qty: "1 ea", rate: 285, amount: 285 },
    ],
  },
  {
    id: "e3", ref: "EST-1039", name: "Nguyen Property", address: "221 Ashford Oaks, Austin TX", date: "Sep 2, 2026", status: "sent",
    squares: 14, pitch: "5/12", layers: 1, waste: "10%",
    lines: [
      { description: "Tear-off — partial re-roof, rear slope", qty: "14 sq", rate: 55, amount: 770 },
      { description: "GAF Timberline HDZ — Slate", qty: "14 sq", rate: 118, amount: 1652 },
      { description: "Synthetic underlayment", qty: "14 sq", rate: 16, amount: 224 },
      { description: "Ice & water shield — valleys", qty: "3 sq", rate: 62, amount: 186 },
      { description: "Drip edge", qty: "110 lf", rate: 3.2, amount: 352 },
      { description: "Labor — install (1-day)", qty: "14 sq", rate: 210, amount: 2940 },
    ],
  },
  {
    id: "e4", ref: "EST-1044", name: "Holloway Residence", address: "944 Stone Harbor, Austin TX", date: "Sep 8, 2026", status: "approved",
    squares: 36, pitch: "7/12", layers: 1, waste: "12%",
    lines: [
      { description: "Tear-off existing architectural, haul & dispose", qty: "36 sq", rate: 55, amount: 1980 },
      { description: "GAF Timberline HDZ — Pewter Gray", qty: "36 sq", rate: 118, amount: 4248 },
      { description: "Synthetic underlayment", qty: "36 sq", rate: 16, amount: 576 },
      { description: "Ice & water shield — eaves & valleys", qty: "9 sq", rate: 62, amount: 558 },
      { description: "Ridge cap shingles", qty: "104 lf", rate: 6.5, amount: 676 },
      { description: "Drip edge, aluminum", qty: "230 lf", rate: 3.2, amount: 736 },
      { description: "Labor — install (2-day, Crew A)", qty: "36 sq", rate: 210, amount: 7560 },
      { description: "Permit & final inspection", qty: "1 ea", rate: 285, amount: 285 },
    ],
  },
  {
    id: "e5", ref: "EST-1045", name: "Prewitt Ranch", address: "FM 620 & Quarry Rd, Leander TX", date: "Sep 9, 2026", status: "draft",
    squares: 61, pitch: "4/12", layers: 1, waste: "8%",
    lines: [
      { description: "Standing seam metal panels — 24ga, Galvalume", qty: "61 sq", rate: 385, amount: 23485 },
      { description: "Tear-off existing metal & dispose", qty: "61 sq", rate: 48, amount: 2928 },
      { description: "Synthetic underlayment — high-temp", qty: "61 sq", rate: 22, amount: 1342 },
      { description: "Ridge & eave trim, closures", qty: "380 lf", rate: 9, amount: 3420 },
      { description: "Labor — fabrication & install (5-day)", qty: "61 sq", rate: 270, amount: 16470 },
      { description: "Crane / material lift rental", qty: "2 day", rate: 650, amount: 1300 },
    ],
  },
];

export const SAMPLE_INVOICES: Invoice[] = [
  { id: "i1", ref: "INV-2088", customer: "Delgado Residence", sub: "State Farm claim #SF-4471", job: "Full replacement · 28 sq", amount: 18400, balance: 9200, due: "Sep 22", status: "deposit" },
  { id: "i2", ref: "INV-2085", customer: "Marsh, K.", sub: "(512) 555-0140", job: "Repair · ridge & valley", amount: 3850, balance: 0, due: "Sep 1", status: "paid" },
  { id: "i3", ref: "INV-2082", customer: "Castellano Home", sub: "(512) 555-0125", job: "Full replacement · 24 sq", amount: 15600, balance: 15600, due: "Aug 28", status: "overdue" },
  { id: "i4", ref: "INV-2090", customer: "Holloway Residence", sub: "Contract signed Sep 8", job: "Full replacement · 36 sq", amount: 26400, balance: 26400, due: "Oct 5", status: "draft" },
  { id: "i5", ref: "INV-2079", customer: "Petersen, L.", sub: "(737) 555-0119", job: "Gutter & fascia", amount: 2240, balance: 0, due: "Aug 20", status: "paid" },
  { id: "i6", ref: "INV-2091", customer: "Nguyen Property", sub: "(512) 555-0110", job: "Partial re-roof · 14 sq", amount: 6476, balance: 6476, due: "Oct 12", status: "draft" },
  { id: "i7", ref: "INV-2076", customer: "Alvarez Duplex", sub: "(512) 555-0198", job: "Full replacement · 2×16 sq", amount: 19800, balance: 0, due: "Aug 12", status: "paid" },
];

export const SAMPLE_CREWS: Crew[] = [
  { id: "c1", name: "Crew A", lead: "Miguel R.", detail: "4 installers" },
  { id: "c2", name: "Crew B", lead: "Andre T.", detail: "3 installers" },
  { id: "c3", name: "Field", lead: "Devon K.", detail: "sales" },
];

export const SCHEDULE_DAYS = ["Mon 8", "Tue 9", "Wed 10", "Thu 11", "Fri 12", "Sat 13"];

export const SAMPLE_JOBS: ScheduledJob[] = [
  { id: "j1", crewIndex: 0, dayIndex: 0, name: "Delgado tear-off", meta: "28 sq · 6/12", type: "install" },
  { id: "j2", crewIndex: 0, dayIndex: 1, name: "Delgado install", meta: "day 2 · finishing", type: "install" },
  { id: "j3", crewIndex: 0, dayIndex: 3, name: "Holloway install", meta: "36 sq · start", type: "install" },
  { id: "j4", crewIndex: 0, dayIndex: 4, name: "Holloway install", meta: "day 2", type: "install" },
  { id: "j5", crewIndex: 1, dayIndex: 1, name: "Castellano", meta: "punch list", type: "inspection" },
  { id: "j6", crewIndex: 1, dayIndex: 2, name: "Okafor", meta: "42 sq · steep", type: "tentative" },
  { id: "j7", crewIndex: 1, dayIndex: 3, name: "Okafor", meta: "day 2", type: "tentative" },
  { id: "j8", crewIndex: 1, dayIndex: 5, name: "Alvarez repair", meta: "8 sq", type: "repair" },
  { id: "j9", crewIndex: 2, dayIndex: 0, name: "Marsh inspect", meta: "10:30a", type: "inspection" },
  { id: "j10", crewIndex: 2, dayIndex: 1, name: "Barrett adjuster", meta: "1:00p", type: "repair" },
  { id: "j11", crewIndex: 2, dayIndex: 2, name: "Prewitt measure", meta: "site visit", type: "inspection" },
  { id: "j12", crewIndex: 2, dayIndex: 3, name: "Okafor inspect", meta: "9:00a", type: "inspection" },
];

export const REVENUE = [
  { month: "Apr", value: 132 },
  { month: "May", value: 168 },
  { month: "Jun", value: 154 },
  { month: "Jul", value: 196 },
  { month: "Aug", value: 221 },
  { month: "Sep", value: 189 },
];

export const ACTIVITY = [
  { color: "var(--good)", text: "<b>Holloway</b> approved the $26,400 proposal", time: "22 min ago" },
  { color: "var(--clay)", text: "Crew A checked in at <b>Delgado</b> job site", time: "1 hr ago" },
  { color: "var(--slate)", text: "New lead <b>Kaur Residence</b> from website form", time: "2 hrs ago" },
  { color: "var(--good)", text: "Payment received — <b>Marsh</b> $3,850", time: "4 hrs ago" },
  { color: "var(--warn)", text: "Invoice <b>INV-2082</b> is now overdue", time: "Yesterday" },
  { color: "var(--slate)", text: "Estimate <b>EST-1045</b> drafted for Prewitt Ranch", time: "Yesterday" },
];
