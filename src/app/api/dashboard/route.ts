import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  fetchCustomerMetrics,
  fetchRevenueAnnual,
  fetchLaunchStatus,
  fetchOpsWeekly,
  fetchPayWeekly,
  fetchFinanceWeekly,
  fetchEngineering,
  fetchDashboardSettings,
  fetchLastUpdateTimestamp,
  fetchDashboardUsers,
} from '@/lib/queries';
import { DashboardData } from '@/types/dashboard';

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      customersMonthly,
      revenueAnnual,
      launchStatus,
      opsWeekly,
      payWeekly,
      financeWeekly,
      engineering,
      lastUpdateTimestamp,
      settings,
      users,
    ] = await Promise.all([
      fetchCustomerMetrics(supabase),
      fetchRevenueAnnual(supabase),
      fetchLaunchStatus(supabase),
      fetchOpsWeekly(supabase),
      fetchPayWeekly(supabase),
      fetchFinanceWeekly(supabase),
      fetchEngineering(supabase),
      fetchLastUpdateTimestamp(supabase),
      fetchDashboardSettings(supabase),
      fetchDashboardUsers(supabase),
    ]);

    const payload: DashboardData = {
      customersMonthly,
      revenueAnnual,
      launchStatus: launchStatus.current,
      launchHistory: launchStatus.history,
      opsWeekly,
      payWeekly,
      financeWeekly,
      engineering,
      engineeringRoadmap: engineering.projects,
      lastUpdateTimestamp,
      settings,
      users,
      serverTime: new Date().toISOString(),
    };



    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/dashboard]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
