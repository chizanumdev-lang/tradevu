import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/pay/weekly — Pay Team Lead updates conversations and transfer counts */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weeklyGoal, conversations, usersConverted, lcyTransfers, lcyGoal, fcyTransfers, fcyGoal } = body;

    if (
      typeof weeklyGoal !== 'number' ||
      typeof conversations !== 'number' ||
      typeof usersConverted !== 'number' ||
      typeof lcyTransfers !== 'number' ||
      typeof fcyTransfers !== 'number'
    ) {
      return NextResponse.json(
        { error: 'weeklyGoal, conversations, usersConverted, lcyTransfers, and fcyTransfers are required numbers.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pay_weekly')
      .upsert(
        {
          week_start: weekStartStr,
          weekly_goal: weeklyGoal,
          conversations,
          users_converted: usersConverted,
          lcy_transfers: lcyTransfers,
          lcy_goal: lcyGoal ?? 2,
          fcy_transfers: fcyTransfers,
          fcy_goal: fcyGoal ?? 2,
          recorded_at: new Date().toISOString(),
        },
        { onConflict: 'week_start' }
      )
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/pay/weekly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('pay_weekly')
      .select('weekly_goal, conversations, users_converted, lcy_transfers, lcy_goal, fcy_transfers, fcy_goal, week_start')
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(error.message);

    const conversionRate =
      data.conversations > 0
        ? Math.min(100, Math.round((data.users_converted / data.conversations) * 100))
        : 0;

    return NextResponse.json({
      weeklyGoal: data.weekly_goal,
      conversations: data.conversations,
      conversionRate,
      transfers: [
        { label: 'LCY transfers', current: data.lcy_transfers, goal: data.lcy_goal },
        { label: 'FCY transfers', current: data.fcy_transfers, goal: data.fcy_goal },
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/pay/weekly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
