-- Ridgeline schema for Neon Postgres — multi-tenant.
-- Every business row belongs to a company; users belong to a company; the app
-- scopes all reads/writes to the signed-in user's company.
--
-- NOTE: this rebuilds the schema (drops the data tables) so it's a clean,
-- repeatable dev migration. Re-running wipes existing rows and re-seeds.

create extension if not exists pgcrypto;

drop table if exists estimate_lines cascade;
drop table if exists estimates cascade;
drop table if exists leads cascade;
drop table if exists invoices cascade;
drop table if exists scheduled_jobs cascade;
drop table if exists crews cascade;
drop table if exists accounts cascade;
drop table if exists verification_tokens cascade;
drop table if exists users cascade;
drop table if exists companies cascade;

-- ---------- tenancy + auth ----------
create table companies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table users (
  id             uuid primary key default gen_random_uuid(),
  company_id     uuid not null references companies(id) on delete cascade,
  email          text not null unique,
  name           text,
  password_hash  text,                         -- null for OAuth-only users
  role           text not null default 'member' check (role in ('owner','member')),
  image          text,
  email_verified timestamptz,
  created_at     timestamptz not null default now()
);

-- Links an OAuth identity (Google/GitHub) to a user.
create table accounts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references users(id) on delete cascade,
  provider            text not null,
  provider_account_id text not null,
  created_at          timestamptz not null default now(),
  unique (provider, provider_account_id)
);

-- Magic-link sign-in tokens (Auth.js Email provider).
create table verification_tokens (
  identifier text not null,
  token      text not null,
  expires    timestamptz not null,
  primary key (identifier, token)
);

-- ---------- business data (all scoped by company_id) ----------
create table crews (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name       text not null,
  lead       text not null,
  detail     text not null
);

create table leads (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
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
create index leads_company_idx on leads (company_id);

create table estimates (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  ref        text not null,
  name       text not null,
  address    text,
  date       text,
  status     text not null check (status in ('draft','sent','approved','declined')),
  squares    integer,
  pitch      text,
  layers     integer,
  waste      text,
  created_at timestamptz not null default now(),
  unique (company_id, ref)
);
create index estimates_company_idx on estimates (company_id);

create table estimate_lines (
  id          uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  description text not null,
  qty         text,
  rate        numeric(10,2) not null default 0,
  amount      numeric(10,2) not null default 0,
  position    integer not null default 0
);
create index estimate_lines_estimate_idx on estimate_lines (estimate_id);

create table invoices (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  ref        text not null,
  customer   text not null,
  sub        text,
  job        text,
  amount     numeric(10,2) not null default 0,
  balance    numeric(10,2) not null default 0,
  due        text,
  status     text not null check (status in ('draft','deposit','paid','overdue')),
  unique (company_id, ref)
);
create index invoices_company_idx on invoices (company_id);

create table scheduled_jobs (
  id         uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  crew_index integer not null,
  day_index  integer not null,
  name       text not null,
  meta       text,
  type       text not null check (type in ('install','repair','inspection','tentative'))
);
create index scheduled_jobs_company_idx on scheduled_jobs (company_id);
