import { $, $all, el } from './utils/dom.js';
import { loadCategorias } from './views/categorias.js';
import { openSociosList, handleSocioFormSubmit } from './views/socios.js';
import { getClient } from './services/supabase.js';
import { bindConfirm, bindModalCloseButtons, openCatModal, getCatEditId, closeCatModal, getCatCfgId, closeCatConfig, openTxModal, handleTxFormSubmit } from './ui/modals.js';
import { mountTransaccionesView } from './views/transacciones.js';

(function(){
  try{
    const DSN = (window.APP_CONFIG && window.APP_CONFIG.SENTRY_DSN) || '';
    if (DSN && window.Sentry) { window.Sentry.init({ dsn: DSN, environment: 'production', tracesSampleRate: 0 }); }
  }catch(e){ console.warn('Sentry init skipped', e); }
})();

function demoCard(t){ const c=document.createElement('div'); c.className='card'; c.innerHTML='<h3>'+t+'</h3><p class="muted">Vista demo.</p>'; return c; }

function mountView(tab){
  $all('.nav-btn', $('#nav')).forEach(b => b.classList.toggle('active', b.dataset.view===tab));
  $('#title').textContent = tab.charAt(0).toUpperCase()+tab.slice(1);
  $('#view').innerHTML='';

  // Mostrar FAB solo en socios y transacciones
  const fab = $('#fabTx');
  fab.style.display = (tab==='socios' || tab==='transacciones') ? 'grid' : 'none';

  if (tab==='socios'){
    const root = document.createElement('div');
    root.id='sociosRoot';
    root.appendChild(el('div',{id:'socTop',class:'actions-inline',style:{marginBottom:'12px'}},[]));
    root.appendChild(el('div',{id:'socGrid',class:'grid'},[]));
    $('#view').appendChild(root);
    $('#topActions').innerHTML = '<button class="btn primary" id="btnNuevaCat" type="button">Crear categoría de socios</button>';
    $('#btnNuevaCat')?.addEventListener('click', ()=> openCatModal('create'));
    try { getClient(); } catch(e){ console.error(e); }
    loadCategorias();
  } else if (tab==='transacciones'){
    mountTransaccionesView();
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
  bindConfirm();
  bindModalCloseButtons();

  $('#nav').addEventListener('click', (e)=>{
    const btn = e.target.closest('.nav-btn'); if(!btn) return;
    mountView(btn.dataset.view);
  });

  // Categoría (crear/editar)
  $('#formCat').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const supabase = getClient();
    const f=e.target;
    const nombre=f.nombre.value.trim(), color=f.color.value||'#3ba55d', balance=parseFloat(f.balance.value||'0');
    if(!nombre) return alert('Nombre obligatorio');
    const id = (window.__catEditId || null);
    if (id){
      const up = await supabase.from('categorias_socios').update({nombre,color,balance}).eq('id', id);
      if(up.error) return alert(up.error.message);
    } else {
      const ins = await supabase.from('categorias_socios').insert([{nombre,color,balance, tab2_name:'Notas', tab3_name:'Archivos'}]);
      if(ins.error) return alert(ins.error.message);
    }
    document.getElementById('modalCat').style.display='none';
    loadCategorias();
  });

  // Config categoría
  $('#formCatConfig').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const supabase = getClient();
    const f=e.target;
    const tab2_name = f.tab2_name.value.trim() || 'Notas';
    const tab3_name = f.tab3_name.value.trim() || 'Archivos';
    const id = (window.__catCfgId || null);
    const up = await supabase.from('categorias_socios').update({tab2_name, tab3_name}).eq('id', id);
    if(up.error) return alert(up.error.message);
    document.getElementById('modalCatConfig').style.display='none';
    loadCategorias();
  });

  // Socio
  $('#formSocio').addEventListener('submit', (e)=> handleSocioFormSubmit(e));

  // Transacción
  $('#btnCancelTx').addEventListener('click', ()=>{ document.getElementById('modalTx').style.display='none'; });
  $('#formTx').addEventListener('submit', (e)=> handleTxFormSubmit(e));

  // FAB
  $('#fabTx').addEventListener('click', ()=> openTxModal());

  window.addEventListener('hashchange', onHashChange);
  onHashChange();
});
