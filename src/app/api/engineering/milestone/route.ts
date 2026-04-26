import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/** POST /api/engineering/milestone — Eng Team Lead updates project statuses and health */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projects, health } = body as {
      projects?: { name: string; status: string; dateLabel: string; dateValue: string; sortOrder?: number }[];
      health?: { label: string; value: string; isGood: boolean; sortOrder?: number }[];
    };

    if (!projects && !health) {
      return NextResponse.json(
        { error: 'At least one of projects or health must be provided.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const now = new Date().toISOString();

    const results: Record<string, unknown> = {};

    if (projects && projects.length > 0) {
      // Deactivate all existing, then insert new set
      await supabase.from('engineering_projects').update({ is_active: false }).eq('is_active', true);

      const { data, error } = await supabase
        .from('engineering_projects')
        .insert(
          projects.map((p, i) => ({
            name: p.name,
            status: p.status,
            date_label: p.dateLabel,
            date_value: p.dateValue,
            sort_order: p.sortOrder ?? i + 1,
            is_active: true,
            updated_at: now,
          }))
        )
        .select();

      if (error) throw new Error(`engineering_projects: ${error.message}`);
      results.projects = data;
    }

    if (health && health.length > 0) {
      await supabase.from('engineering_health').update({ is_active: false }).eq('is_active', true);

      const { data, error } = await supabase
        .from('engineering_health')
        .insert(
          health.map((h, i) => ({
            label: h.label,
            value: h.value,
            is_good: h.isGood,
            sort_order: h.sortOrder ?? i + 1,
            is_active: true,
            updated_at: now,
          }))
        )
        .select();

      if (error) throw new Error(`engineering_health: ${error.message}`);
      results.health = data;
    }

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/engineering/milestone]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    const [projectsRes, healthRes] = await Promise.all([
      supabase
        .from('engineering_projects')
        .select('name, status, date_label, date_value')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('engineering_health')
        .select('label, value, is_good')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
    ]);

    if (projectsRes.error) throw new Error(projectsRes.error.message);
    if (healthRes.error) throw new Error(healthRes.error.message);

    return NextResponse.json({
      projects: (projectsRes.data ?? []).map((p) => ({
        name: p.name,
        status: p.status,
        dateLabel: p.date_label,
        dateValue: p.date_value,
      })),
      health: (healthRes.data ?? []).map((h) => ({
        label: h.label,
        value: h.value,
        isGood: h.is_good,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[GET /api/engineering/milestone]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
