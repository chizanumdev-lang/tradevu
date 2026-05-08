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
  WeeklyFinance,
  EngineeringData,
  DeptTarget,
  User
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
    .order('recorded_at', { ascending: false })
    .limit(2);

  if (error) {
    console.warn('customer_metrics:', error.message);
    return {
      current: 342,
      goal: 500,
      activeMonthly: 100,
      percentageChange: 12,
    };
  }

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

  if (error) {
    console.warn('revenue_annual:', error.message);
    return {
      goal: 1000000,
      current: 750000,
      percentage: 75,
    };
  }

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
): Promise<{ current: LaunchStatus; history: LaunchStatus[] }> {
  const { data, error } = await supabase
    .from('launch_readiness')
    .select('phase, dept_name, progress, recorded_at')
    .order('recorded_at', { ascending: false });

  if (error) {
    console.warn('launch_readiness:', error.message);
    return {
      current: { phase: 'Q2', progress: 56, deptTargets: [
        { name: 'Operations', progress: 64 },
        { name: 'Pay', progress: 48 },
        { name: 'Engineering', progress: 55 }
      ], label: 'Q2' },
      history: []
    };
  }

  // Group by phase
  const phaseMap: Record<string, { phase: string, deptTargets: DeptTarget[], latestDate: string }> = {};
  
  for (const row of data ?? []) {
    if (!phaseMap[row.phase]) {
      phaseMap[row.phase] = { phase: row.phase, deptTargets: [], latestDate: row.recorded_at };
    }
    if (!phaseMap[row.phase].deptTargets.find(d => d.name === row.dept_name)) {
      phaseMap[row.phase].deptTargets.push({ name: row.dept_name, progress: row.progress });
    }
  }

  const allQuarters = Object.values(phaseMap).map(p => {
    const overall = p.deptTargets.length > 0
      ? Math.round(p.deptTargets.reduce((s, d) => s + d.progress, 0) / p.deptTargets.length)
      : 0;
    return { phase: p.phase, progress: overall, deptTargets: p.deptTargets, label: p.phase };
  });

  // Sort by latest update date desc
  allQuarters.sort((a, b) => {
      const dateA = new Date(phaseMap[a.phase].latestDate).getTime();
      const dateB = new Date(phaseMap[b.phase].latestDate).getTime();
      return dateB - dateA;
  });

  return {
    current: allQuarters[0] || { phase: 'Q2', progress: 0, deptTargets: [] },
    history: allQuarters.slice(1)
  };
}


// ─── 4. Ops weekly ────────────────────────────────────────────────────────────
export async function fetchOpsWeekly(
  supabase: SupabaseClient
): Promise<WeeklyOps> {
  const { data, error } = await supabase
    .from('ops_weekly')
    .select(
      'weekly_goal, visits, conversations, users_converted, week_start, recorded_at'
    )
    .order('week_start', { ascending: false })
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('ops_weekly:', error.message);
    return {
      weeklyGoal: 10,
      visits: 89,
      conversations: 50,
      usersConverted: 23,
      conversionRate: 26,
      activePilots: 0,
    };
  }

  const conversionRate = toPercent(data.users_converted, data.visits);

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
      'weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal, week_start, recorded_at'
    )
    .order('week_start', { ascending: false })
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('pay_weekly:', error.message);
    return {
      weeklyGoal: 10,
      conversations: 28,
      usersConverted: 9,
      conversionRate: 32,
      transfers: [
        { label: 'LCY transfers', current: 1, value: 1, goal: 2 },
        { label: 'FCY transfers', current: 5, value: 5, goal: 2 },
      ],
    };
  }

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

// ─── 6. Finance weekly ────────────────────────────────────────────────────────
export async function fetchFinanceWeekly(
  supabase: SupabaseClient
): Promise<WeeklyFinance> {
  const { data, error } = await supabase
    .from('finance_weekly')
    .select(
      'loan_disbursement_value, loan_disbursement_trend, loans_disbursed, loans_disbursed_trend, default_rate, default_rate_trend, week_start, recorded_at'
    )
    .order('week_start', { ascending: false })
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // Return defaults if table doesn't exist or no data
    console.warn('finance_weekly:', error.message);
    return {
      loanDisbursementValue: 2000000,
      loanDisbursementTrend: 25,
      loansDisbursed: 15,
      loansDisbursedTrend: 25,
      defaultRate: 12,
      defaultRateTrend: 25,
    };
  }

  return {
    loanDisbursementValue: Number(data.loan_disbursement_value),
    loanDisbursementTrend: data.loan_disbursement_trend,
    loansDisbursed: data.loans_disbursed,
    loansDisbursedTrend: data.loans_disbursed_trend,
    defaultRate: Number(data.default_rate),
    defaultRateTrend: data.default_rate_trend,
  };
}

// ─── 7. Engineering ───────────────────────────────────────────────────────────
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

  if (projectsRes.error || healthRes.error) {
    console.warn('engineering:', projectsRes.error?.message || healthRes.error?.message);
    return {
      projects: [
        { id: '1', title: 'USD wallets & transfers', name: 'USD wallets & transfers', status: 'Live', dateLabel: 'Deployed', dateValue: 'May 2026', progress: 0, eta: 'May 2026', description: '' },
        { id: '2', title: 'Pay Partner Dashboard', name: 'Pay Partner Dashboard', status: 'In Development', dateLabel: 'Target', dateValue: 'May 2026', progress: 0, eta: 'May 2026', description: '' }
      ],
      health: [
        { label: 'Transaction Success', value: '98.2%', isGood: true },
        { label: 'Downtime (30d)', value: '0.5h', isGood: false }
      ]
    };
  }

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

// ─── 7. Dashboard Settings ────────────────────────────────────────────────────
export async function fetchDashboardSettings(
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('dashboard_settings')
    .select('scroll_speed, scroll_enabled, dashboard_title')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('dashboard_settings:', error.message);
    return { 
      scrollSpeed: 8, 
      scrollEnabled: true,
      dashboardTitle: "FY'26 Operating Dashboard"
    };
  }

  return {
    scrollSpeed: data.scroll_speed,
    scrollEnabled: data.scroll_enabled,
    dashboardTitle: data.dashboard_title || "FY'26 Operating Dashboard",
  };
}

export async function updateDashboardSettings(
  supabase: SupabaseClient,
  settings: { scrollSpeed: number; scrollEnabled: boolean; dashboardTitle: string }
) {
  const { error } = await supabase
    .from('dashboard_settings')
    .insert({
      scroll_speed: settings.scrollSpeed,
      scroll_enabled: settings.scrollEnabled,
      dashboard_title: settings.dashboardTitle,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(`dashboard_settings: ${error.message}`);
}

// ─── 8. Last System Update Timestamp ──────────────────────────────────────────
export async function fetchLastUpdateTimestamp(
  supabase: SupabaseClient
): Promise<string | undefined> {
  const [ops, pay, finance, customers, revenue, launch, engProjects, engHealth, settings] = await Promise.all([
    supabase.from('ops_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('pay_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('finance_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('customer_metrics').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('revenue_annual').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('launch_readiness').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('engineering_projects').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    supabase.from('engineering_health').select('updated_at').order('updated_at', { ascending: false }).limit(1),
    supabase.from('dashboard_settings').select('updated_at').order('updated_at', { ascending: false }).limit(1),
  ]);

  const dates = [
    ops.data?.[0]?.recorded_at,
    pay.data?.[0]?.recorded_at,
    finance.data?.[0]?.recorded_at,
    customers.data?.[0]?.recorded_at,
    revenue.data?.[0]?.recorded_at,
    launch.data?.[0]?.recorded_at,
    engProjects.data?.[0]?.updated_at,
    engHealth.data?.[0]?.updated_at,
    settings.data?.[0]?.updated_at
  ]
    .filter(Boolean)
    .map(d => new Date(d).getTime());

  if (dates.length > 0) {
    return new Date(Math.max(...dates)).toISOString();
  }
  return undefined;
}

// ─── 9. Dashboard Users ───────────────────────────────────────
export async function fetchDashboardUsers(
  supabase: SupabaseClient
): Promise<User[]> {
  const { data, error } = await supabase
    .from('dashboard_users')
    .select('email, name, role, permissions, password, requires_password_change')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('dashboard_users:', error.message);
    // Return hardcoded defaults if table doesn't exist yet
    return [
      { email: 'nkiru@tradevu.africa', name: 'Nkiru', role: 'CEO', password: 'password123' },
      { email: 'tola@tradevu.co', name: 'Tola', role: 'HR', password: 'password123' },
      { email: 'kene@tradevu.co', name: 'Kene', role: 'PM', password: 'password123' },
    ];
  }

  const users = (data ?? []).map(u => ({
    email: u.email,
    name: u.name,
    role: u.role,
    permissions: u.permissions,
    password: u.password,
    requiresPasswordChange: u.requires_password_change
  }));

  return users.length > 0 ? users : [
    { email: 'nkiru@tradevu.africa', name: 'Nkiru', role: 'CEO', password: 'password123' },
    { email: 'tola@tradevu.co', name: 'Tola', role: 'HR', password: 'password123' },
    { email: 'kene@tradevu.co', name: 'Kene', role: 'PM', password: 'password123' },
  ];
}

export async function updateDashboardUsers(
  supabase: SupabaseClient,
  users: User[]
) {
  // Clear all and re-insert for simple synchronization in this dashboard context
  // Alternatively, use upsert/delete logic.
  
  // First, get all current emails to know what to delete
  const { data: currentUsers } = await supabase.from('dashboard_users').select('email');
  const currentEmails = (currentUsers ?? []).map(u => u.email);
  const newEmails = users.map(u => u.email);
  
  const toDelete = currentEmails.filter(e => !newEmails.includes(e));
  
  if (toDelete.length > 0) {
    await supabase.from('dashboard_users').delete().in('email', toDelete);
  }

  const { error } = await supabase
    .from('dashboard_users')
    .upsert(users.map(u => ({
      email: u.email,
      name: u.name,
      role: u.role,
      permissions: u.permissions || [],
      password: u.password,
      requires_password_change: u.requiresPasswordChange || false,
    })));

  if (error) throw new Error(`dashboard_users: ${error.message}`);
}
