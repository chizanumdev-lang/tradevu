/**
 * Creates all dashboard tables in Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<service_role_key> node scripts/create-tables.mjs
 *
 * Get your service_role key from:
 *   Supabase Dashboard → Project Settings → API → service_role (secret)
 */

const SUPABASE_URL = 'https://rxtyezapzwxgfvovhnce.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error(
    '\n❌  Missing SUPABASE_SERVICE_KEY environment variable.\n' +
    '   Run:  SUPABASE_SERVICE_KEY=<your_key> node scripts/create-tables.mjs\n' +
    '   Find your key at: Supabase Dashboard → Project Settings → API → service_role\n'
  );
  process.exit(1);
}

const sql = `
-- ── 1. Launch Readiness ─────────────────────────────────────
create table if not exists launch_readiness (
  id            uuid primary key default gen_random_uuid(),
  phase         text        not null,
  dept_name     text        not null,
  progress      int         not null check (progress between 0 and 100),
  recorded_at   timestamptz not null default now()
);

-- ── 2. Revenue Annual ───────────────────────────────────────
create table if not exists revenue_annual (
  id          uuid primary key default gen_random_uuid(),
  fiscal_year int           not null,
  goal        numeric(15,2) not null,
  current     numeric(15,2) not null default 0,
  recorded_at timestamptz   not null default now()
);

-- ── 3. Customer Metrics ─────────────────────────────────────
create table if not exists customer_metrics (
  id               uuid primary key default gen_random_uuid(),
  period_start     date        not null,
  total_customers  int         not null default 0,
  monthly_goal     int         not null default 500,
  active_monthly   int         not null default 0,
  recorded_at      timestamptz not null default now()
);

-- ── 4. Ops Weekly ───────────────────────────────────────────
create table if not exists ops_weekly (
  id                uuid primary key default gen_random_uuid(),
  week_start        date        not null,
  weekly_goal       int         not null,
  visits            int         not null default 0,
  conversations     int         not null default 0,
  users_converted   int         not null default 0,
  recorded_at       timestamptz not null default now()
);

-- ── 6. Pay Weekly ───────────────────────────────────────────
create table if not exists pay_weekly (
  id                uuid primary key default gen_random_uuid(),
  week_start        date        not null,
  weekly_goal       int         not null,
  conversations     int         not null default 0,
  users_converted   int         not null default 0,
  lcy_transfers     int         not null default 0,
  lcy_goal          int         not null default 2,
  fcy_transfers     int         not null default 0,
  fcy_goal          int         not null default 2,
  recorded_at       timestamptz not null default now()
);

-- ── 7. Finance Weekly ───────────────────────────────────────
create table if not exists finance_weekly (
  id                        uuid primary key default gen_random_uuid(),
  week_start                date        not null,
  loan_disbursement_value   numeric(15,2) not null default 0,
  loan_disbursement_trend   int         not null default 0,
  loans_disbursed           int         not null default 0,
  loans_disbursed_trend     int         not null default 0,
  default_rate              numeric(5,2) not null default 0,
  default_rate_trend        int         not null default 0,
  recorded_at               timestamptz not null default now()
);

-- ── 8. Engineering Projects ─────────────────────────────────
create table if not exists engineering_projects (
  id           uuid primary key default gen_random_uuid(),
  name         text        not null,
  status       text        not null check (status in ('Live', 'In Development', 'Testing')),
  date_label   text        not null,
  date_value   text        not null,
  sort_order   int         not null default 0,
  is_active    boolean     not null default true,
  updated_at   timestamptz not null default now()
);

-- ── 9. Engineering Health ───────────────────────────────────
create table if not exists engineering_health (
  id          uuid primary key default gen_random_uuid(),
  label       text        not null,
  value       text        not null,
  is_good     boolean     not null default true,
  sort_order  int         not null default 0,
  is_active   boolean     not null default true,
  updated_at  timestamptz not null default now()
);

-- ── Seed data ───────────────────────────────────────────────
insert into launch_readiness (phase, dept_name, progress)
select * from (values
  ('Q2', 'Operations',   64),
  ('Q2', 'Pay',          48),
  ('Q2', 'Engineering',  55)
) as v(phase, dept_name, progress)
where not exists (select 1 from launch_readiness limit 1);

insert into revenue_annual (fiscal_year, goal, current)
select 2026, 1000000, 750000
where not exists (select 1 from revenue_annual where fiscal_year = 2026);

insert into customer_metrics (period_start, total_customers, monthly_goal, active_monthly)
select date_trunc('month', current_date)::date, 342, 500, 100
where not exists (select 1 from customer_metrics limit 1);

insert into ops_weekly (week_start, weekly_goal, visits, conversations, users_converted)
select date_trunc('week', current_date)::date, 10, 89, 50, 23
where not exists (select 1 from ops_weekly limit 1);

insert into pay_weekly (week_start, weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal)
select date_trunc('week', current_date)::date, 10, 28, 9, 1, 2, 5, 2
where not exists (select 1 from pay_weekly limit 1);

insert into finance_weekly (week_start, loan_disbursement_value, loan_disbursement_trend, loans_disbursed, loans_disbursed_trend, default_rate, default_rate_trend)
select date_trunc('week', current_date)::date, 2000000, 25, 15, 25, 12, 25
where not exists (select 1 from finance_weekly limit 1);

insert into engineering_projects (name, status, date_label, date_value, sort_order)
select * from (values
  ('USD wallets & transfers', 'Live',           'Deployed', 'May 2026', 1),
  ('Pay Partner Dashboard',   'In Development', 'Target',   'May 2026', 2)
) as v(name, status, date_label, date_value, sort_order)
where not exists (select 1 from engineering_projects limit 1);

insert into engineering_health (label, value, is_good, sort_order)
select * from (values
  ('Transaction Success', '98.2%', true,  1),
  ('Downtime (30d)',       '0.5h',  false, 2)
) as v(label, value, is_good, sort_order)
where not exists (select 1 from engineering_health limit 1);

-- ── 10. Dashboard Settings ──────────────────────────────────
create table if not exists dashboard_settings (
  id            uuid primary key default gen_random_uuid(),
  scroll_speed  int not null default 8,
  scroll_enabled boolean not null default true,
  updated_at    timestamptz not null default now()
);

insert into dashboard_settings (scroll_speed, scroll_enabled)
select 8, true
where not exists (select 1 from dashboard_settings limit 1);

`;

async function run() {
  console.log('🚀 Creating Supabase tables...\n');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  // Supabase doesn't expose a generic SQL exec endpoint on the REST API —
  // we need to use the pg endpoint or the Management API.
  // Fall back to the Management API approach.
  if (!res.ok) {
    console.log('Trying Management API approach...');
    await runViaMgmtApi();
    return;
  }

  const data = await res.json();
  console.log('✅ Done!', data);
}

async function runViaMgmtApi() {
  // The Supabase Management API requires a personal access token, not a service key.
  // Since we can't use that in a script without exposing it, we'll use the
  // Postgres REST endpoint with service_role which has raw SQL access.
  const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  if (!projectRef) {
    console.error('❌ Could not extract project ref from URL');
    process.exit(1);
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await res.text();
  if (res.ok) {
    console.log('✅ Tables created and seeded successfully!');
    console.log('   You can now refresh your dashboard — it will show live data.');
  } else {
    console.error('❌ Management API also failed:', text);
    console.log('\n📋 Run this SQL manually in the Supabase SQL editor:');
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('\n--- SQL ---');
    console.log(sql);
  }
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
