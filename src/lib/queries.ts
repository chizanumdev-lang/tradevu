/**
 * Shared Supabase query helpers for dashboard metrics.
 * All functions accept an already-initialised Supabase server client so they
 * can be composed inside route handlers without opening extra connections.
 */
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CustomerMetrics,
  RevenueMetrics,
  SalesMarketingMetric,
  PayData,
  PayMetric,
  FinanceData,
  FinanceMetric,
  ExchangeRate,
  EngineeringData,
  DeptTarget,
  LaunchStatus,
  User,
  DashboardSettings
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
  // Fetch the two most recent distinct-month snapshots.
  // updateCustomers upserts by period_start, so each calendar month has exactly
  // one authoritative row. We order by period_start DESC to get current first.
  const { data: metricsData, error: metricsError } = await supabase
    .from('customer_metrics')
    .select('total_customers, monthly_goal, active_monthly, period_start')
    .order('period_start', { ascending: false })
    .limit(2);

  if (metricsError) console.warn('customer_metrics:', metricsError.message);

  const currentSnapshot = metricsData?.[0];
  const previousSnapshot = metricsData?.[1];

  const currentTotal   = currentSnapshot?.total_customers  ?? 0;
  const currentActive  = currentSnapshot?.active_monthly   ?? 0;
  const previousActive = previousSnapshot?.active_monthly  ?? currentActive;

  // MoM % change based on approved (active_monthly) which equals approved businesses
  const percentageChange =
    previousActive > 0
      ? Math.round(((currentActive - previousActive) / previousActive) * 100)
      : 0;

  return {
    current:          currentTotal,
    goal:             currentSnapshot?.monthly_goal ?? 500,
    activeMonthly:    currentActive,
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
export async function fetchSalesMarketing(
  supabase: SupabaseClient
): Promise<SalesMarketingMetric[]> {
  const { data, error } = await supabase
    .from('sales_marketing')
    .select('touchpoint, period, leads_generated, conversions')
    .order('recorded_at', { ascending: false });

  if (error) {
    console.warn('sales_marketing:', error.message);
    return [
      { touchpoint: 'LinkedIn', period: 'week', leadsGenerated: 45, conversions: 12 },
      { touchpoint: 'Website', period: 'week', leadsGenerated: 89, conversions: 24 },
      { touchpoint: 'X', period: 'week', leadsGenerated: 22, conversions: 5 },
      { touchpoint: 'LinkedIn', period: 'month', leadsGenerated: 180, conversions: 48 },
      { touchpoint: 'Website', period: 'month', leadsGenerated: 350, conversions: 96 },
      { touchpoint: 'X', period: 'month', leadsGenerated: 100, conversions: 25 },
    ];
  }

  const latestMap = new Map<string, any>();
  for (const m of (data || [])) {
    const key = `${m.touchpoint}_${m.period}`;
    if (!latestMap.has(key)) latestMap.set(key, m);
  }

  return Array.from(latestMap.values()).map(m => ({
    touchpoint: m.touchpoint as any,
    period: m.period as any,
    leadsGenerated: m.leads_generated,
    conversions: m.conversions
  }));
}

export async function updateSalesMarketing(
  supabase: SupabaseClient,
  metrics: SalesMarketingMetric[]
) {
  await supabase.from('sales_marketing').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error } = await supabase
    .from('sales_marketing')
    .insert(metrics.map(m => ({
      touchpoint: m.touchpoint,
      period: m.period,
      leads_generated: m.leadsGenerated,
      conversions: m.conversions
    })));
  if (error) throw error;
  return true;
}

// ─── 5. Pay ───────────────────────────────────────────────────────────────
export async function fetchPay(
  supabase: SupabaseClient
): Promise<PayData> {
  const { data, error } = await supabase
    .from('pay_metrics')
    .select('*')
    .order('recorded_at', { ascending: false });

  if (error) {
    console.warn('pay_metrics:', error.message);
    return { metrics: [] };
  }

  const latestMap = new Map<string, any>();
  for (const m of (data || [])) {
    if (!latestMap.has(m.period)) latestMap.set(m.period, m);
  }

  return {
    metrics: Array.from(latestMap.values()).map(m => ({
      period: m.period as any,
      weeklyGoal: m.weekly_goal,
      conversations: m.conversations,
      usersConverted: m.users_converted,
      lcyTransfers: m.lcy_transfers,
      lcyGoal: m.lcy_goal,
      fcyTransfers: m.fcy_transfers,
      fcyGoal: m.fcy_goal
    }))
  };
}

export async function updatePay(
  supabase: SupabaseClient,
  metrics: PayMetric[]
) {
  // Clear and re-insert for simplicity
  await supabase.from('pay_metrics').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase
    .from('pay_metrics')
    .insert(metrics.map(m => ({
      period: m.period,
      weekly_goal: m.weeklyGoal,
      conversations: m.conversations,
      users_converted: m.usersConverted,
      lcy_transfers: m.lcyTransfers,
      lcy_goal: m.lcyGoal,
      fcy_transfers: m.fcyTransfers,
      fcy_goal: m.fcyGoal
    })));

  if (error) throw error;
  return true;
}

// ─── 6. Finance ───────────────────────────────────────────────────────────────
export async function fetchFinance(
  supabase: SupabaseClient
): Promise<FinanceData> {
  const [metricsRes, ratesRes] = await Promise.all([
    supabase
      .from('finance_metrics')
      .select('loan_type, currency, period, loan_value, loan_count, default_rate')
      .order('recorded_at', { ascending: false }),
    supabase
      .from('exchange_rates')
      .select('currency, rate_to_usd')
  ]);

  if (metricsRes.error || ratesRes.error) {
    console.warn('finance:', metricsRes.error?.message || ratesRes.error?.message);
    // Return empty but consistent structure
    return { 
      metrics: [], 
      exchangeRates: [
        { currency: 'USD', rateToUsd: 1.0 },
        { currency: 'NGN', rateToUsd: 0.00065 },
        { currency: 'USDT', rateToUsd: 1.0 },
        { currency: 'USDC', rateToUsd: 1.0 }
      ] 
    };
  }

  const latestMap = new Map<string, any>();
  for (const m of (metricsRes.data || [])) {
    const key = `${m.loan_type}_${m.currency}_${m.period}`;
    if (!latestMap.has(key)) latestMap.set(key, m);
  }

  return {
    metrics: Array.from(latestMap.values()).map(m => ({
      loanType: m.loan_type as any,
      currency: m.currency as any,
      period: m.period as any,
      loanValue: m.loan_value,
      loanCount: m.loan_count,
      defaultRate: m.default_rate
    })),
    exchangeRates: (ratesRes.data || []).map(r => ({
      currency: r.currency as any,
      rateToUsd: r.rate_to_usd
    }))
  };
}

export async function updateFinance(
  supabase: SupabaseClient,
  metrics: FinanceMetric[],
  exchangeRates: ExchangeRate[]
) {
  // Clear and re-insert metrics for simplicity
  await supabase.from('finance_metrics').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const { error: mError } = await supabase
    .from('finance_metrics')
    .insert(metrics.map(m => ({
      loan_type: m.loanType,
      currency: m.currency,
      period: m.period,
      loan_value: m.loanValue,
      loan_count: m.loanCount,
      default_rate: m.defaultRate,
      historical_rate_to_usd: exchangeRates.find(r => r.currency === m.currency)?.rateToUsd || 1
    })));

  if (mError) throw mError;

  const { error: rError } = await supabase
    .from('exchange_rates')
    .upsert(exchangeRates.map(r => ({
      currency: r.currency,
      rate_to_usd: r.rateToUsd,
      updated_at: new Date().toISOString()
    })), { onConflict: 'currency' });

  if (rError) throw rError;

  return true;
}

// ─── 7. Engineering ───────────────────────────────────────────────────────────
export async function fetchEngineering(
  supabase: SupabaseClient
): Promise<EngineeringData> {
  const [projectsRes, healthRes] = await Promise.all([
    supabase
      .from('engineering_projects')
      .select('id, name, status, date_label, date_value, description, completion_percentage, impact_score')
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
        { id: '1', title: 'USD wallets & transfers', name: 'USD wallets & transfers', status: 'Live', dateLabel: 'Deployed', dateValue: 'May 2026', progress: 100, impactScore: 90, eta: 'May 2026', description: 'Deployment of multi-currency stablecoin and USD wallet gateways' },
        { id: '2', title: 'Pay Partner Dashboard', name: 'Pay Partner Dashboard', status: 'In Development', dateLabel: 'Target', dateValue: 'May 2026', progress: 45, impactScore: 80, eta: 'May 2026', description: 'Onboarding console and metrics interface for Pay service partners' }
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
      description: p.description || '',
      name: p.name,
      status: p.status as 'Live' | 'In Development' | 'Testing',
      dateLabel: p.date_label,
      dateValue: p.date_value,
      progress: p.completion_percentage || 0,
      impactScore: p.impact_score || 0,
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
): Promise<DashboardSettings> {
  const { data, error } = await supabase
    .from('dashboard_settings')
    .select('scroll_speed, scroll_enabled, dashboard_title, launch_status_title, departments')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn('dashboard_settings:', error.message);
    return { 
      scrollSpeed: 8, 
      scrollEnabled: true,
      dashboardTitle: "FY'26 Operating Dashboard",
      launchStatusTitle: "Launch Readiness",
      departments: []
    };
  }

  return {
    scrollSpeed: data.scroll_speed,
    scrollEnabled: data.scroll_enabled,
    dashboardTitle: data.dashboard_title,
    launchStatusTitle: data.launch_status_title,
    departments: data.departments || []
  };
}

export async function updateDashboardSettings(
  supabase: SupabaseClient,
  settings: Partial<DashboardSettings>
) {
  const { error } = await supabase
    .from('dashboard_settings')
    .insert({
      scroll_speed: settings.scrollSpeed,
      scroll_enabled: settings.scrollEnabled,
      dashboard_title: settings.dashboardTitle,
      launch_status_title: settings.launchStatusTitle,
      departments: settings.departments,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(`dashboard_settings: ${error.message}`);
}

// ─── 8. Last System Update Timestamp ──────────────────────────────────────────
export async function fetchLastUpdateTimestamp(
  supabase: SupabaseClient
): Promise<string | undefined> {
  const [ops, pay, finance, customers, revenue, launch, engProjects, engHealth, settings] = await Promise.all([
    supabase.from('sales_marketing').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('pay_weekly').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
    supabase.from('finance_metrics').select('recorded_at').order('recorded_at', { ascending: false }).limit(1),
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

export async function upsertSingleUser(
  supabase: SupabaseClient,
  user: User
) {
  const { error } = await supabase
    .from('dashboard_users')
    .upsert({
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions || [],
      password: user.password,
      requires_password_change: user.requiresPasswordChange ?? false,
    }, { onConflict: 'email' });

  if (error) throw new Error(`dashboard_users_single: ${error.message}`);
}

export async function updateUserPermissions(
  supabase: SupabaseClient,
  email: string,
  role: string,
  permissions: string[]
) {
  const { error } = await supabase
    .from('dashboard_users')
    .update({
      role: role,
      permissions: permissions
    })
    .eq('email', email);

  if (error) throw new Error(`update_user_permissions: ${error.message}`);
}
