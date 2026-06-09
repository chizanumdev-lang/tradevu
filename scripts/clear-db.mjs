import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const tables = [
  'launch_readiness',
  'revenue_annual',
  'customer_metrics',
  'ops_weekly',
  'pay_weekly',
  'finance_weekly',
  'engineering_projects',
  'engineering_health',
  'dashboard_settings',
  'dashboard_users'
];

async function run() {
  console.log('🗑️  Clearing all data from tables...');
  
  for (const table of tables) {
    console.log(`Clearing ${table}...`);
    let result;
    if (table === 'dashboard_users') {
      result = await supabase.from(table).delete().neq('email', 'nonexistent@example.com');
    } else {
      result = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }
    
    if (result.error) {
      console.error(`❌ Error clearing ${table}:`, result.error.message);
    } else {
      console.log(`✅ Cleared ${table}`);
    }
  }
  
  console.log('🎉 Done clearing DB!');
}

run();
