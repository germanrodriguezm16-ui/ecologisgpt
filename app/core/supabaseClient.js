import { debug } from './utils.js';

// Carga UMD desde CDN para no requerir bundler
const UMD_SRC = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';

function ensureSupabaseUMD(){
  return new Promise((resolve, reject) => {
    if (window.supabase) return resolve();
    const s = document.createElement('script');
    s.src = UMD_SRC;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('No se pudo cargar supabase-js'));
    document.head.appendChild(s);
  });
}

let clientPromise;

export async function getSupabase(){
  if(!clientPromise){
    clientPromise = (async () => {
      await ensureSupabaseUMD();
      const url = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL) || '';
      const key = (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_ANON_KEY) || '';
      if(!/^https?:\/\//.test(url) || !key){
        debug('⚠️ Configura SUPABASE_URL / ANON KEY en config.js');
      }
      return window.supabase.createClient(url, key);
    })();
  }
  return clientPromise;
}
