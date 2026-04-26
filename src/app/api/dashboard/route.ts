import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  fetchCustomerMetrics,
  fetchRevenueAnnual,
  fetchLaunchStatus,
  fetchOpsWeekly,
  fetchPayWeekly,
  fetchEngineering,
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
    ] = await Promise.all([
      fetchCustomerMetrics(supabase),
      fetchRevenueAnnual(supabase),
      fetchLaunchStatus(supabase),
      fetchOpsWeekly(supabase),
      fetchPayWeekly(supabase),
      fetchEngineering(supabase),
    ]);

    const payload: DashboardData = {
      customersMonthly,
      revenueAnnual,
      launchStatus,
      opsWeekly,
      payWeekly,
      engineering,
      engineeringRoadmap: engineering.projects,
    };

    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/dashboard]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
