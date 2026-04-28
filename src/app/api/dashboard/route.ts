import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  fetchCustomerMetrics,
  fetchRevenueAnnual,
  fetchLaunchStatus,
  fetchOpsWeekly,
  fetchPayWeekly,
  fetchEngineering,
  fetchDashboardSettings,
  fetchLastUpdateTimestamp,
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
      engineering,
      lastUpdateTimestamp,
      settings,
    ] = await Promise.all([
      fetchCustomerMetrics(supabase),
      fetchRevenueAnnual(supabase),
      fetchLaunchStatus(supabase),
      fetchOpsWeekly(supabase),
      fetchPayWeekly(supabase),
      fetchEngineering(supabase),
      fetchLastUpdateTimestamp(supabase),
      fetchDashboardSettings(supabase),
    ]);

    const payload: DashboardData = {
      customersMonthly,
      revenueAnnual,
      launchStatus: launchStatus.current,
      launchHistory: launchStatus.history,
      opsWeekly,


      payWeekly,
      engineering,
      engineeringRoadmap: engineering.projects,
      lastUpdateTimestamp,
      settings,
      serverTime: new Date().toISOString(),
    };



    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/dashboard]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
