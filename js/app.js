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

      // Formateo de input moneda (colombiano) con punto miles y coma decimales
      const valorInput = document.querySelector('input[name="valor"]');
      function formatCurrencyColombian(value){
        if(value === '' || value == null) return '';
        // eliminar todo excepto numeros y coma/punto
        const only = String(value).replace(/[^0-9,\.]/g,'');
        // reemplazar comas por punto para parsear, luego formatear
        const cleaned = only.replace(/\./g,'').replace(/,/g,'.');
        const num = parseFloat(cleaned);
        if(isNaN(num)) return '';
        // separar parte entera y decimal
        const parts = num.toFixed(2).split('.');
        const intPart = parts[0];
        const decPart = parts[1];
        const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return intWithDots + (decPart ? ',' + decPart : '');
      }

      if (valorInput){
        // Live caret-aware formatting
        // keydown: permitir entrada explícita de '.' y ',' (algunos navegadores o IMEs pueden bloquear)
        valorInput.addEventListener('keydown', (e)=>{
          if (e.key === '.' || e.key === ',') {
            // dejar que input procese la tecla
            return;
          }
        });

        valorInput.dataset.prevWasDecimal = 'false';
        valorInput.addEventListener('input', (e)=>{
          const cur = e.target;
          const orig = cur.value;
          const selStart = cur.selectionStart;
          const prevWasDecimal = cur.dataset.prevWasDecimal === 'true';
          const { value, caret, isDecimal } = formatCurrencyLive(orig, selStart, prevWasDecimal);
          cur.value = value;
          cur.dataset.prevWasDecimal = isDecimal ? 'true' : 'false';
          try{ cur.setSelectionRange(caret, caret); }catch(_){ /* ignore */ }
        });

        // focus: des-formatear para edición (mostrar versión sin miles, con punto decimal)
        valorInput.addEventListener('focus', (e)=>{
          const raw = e.target.value.replace(/\./g,'').replace(/,/g,'.').replace(/\s/g,'').replace(/\$/g,'');
          e.target.value = raw;
          setTimeout(()=> e.target.selectionStart = e.target.selectionEnd = e.target.value.length, 0);
        });

        // blur: aplicar formateo definitivo (usamos formatCurrencyLive para consistencia)
        valorInput.addEventListener('blur', (e)=>{
          const prevWasDecimal = e.target.dataset.prevWasDecimal === 'true';
          const res = formatCurrencyLive(e.target.value, (e.target.value||'').length, prevWasDecimal);
          e.target.value = res.value;
          e.target.dataset.prevWasDecimal = res.isDecimal ? 'true' : 'false';
        });

        // inicializar placeholder
        if(!valorInput.value) valorInput.value = '';
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
