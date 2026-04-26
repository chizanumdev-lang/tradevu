import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/launch/status — HR or CEO sets launch phase and per-dept progress */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phase, deptTargets } = body as {
      phase: string;
      deptTargets: { name: string; progress: number }[];
    };

    if (!phase || !Array.isArray(deptTargets) || deptTargets.length === 0) {
      return NextResponse.json(
        { error: 'phase (string) and deptTargets (array) are required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const rows = deptTargets.map((d) => ({
      phase,
      dept_name: d.name,
      progress: d.progress,
      recorded_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('launch_readiness')
      .insert(rows)
      .select();

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/launch/status]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('launch_readiness')
      .select('phase, dept_name, progress, recorded_at')
      .order('recorded_at', { ascending: false });

    if (error) throw new Error(error.message);

    const seen = new Set<string>();
    const deptTargets: { name: string; progress: number }[] = [];
    let phase = 'Q2';

    for (const row of data ?? []) {
      if (!seen.has(row.dept_name)) {
        seen.add(row.dept_name);
        phase = row.phase;
        deptTargets.push({ name: row.dept_name, progress: row.progress });
      }
    }

    const overall =
      deptTargets.length > 0
        ? Math.round(deptTargets.reduce((s, d) => s + d.progress, 0) / deptTargets.length)
        : 0;

    return NextResponse.json({ phase, progress: overall, deptTargets });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/launch/status]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
