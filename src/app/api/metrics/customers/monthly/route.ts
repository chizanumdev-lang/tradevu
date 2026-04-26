import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/metrics/customers/monthly — Ops Team Lead updates customer counts */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { totalCustomers, monthlyGoal, activeMonthly, periodStart } = body;

    if (typeof totalCustomers !== 'number' || typeof activeMonthly !== 'number') {
      return NextResponse.json(
        { error: 'totalCustomers and activeMonthly are required numbers.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const defaultPeriodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('customer_metrics')
      .insert({
        period_start: periodStart ?? defaultPeriodStart,
        total_customers: totalCustomers,
        monthly_goal: monthlyGoal ?? 500,
        active_monthly: activeMonthly,
        recorded_at: now.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/metrics/customers/monthly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customer_metrics')
      .select('total_customers, monthly_goal, active_monthly, period_start')
      .order('period_start', { ascending: false })
      .limit(2);

    if (error) throw new Error(error.message);

    const current = data?.[0];
    const previous = data?.[1];

    const currentCount = current?.total_customers ?? 0;
    const previousCount = previous?.total_customers ?? 0;
    const percentageChange =
      previousCount > 0
        ? Math.round(((currentCount - previousCount) / previousCount) * 100)
        : 0;

    return NextResponse.json({
      current: currentCount,
      goal: current?.monthly_goal ?? 500,
      activeMonthly: current?.active_monthly ?? 0,
      percentageChange,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/metrics/customers/monthly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
