import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

    const { error } = await supabase
      .from('finance_weekly')
      .insert([{
        loan_disbursement_value: loanDisbursementValue,
        loan_disbursement_trend: loanDisbursementTrend,
        loans_disbursed: loansDisbursed,
        loans_disbursed_trend: loansDisbursedTrend,
        default_rate: defaultRate,
        default_rate_trend: defaultRateTrend,
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
