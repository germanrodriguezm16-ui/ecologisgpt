// app/core/supabaseClient.js
let _client = null;

export function getSupabase(){
  if (_client) return _client;
  const url  = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || '';
  const key  = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || '';
  if (!url || !key || !window.supabase){
    console.warn('Supabase no disponible: revisa config.js y el script UMD.');
    return null;
  }
  _client = window.supabase.createClient(url, key);
  return _client;
}
