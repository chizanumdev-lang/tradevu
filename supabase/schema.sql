-- =============================================================
-- Tradevu Operating Scoreboard — Supabase Schema
-- Run this in the Supabase SQL editor to create all tables.
-- =============================================================

-- ── 1. Launch Readiness ─────────────────────────────────────
-- Stores the current quarter phase and per-department progress.
create table if not exists launch_readiness (
  id            uuid primary key default gen_random_uuid(),
  phase         text        not null,            -- e.g. "Q2"
  dept_name     text        not null,            -- "Operations" | "Pay" | "Engineering"
  progress      int         not null check (progress between 0 and 100),
  recorded_at   timestamptz not null default now()
);

-- Only one row per dept per quarter should be "current".
-- The API will select the latest row per dept.

-- ── 2. Revenue Annual ───────────────────────────────────────
-- Tracks cumulative annual revenue vs goal.
create table if not exists revenue_annual (
  id          uuid primary key default gen_random_uuid(),
  fiscal_year int         not null,             -- e.g. 2026
  goal        numeric(15,2) not null,
  current     numeric(15,2) not null default 0,
  recorded_at timestamptz not null default now()
);

-- ── 3. Customer Metrics ─────────────────────────────────────
-- Monthly signups / active user counts.
create table if not exists customer_metrics (
  id               uuid primary key default gen_random_uuid(),
  period_start     date        not null,         -- first day of the month
  total_customers  int         not null default 0,
  monthly_goal     int         not null default 500,
  active_monthly   int         not null default 0,
  recorded_at      timestamptz not null default now()
);

-- ── 4. Ops Weekly ───────────────────────────────────────────
-- Visits, conversations, and conversion tracking for Operations.
-- Conversion rate = users_converted / conversations (visits that led to product use).
create table if not exists ops_weekly (
  id                uuid primary key default gen_random_uuid(),
  week_start        date        not null,
  weekly_goal       int         not null,         -- target visits
  visits            int         not null default 0,
  conversations     int         not null default 0,  -- subset of visits that engaged
  users_converted   int         not null default 0,  -- conversations → actual product use
  recorded_at       timestamptz not null default now()
);

-- ── 5. Pay Weekly ───────────────────────────────────────────
-- Conversations, conversions, LCY/FCY transfer counts for Tradevu Pay.
-- Conversion rate = users_converted / conversations.
create table if not exists pay_weekly (
  id                uuid primary key default gen_random_uuid(),
  week_start        date        not null,
  weekly_goal       int         not null,         -- target conversations
  conversations     int         not null default 0,
  users_converted   int         not null default 0,  -- conversations → product use
  lcy_transfers     int         not null default 0,
  lcy_goal          int         not null default 2,
  fcy_transfers     int         not null default 0,
  fcy_goal          int         not null default 2,
  recorded_at       timestamptz not null default now()
);

-- ── 6. Engineering Projects ─────────────────────────────────
-- Individual engineering project statuses shown on the card.
create table if not exists engineering_projects (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  status       text        not null check (status in ('Live', 'In Development', 'Testing')),
  date_label   text        not null,             -- e.g. "Deployed" | "Target"
  date_value   text        not null,             -- e.g. "May 2026"
  sort_order   int         not null default 0,
  is_active    boolean     not null default true,
  updated_at   timestamptz not null default now()
);

-- ── 7. Engineering Health ───────────────────────────────────
-- System health metrics shown at the bottom of the Engineering card.
create table if not exists engineering_health (
  id          uuid primary key default gen_random_uuid(),
  label       text        not null,              -- e.g. "Transaction Success"
  value       text        not null,              -- e.g. "98.2%"
  is_good     boolean     not null default true,
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  updated_at  timestamptz not null default now()
);

-- =============================================================
-- Seed data — safe to re-run (uses INSERT … ON CONFLICT DO NOTHING
-- on a unique constraint we add per table for idempotency).
-- =============================================================

-- Launch readiness seed
insert into launch_readiness (phase, dept_name, progress) values
  ('Q2', 'Operations',   64),
  ('Q2', 'Pay',          48),
  ('Q2', 'Engineering',  55)
on conflict do nothing;

-- Revenue seed (FY2026)
insert into revenue_annual (fiscal_year, goal, current) values
  (2026, 1000000, 750000)
on conflict do nothing;

-- Customer metrics seed (current month)
insert into customer_metrics (period_start, total_customers, monthly_goal, active_monthly) values
  (date_trunc('month', current_date)::date, 342, 500, 100)
on conflict do nothing;

-- Ops weekly seed (current week)
insert into ops_weekly (week_start, weekly_goal, visits, conversations, users_converted) values
  (date_trunc('week', current_date)::date, 10, 89, 50, 23)
on conflict do nothing;

-- Pay weekly seed (current week)
insert into pay_weekly (week_start, weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal) values
  (date_trunc('week', current_date)::date, 10, 28, 9, 1, 2, 5, 2)
on conflict do nothing;

-- Engineering projects seed
insert into engineering_projects (name, status, date_label, date_value, sort_order) values
  ('USD wallets & transfers',  'Live',           'Deployed', 'May 2026', 1),
  ('Pay Partner Dashboard',    'In Development', 'Target',   'May 2026', 2)
on conflict do nothing;

-- Engineering health seed
insert into engineering_health (label, value, is_good, sort_order) values
  ('Transaction Success', '98.2%', true,  1),
  ('Downtime (30d)',       '0.5h',  false, 2)
on conflict do nothing;
