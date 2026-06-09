import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxtyezapzwxgfvovhnce.supabase.co';
const anonKey = 'sb_publishable_Q4qCh35WMLqbNtkZyhqdxw_YTylIBx6'; // from .env.local

const supabase = createClient(supabaseUrl, anonKey);

async function main() {
  console.log('Testing anon key...');
  const { data, error } = await supabase
    .from('customer_metrics')
    .select('*');

  if (error) {
    console.error('Anon key error:', error);
  } else {
    console.log('Anon key data:', data);
  }
}

main();
