const SUPABASE_URL = 'https://rxtyezapzwxgfvovhnce.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const sql = `
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS completion_percentage INT DEFAULT 0;
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS impact_score INT DEFAULT 0;
`;

async function run() {
  console.log('🚀 Running database migrations...');

  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  const text = await res.text();
  if (res.ok) {
    console.log('✅ Migrations applied successfully via exec_sql!', text);
  } else {
    console.error('❌ exec_sql failed:', text);
  }
}

run().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
