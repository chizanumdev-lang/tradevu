import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateDashboardSettings } from '@/lib/queries';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { scrollSpeed, scrollEnabled, dashboardTitle, launchStatusTitle } = await req.json();

    if (scrollSpeed === undefined || scrollEnabled === undefined) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await updateDashboardSettings(supabase, { 
      scrollSpeed, 
      scrollEnabled, 
      dashboardTitle: dashboardTitle || "FY'26 Operating Dashboard",
      launchStatusTitle: launchStatusTitle || "Launch Readiness"
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
