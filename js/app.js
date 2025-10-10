import { $, $all, el, debug } from './utils/dom.js';
import { loadCategorias } from './views/categorias.js';
import { openSociosList, handleSocioFormSubmit } from './views/socios.js';
import { openTransaccionesView, renderTransacciones, handleTransaccionFormSubmit } from './views/transacciones.js';
import { getClient } from './services/supabase.js';
import { bindConfirm, bindModalCloseButtons, openCatModal, getCatEditId, closeCatModal, getCatCfgId, closeCatConfig } from './ui/modals.js';

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

  // Config categoría
  $('#formCatConfig').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const supabase = getClient();
    const f=e.target;
    const tab2_name = f.tab2_name.value.trim() || 'Notas';
    const tab3_name = f.tab3_name.value.trim() || 'Archivos';
    const id = getCatCfgId();
    const up = await supabase.from('categorias_socios').update({tab2_name, tab3_name}).eq('id', id);
    if(up.error) return alert(up.error.message);
    closeCatConfig();
    loadCategorias();
  });

  // Socio
  $('#formSocio').addEventListener('submit', (e)=> handleSocioFormSubmit(e));

  // Transacciones form submit
  const formT = $('#formTransaccion');
  if (formT) formT.addEventListener('submit', (e)=> handleTransaccionFormSubmit(e));

  // Cuando se abra el modal de transaccion, cargamos categorias y socios en selects
  document.addEventListener('click', async (ev)=>{
    const btn = ev.target.closest('#btnNewTrans');
    if (!btn) return;
    try{
      const supabase = getClient();
      const cats = await supabase.from('categorias_socios').select('*').order('orden',{ascending:true});
      const socios = await supabase.from('socios').select('*').order('empresa',{ascending:true});
      const sel = (id)=> document.getElementById(id);
      if (cats.data){
        ['origen_categoria_id','destino_categoria_id'].forEach(id=>{
          const elSel = sel(id); if(!elSel) return; elSel.innerHTML='';
          cats.data.forEach(c=> elSel.add(new Option(c.nombre, c.id)));
        });
      }

      // Poblar socios por categoría dinámicamente
      async function loadSociosForCategory(catId, targetSelectId){
        const sEl = sel(targetSelectId);
        if(!sEl) return;
        sEl.innerHTML = '';
        if(!catId) return;
        const { data: socs, error } = await supabase.from('socios').select('*').eq('categoria_id', catId).order('empresa',{ascending:true});
        if(error) return console.warn('Error cargando socios por categoría', error.message);
        socs.forEach(s => sEl.add(new Option(s.empresa + ' — ' + (s.titular||''), s.id)));
      }

      // Asignar handlers para cuando cambien las categorías
      const origenCat = document.getElementById('origen_categoria_id');
      const destinoCat = document.getElementById('destino_categoria_id');
      origenCat?.addEventListener('change', async (e)=>{
        await loadSociosForCategory(e.target.value, 'origen_socio_id');
        // limpiar selección de socio si no existe o no pertenece
        const origenSel = document.getElementById('origen_socio_id'); if (origenSel) origenSel.value = '';
      });
      destinoCat?.addEventListener('change', async (e)=>{
        await loadSociosForCategory(e.target.value, 'destino_socio_id');
        const destinoSel = document.getElementById('destino_socio_id'); if (destinoSel) destinoSel.value = '';
      });
      // set default datetime-local to now in Bogota
      const fechaInput = document.querySelector('input[name="fecha"]');
      if (fechaInput && !fechaInput.value){
        const nowUtc = Date.now();
        const colombiaOffsetHours = -5; // Bogotá UTC-5
        const colombiaMillis = nowUtc + colombiaOffsetHours * 3600_000;
        const d = new Date(colombiaMillis);
        fechaInput.value = d.toISOString().slice(0,16);
      }

      // evitar seleccionar el mismo socio en destino al elegir origen
      const origenSel = document.getElementById('origen_socio_id');
      const destinoSel = document.getElementById('destino_socio_id');
      function syncDisable(){
        if (!origenSel || !destinoSel) return;
        const origenVal = origenSel.value;
        Array.from(destinoSel.options).forEach(opt=> opt.disabled = (opt.value === origenVal));
      }
      origenSel?.addEventListener('change', syncDisable);
      destinoSel?.addEventListener('change', ()=>{
        // si por algún motivo el usuario dejó el mismo (por error), mostrar advertencia simple
        if (origenSel && destinoSel && origenSel.value === destinoSel.value) alert('Origen y destino no pueden ser el mismo socio');
      });
    }catch(e){ console.warn('No se pudieron cargar selects de transacciones', e); }
  });

  window.addEventListener('hashchange', onHashChange);
  onHashChange();
});
