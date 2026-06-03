/**
 * One-time migration: adds a UNIQUE constraint on customer_metrics.period_start.
 * Run with:  npx tsx scripts/migrate-customer-metrics.ts
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rxtyezapzwxgfvovhnce.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dHllemFwend4Z2Z2b3ZobmNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njk4NDg4NCwiZXhwIjoyMDkyNTYwODg0fQ.8gDln6YHCY1eKkgXOlwZXpCaZxRWZ8sh6mALlxbNujY'
);

async function main() {
  // The Supabase JS client doesn't expose DDL directly.
  // Use the RPC endpoint if a helper function exists, otherwise note that
  // the constraint must be applied via the Supabase dashboard SQL editor:
  //
  //   ALTER TABLE customer_metrics
  //   ADD CONSTRAINT customer_metrics_period_start_unique UNIQUE (period_start);
  //
  // Verify current data:
  const { data, error } = await supabase
    .from('customer_metrics')
    .select('id, period_start, total_customers, active_monthly, monthly_goal')
    .order('period_start', { ascending: false });

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('Current customer_metrics rows:');
  console.table(data);
  console.log('\n⚠️  Apply this SQL in the Supabase Dashboard > SQL Editor:');
  console.log(`
ALTER TABLE customer_metrics
ADD CONSTRAINT customer_metrics_period_start_unique UNIQUE (period_start);
  `);
}

main();
