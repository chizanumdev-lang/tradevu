const SUPABASE_URL = 'https://rxtyezapzwxgfvovhnce.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY');
  process.exit(1);
}

async function run() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
    },
  });

  const data = await res.json();
  console.log('Paths available in OpenAPI:');
  console.log(Object.keys(data.paths).filter(p => p.startsWith('/rpc/')));
}

run();
