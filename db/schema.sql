-- Ridgeline schema for Neon Postgres.
-- Single-company demo. For a real multi-tenant SaaS you'd add a `company_id`
-- to every table (and scope queries by the signed-in user's company).

create extension if not exists pgcrypto;

create table if not exists crews (
  id     uuid primary key default gen_random_uuid(),
  name   text not null,
  lead   text not null,
  detail text not null
);

create table if not exists leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  address    text not null,
  value      integer not null default 0,
  stage      text not null check (stage in ('new','contacted','inspection','quoted','won')),
  source     text,
  phone      text,
  scope      text,
  notes      text,
  created_at timestamptz not null default now()
);

create table if not exists estimates (
  id         uuid primary key default gen_random_uuid(),
  ref        text not null unique,
  name       text not null,
  address    text,
  date       text,
  status     text not null check (status in ('draft','sent','approved','declined')),
  squares    integer,
  pitch      text,
  layers     integer,
  waste      text,
  created_at timestamptz not null default now()
);

create table if not exists estimate_lines (
  id          uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  description text not null,
  qty         text,
  rate        numeric(10,2) not null default 0,
  amount      numeric(10,2) not null default 0,
  position    integer not null default 0
);
create index if not exists estimate_lines_estimate_id_idx on estimate_lines (estimate_id);

create table if not exists invoices (
  id       uuid primary key default gen_random_uuid(),
  ref      text not null unique,
  customer text not null,
  sub      text,
  job      text,
  amount   numeric(10,2) not null default 0,
  balance  numeric(10,2) not null default 0,
  due      text,
  status   text not null check (status in ('draft','deposit','paid','overdue'))
);

create table if not exists scheduled_jobs (
  id         uuid primary key default gen_random_uuid(),
  crew_index integer not null,
  day_index  integer not null,
  name       text not null,
  meta       text,
  type       text not null check (type in ('install','repair','inspection','tentative'))
);
