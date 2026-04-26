import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/metrics/revenue/annual — HR or CEO sets the annual revenue goal and current figure */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal, current, fiscalYear } = body;

    if (typeof goal !== 'number' || typeof current !== 'number') {
      return NextResponse.json(
        { error: 'goal and current are required numbers.' },
        { status: 400 }
      );
    }

    const year = fiscalYear ?? new Date().getFullYear();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('revenue_annual')
      .insert({
        fiscal_year: year,
        goal,
        current,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/metrics/revenue/annual]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('revenue_annual')
      .select('goal, current')
      .eq('fiscal_year', currentYear)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(error.message);

    const goal = Number(data.goal);
    const current = Number(data.current);
    const percentage = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;

    return NextResponse.json({ goal, current, percentage });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/metrics/revenue/annual]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
