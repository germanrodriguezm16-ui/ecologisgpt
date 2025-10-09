import { getSupabase } from '../../core/supabaseClient.js';

export async function listCategorias() {
  const sb = await getSupabase();
  const { data, error } = await sb.from('categorias_socios').select('*')
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function upsertCategoria(payload) {
  const sb = await getSupabase();
  if (payload.id) {
    const { error } = await sb.from('categorias_socios')
      .update({ nombre: payload.nombre, color: payload.color ?? '#3ba55d', balance: payload.balance ?? 0, orden: payload.orden ?? null })
      .eq('id', payload.id);
    return { error };
  } else {
    const { data, error } = await sb.from('categorias_socios')
      .insert([{ nombre: payload.nombre, color: payload.color ?? '#3ba55d', balance: payload.balance ?? 0, orden: payload.orden ?? null }])
      .select().single();
    return { data, error };
  }
}

export async function deleteCategoria(id) {
  const sb = await getSupabase();
  const { error } = await sb.from('categorias_socios').delete().eq('id', id);
  return { error };
}

export async function listSociosByCategoria(catId) {
  const sb = await getSupabase();
  const { data, error } = await sb.from('socios').select('*')
    .eq('categoria_id', catId)
    .order('orden', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

export async function upsertSocio(payload) {
  const sb = await getSupabase();
  if (payload.id) {
    const { error } = await sb.from('socios')
      .update({
        empresa: payload.empresa, titular: payload.titular,
        telefono: payload.telefono ?? null, direccion: payload.direccion ?? null,
        balance: payload.balance ?? null, card_color: payload.card_color ?? null,
        avatar_url: payload.avatar_url ?? undefined, orden: payload.orden ?? undefined
      })
      .eq('id', payload.id);
    return { error };
  } else {
    const { data, error } = await sb.from('socios')
      .insert([{ categoria_id: payload.categoria_id, empresa: payload.empresa, titular: payload.titular, telefono: payload.telefono ?? null, direccion: payload.direccion ?? null, balance: payload.balance ?? null, card_color: payload.card_color ?? null, avatar_url: payload.avatar_url ?? null, orden: payload.orden ?? null }])
      .select('id').single();
    return { data, error };
  }
}

export async function deleteSocio(id) {
  const sb = await getSupabase();
  const { error } = await sb.from('socios').delete().eq('id', id);
  return { error };
}

export async function saveSociosOrder(catId, orderedIds) {
  const sb = await getSupabase();
  const updates = orderedIds.map((id, idx) => sb.from('socios').update({ orden: idx }).eq('id', id));
  const results = await Promise.all(updates);
  const error = results.find(r => r.error)?.error || null;
  return { error };
}

export async function uploadAvatar(file, socioId) {
  if (!file) return { url: null };
  const sb = await getSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${socioId}/${Date.now()}_${safeName}`;
  const up = await sb.storage.from('socios').upload(path, file, { upsert: true });
  if (up.error) return { error: up.error };
  const pub = sb.storage.from('socios').getPublicUrl(path);
  const url = pub?.data?.publicUrl || null;
  if (url) await sb.from('socios').update({ avatar_url: url }).eq('id', socioId);
  return { url };
}

// Lee una categoría por id (para precargar modal de editar)
export async function getCategoriaById(id){
  const supa = getSupabase();
  return supa.from('categorias_socios').select('*').eq('id', id).single();
}
