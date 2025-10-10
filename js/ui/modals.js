import { $, debug } from '../utils/dom.js';

let confirmCb = null;

export function openConfirm(msg, onOk, title){
  $('#confirmTitle').textContent = title || 'Confirmar acción';
  $('#confirmMsg').textContent = msg || '¿Seguro que deseas continuar?';
  confirmCb = (typeof onOk==='function') ? onOk : null;
  openModal($('#modalConfirm'));
}
export function bindConfirm(){
  $('#btnCancelConfirm').addEventListener('click', ()=>{ closeModal($('#modalConfirm')); confirmCb=null; });
  $('#btnOkConfirm').addEventListener('click', ()=>{
    const cb=confirmCb; confirmCb=null; closeModal($('#modalConfirm'));
    if(cb) cb();
  });
}

/* Categoría modal */
let catEditId = null;
export function openCatModal(mode, row){
  catEditId = (mode==='edit' && row && row.id) ? row.id : null;
  $('#modalTitle').textContent = catEditId? 'Editar categoría' : 'Nueva categoría';
  const f = $('#formCat');
  f.nombre.value = row?.nombre || '';
  f.color.value  = row?.color  || '#3ba55d';
  f.balance.value = row?.balance ?? 0;
  openModal($('#modalCat'));
}
export function closeCatModal(){ closeModal($('#modalCat')); catEditId=null; }
export function getCatEditId(){ return catEditId; }

/* Config modal */
let catCfgId = null;
export function openCatConfig(row){
  catCfgId = row.id;
  $('#modalConfigTitle').textContent = 'Config: ' + (row.nombre||'Categoría');
  const f = $('#formCatConfig');
  f.tab2_name.value = row.tab2_name || 'Notas';
  f.tab3_name.value = row.tab3_name || 'Archivos';
  openModal($('#modalCatConfig'));
}
export function closeCatConfig(){ closeModal($('#modalCatConfig')); catCfgId=null; }
export function getCatCfgId(){ return catCfgId; }

/* Socio modal */
let socioEditId = null;
export function openSocioModal(socio, currentCatName){
  socioEditId = (socio && socio.id) ? socio.id : null;
  $('#modalSocioTitle').textContent = socioEditId ? 'Editar socio' : (String(currentCatName||'').toLowerCase()==='proveedores'?'Editar proveedor':'Nuevo socio').replace('Editar','Nuevo');
  const f = $('#formSocio');
  f.empresa.value = socio?.empresa || '';
  f.titular.value = socio?.titular || '';
  f.telefono.value = socio?.telefono || '';
  f.direccion.value = socio?.direccion || '';
  f.card_color.value = socio?.card_color || '#121a26';
  f.avatar.value = '';
  openModal($('#modalSocio'));
}
export function closeSocioModal(){ closeModal($('#modalSocio')); socioEditId=null; }
export function getSocioEditId(){ return socioEditId; }

export function bindModalCloseButtons(){
  $('#btnCancelCat')?.addEventListener('click', closeCatModal);
  $('#btnCancelCatCfg')?.addEventListener('click', closeCatConfig);
  $('#btnCancelSocio')?.addEventListener('click', closeSocioModal);
  $('#btnCancelTransaccion')?.addEventListener('click', closeTransaccionModal);
}

/* Transaccion modal */
let transaccionOpen = false;
export function openTransaccionModal(){
  transaccionOpen = true;
  openModal($('#modalTransaccion'));
}
export function closeTransaccionModal(){
  transaccionOpen = false;
  closeModal($('#modalTransaccion'));
}

/* Generic modal helpers: operate on modal element (which is inside a .backdrop parent in markup) */
function openModal(modalEl){
  try{
    if(!modalEl) return console.warn('openModal: modalEl not found');
    const backdrop = modalEl.parentElement && modalEl.parentElement.classList && modalEl.parentElement.classList.contains('backdrop') ? modalEl.parentElement : null;
    if(!backdrop) return console.warn('openModal: backdrop not found for modal', modalEl);
    // add open classes
    backdrop.classList.add('open');
    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden','false');
    // lock scroll
    document.body.style.overflow = 'hidden';
    // focus first interactive element
    setTimeout(()=>{
      const first = modalEl.querySelector('input, select, textarea, button');
      first?.focus();
    }, 50);
    // backdrop click closes
    const onBackdropClick = (ev)=>{ if(ev.target === backdrop) closeModal(modalEl); };
    backdrop.addEventListener('click', onBackdropClick);
    // esc to close
    const onKey = (ev)=>{ if(ev.key === 'Escape') closeModal(modalEl); };
    document.addEventListener('keydown', onKey);
    // store handlers to remove later
    modalEl._modalHandlers = { backdrop, onBackdropClick, onKey };
  }catch(e){ console.warn('openModal error', e); }
}

function closeModal(modalEl){
  try{
    if(!modalEl) return;
    const handlers = modalEl._modalHandlers || {};
    if(handlers.backdrop && handlers.onBackdropClick) handlers.backdrop.removeEventListener('click', handlers.onBackdropClick);
    if(handlers.onKey) document.removeEventListener('keydown', handlers.onKey);
    const backdrop = handlers.backdrop || (modalEl.parentElement && modalEl.parentElement.classList && modalEl.parentElement.classList.contains('backdrop') ? modalEl.parentElement : null);
    if(backdrop) backdrop.classList.remove('open');
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden','true');
    // restore scroll only if no other backdrop open
    const anyOpen = Array.from(document.querySelectorAll('.backdrop.open')).length > 0;
    if(!anyOpen) document.body.style.overflow = '';
    // remove handlers reference
    try{ delete modalEl._modalHandlers; }catch(_){ modalEl._modalHandlers = null; }
  }catch(e){ console.warn('closeModal error', e); }
}
