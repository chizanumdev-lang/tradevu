import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { 
    email: 'nkiru@tradevu.africa', 
    name: 'Nkiru', 
    role: 'CEO', 
    password: 'password123',
    permissions: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings', 'marketing'],
    requires_password_change: false
  },
  { 
    email: 'tola@tradevu.co', 
    name: 'Tola', 
    role: 'HR', 
    password: 'password123',
    permissions: ['launch', 'users', 'settings', 'ops', 'pay'],
    requires_password_change: false
  },
  { 
    email: 'kene@tradevu.co', 
    name: 'Kene', 
    role: 'PM', 
    password: 'password123',
    permissions: ['revenue', 'launch', 'customers', 'ops', 'pay', 'finance', 'engineering', 'users', 'settings'],
    requires_password_change: false
  }
];

async function seedUsers() {
  console.log('Seeding users...');
  
  const { data, error } = await supabase
    .from('dashboard_users')
    .upsert(users, { onConflict: 'email' });

  if (error) {
    console.error('Error seeding users:', error);
  } else {
    console.log('Successfully seeded users!');
  }
}

seedUsers();
