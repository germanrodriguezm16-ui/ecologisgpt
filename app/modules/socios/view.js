import { $, $$ } from '../../core/utils.js';
import { store, setPrefView } from '../../core/store.js';
import { listCategorias, createCategoria, updateCategoria, deleteCategoria, saveOrdenCategorias,
         listSocios, createSocio, updateSocio, deleteSocio, countSocios, saveOrdenSocios, uploadAvatar } from './actions.js';
import { catCard, socioCard, sociosTable } from './templates.js';

// ------- Render Categorías -------
export async function renderCategorias(root){
  const grid = document.createElement('div'); grid.className='grid'; grid.id='catGrid';
  root.appendChild(grid);

  const res = await listCategorias();
  if(res.error){ grid.innerHTML = `<div class="muted">Error cargando categorías: ${res.error.message}</div>`; return; }
  const cats = res.data || [];
  if(!cats.length){ grid.innerHTML = '<div class="muted">No hay categorías.</div>'; return; }

  cats.forEach(cat => {
    const card = catCard(cat);
    card.addEventListener('click', (ev)=>{
      if(ev.target.closest('.icon-btn')) return;
      openSocios(root, cat);
    });
    card.querySelector('.icon-btn.edit').addEventListener('click', (e)=>{ e.stopPropagation(); openCatModal(root, cat); });
    card.querySelector('.icon-btn.delete').addEventListener('click', async (e)=>{ e.stopPropagation(); if(confirm(`¿Eliminar la categoría "${cat.nombre}"?`)){ const del=await deleteCategoria(cat.id); if(del.error) alert(del.error.message); else renderCategorias(root.parentElement); }});
    grid.appendChild(card);
  });

  // Drag & drop categorías
  if(grid._sortable){ grid._sortable.destroy(); }
  grid._sortable = Sortable.create(grid, {
    animation:150, draggable: '.card',
    onEnd: async ()=>{
      const nodes = $$('.card', grid);
      const updates = nodes.map((n,idx)=>({ id: n.dataset.id, orden: idx+1 }));
      await saveOrdenCategorias(updates);
      renderCategorias(root.parentElement);
    }
  });

  // Top actions
  const top = $('#topActions'); top.innerHTML='';
  const btn = document.createElement('button'); btn.className='btn primary'; btn.textContent='Crear categoría de socios';
  btn.addEventListener('click', ()=> openCatModal(root, null));
  top.appendChild(btn);
}

function openCatModal(root, cat){
  // modal inline simple (prompt) para mantener el ejemplo compacto
  const nombre = prompt('Nombre de la categoría:', cat?.nombre || '');
  if(nombre===null) return;
  const color = prompt('Color (hex):', cat?.color || '#3ba55d') || '#3ba55d';
  const bal = Number(prompt('Balance (placeholder):', String(cat?.balance ?? 0)) || 0);
  (cat ? updateCategoria(cat.id,{nombre,color,balance:bal}) : createCategoria({nombre,color,balance:bal}))
    .then(r => { if(r.error) alert(r.error.message); renderCategorias(root.parentElement); });
}

// ------- Render Socios por categoría -------
export async function openSocios(root, cat){
  store.currentCat = cat.id;
  store.currentCatName = cat.nombre || 'Socios';
  $('#title').textContent = 'Socios · ' + store.currentCatName;
  const top = $('#topActions');
  top.innerHTML = `
    <button class="btn ghost" id="btnBack">← Volver a categorías</button>
    <div class="actions-inline">
      <input id="socioSearch" type="text" placeholder="Buscar socio…" style="padding:10px 12px;border:1px solid var(--border);background:var(--card);color:var(--text);border-radius:10px;min-width:220px" />
      <button class="btn ${store.prefView==='list'?'warn':''}" id="btnList">Lista</button>
      <button class="btn ${store.prefView==='cards'?'warn':''}" id="btnCards">Tarjetas</button>
      <button class="btn primary" id="btnNew">Crear socio</button>
    </div>
  `;
  $('#btnBack').addEventListener('click', ()=> location.hash = '#/socios');
  $('#btnList').addEventListener('click', ()=>{ setPrefView('list'); renderSocios(root); });
  $('#btnCards').addEventListener('click', ()=>{ setPrefView('cards'); renderSocios(root); });
  $('#btnNew').addEventListener('click', ()=> openSocioModal(root, null));
  $('#socioSearch').addEventListener('input', (e)=> applyFilter(root, e.target.value.trim().toLowerCase()));

  root.innerHTML=''; const container = document.createElement('div'); container.id='socContainer'; root.appendChild(container);
  await renderSocios(root);
}

let lastRows = [];
export async function renderSocios(root){
  const container = $('#socContainer') || root;
  container.innerHTML = 'Cargando…';
  const res = await listSocios(store.currentCat);
  if(res.error){ container.innerHTML = `<div class="muted">Error: ${res.error.message}</div>`; return; }
  lastRows = res.data || [];
  draw(container, lastRows);
}

function draw(container, rows){
  container.innerHTML='';
  if(!rows.length){ container.innerHTML = '<div class="muted">No hay socios en esta categoría.</div>'; return; }

  if(store.prefView==='list'){
    const table = sociosTable(rows);
    container.appendChild(table);
    // acciones
    $$('.icon-btn.edit', table).forEach(btn => btn.addEventListener('click', ()=>{
      const id = btn.closest('tr').dataset.id;
      const s = rows.find(x => String(x.id)===String(id));
      openSocioModal(container, s);
    }));
    $$('.icon-btn.delete', table).forEach(btn => btn.addEventListener('click', async ()=>{
      const id = btn.closest('tr').dataset.id;
      if(confirm('¿Eliminar este socio?')){ const r=await deleteSocio(id); if(r.error) alert(r.error.message); renderSocios(container.parentElement); }
    }));
    // drag table
    const tbody = $('tbody', table);
    if(tbody._sortable) tbody._sortable.destroy();
    tbody._sortable = Sortable.create(tbody, {
      animation:150, draggable:'tr',
      onEnd: async ()=>{
        const nodes = $$('tr', tbody);
        const updates = nodes.map((n,idx)=>({ id: n.dataset.id, orden: idx+1 }));
        await saveOrdenSocios(updates);
        renderSocios(container.parentElement);
      }
    });
  }else{
    const grid = document.createElement('div'); grid.className='grid'; grid.id='socGrid';
    rows.forEach(r => {
      const card = socioCard(r);
      card.querySelector('.icon-btn.edit').addEventListener('click', ()=> openSocioModal(container, r));
      card.querySelector('.icon-btn.delete').addEventListener('click', async ()=>{
        if(confirm('¿Eliminar este socio?')){ const del=await deleteSocio(r.id); if(del.error) alert(del.error.message); renderSocios(container.parentElement); }
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
    // drag cards
    if(grid._sortable) grid._sortable.destroy();
    grid._sortable = Sortable.create(grid, {
      animation:150, draggable:'.card',
      onEnd: async ()=>{
        const nodes = $$('.card', grid);
        const updates = nodes.map((n,idx)=>({ id: n.dataset.id, orden: idx+1 }));
        await saveOrdenSocios(updates);
        renderSocios(container.parentElement);
      }
    });
  }
}

function applyFilter(root, q){
  if(!q) return draw($('#socContainer'), lastRows);
  const fields = r => [r.empresa||'', r.titular||'', r.telefono||'', r.direccion||'', (r.balance!=null? String(r.balance):'')].join(' ').toLowerCase();
  const filtered = lastRows.filter(r => fields(r).includes(q));
  draw($('#socContainer'), filtered);
}

function openSocioModal(root, socio){
  // modal inline simplificado con prompts para ejemplificar (puede reemplazarse luego por UI completa)
  const empresa = prompt('Empresa *', socio?.empresa || '');
  if(empresa===null || !empresa.trim()) return;
  const titular = prompt('Titular *', socio?.titular || '');
  if(titular===null || !titular.trim()) return;
  const telefono = prompt('Teléfono', socio?.telefono || '') || '';
  const direccion = prompt('Dirección', socio?.direccion || '') || '';
  const balanceStr = prompt('Balance', String(socio?.balance ?? '')) || '';
  const balance = balanceStr==='' ? null : Number(balanceStr);
  const color = prompt('Color de tarjeta (hex)', socio?.card_color || '#18213a') || '#18213a';

  (async ()=>{
    if(socio){
      const up = await updateSocio(socio.id, { empresa, titular, telefono, direccion, balance, card_color: color });
      if(up.error) return alert(up.error.message);
    }else{
      const cnt = await countSocios(store.currentCat);
      const orden = (cnt.count || 0) + 1;
      const ins = await createSocio({ categoria_id: store.currentCat, empresa, titular, telefono, direccion, balance, card_color: color, orden });
      if(ins.error) return alert(ins.error.message);
      // Avatar opcional
      const wantAvatar = confirm('¿Quieres subir un avatar ahora?');
      if(wantAvatar){
        const file = await pickFile();
        if(file){
          const up = await uploadAvatar(ins.data.id, file);
          if(up?.data?.url){
            await updateSocio(ins.data.id, { avatar_url: up.data.url });
          }
        }
      }
    }
    renderSocios(root.parentElement);
  })();
}

function pickFile(){
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type='file'; input.accept='image/*';
    input.onchange = ()=> resolve(input.files[0] || null);
    input.click();
  });
}
