let cached = null;
function wait(ms){ return new Promise(r => setTimeout(r, ms)); }
export async function getSupabase() {
  if (cached) return cached;
  const cfg = (window.APP_CONFIG || {});
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL / ANON KEY');
  let tries = 0;
  while (!(window.supabase && window.supabase.createClient) && tries < 60) { await wait(50); tries++; }
  if (!(window.supabase && window.supabase.createClient)) throw new Error('Supabase JS no está disponible en window.supabase');
  cached = window.supabase.createClient(url, key);
  return cached;
}
