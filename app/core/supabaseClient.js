// app/core/supabaseClient.js
// Inicialización robusta del cliente Supabase (UMD) con espera activa.

let _client = null;
let _readyPromise = null;

function _wait(ms){ return new Promise(r => setTimeout(r, ms)); }

async function _ensureGlobals(){
  // Espera a que el script UMD de Supabase y APP_CONFIG estén disponibles
  const maxTries = 50; // ~5s
  let tries = 0;
  while (tries < maxTries) {
    if (window.supabase && window.APP_CONFIG?.SUPABASE_URL && window.APP_CONFIG?.SUPABASE_ANON_KEY) return;
    await _wait(100);
    tries++;
  }
  throw new Error('[supabaseClient] No se detectó supabase UMD o APP_CONFIG (URL/KEY).');
}

async function _createClient(){
  await _ensureGlobals();
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
  _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _client;
}

// Devuelve SIEMPRE el cliente inicializado (espera si es necesario)
export async function getClient(){
  if (_client) return _client;
  if (!_readyPromise) _readyPromise = _createClient();
  return _readyPromise;
}

// Atajo opcional para comprobar si ya existe
export function hasClient(){ return !!_client; }
