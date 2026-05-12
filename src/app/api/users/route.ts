import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateDashboardUsers } from '@/lib/queries';

export async function POST(req: Request) {
  try {
    const { users } = await req.json();
    const supabase = await createClient();
    
    await updateDashboardUsers(supabase, users);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/users]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
