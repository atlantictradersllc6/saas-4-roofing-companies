-- Seed data — the same records the app shows in preview mode, so connecting
-- Neon is seamless. Safe to re-run: it clears first.

truncate estimate_lines, estimates, leads, invoices, scheduled_jobs, crews restart identity cascade;

insert into crews (name, lead, detail) values
  ('Crew A', 'Miguel R.', '4 installers'),
  ('Crew B', 'Andre T.', '3 installers'),
  ('Field', 'Devon K.', 'sales');

insert into leads (name, address, value, stage, source, phone, scope, notes) values
  ('Delgado Residence','4114 Cedar Bluff Dr',18400,'won','Referral','(512) 555-0147','Full replacement · 28 sq · 6/12','Hail damage claim approved by State Farm. Deposit collected. Crew A tearing off today.'),
  ('Whitaker, J.','908 Palmera Ln',22750,'quoted','Google Ads','(512) 555-0192','Full replacement · 34 sq · 8/12','Sent proposal Sep 6. Comparing against two other bids — follow up Thursday.'),
  ('Nguyen Property','221 Ashford Oaks',9600,'quoted','Website','(512) 555-0110','Partial re-roof · 14 sq','Wants premium shingle upgrade quote as an alternate.'),
  ('Okafor, C.','55 Windmere Ct',31200,'inspection','Referral','(737) 555-0166','Full replacement · 42 sq · 10/12','Inspection booked Sep 11, 9am. Steep pitch — quote to include safety surcharge.'),
  ('Barrett Home','1720 Lark Meadow',14300,'inspection','Door knock','(512) 555-0134','Repair + partial · 19 sq','Visible ridge cap damage after storm. Adjuster meeting requested.'),
  ('Salinas, M.','3400 Verde Vista',16900,'contacted','Facebook','(512) 555-0178','Full replacement · 26 sq','Left voicemail Sep 8. Interested in metal roof option.'),
  ('Prewitt Ranch','FM 620 & Quarry Rd',47800,'contacted','Referral','(830) 555-0121','Metal standing seam · 61 sq','Large barn + main house. Needs site visit to measure.'),
  ('Kaur Residence','612 Sable Point',12100,'new','Website','(512) 555-0155','Unknown — intake pending','Submitted contact form 2 hrs ago. Reported active leak in master bedroom.'),
  ('Foster, D.','88 Kettle Creek',8800,'new','Google Ads','(512) 555-0188','Repair estimate requested','Missing shingles after windstorm. Wants quick turnaround.'),
  ('Underwood Home','2405 Bristle Cone',20500,'new','Referral','(512) 555-0199','Full replacement · ~30 sq','Neighbor of Delgado job. Asked crew for a card.'),
  ('Reyes Property','170 Copper Fall',13750,'contacted','Website','(512) 555-0102','Full replacement · 21 sq','Scheduling inspection — prefers next week.'),
  ('Holloway, T.','944 Stone Harbor',26400,'quoted','Referral','(512) 555-0173','Full replacement · 36 sq · 7/12','Verbal yes. Sending contract for e-signature.');

insert into estimates (ref, name, address, date, status, squares, pitch, layers, waste) values
  ('EST-1043','Whitaker Residence','908 Palmera Ln, Austin TX','Sep 6, 2026','sent',34,'8/12',1,'12%'),
  ('EST-1041','Okafor Residence','55 Windmere Ct, Austin TX','Sep 4, 2026','draft',42,'10/12',2,'15%'),
  ('EST-1039','Nguyen Property','221 Ashford Oaks, Austin TX','Sep 2, 2026','sent',14,'5/12',1,'10%'),
  ('EST-1044','Holloway Residence','944 Stone Harbor, Austin TX','Sep 8, 2026','approved',36,'7/12',1,'12%'),
  ('EST-1045','Prewitt Ranch','FM 620 & Quarry Rd, Leander TX','Sep 9, 2026','draft',61,'4/12',1,'8%');

insert into estimate_lines (estimate_id, description, qty, rate, amount, position)
select e.id, l.description, l.qty, l.rate, l.amount, l.position
from estimates e
join (values
  ('EST-1043','Tear-off existing 3-tab, haul & dispose (30-yd dumpster)','34 sq',55,1870,0),
  ('EST-1043','GAF Timberline HDZ architectural shingles — Weathered Wood','34 sq',118,4012,1),
  ('EST-1043','Synthetic underlayment (FeltBuster)','34 sq',16,544,2),
  ('EST-1043','Ice & water shield — eaves & valleys','8 sq',62,496,3),
  ('EST-1043','Ridge cap shingles (Seal-A-Ridge)','96 lf',6.5,624,4),
  ('EST-1043','Drip edge, aluminum','220 lf',3.2,704,5),
  ('EST-1043','Pipe boots & flashing kit','6 ea',38,228,6),
  ('EST-1043','Labor — install (2-day, Crew A)','34 sq',210,7140,7),
  ('EST-1043','Permit & final inspection','1 ea',285,285,8),
  ('EST-1041','Tear-off — 2 layers, haul & dispose','42 sq',78,3276,0),
  ('EST-1041','Steep-pitch safety surcharge (10/12)','42 sq',24,1008,1),
  ('EST-1041','GAF Timberline HDZ — Charcoal','42 sq',118,4956,2),
  ('EST-1041','Synthetic underlayment','42 sq',16,672,3),
  ('EST-1041','Ice & water shield — full coverage','42 sq',62,2604,4),
  ('EST-1041','Ridge cap + hip caps','140 lf',6.5,910,5),
  ('EST-1041','Labor — install (3-day, Crew B)','42 sq',245,10290,6),
  ('EST-1041','Permit & final inspection','1 ea',285,285,7),
  ('EST-1039','Tear-off — partial re-roof, rear slope','14 sq',55,770,0),
  ('EST-1039','GAF Timberline HDZ — Slate','14 sq',118,1652,1),
  ('EST-1039','Synthetic underlayment','14 sq',16,224,2),
  ('EST-1039','Ice & water shield — valleys','3 sq',62,186,3),
  ('EST-1039','Drip edge','110 lf',3.2,352,4),
  ('EST-1039','Labor — install (1-day)','14 sq',210,2940,5),
  ('EST-1044','Tear-off existing architectural, haul & dispose','36 sq',55,1980,0),
  ('EST-1044','GAF Timberline HDZ — Pewter Gray','36 sq',118,4248,1),
  ('EST-1044','Synthetic underlayment','36 sq',16,576,2),
  ('EST-1044','Ice & water shield — eaves & valleys','9 sq',62,558,3),
  ('EST-1044','Ridge cap shingles','104 lf',6.5,676,4),
  ('EST-1044','Drip edge, aluminum','230 lf',3.2,736,5),
  ('EST-1044','Labor — install (2-day, Crew A)','36 sq',210,7560,6),
  ('EST-1044','Permit & final inspection','1 ea',285,285,7),
  ('EST-1045','Standing seam metal panels — 24ga, Galvalume','61 sq',385,23485,0),
  ('EST-1045','Tear-off existing metal & dispose','61 sq',48,2928,1),
  ('EST-1045','Synthetic underlayment — high-temp','61 sq',22,1342,2),
  ('EST-1045','Ridge & eave trim, closures','380 lf',9,3420,3),
  ('EST-1045','Labor — fabrication & install (5-day)','61 sq',270,16470,4),
  ('EST-1045','Crane / material lift rental','2 day',650,1300,5)
) as l(ref, description, qty, rate, amount, position) on l.ref = e.ref;

insert into invoices (ref, customer, sub, job, amount, balance, due, status) values
  ('INV-2088','Delgado Residence','State Farm claim #SF-4471','Full replacement · 28 sq',18400,9200,'Sep 22','deposit'),
  ('INV-2085','Marsh, K.','(512) 555-0140','Repair · ridge & valley',3850,0,'Sep 1','paid'),
  ('INV-2082','Castellano Home','(512) 555-0125','Full replacement · 24 sq',15600,15600,'Aug 28','overdue'),
  ('INV-2090','Holloway Residence','Contract signed Sep 8','Full replacement · 36 sq',26400,26400,'Oct 5','draft'),
  ('INV-2079','Petersen, L.','(737) 555-0119','Gutter & fascia',2240,0,'Aug 20','paid'),
  ('INV-2091','Nguyen Property','(512) 555-0110','Partial re-roof · 14 sq',6476,6476,'Oct 12','draft'),
  ('INV-2076','Alvarez Duplex','(512) 555-0198','Full replacement · 2×16 sq',19800,0,'Aug 12','paid');

insert into scheduled_jobs (crew_index, day_index, name, meta, type) values
  (0,0,'Delgado tear-off','28 sq · 6/12','install'),
  (0,1,'Delgado install','day 2 · finishing','install'),
  (0,3,'Holloway install','36 sq · start','install'),
  (0,4,'Holloway install','day 2','install'),
  (1,1,'Castellano','punch list','inspection'),
  (1,2,'Okafor','42 sq · steep','tentative'),
  (1,3,'Okafor','day 2','tentative'),
  (1,5,'Alvarez repair','8 sq','repair'),
  (2,0,'Marsh inspect','10:30a','inspection'),
  (2,1,'Barrett adjuster','1:00p','repair'),
  (2,2,'Prewitt measure','site visit','inspection'),
  (2,3,'Okafor inspect','9:00a','inspection');
