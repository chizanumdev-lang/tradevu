import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { updateDashboardUsers } from '@/lib/queries';

export async function POST(req: Request) {
  try {
    const { users, user, updatePermissions } = await req.json();
    const supabase = await createClient();
    
    if (updatePermissions) {
      const { updateUserPermissions } = await import('@/lib/queries');
      await updateUserPermissions(supabase, updatePermissions.email, updatePermissions.role, updatePermissions.permissions);
    } else if (user) {
      const { upsertSingleUser } = await import('@/lib/queries');
      await upsertSingleUser(supabase, user);
    } else if (users) {
      await updateDashboardUsers(supabase, users);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/users]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
