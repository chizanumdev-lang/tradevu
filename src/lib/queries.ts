/**
 * Shared Supabase query helpers for dashboard metrics.
 * All functions accept an already-initialised Supabase server client so they
 * can be composed inside route handlers without opening extra connections.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CustomerMetrics,
  RevenueMetrics,
  LaunchStatus,
  WeeklyOps,
  WeeklyPay,
  EngineeringData,
} from '@/types/dashboard';

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Clamps a ratio to a 0-100 integer percentage. */
function toPercent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 100));
}

// ─── 1. Customer metrics ──────────────────────────────────────────────────────
export async function fetchCustomerMetrics(
  supabase: SupabaseClient
): Promise<CustomerMetrics> {
  // Latest two months, so we can compute MoM change
  const { data, error } = await supabase
    .from('customer_metrics')
    .select('total_customers, monthly_goal, active_monthly, period_start')
    .order('period_start', { ascending: false })
    .limit(2);

  if (error) throw new Error(`customer_metrics: ${error.message}`);

  const current = data?.[0];
  const previous = data?.[1];

  const currentCount = current?.total_customers ?? 0;
  const previousCount = previous?.total_customers ?? 0;
  const percentageChange =
    previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : 0;

  return {
    current: currentCount,
    goal: current?.monthly_goal ?? 500,
    activeMonthly: current?.active_monthly ?? 0,
    percentageChange,
  };
}

// ─── 2. Revenue annual ────────────────────────────────────────────────────────
export async function fetchRevenueAnnual(
  supabase: SupabaseClient
): Promise<RevenueMetrics> {
  const currentYear = new Date().getFullYear();

  const { data, error } = await supabase
    .from('revenue_annual')
    .select('goal, current')
    .eq('fiscal_year', currentYear)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(`revenue_annual: ${error.message}`);

  const goal = Number(data.goal);
  const current = Number(data.current);

  return {
    goal,
    current,
    percentage: toPercent(current, goal),
  };
}

// ─── 3. Launch readiness ──────────────────────────────────────────────────────
export async function fetchLaunchStatus(
  supabase: SupabaseClient
): Promise<LaunchStatus> {
  // Grab the latest row per dept (distinct on dept_name, ordered by recorded_at desc)
  const { data, error } = await supabase
    .from('launch_readiness')
    .select('phase, dept_name, progress, recorded_at')
    .order('recorded_at', { ascending: false });

  if (error) throw new Error(`launch_readiness: ${error.message}`);

  // De-duplicate: keep only the newest row per dept
  const seen = new Set<string>();
  const deptTargets: { name: string; progress: number }[] = [];
  let phase = 'Q2';

  for (const row of data ?? []) {
    if (!seen.has(row.dept_name)) {
      seen.add(row.dept_name);
      phase = row.phase;
      deptTargets.push({ name: row.dept_name, progress: row.progress });
    }
  }

  const overall =
    deptTargets.length > 0
      ? Math.round(
          deptTargets.reduce((sum, d) => sum + d.progress, 0) /
            deptTargets.length
        )
      : 0;

  return { phase, progress: overall, deptTargets };
}

// ─── 4. Ops weekly ────────────────────────────────────────────────────────────
export async function fetchOpsWeekly(
  supabase: SupabaseClient
): Promise<WeeklyOps> {
  const { data, error } = await supabase
    .from('ops_weekly')
    .select(
      'weekly_goal, visits, conversations, users_converted, week_start'
    )
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(`ops_weekly: ${error.message}`);

  const conversionRate = toPercent(data.users_converted, data.conversations);

  return {
    weeklyGoal: data.weekly_goal,
    visits: data.visits,
    conversations: data.conversations,
    usersConverted: data.users_converted,
    conversionRate,
    activePilots: (data as any).active_pilots || 0,
  };
}

// ─── 5. Pay weekly ────────────────────────────────────────────────────────────
export async function fetchPayWeekly(
  supabase: SupabaseClient
): Promise<WeeklyPay> {
  const { data, error } = await supabase
    .from('pay_weekly')
    .select(
      'weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal, week_start'
    )
    .order('week_start', { ascending: false })
    .limit(1)
    .single();

  if (error) throw new Error(`pay_weekly: ${error.message}`);

  const conversionRate = toPercent(data.users_converted, data.conversations);

  return {
    weeklyGoal: data.weekly_goal,
    conversations: data.conversations,
    usersConverted: data.users_converted,
    conversionRate,
    transfers: [
      { label: 'LCY transfers', current: data.lcy_transfers, value: data.lcy_transfers, goal: data.lcy_goal },
      { label: 'FCY transfers', current: data.fcy_transfers, value: data.fcy_transfers, goal: data.fcy_goal },
    ],
  };
}

// ─── 6. Engineering ───────────────────────────────────────────────────────────
export async function fetchEngineering(
  supabase: SupabaseClient
): Promise<EngineeringData> {
  const [projectsRes, healthRes] = await Promise.all([
    supabase
      .from('engineering_projects')
      .select('id, name, status, date_label, date_value')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('engineering_health')
      .select('label, value, is_good')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (projectsRes.error)
    throw new Error(`engineering_projects: ${projectsRes.error.message}`);
  if (healthRes.error)
    throw new Error(`engineering_health: ${healthRes.error.message}`);

  return {
    projects: ((projectsRes.data as any) ?? []).map((p: any) => ({
      id: p.id,
      title: p.name,
      description: (p as any).description || '',
      name: p.name,
      status: p.status as 'Live' | 'In Development' | 'Testing',
      dateLabel: p.date_label,
      dateValue: p.date_value,
      progress: 0,
      eta: p.date_value,
    })),
    health: (healthRes.data ?? []).map((h) => ({
      label: h.label,
      value: h.value,
      isGood: h.is_good,
    })),
  };
}

// ─── 7. Last System Update Timestamp ──────────────────────────────────────────
export async function fetchLastUpdateTimestamp(
  supabase: SupabaseClient
): Promise<string | undefined> {
  const [ops, pay, customers, revenue, launch, engProjects, engHealth] = await Promise.all([
    supabase.from('ops_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
    supabase.from('pay_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
    supabase.from('customer_metrics').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
    supabase.from('revenue_annual').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
    supabase.from('launch_readiness').select('recorded_at').order('recorded_at', { ascending: false }).limit(1).single(),
    supabase.from('engineering_projects').select('updated_at').order('updated_at', { ascending: false }).limit(1).single(),
    supabase.from('engineering_health').select('updated_at').order('updated_at', { ascending: false }).limit(1).single(),
  ]);

  const dates = [
    ops.data?.recorded_at,
    pay.data?.recorded_at,
    customers.data?.recorded_at,
    revenue.data?.recorded_at,
    launch.data?.recorded_at,
    engProjects.data?.updated_at,
    engHealth.data?.updated_at
  ]
    .filter(Boolean)
    .map(d => new Date(d).getTime());

  if (dates.length > 0) {
    return new Date(Math.max(...dates)).toISOString();
  }
  return undefined;
}
