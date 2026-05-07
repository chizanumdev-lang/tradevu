import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      loanDisbursementValue, 
      loanDisbursementTrend,
      loansDisbursed,
      loansDisbursedTrend,
      defaultRate,
      defaultRateTrend
    } = body;

    const supabase = await createClient();

    // Get the start of the current ISO week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diff = day === 0 ? 6 : day - 1; // days since Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Check if we already have a record for this week
    const { data: existing } = await supabase
      .from('finance_weekly')
      .select('id')
      .eq('week_start', weekStartStr)
      .limit(1);

    let error;
    if (existing && existing.length > 0) {
      const result = await supabase
        .from('finance_weekly')
        .update({
          loan_disbursement_value: loanDisbursementValue,
          loan_disbursement_trend: loanDisbursementTrend,
          loans_disbursed: loansDisbursed,
          loans_disbursed_trend: loansDisbursedTrend,
          default_rate: defaultRate,
          default_rate_trend: defaultRateTrend,
          recorded_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id);
      error = result.error;
    } else {
      const result = await supabase
        .from('finance_weekly')
        .insert([{
          week_start: weekStartStr,
          loan_disbursement_value: loanDisbursementValue,
          loan_disbursement_trend: loanDisbursementTrend,
          loans_disbursed: loansDisbursed,
          loans_disbursed_trend: loansDisbursedTrend,
          default_rate: defaultRate,
          default_rate_trend: defaultRateTrend,
          recorded_at: new Date().toISOString(),
        }]);
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[POST /api/finance/weekly]', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
