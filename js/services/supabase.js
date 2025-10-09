// js/services/supabase.js
// Wrapper robusto para usar la UMD de Supabase y validar APP_CONFIG.
// Mantiene compatibilidad: exporta getSupabase() y también un singleton supabaseClient.

let _client = null;

export function getSupabase(){
  if (_client) return _client;

  const cfg = window.APP_CONFIG || {};
  const url = cfg.SUPABASE_URL || '';
  const anon = cfg.SUPABASE_ANON_KEY || '';

  if (!url || !anon) {
    throw new Error('Supabase no configurado: faltan SUPABASE_URL / SUPABASE_ANON_KEY en config.js');
  }
  if (!window.supabase || !window.supabase.createClient) {
    throw new Error('La librería UMD de Supabase no está cargada. Revisa index.html (script de supabase antes de app.js).');
  }
  _client = window.supabase.createClient(url, anon);
  return _client;
}

// Compatibilidad (por si en algún punto importabas { supabase }):
export const supabase = {
  from: (...args) => getSupabase().from(...args),
  storage: { from: (...args)=> getSupabase().storage.from(...args) },
  auth: { ...getSupabase().auth }
};
