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
create table if not exists sales_marketing (
  id               uuid primary key default gen_random_uuid(),
  touchpoint       text not null, -- LinkedIn, Website, X
  period           text not null, -- week, month
  leads_generated  int not null default 0,
  conversions      int not null default 0,
  recorded_at      timestamptz not null default now()
);

-- ── 5. Pay Metrics ───────────────────────────────────────────
-- Conversations, conversions, LCY/FCY transfer counts for Tradevu Pay.
-- Conversion rate = users_converted / conversations.
create table if not exists pay_metrics (
  id                uuid primary key default gen_random_uuid(),
  period            text not null, -- week, month
  weekly_goal       int not null default 0,
  conversations     int not null default 0,
  users_converted   int not null default 0,  -- conversations → product use
  lcy_transfers     int not null default 0,
  lcy_goal          int not null default 2,
  fcy_transfers     int not null default 0,
  fcy_goal          int not null default 2,
  recorded_at       timestamptz not null default now()
);

-- ── 6. Finance Weekly ─────────────────────────────────────────
-- Loan disbursements and default rates for Finance.
create table if not exists exchange_rates (
  id           uuid primary key default gen_random_uuid(),
  currency     text not null unique,
  rate_to_usd  float not null,
  updated_at   timestamptz not null default now()
);

create table if not exists finance_metrics (
  id              uuid primary key default gen_random_uuid(),
  loan_type       text not null, -- Payables, Receivables, Payment
  currency        text not null, -- USD, NGN, USDT, USDC
  period          text not null, -- week, month
  loan_value      float not null default 0,
  loan_count      int not null default 0,
  default_rate    float not null default 0,
  historical_rate_to_usd float, -- Rate at the time of entry for reporting
  recorded_at     timestamptz not null default now()
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

-- ── 8. Dashboard Settings ───────────────────────────────────
-- Global controls for the TV display (scroll speed, toggle).
create table if not exists dashboard_settings (
  id            uuid primary key default gen_random_uuid(),
  scroll_speed  int not null default 8,          
  scroll_enabled boolean not null default true,
  dashboard_title text not null default 'FY''26 Operating Dashboard',
  launch_status_title text not null default 'Launch Readiness',
  departments   jsonb       not null default '[]',
  updated_at    timestamptz not null default now()
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
  (2026, 1000000, 780000)
on conflict do nothing;

-- Customer metrics seed (current month)
insert into customer_metrics (period_start, total_customers, monthly_goal, active_monthly) values
  (date_trunc('month', current_date)::date, 342, 500, 100)
on conflict do nothing;

-- Sales & Marketing seed
insert into sales_marketing (touchpoint, period, leads_generated, conversions) values
  ('LinkedIn', 'week',  20, 5),
  ('Website',  'week',  50, 12),
  ('X',        'week',  15, 3),
  ('LinkedIn', 'month', 80, 20),
  ('Website',  'month', 200, 45),
  ('X',        'month', 60, 10)
on conflict do nothing;

-- Pay metrics seed
insert into pay_metrics (period, weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal) values
  ('week',  10, 28, 9, 1, 2, 5, 2),
  ('month', 40, 110, 35, 4, 8, 20, 8)
on conflict do nothing;

-- Exchange rates seed
insert into exchange_rates (currency, rate_to_usd) values
  ('USD', 1.0),
  ('NGN', 0.00065),
  ('USDT', 1.0),
  ('USDC', 1.0)
on conflict (currency) do update set rate_to_usd = excluded.rate_to_usd;

-- Finance metrics seed
insert into finance_metrics (loan_type, currency, period, loan_value, loan_count, default_rate) values
  ('Payables',    'USD',  'week', 50000, 10, 2.5),
  ('Receivables', 'NGN',  'week', 10000000, 15, 4.0),
  ('Payment',     'USDT', 'week', 25000, 5, 1.2),
  ('Payables',    'USD',  'month', 200000, 40, 2.2)
on conflict do nothing;

-- Engineering projects seed
insert into engineering_projects (name, status, date_label, date_value, sort_order) values
  ('USD wallets & transfers',  'In Development', 'Target', '1st, May 2026', 1),
  ('Pay Partner Dashboard',    'In Development', 'Target', '1st, June 2026', 2)
on conflict do nothing;

-- Engineering health seed
insert into engineering_health (label, value, is_good, sort_order) values
  ('Transaction Success', '98.2%', true,  1),
  ('Downtime (30d)',       '0.5h',  false, 2)
on conflict do nothing;

-- Dashboard settings seed
insert into dashboard_settings (scroll_speed, scroll_enabled) values
  (8, true)
on conflict do nothing;

-- ── 9. Dashboard Users ─────────────────────────────────────
-- Authorized users who can access the admin console.
create table if not exists dashboard_users (
  email                     text primary key,
  name                      text not null,
  role                      text not null,
  permissions               text[] not null default '{}',
  password                  text not null,
  requires_password_change  boolean not null default false,
  created_at                timestamptz not null default now()
);

-- ── 10. Customers ──────────────────────────────────────────
-- Individual customer records for dynamic computation.
create table if not exists customers (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  name            text,
  last_logged_in  timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

-- Seed users
insert into dashboard_users (email, name, role, permissions, password, requires_password_change) values
  ('nkiru@tradevu.africa', 'Nkiru', 'CEO', '{revenue,launch,customers,ops,pay,finance,engineering,users,settings}', 'password123', false),
  ('tola@tradevu.co', 'Tola', 'HR', '{launch,users,settings,ops,pay}', 'password123', false),
  ('kene@tradevu.co', 'Kene', 'PM', '{revenue,launch,customers,ops,pay,finance,engineering,settings}', 'password123', false)
on conflict (email) do nothing;
