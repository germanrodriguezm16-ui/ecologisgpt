import { debug } from '../utils/dom.js';

let client = null;

export function getClient(){
  if (client) return client;
  const cfg = (window.APP_CONFIG)||{};
  const url = cfg.SUPABASE_URL;
  const key = cfg.SUPABASE_ANON_KEY;
  if (!/^https?:\/\//.test(url) || !key) { debug('⚠️ Configura SUPABASE_URL / ANON KEY en config.js'); throw new Error('Supabase no configurado'); }
  client = window.supabase.createClient(url, key);
  return client;
}

export function getCategoriaById(id){
  const supabase = getClient();
  return supabase.from('categorias_socios').select('*').eq('id', id).single().then(({data})=>data).catch(()=>null);
}

export async function listCategorias(){
  const supabase = getClient();
  const {data,error} = await supabase.from('categorias_socios').select('*').order('nombre',{ascending:true});
  if(error) throw error;
  return data||[];
}
export async function listSociosByCategoria(categoria_id){
  const supabase = getClient();
  const {data,error} = await supabase.from('socios').select('*').eq('categoria_id', categoria_id).order('empresa', {ascending:true});
  if(error) throw error;
  return data||[];
}

/* ====== TRANSACCIONES ====== */
export async function insertTransaccion(tx){
  const supabase = getClient();
  const {data,error} = await supabase.from('transacciones')
    .insert([tx]).select('id').single();
  if(error) throw error;
  return data.id;
}

export async function updateTransaccion(id, patch){
  const supabase = getClient();
  const {error} = await supabase.from('transacciones').update(patch).eq('id', id);
  if(error) throw error;
}

export async function listTransacciones(opts={}){
  const supabase = getClient();
  let q = supabase.from('transacciones')
    .select('*, origen:origen_socio_id (empresa), destino:destino_socio_id (empresa)')
    .order('fecha',{ascending:false}).order('created_at',{ascending:false});
  if (opts.socioId){
    q = q.or(`origen_socio_id.eq.${opts.socioId},destino_socio_id.eq.${opts.socioId}`);
  }
  const {data,error} = await q;
  if(error) throw error;
  return data||[];
}

/* ====== VOUCHERS ====== */
export function getVouchersBucket(){
  const cfg = (window.APP_CONFIG)||{};
  return cfg.VOUCHERS_BUCKET || 'socios';
}

export async function uploadVoucher(file, txId){
  const supabase = getClient();
  const bucket = getVouchersBucket();
  const safe = String(file.name||'voucher').replace(/[^a-zA-Z0-9._-]/g,'_');
  const path = `vouchers/${txId}/${Date.now()}_${safe}`;
  const up = await supabase.storage.from(bucket).upload(path, file, {upsert:true});
  if(up.error) throw up.error;
  const pub = supabase.storage.from(bucket).getPublicUrl(path);
  return pub?.data?.publicUrl || null;
}
