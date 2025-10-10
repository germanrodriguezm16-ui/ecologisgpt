import { $, $all, el, debug } from './utils/dom.js';
import { loadCategorias } from './views/categorias.js';
import { openSociosList, handleSocioFormSubmit } from './views/socios.js';
import { openTransaccionesView, renderTransacciones, handleTransaccionFormSubmit } from './views/transacciones.js';
import { getClient } from './services/supabase.js';
import { bindConfirm, bindModalCloseButtons, openCatModal, getCatEditId, closeCatModal, getCatCfgId, closeCatConfig } from './ui/modals.js';
import { formatCurrencyLive } from './utils/format.js';

// Sentry init (optional)
(function(){
  try{
    const DSN = (window.APP_CONFIG && window.APP_CONFIG.SENTRY_DSN) || '';
    if (DSN && window.Sentry) { window.Sentry.init({ dsn: DSN, environment: 'production', tracesSampleRate: 0 }); }
  }catch(e){ console.warn('Sentry init skipped', e); }
})();

// Simple demo views for other modules
function demoCard(t){ const c=document.createElement('div'); c.className='card'; c.innerHTML='<h3>'+t+'</h3><p class="muted">Vista demo.</p>'; return c; }

function mountView(tab){
  $all('.nav-btn', $('#nav')).forEach(b => b.classList.toggle('active', b.dataset.view===tab));
  $('#title').textContent = tab.charAt(0).toUpperCase()+tab.slice(1);
  $('#view').innerHTML='';
  if (tab==='socios'){
    const root = document.createElement('div');
    root.id='sociosRoot';
    root.appendChild(el('div',{id:'socTop',class:'actions-inline',style:{marginBottom:'12px'}},[]));
    root.appendChild(el('div',{id:'socGrid',class:'grid'},[]));
    $('#view').appendChild(root);
    $('#topActions').innerHTML = '<button class="btn primary" id="btnNuevaCat" type="button">Crear categoría de socios</button>';
    $('#btnNuevaCat')?.addEventListener('click', ()=> openCatModal('create'));
    // ensure supabase
    try { getClient(); } catch(e){ console.error(e); }
    loadCategorias();
  } else if (tab === 'transacciones') {
    try { openTransaccionesView(); } catch (e) { console.error('Error opening transacciones view', e); $('#topActions').innerHTML=''; $('#view').appendChild(demoCard('transacciones')); }
  } else {
    $('#topActions').innerHTML='';
    $('#view').appendChild(demoCard(tab));
  }
  location.hash = tab;
}

function onHashChange(){
  const tab = (location.hash||'#socios').slice(1);
  mountView(tab);
}

document.addEventListener('DOMContentLoaded', ()=>{
  // bind modals
  bindConfirm();
  bindModalCloseButtons();

  // nav
  $('#nav').addEventListener('click', (e)=>{
    const btn = e.target.closest('.nav-btn'); if(!btn) return;
    mountView(btn.dataset.view);
  });

  // forms submit binding
  // Categoría
  $('#formCat').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const supabase = getClient();
    const f=e.target;
    const nombre=f.nombre.value.trim(), color=f.color.value||'#3ba55d', balance=parseFloat(f.balance.value||'0');
    if(!nombre) return alert('Nombre obligatorio');
    const catId = getCatEditId();
    if (catId){
      const up = await supabase.from('categorias_socios').update({nombre,color,balance}).eq('id', catId);
      if(up.error) return alert(up.error.message);
    } else {
      const ins = await supabase.from('categorias_socios').insert([{nombre,color,balance, tab2_name:'Notas', tab3_name:'Archivos'}]);
      if(ins.error) return alert(ins.error.message);
    }
    closeCatModal();
    loadCategorias();
  });
  // Socio
  $('#formSocio').addEventListener('submit', (e)=> handleSocioFormSubmit(e));

  // Transacciones form submit
  const formT = $('#formTransaccion');
  if (formT) formT.addEventListener('submit', (e)=> handleTransaccionFormSubmit(e));

  // La preparación del modal de transacciones se realiza en views/transacciones.prepareTransaccionModal()

  window.addEventListener('hashchange', onHashChange);
  onHashChange();
});
