import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/launch/status — HR or CEO sets launch phase and per-dept progress */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phases } = body as {
      phases: { phase: string; label?: string; deptTargets: { name: string; progress: number }[] }[];
    };

    if (!Array.isArray(phases) || phases.length === 0) {
      return NextResponse.json(
        { error: 'phases array is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const phaseNames = phases.map(p => p.phase);

    // Clear ALL existing data to mirror the Admin Panel's current state (handles deletions)
    await supabase
      .from('launch_readiness')
      .delete()
      .not('id', 'is', null); 



    const allRows: any[] = [];
    const now = new Date();
    
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      // Subtract i seconds to ensure reverse chronological order matching the array order
      // (The first item in 'phases' will have the newest timestamp)
      const timestamp = new Date(now.getTime() - i * 1000).toISOString();
      
      const rows = p.deptTargets.map((d) => ({
        phase: p.phase,
        dept_name: d.name,
        progress: d.progress,
        recorded_at: timestamp,
      }));
      allRows.push(...rows);
    }



    const { data, error } = await supabase
      .from('launch_readiness')
      .insert(allRows)
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
