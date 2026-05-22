import { createClient } from '@/utils/supabase/server';


export async function generateReport(
  module: 'all' | 'finance' | 'sales' | 'pay' | 'engineering' | 'customers' | 'revenue' | 'launch',
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient();

  const reportData: Record<string, unknown> = {
    generatedAt: new Date().toISOString(),
    module,
    filters: { startDate, endDate }
  };

  if (module === 'all' || module === 'finance') {
    let query = supabase.from('finance_metrics').select('*').order('recorded_at', { ascending: false });
    if (startDate) query = query.gte('recorded_at', startDate);
    if (endDate) query = query.lte('recorded_at', endDate);
    
    const { data: metrics } = await query;
    
    // Calculate historical totals
    let totalUsd = 0;
    const periodTotals: Record<string, number> = {};

    if (metrics) {
      interface FinanceMetricRow {
        period: string;
        historical_rate_to_usd?: number;
        loan_value: number;
      }
      metrics.forEach((m: FinanceMetricRow) => {
        // Use historical rate for reporting, falling back to 1 if missing
        const rate = m.historical_rate_to_usd || 1;
        const valUsd = m.loan_value * rate;
        
        totalUsd += valUsd;
        periodTotals[m.period] = (periodTotals[m.period] || 0) + valUsd;
      });
    }

    reportData.finance = {
      rawMetrics: metrics,
      calculatedTotalsUsd: {
        total: totalUsd,
        byPeriod: periodTotals
      }
    };
  }

  if (module === 'all' || module === 'sales') {
    let query = supabase.from('sales_marketing').select('*').order('recorded_at', { ascending: false });
    if (startDate) query = query.gte('recorded_at', startDate);
    if (endDate) query = query.lte('recorded_at', endDate);
    
    const { data: sales } = await query;
    reportData.sales = sales;
  }

  if (module === 'all' || module === 'pay') {
    let query = supabase.from('pay_metrics').select('*').order('recorded_at', { ascending: false });
    if (startDate) query = query.gte('recorded_at', startDate);
    if (endDate) query = query.lte('recorded_at', endDate);
    
    const { data: pay } = await query;
    reportData.pay = pay;
  }

  if (module === 'all' || module === 'engineering') {
    const { data: projects } = await supabase.from('engineering_projects').select('*');
    const { data: health } = await supabase.from('engineering_health').select('*');
    reportData.engineering = { projects, health };
  }

  if (module === 'all' || module === 'customers') {
    const { data: customers } = await supabase.from('customer_metrics').select('*');
    reportData.customers = customers;
  }

  if (module === 'all' || module === 'revenue') {
    const { data: revenue } = await supabase.from('revenue_annual').select('*');
    reportData.revenue = revenue;
  }

  if (module === 'all' || module === 'launch') {
    const { data: launch } = await supabase.from('launch_readiness').select('*');
    reportData.launch = launch;
  }

  return reportData;
}
