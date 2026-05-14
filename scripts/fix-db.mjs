
const SUPABASE_URL = 'https://rxtyezapzwxgfvovhnce.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const projectRef = 'rxtyezapzwxgfvovhnce';

const sql = `ALTER TABLE dashboard_settings ADD COLUMN IF NOT EXISTS departments JSONB NOT NULL DEFAULT '[]';`;

async function run() {
  if (!SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  console.log('🚀 Adding departments column to dashboard_settings...');

  // Try the Postgres API first if it exists (some setups have it)
  // Otherwise, use the Management API approach from the other script
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const text = await res.text();
  if (res.ok) {
    console.log('✅ Column added successfully!');
  } else {
    console.error('❌ Failed:', text);
    console.log('\nPlease run this SQL manually in the Supabase SQL Editor:');
    console.log(sql);
  }
}

run();
