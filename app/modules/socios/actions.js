// app/modules/socios/actions.js
import { getClient } from '../../core/supabaseClient.js';

// --------- CATEGORÍAS ---------

export async function fetchCategorias(){
  const sb = await getClient();
  const { data, error } = await sb
    .from('categorias_socios')
    .select('*')
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function crearCategoria({ nombre, color = '#3ba55d', balance = 0 }){
  const sb = await getClient();
  const { data, error } = await sb
    .from('categorias_socios')
    .insert([{ nombre, color, balance }])
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function actualizarCategoria(id, payload){
  const sb = await getClient();
  const { data, error } = await sb
    .from('categorias_socios')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function eliminarCategoria(id){
  const sb = await getClient();
  const { error } = await sb.from('categorias_socios').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function guardarOrdenCategorias(ordenItems){
  // ordenItems: [{ id, orden }, ...]
  const sb = await getClient();
  const updates = ordenItems.map(it =>
    sb.from('categorias_socios').update({ orden: it.orden }).eq('id', it.id)
  );
  const results = await Promise.all(updates);
  const err = results.find(r => r.error)?.error;
  if (err) throw err;
  return true;
}

// --------- SOCIOS ---------

export async function fetchSociosByCategoria(categoria_id){
  const sb = await getClient();
  const { data, error } = await sb
    .from('socios')
    .select('*')
    .eq('categoria_id', categoria_id)
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function crearSocio(payload){
  // payload: { categoria_id, empresa*, titular*, telefono, direccion, balance, card_color, avatar_url }
  const sb = await getClient();
  const { data, error } = await sb.from('socios').insert([payload]).select('*').single();
  if (error) throw error;
  return data;
}

export async function actualizarSocio(id, payload){
  const sb = await getClient();
  const { data, error } = await sb.from('socios').update(payload).eq('id', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function eliminarSocio(id){
  const sb = await getClient();
  const { error } = await sb.from('socios').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function guardarOrdenSocios(ordenItems){
  const sb = await getClient();
  const updates = ordenItems.map(it =>
    sb.from('socios').update({ orden: it.orden }).eq('id', it.id)
  );
  const results = await Promise.all(updates);
  const err = results.find(r => r.error)?.error;
  if (err) throw err;
  return true;
}

// --------- STORAGE: subida de avatar ---------

export async function subirAvatar(socioId, file){
  if (!file) return null;
  const sb = await getClient();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${socioId}/${Date.now()}_${safeName}`;

  const up = await sb.storage.from('socios').upload(path, file, { upsert: true });
  if (up.error) throw up.error;

  const pub = sb.storage.from('socios').getPublicUrl(path);
  return pub?.data?.publicUrl || null;
}
