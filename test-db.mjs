import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const { data: pay, error: payErr } = await supabase.from('pay_metrics').select('*').limit(1);
  console.log('Pay metrics:', pay, payErr);
  
  const { data: sales, error: salesErr } = await supabase.from('sales_marketing').select('*').limit(1);
  console.log('Sales metrics:', sales, salesErr);
}
test();
