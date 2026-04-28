import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/ops/weekly — Ops Team Lead updates visits, conversations, converted users */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weeklyGoal, visits, conversations, usersConverted } = body;

    if (
      typeof weeklyGoal !== 'number' ||
      typeof visits !== 'number' ||
      typeof usersConverted !== 'number'
    ) {
      return NextResponse.json(
        { error: 'weeklyGoal, visits, and usersConverted are required numbers.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get the start of the current ISO week (Monday)
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diff = day === 0 ? 6 : day - 1; // days since Monday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diff);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('ops_weekly')
      .select('id, conversations')
      .eq('week_start', weekStartStr)
      .limit(1);

    let data, error;
    const finalConversations = typeof conversations === 'number' ? conversations : (existing?.[0]?.conversations || 0);

    if (existing && existing.length > 0) {
      const result = await supabase
        .from('ops_weekly')
        .update({
          weekly_goal: weeklyGoal,
          visits,
          conversations: finalConversations,
          users_converted: usersConverted,
          recorded_at: new Date().toISOString(),
        })
        .eq('id', existing[0].id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('ops_weekly')
        .insert({
          week_start: weekStartStr,
          weekly_goal: weeklyGoal,
          visits,
          conversations: finalConversations,
          users_converted: usersConverted,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/ops/weekly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ops_weekly')
      .select('weekly_goal, visits, conversations, users_converted, week_start')
      .order('week_start', { ascending: false })
      .limit(1)
      .single();

    if (error) throw new Error(error.message);

    const conversionRate =
      data.visits > 0
        ? Math.min(100, Math.round((data.users_converted / data.visits) * 100))
        : 0;

    return NextResponse.json({
      weeklyGoal: data.weekly_goal,
      visits: data.visits,
      usersConverted: data.users_converted,
      conversionRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/ops/weekly]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
