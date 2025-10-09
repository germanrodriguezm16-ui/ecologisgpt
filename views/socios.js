import { $, $all, el, esc } from '../utils/dom.js';
import { fmt } from '../utils/format.js';
import { contrastColor, borderOn, initials } from '../utils/colors.js';
import { getClient, getCategoriaById } from '../services/supabase.js';
import { openConfirm, openSocioModal, getSocioEditId, closeSocioModal } from '../ui/modals.js';

let currentCat=null, currentCatName='', currentCatTab2='Notas', currentCatTab3='Archivos';
let prefView = localStorage.getItem('sociosViewMode') || 'cards';

export function openSociosList(catId, catName){
  currentCat=catId; currentCatName=catName||'Socios';
  $('#title').textContent = 'Socios · '+currentCatName;
  $('#view').innerHTML='';
  const labelBtn = (String(currentCatName).toLowerCase()==='proveedores' ? 'Crear proveedor' : 'Crear socio');
  $('#topActions').innerHTML = ''
    + '<button class="btn ghost" id="btnBack" type="button">← Volver</button>'
    + '<div class="actions-inline">'
    + ' <button class="btn '+(prefView==='list'?'warn':'')+'" id="btnList" type="button">Lista</button>'
    + ' <button class="btn '+(prefView==='cards'?'warn':'')+'" id="btnCards" type="button">Tarjetas</button>'
    + ' <button class="btn primary" id="btnNewSocio" type="button">'+esc(labelBtn)+'</button>'
    + '</div>';

  $('#btnBack').addEventListener('click', ()=> window.location.hash = 'socios');
  $('#btnList').addEventListener('click', ()=>{ prefView='list'; localStorage.setItem('sociosViewMode','list'); renderSocios(); $('#btnList').classList.add('warn'); $('#btnCards').classList.remove('warn'); });
  $('#btnCards').addEventListener('click', ()=>{ prefView='cards'; localStorage.setItem('sociosViewMode','cards'); renderSocios(); $('#btnCards').classList.add('warn'); $('#btnList').classList.remove('warn'); });
  $('#btnNewSocio').addEventListener('click', ()=> openSocioModal(null, currentCatName));

  $('#view').appendChild(el('div',{id:'socContent'},['Cargando…']));

  getCategoriaById(currentCat).then(cat=>{
    currentCatTab2 = cat?.tab2_name || 'Notas';
    currentCatTab3 = cat?.tab3_name || 'Archivos';
  }).finally(renderSocios);
}

function fetchSociosQuery(){
  const supabase = getClient();
  return supabase.from('socios').select('*').eq('categoria_id', currentCat)
    .order('orden',{ascending:true,nullsFirst:true})
    .order('created_at',{ascending:false});
}

async function fetchSocios(){
  const {data,error} = await fetchSociosQuery();
  if(error){ return {rows:[], error:error}; }
  return {rows:data||[], error:null};
}

export async function renderSocios(){
  const cont = $('#socContent'); cont.innerHTML='Cargando…';
  const r = await fetchSocios();
  if(r.error){ cont.innerHTML='<div class="error">'+esc(r.error.message)+'</div>'; return; }
  const rows = r.rows;
  if(!rows.length){ cont.innerHTML='<div class="empty">No hay socios en esta categoría.</div>'; return; }

  cont.innerHTML='';
  if(prefView==='list'){ cont.appendChild(buildSociosTable(rows)); }
  else { cont.appendChild(buildSociosCards(rows)); }

  if (prefView==='cards' && window.Sortable){
    const grid = $('#socContent .grid');
    if (grid){
      window.Sortable.create(grid, {
        animation:150,
        onEnd: async function(){
          try{
            const supabase = getClient();
            const items = $all('.card', grid).map((card, idx)=>({ id: Number(card.getAttribute('data-id')), orden: idx+1 }));
            await Promise.all(items.map(it => supabase.from('socios').update({orden: it.orden}).eq('id', it.id)));
          }catch(err){ console.error(err); alert('No se pudo guardar el nuevo orden de socios.'); }
        }
      });
    }
  }
}

function buildSociosTable(rows){
  const table = document.createElement('table'); table.className='list';
  const thead=document.createElement('thead'); const trh=document.createElement('tr');
  ['', 'Empresa','Titular','Teléfono','Dirección',''].forEach(h=>{ const th=document.createElement('th'); th.textContent=h; trh.appendChild(th); });
  thead.appendChild(trh); table.appendChild(thead);

  const tbody=document.createElement('tbody');
  rows.forEach(r=>{
    const tr=document.createElement('tr'); tr.setAttribute('data-id', r.id);

    const td0=document.createElement('td');
    const img=r.avatar_url?('<img class="avatar" src="'+esc(r.avatar_url)+'" alt="">') : ('<div class="avatar" style="display:grid;place-items:center;color:var(--muted);font-weight:700">'+initials(r.empresa)+'</div>');
    td0.innerHTML=img; tr.appendChild(td0);

    const td1=document.createElement('td'); td1.innerHTML='<div class="row-flex"><span>'+esc(r.empresa)+'</span></div>'; tr.appendChild(td1);
    const td2=document.createElement('td'); td2.textContent=r.titular||'—'; tr.appendChild(td2);
    const td3=document.createElement('td'); td3.textContent=r.telefono||'—'; tr.appendChild(td3);
    const td4=document.createElement('td'); td4.textContent=r.direccion||'—'; tr.appendChild(td4);

    const td5=document.createElement('td'); td5.innerHTML=''
      + '<div class="mini-actions">'
      + '<button class="icon-btn edit" type="button" data-edit="'+r.id+'">✏️</button>'
      + '<button class="icon-btn delete" type="button" data-del="'+r.id+'">🗑️</button>'
      + '</div>';
    tr.appendChild(td5);

    tr.addEventListener('click', (e)=>{ if (!e.target.closest('.mini-actions')) openSocioDetail(r); });

    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  $all('[data-edit]', table).forEach(b=> b.addEventListener('click', (e)=>{ e.stopPropagation(); openSocioModal(rows.find(x=>String(x.id)===String(b.getAttribute('data-edit'))), currentCatName); }));
  $all('[data-del]', table).forEach(b=> b.addEventListener('click', (e)=>{ e.stopPropagation(); deleteSocio(b.getAttribute('data-del')); }));

  if (window.Sortable){
    window.Sortable.create(tbody, {
      animation:150,
      ghostClass:'drag-ghost',
      handle: 'td',
      filter: '.mini-actions button',
      preventOnFilter: false,
      onEnd: async function(){
        try{
          const supabase = getClient();
          const items = $all('tr[data-id]', tbody).map((tr, idx)=>({ id: Number(tr.getAttribute('data-id')), orden: idx+1 }));
          await Promise.all(items.map(it => supabase.from('socios').update({orden: it.orden}).eq('id', it.id)));
        }catch(err){ console.error(err); alert('No se pudo guardar el nuevo orden de socios.'); }
      }
    });
  }

  return table;
}

function buildSociosCards(rows){
  const grid = document.createElement('div'); grid.className='grid';
  rows.forEach(r=>{
    const c=document.createElement('div'); c.className='card'; c.setAttribute('data-id', r.id);
    const col = r.card_color || 'var(--card)';
    c.style.background = col; c.style.borderColor = borderOn(col); c.style.color = contrastColor(col);

    const header=document.createElement('div'); header.className='row';
    const left=document.createElement('div'); left.className='row-flex';
    let avatar;
    if(r.avatar_url){ avatar=document.createElement('img'); avatar.className='avatar'; avatar.src=r.avatar_url; }
    else { avatar=document.createElement('div'); avatar.className='avatar'; avatar.style.display='grid'; avatar.style.placeItems='center'; avatar.style.color='var(--muted)'; avatar.style.fontWeight='700'; avatar.textContent=initials(r.empresa); }
    left.appendChild(avatar);
    const titleWrap=document.createElement('div');
    const h=document.createElement('div'); h.style.fontWeight='700'; h.textContent=r.empresa||'—';
    const sub=document.createElement('div'); sub.className='muted'; sub.textContent=r.titular||'—';
    titleWrap.appendChild(h); titleWrap.appendChild(sub);
    left.appendChild(titleWrap);
    const actions=document.createElement('div'); actions.className='actions';
    const ebtn=document.createElement('button'); ebtn.className='icon-btn edit'; ebtn.textContent='✏️'; ebtn.setAttribute('data-edit',r.id); ebtn.type='button';
    const dbtn=document.createElement('button'); dbtn.className='icon-btn delete'; dbtn.textContent='🗑️'; dbtn.setAttribute('data-del',r.id); dbtn.type='button';
    actions.appendChild(ebtn); actions.appendChild(dbtn);
    header.appendChild(left); header.appendChild(actions);
    c.appendChild(header);

    const meta=document.createElement('div'); meta.className='muted'; meta.style.marginTop='8px';
    meta.textContent=(r.telefono||'—') + (r.direccion?(' · '+r.direccion):'');
    c.appendChild(meta);

    c.addEventListener('click', (e)=>{ if (!e.target.closest('.actions')) openSocioDetail(r); });

    grid.appendChild(c);
  });

  $all('[data-edit]', grid).forEach(b=> b.addEventListener('click', (e)=>{ e.stopPropagation(); openSocioModal(rows.find(x=>String(x.id)===String(b.getAttribute('data-edit'))), currentCatName); }));
  $all('[data-del]', grid).forEach(b=> b.addEventListener('click', (e)=>{ e.stopPropagation(); deleteSocio(b.getAttribute('data-del')); }));

  return grid;
}

async function deleteSocio(id){
  openConfirm('¿Eliminar este socio?', async ()=>{
    const supabase = getClient();
    const {error} = await supabase.from('socios').delete().eq('id', id);
    if(error) return alert(error.message);
    renderSocios();
  }, 'Eliminar socio');
}

export async function openSocioDetail(socio){
  $('#title').textContent = 'Socio · ' + (socio.empresa || '—');
  $('#topActions').innerHTML = '<button class="btn ghost" id="btnBackSocios" type="button">← Volver a socios</button>';
  $('#btnBackSocios').addEventListener('click', ()=> openSociosList(socio.categoria_id || currentCat, currentCatName));

  const cat = await getCategoriaById(socio.categoria_id || currentCat);
  currentCatTab2 = cat?.tab2_name || 'Notas';
  currentCatTab3 = cat?.tab3_name || 'Archivos';

  const wrap = document.createElement('div');
  const tabs = document.createElement('div'); tabs.className='tabs'; tabs.id='socioDetailTabs';
  tabs.innerHTML = ''
    + '<button class="tab-btn active" data-tab="tx">Transacciones</button>'
    + '<button class="tab-btn" data-tab="t2">'+esc(currentCatTab2)+'</button>'
    + '<button class="tab-btn" data-tab="t3">'+esc(currentCatTab3)+'</button>';

  const panel = document.createElement('div'); panel.className='tab-panel'; panel.id='socioDetailPanel';
  panel.innerHTML = renderSocioDetailPanel('tx', socio);

  tabs.addEventListener('click', (e)=>{
    const b = e.target.closest('.tab-btn'); if(!b) return;
    const tab = b.getAttribute('data-tab');
    $all('.tab-btn', tabs).forEach(x=> x.classList.toggle('active', x===b));
    panel.innerHTML = renderSocioDetailPanel(tab, socio);
  });

  wrap.appendChild(tabs); wrap.appendChild(panel);
  $('#view').innerHTML=''; $('#view').appendChild(wrap);
}

function renderSocioDetailPanel(tab, socio){
  if (tab==='tx'){
    return '<div>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
      + '<div class="muted">Aquí verás las transacciones de <b>'+esc(socio.empresa||'—')+'</b>.</div>'
      + '<button class="btn primary" type="button" disabled>Agregar transacción</button>'
      + '</div>'
      + '<div class="empty">Aún no hay transacciones.</div>'
      + '</div>';
  }
  if (tab==='t2'){
    return '<div><div class="muted">Pestaña 2: <b>'+esc((currentCatTab2))+'</b> (definido por la categoría).</div><div class="empty" style="margin-top:8px">Sin contenido.</div></div>';
  }
  return '<div><div class="muted">Pestaña 3: <b>'+esc((currentCatTab3))+'</b> (definido por la categoría).</div><div class="empty" style="margin-top:8px">Sin contenido.</div></div>';
}

export async function handleSocioFormSubmit(e){
  e.preventDefault();
  const supabase = getClient();
  const f = $('#formSocio');
  const empresa=f.empresa.value.trim();
  const titular=f.titular.value.trim();
  if(!empresa || !titular) return alert('Empresa y Titular son obligatorios');
  const telefono=f.telefono.value.trim();
  const direccion=f.direccion.value.trim();
  const card_color=f.card_color.value || '#121a26';

  let socioId = getSocioEditId();
  if(socioId){
    const up = await supabase.from('socios').update({empresa,titular,telefono,direccion,card_color}).eq('id', socioId);
    if(up.error) return alert(up.error.message);
  } else {
    const ins = await supabase.from('socios').insert([{categoria_id: currentCat, empresa, titular, telefono, direccion, card_color}]).select('id').single();
    if(ins.error) return alert(ins.error.message);
    socioId = ins.data.id;
  }

  const file = f.avatar.files[0];
  if(file){
    if(file.size > 2*1024*1024) return alert('El archivo supera 2 MB');
    const path = socioId + '/' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const up = await supabase.storage.from('socios').upload(path, file, {upsert:true});
    if(!up.error){
      const pub = supabase.storage.from('socios').getPublicUrl(path);
      const url = pub?.data?.publicUrl;
      if(url){ await supabase.from('socios').update({avatar_url:url}).eq('id', socioId); }
    } else {
      alert('Error subiendo imagen: '+up.error.message);
    }
  }

  document.getElementById('modalSocio').style.display='none';
  renderSocios();
}
