import { router } from '../../core/router.js';
import * as act from './actions.js';
import * as tpl from './templates.js';

let root, topActionsEl, contentEl;
let currentCatId = null;
let viewMode = localStorage.getItem('sociosViewMode') || 'cards';
let onClick, onSubmitCat, onSubmitSocio;
let bound = false; // evita doble binding

export async function mount(container){
  root = container;
  root.innerHTML = `
    <div class="topbar">
      <div class="title" id="soc-title">Socios</div>
      <div id="soc-actions" class="actions-inline"></div>
    </div>
    <div id="soc-content"></div>
  `;
  topActionsEl = root.querySelector('#soc-actions');
  contentEl = root.querySelector('#soc-content');

  if (!bound){
    onClick = handleClick;
    root.addEventListener('click', onClick);
    bindModals();
    bound = true;
  }

  await renderCategorias(); // arranque
}

export function unmount(){
  // (si tu router llama unmount) limpiamos
  if (root && onClick){ root.removeEventListener('click', onClick); }
  unbindModals();
  bound = false;
  root = topActionsEl = contentEl = null;
  currentCatId = null;
}

export async function update(ctx){
  if (!ctx?.parts || ctx.parts[0] !== 'socios') return;
  const catId = ctx.parts[1] ? Number(ctx.parts[1]) : null;
  if (catId !== currentCatId){
    currentCatId = catId;
    if (currentCatId) await renderSocios();
    else await renderCategorias();
  }
}

/* ---------------- Eventos ---------------- */
async function handleClick(e){
  const el = e.target.closest('[data-action]');
  if (!el) return;
  e.preventDefault();
  if (el.tagName === 'BUTTON' && el.type !== 'button') el.type = 'button';

  const { action, id } = el.dataset;
  switch(action){
    case 'new-cat':       return openCatModal('create');
    case 'edit-cat':      return openCatModal('edit', id);
    case 'delete-cat':    return deleteCat(id);
    case 'back-to-cats':  currentCatId = null; location.hash = '#/socios'; return;
    case 'new-socio':     return openSocioModal('create');
    case 'edit-socio':    return openSocioModal('edit', id);
    case 'delete-socio':  return deleteSocio(id);
    case 'list-view':     viewMode='list';  localStorage.setItem('sociosViewMode','list');  return renderSocios();
    case 'cards-view':    viewMode='cards'; localStorage.setItem('sociosViewMode','cards'); return renderSocios();
  }
}

/* ---------------- Modales ---------------- */
function bindModals(){
  const modalCat = document.getElementById('modalCat');
  const formCat  = document.getElementById('formCat');
  if (modalCat && formCat){
    onSubmitCat = submitCategoria;
    formCat.removeEventListener('submit', onSubmitCat); // idempotente
    formCat.addEventListener('submit', onSubmitCat);
    const btnCancelCat = document.getElementById('btnCancelCat');
    if (btnCancelCat) btnCancelCat.onclick = () => modalCat.style.display='none';
  }

  const modalSoc = document.getElementById('modalSocio');
  const formSoc  = document.getElementById('formSocio');
  if (modalSoc && formSoc){
    onSubmitSocio = submitSocio;
    formSoc.removeEventListener('submit', onSubmitSocio); // idempotente
    formSoc.addEventListener('submit', onSubmitSocio);
    const btnCancelSoc = document.getElementById('btnCancelSocio');
    if (btnCancelSoc) btnCancelSoc.onclick = () => modalSoc.style.display='none';
  }
}

function unbindModals(){
  const formCat = document.getElementById('formCat');
  if (formCat && onSubmitCat) formCat.removeEventListener('submit', onSubmitCat);
  const formSoc = document.getElementById('formSocio');
  if (formSoc && onSubmitSocio) formSoc.removeEventListener('submit', onSubmitSocio);
}

async function openCatModal(mode, id){
  const modal = document.getElementById('modalCat');
  const form = document.getElementById('formCat');
  if (!modal || !form) return alert('Modal de categoría no disponible.');

  form.reset();
  form.dataset.id = '';
  const title = document.getElementById('modalTitle');

  if (mode === 'edit' && id){
    const { data, error } = await act.getCategoriaById(Number(id));
    if (error) return alert(error.message);
    form.dataset.id = String(data.id);
    form.nombre.value = data.nombre || '';
    form.color.value  = data.color || '#3ba55d';
    form.balance.value = data.balance ?? 0;
    if (title) title.textContent = 'Editar categoría';
  } else {
    if (title) title.textContent = 'Nueva categoría';
  }

  modal.style.display = 'flex';
}

function openSocioModal(mode, id){
  const modal = document.getElementById('modalSocio');
  const form = document.getElementById('formSocio');
  if (!modal || !form) return alert('Modal de socio no disponible.');

  form.reset();
  form.dataset.id = '';
  const title = document.getElementById('modalSocioTitle');
  if (title) title.textContent = (mode === 'edit' ? 'Editar socio' : 'Nuevo socio');

  // Si quieres precargar para editar socio, aquí podrías pedirlo por id y setear campos
  modal.style.display = 'flex';
}

async function submitCategoria(ev){
  ev.preventDefault();
  const modal = document.getElementById('modalCat');
  const f = ev.target;
  const payload = {
    id: f.dataset.id ? Number(f.dataset.id) : undefined,
    nombre: f.nombre.value.trim(),
    color: f.color.value || '#3ba55d',
    balance: Number(f.balance.value || '0'),
  };
  if (!payload.nombre) return alert('Nombre obligatorio');

  const { error } = await act.upsertCategoria(payload);
  if (error) return alert(error.message);

  if (modal) modal.style.display='none';
  await renderCategorias();
}

async function submitSocio(ev){
  ev.preventDefault();
  const modal = document.getElementById('modalSocio');
  const f = ev.target;
  const fd = new FormData(f);
  const payload = {
    id: f.dataset.id ? Number(f.dataset.id) : undefined,
    categoria_id: currentCatId,
    empresa: (fd.get('empresa')||'').toString().trim(),
    titular: (fd.get('titular')||'').toString().trim(),
    telefono: (fd.get('telefono')||'').toString().trim() || null,
    direccion: (fd.get('direccion')||'').toString().trim() || null,
  };
  if (!payload.empresa || !payload.titular) return alert('Empresa y Titular son obligatorios');

  // upsert
  const ins = await act.upsertSocio(payload);
  if (ins.error) return alert(ins.error.message);
  const newId = ins.data?.id || payload.id;

  // upload avatar opcional
  const file = f.avatar?.files?.[0];
  if (file && newId){
    if (file.size > 2*1024*1024) return alert('El archivo supera 2 MB');
    const up = await act.uploadAvatar(file, newId);
    if (up.error) alert('Error subiendo imagen: '+up.error.message);
  }

  if (modal) modal.style.display='none';
  await renderSocios();
}

/* ---------------- Render ---------------- */
async function renderCategorias(){
  const box = contentEl;
  document.getElementById('soc-title').textContent = 'Socios';
  topActionsEl.innerHTML = tpl.topbarCategorias();

  box.innerHTML = '<div class="loading">Cargando categorías…</div>';
  const { data, error } = await act.listCategorias();
  if (error){ box.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`; return; }
  if (!data.length){ box.innerHTML = '<div class="empty">No hay categorías aún.</div>'; return; }

  const grid = document.createElement('div');
  grid.className = 'grid';
  grid.innerHTML = data.map(tpl.categoriaCard).join('');

  // navegación a socios por categoría (evitando acciones internas)
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.card[data-id]');
    if (!card) return;
    if (e.target.closest('[data-action]')) return; // si fue botón de editar/eliminar
    location.hash = `#/socios/${card.dataset.id}`;
  });

  box.innerHTML = '';
  box.appendChild(grid);
}

async function renderSocios(){
  if (!currentCatId){ return renderCategorias(); }
  const box = contentEl;
  document.getElementById('soc-title').textContent = 'Socios · Categoría';
  topActionsEl.innerHTML = tpl.topbarSocios();

  box.innerHTML = '<div class="loading">Cargando socios…</div>';
  const { data, error } = await act.listSociosByCategoria(currentCatId);
  if (error){ box.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`; return; }
  if (!data.length){ box.innerHTML = '<div class="empty">No hay socios en esta categoría.</div>'; return; }

  if (viewMode === 'list'){
    // si ya tienes una plantilla de lista, úsala aquí:
    box.innerHTML = `<div class="grid">${data.map(tpl.socioCard).join('')}</div>`;
  } else {
    const grid = document.createElement('div');
    grid.className = 'grid';
    grid.innerHTML = data.map(tpl.socioCard).join('');
    box.innerHTML = '';
    box.appendChild(grid);
  }
}

/* helpers */
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
