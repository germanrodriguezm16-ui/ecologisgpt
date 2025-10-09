// app/modules/socios/actions.js
import { getSupabase } from '../../core/supabaseClient.js';

/* CATEGORÍAS */
export async function listCategorias(){
  const supa = getSupabase(); if(!supa) return {data:[],error:new Error('Supabase no disponible')};
  return supa.from('categorias_socios')
    .select('*')
    .order('orden',{ascending:true,nullsFirst:true})
    .order('created_at',{ascending:false});
}

export async function getCategoriaById(id){
  const supa = getSupabase(); if(!supa) return {data:null,error:new Error('Supabase no disponible')};
  return supa.from('categorias_socios').select('*').eq('id', id).single();
}

export async function upsertCategoria(payload){
  const supa = getSupabase(); if(!supa) return {data:null,error:new Error('Supabase no disponible')};
  const row = {
    nombre: payload.nombre,
    color: payload.color || '#3ba55d',
    balance: payload.balance ?? 0
  };
  if (payload.id){
    return supa.from('categorias_socios').update(row).eq('id', payload.id);
  }
  return supa.from('categorias_socios').insert([row]);
}

export async function deleteCategoria(id){
  const supa = getSupabase(); if(!supa) return {error:new Error('Supabase no disponible')};
  return supa.from('categorias_socios').delete().eq('id', id);
}

/* SOCIOS */
export async function listSociosByCategoria(categoria_id){
  const supa = getSupabase(); if(!supa) return {data:[],error:new Error('Supabase no disponible')};
  return supa.from('socios')
    .select('*')
    .eq('categoria_id', categoria_id)
    .order('orden',{ascending:true,nullsFirst:true})
    .order('created_at',{ascending:false});
}

export async function getSocioById(id){
  const supa = getSupabase(); if(!supa) return {data:null,error:new Error('Supabase no disponible')};
  return supa.from('socios').select('*').eq('id', id).single();
}

export async function upsertSocio(payload){
  const supa = getSupabase(); if(!supa) return {data:null,error:new Error('Supabase no disponible')};
  const row = {
    categoria_id: payload.categoria_id,
    empresa: payload.empresa,
    titular: payload.titular,
    telefono: payload.telefono || null,
    direccion: payload.direccion || null,
    balance: payload.balance ?? null,
    card_color: payload.card_color || null
  };
  if (payload.id){
    return supa.from('socios').update(row).eq('id', payload.id);
  }
  return supa.from('socios').insert([row]).select('id').single();
}

export async function deleteSocio(id){
  const supa = getSupabase(); if(!supa) return {error:new Error('Supabase no disponible')};
  return supa.from('socios').delete().eq('id', id);
}

export async function uploadAvatar(file, socioId){
  const supa = getSupabase(); if(!supa) return {error:new Error('Supabase no disponible')};
  const safe = (name)=> name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path = `${socioId}/${Date.now()}_${safe(file.name)}`;
  const up = await supa.storage.from('socios').upload(path, file, { upsert:true });
  if (up.error) return up;
  const pub = supa.storage.from('socios').getPublicUrl(path);
  const url = pub?.data?.publicUrl;
  if (url) await supa.from('socios').update({ avatar_url: url }).eq('id', socioId);
  return { data: { url }, error: null };
}
