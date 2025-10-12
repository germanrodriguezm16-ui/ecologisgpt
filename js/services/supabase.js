import { debug } from '../utils/dom.js';

let client = null;

export const getClient = () => {
  if (client) return client;
  const cfg = window.APP_CONFIG || {};
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_ANON_KEY;

  if (!/^https?:\/\//.test(url) || !key) {
    debug('⚠️ Configura SUPABASE_URL / ANON KEY en config.js');
    throw new Error('Supabase no configurado');
  }
  console.log('[SUPABASE] Creando cliente con URL:', url);
  client = window.supabase.createClient(url, key);
  return client;
};

export const getCategoriaById = async id => {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('categorias_socios')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};
