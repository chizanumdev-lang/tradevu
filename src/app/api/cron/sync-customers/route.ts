import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const tradevuApi = process.env.TRADEVU_API_BASE;
    if (!tradevuApi) {
      return new NextResponse('Missing TRADEVU_API_BASE', { status: 500 });
    }

    // 1. Fetch current monthly goal from Supabase to preserve it
    const supabase = await createAdminClient();
    const periodStart = new Date().toISOString().substring(0, 7) + '-01';
    
    let currentGoal = 0;
    const { data: currentMetrics } = await supabase
      .from('customer_metrics')
      .select('monthly_goal')
      .eq('period_start', periodStart)
      .single();
      
    if (currentMetrics && currentMetrics.monthly_goal) {
      currentGoal = currentMetrics.monthly_goal;
    }

    // 2. Fetch live data from TradeVu API
    const [totalRes, approvedRes] = await Promise.all([
      fetch(`${tradevuApi}/v1/business/count`, { cache: 'no-store' }),
      fetch(`${tradevuApi}/v1/business/count?status=APPROVED`, { cache: 'no-store' })
    ]);

    if (!totalRes.ok || !approvedRes.ok) {
      throw new Error(`Failed to fetch from TradeVu API. Total OK: ${totalRes.ok}, Approved OK: ${approvedRes.ok}`);
    }

    const totalData = await totalRes.json();
    const approvedData = await approvedRes.json();

    const totalCustomers = totalData.data?.totalBusinesses ?? 0;
    const activeMonthly = approvedData.data?.totalBusinesses ?? 0;

    // 3. Upsert into Supabase using the admin client
    const { error } = await supabase
      .from('customer_metrics')
      .upsert({
        period_start: periodStart,
        total_customers: totalCustomers,
        monthly_goal: currentGoal,
        active_monthly: activeMonthly
      }, {
        onConflict: 'period_start'
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully synced customer metrics',
      synced: {
        total_customers: totalCustomers,
        active_monthly: activeMonthly,
        monthly_goal: currentGoal
      }
    });
  } catch (error: any) {
    console.error('Error syncing customer metrics:', error);
    return new NextResponse(`Sync error: ${error.message}`, { status: 500 });
  }
}
