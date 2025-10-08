import { getSupabase } from '../../core/supabaseClient.js';

// ===== CATEGORÍAS =====
export async function listCategorias(){
  const sb = await getSupabase();
  return sb.from('categorias_socios')
    .select('*')
    .order('orden',{ascending:true, nullsFirst:true})
    .order('created_at',{ascending:false});
}

export async function createCategoria({nombre,color,balance}){
  const sb = await getSupabase();
  return sb.from('categorias_socios').insert([{nombre,color,balance}]);
}
export async function updateCategoria(id, {nombre,color,balance}){
  const sb = await getSupabase();
  return sb.from('categorias_socios').update({nombre,color,balance}).eq('id', id);
}
export async function deleteCategoria(id){
  const sb = await getSupabase();
  return sb.from('categorias_socios').delete().eq('id', id);
}
export async function saveOrdenCategorias(updates){
  const sb = await getSupabase();
  const tasks = updates.map(u => sb.from('categorias_socios').update({orden:u.orden}).eq('id', u.id));
  return Promise.all(tasks);
}

// ===== SOCIOS =====
export async function listSocios(categoria_id){
  const sb = await getSupabase();
  return sb.from('socios')
    .select('*')
    .eq('categoria_id', categoria_id)
    .order('orden',{ascending:true, nullsFirst:true})
    .order('created_at',{ascending:true});
}

export async function createSocio(payload){
  const sb = await getSupabase();
  return sb.from('socios').insert([payload]).select('id').single();
}
export async function updateSocio(id, payload){
  const sb = await getSupabase();
  return sb.from('socios').update(payload).eq('id', id);
}
export async function deleteSocio(id){
  const sb = await getSupabase();
  return sb.from('socios').delete().eq('id', id);
}
export async function countSocios(categoria_id){
  const sb = await getSupabase();
  return sb.from('socios').select('*',{head:true, count:'exact'}).eq('categoria_id', categoria_id);
}
export async function saveOrdenSocios(updates){
  const sb = await getSupabase();
  const tasks = updates.map(u => sb.from('socios').update({orden:u.orden}).eq('id', u.id));
  return Promise.all(tasks);
}

// ===== STORAGE (avatar) =====
export async function uploadAvatar(socioId, file){
  if(!file) return null;
  const sb = await getSupabase();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const path = `${socioId}/${Date.now()}_${safeName}`;
  const up = await sb.storage.from('socios').upload(path, file, { upsert: true });
  if(up.error) return { error: up.error };
  const pub = sb.storage.from('socios').getPublicUrl(path);
  return { data: { url: pub.data.publicUrl } };
}
