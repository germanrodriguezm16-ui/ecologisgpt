import { $, el, $all, esc } from '../utils/dom.js';
import { getClient } from '../services/supabase.js';
import { openTransaccionModal, closeTransaccionModal } from '../ui/modals.js';
import { createFAB, removeFAB } from '../ui/fab.js';

export function openTransaccionesView(){
  $('#title').textContent = 'Transacciones';
  $('#view').innerHTML = '';

  // Top action previously had a textual button; we hide it in favor of the FAB
  $('#topActions').innerHTML = '';

  // Abrir y preparar modal (separado para cargar selects y formateo)
  // create FAB (reusable) that opens the modal. If a previous FAB exists, remove it first.
  try{ removeFAB('fabNewTrans'); }catch(_){ }
  createFAB({ id: 'fabNewTrans', ariaLabel: 'Crear transacción', title: 'Crear transacción', onActivate: async ()=>{
    openTransaccionModal();
    await prepareTransaccionModal();
  }});

  const container = el('div', { id: 'transContent' }, ['Cargando…']);
  $('#view').appendChild(container);

  renderTransacciones();
}

export async function prepareTransaccionModal(){
  try{
    const supabase = getClient();
    const cats = await supabase.from('categorias_socios').select('*').order('orden',{ascending:true});
    const socios = await supabase.from('socios').select('*').order('empresa',{ascending:true});
    const sel = (id)=> document.getElementById(id);
    if (cats.data){
      ['origen_categoria_id','destino_categoria_id'].forEach(id=>{
        const elSel = sel(id); if(!elSel) return; elSel.innerHTML='';
        // placeholder option
        const ph = new Option('Seleccione categoría', ''); ph.disabled = true; ph.selected = true; ph.hidden = true; elSel.add(ph);
        cats.data.forEach(c=> elSel.add(new Option(c.nombre, c.id)));
        try{ elSel.value = ''; }catch(_){ }
      });
    }

    async function loadSociosForCategory(catId, targetSelectId){
      const sEl = sel(targetSelectId);
      if(!sEl) return;
      sEl.innerHTML = '';
      if(!catId) return;
      const { data: socs, error } = await supabase.from('socios').select('*').eq('categoria_id', catId).order('empresa',{ascending:true});
      if(error) return console.warn('Error cargando socios por categoría', error.message);
      socs.forEach(s => sEl.add(new Option(s.empresa + ' — ' + (s.titular||''), s.id)));
    }

    const origenCat = document.getElementById('origen_categoria_id');
    const destinoCat = document.getElementById('destino_categoria_id');
    origenCat?.addEventListener('change', async (e)=>{
      await loadSociosForCategory(e.target.value, 'origen_socio_id');
      const origenSel = document.getElementById('origen_socio_id'); if (origenSel) origenSel.value = '';
    });
    destinoCat?.addEventListener('change', async (e)=>{
      await loadSociosForCategory(e.target.value, 'destino_socio_id');
      const destinoSel = document.getElementById('destino_socio_id'); if (destinoSel) destinoSel.value = '';
    });

    // fecha default se inicializa al preparar el picker más abajo

    const { createCurrencyFSM } = await import('../utils/currency.js');
    const valorInput = document.querySelector('input[name="valor"]');
    if (valorInput){
      const fsm = createCurrencyFSM();
      let composing = false;
      valorInput.value = fsm.getDisplay();
      valorInput.addEventListener('keydown', (e)=>{
        if (e.key === 'Backspace'){ e.preventDefault(); fsm.backspace(); valorInput.value = fsm.getDisplay(); return; }
        if (e.key === '.' || e.key === ','){ e.preventDefault(); fsm.inputSep(); valorInput.value = fsm.getDisplay(); return; }
        if (/^[0-9]$/.test(e.key)){ e.preventDefault(); fsm.inputDigit(e.key); valorInput.value = fsm.getDisplay(); return; }
      });
      valorInput.addEventListener('compositionstart', ()=> composing = true);
      valorInput.addEventListener('compositionend', (e)=>{ composing = false; valorInput.value = fsm.getDisplay(); });
      valorInput.addEventListener('paste', (e)=>{
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const cleaned = text.replace(/[^0-9.,]/g, '');
        for (const ch of cleaned){ if (/[0-9]/.test(ch)) fsm.inputDigit(ch); else if (ch === '.' || ch === ',') fsm.inputSep(); }
        valorInput.value = fsm.getDisplay();
      });
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
    destinoSel?.addEventListener('change', ()=>{ if (origenSel && destinoSel && origenSel.value === destinoSel.value) alert('Origen y destino no pueden ser el mismo socio'); });

  // -------- Fecha picker: mostrar formato DD/MM/YYYY  HH:mm en .fecha-display y permitir abrir picker con el icono
  const fechaInput = document.querySelector('input[name="fecha"]');
  const fechaDisplay = document.querySelector('.fecha-display');
  const btnFecha = document.getElementById('btnFechaPicker');
  let fpInstance = null; // flatpickr instance if available

    // helpers for showing inline field errors
    function showFieldError(fieldName, msg){
      try{
        const container = document.getElementById('voucherInfo')?.parentElement || document.getElementById('formTransaccion');
        if(!container) return;
        let err = document.getElementById(fieldName + 'Error');
        if(!err){ err = document.createElement('div'); err.id = fieldName + 'Error'; err.className = 'field-error'; container.appendChild(err); }
        err.textContent = msg;
      }catch(_){ }
    }
    function clearFieldError(fieldName){ try{ const e = document.getElementById(fieldName + 'Error'); if(e) e.remove(); }catch(_){ } }
    function formatFechaDisplayFromDatetimeLocal(val){
      if(!val) return '';
      const [d,t] = val.split('T'); if(!d || !t) return '';
      const [y,m,day] = d.split('-'); const [hh,mm] = t.split(':');
      return `${day}/${m}/${y} — ${hh}:${mm}`;
    }
    function syncFechaDisplay(){ if(fechaDisplay) fechaDisplay.textContent = formatFechaDisplayFromDatetimeLocal(fechaInput.value); }
    // set default datetime-local to now in Bogota if empty
    if (fechaInput && !fechaInput.value){
      const nowUtc = Date.now();
      const colombiaOffsetHours = -5;
      const colombiaMillis = nowUtc + colombiaOffsetHours * 3600_000;
      const d = new Date(colombiaMillis);
      fechaInput.value = d.toISOString().slice(0,16);
    }

    // Try to initialize flatpickr (datetime) if available. Graceful fallback to native picker.
    try{
      if (window.flatpickr && fechaInput){
        fpInstance = window.flatpickr(fechaInput, {
          enableTime: true,
          time_24hr: true,
          dateFormat: "Y-m-d\TH:i",
          defaultDate: fechaInput.value || null,
          onChange: function(selectedDates, dateStr){
            // dateStr comes formatted as configured (Y-m-dTH:i) matching datetime-local
            fechaInput.value = dateStr;
            syncFechaDisplay();
          }
        });
      }
    }catch(_){ fpInstance = null; }
  // init display
  syncFechaDisplay();
  fechaInput.addEventListener('change', ()=>{ syncFechaDisplay(); });
  if (btnFecha){ btnFecha.addEventListener('click', (e)=>{
    e.preventDefault();
    if(!fechaInput) return;
    // If flatpickr instance exists, open it explicitly
    if (fpInstance && typeof fpInstance.open === 'function') { try{ fpInstance.open(); }catch(_){ /* fallback below */ } return; }
    if (typeof fechaInput.showPicker === 'function') {
      try{ fechaInput.showPicker(); }catch(_){ fechaInput.focus(); }
    } else { fechaInput.focus(); }
  }); }

    // -------- Voucher file handling (temporal hasta submit)
    const btnAdjuntar = document.getElementById('btnAdjuntar');
    const inputVoucher = document.getElementById('inputVoucher');
    const voucherInfo = document.getElementById('voucherInfo');
    const fileThumb = voucherInfo?.querySelector('.file-thumb');
    const fileNameEl = voucherInfo?.querySelector('.file-name');
    const btnRemove = document.getElementById('btnRemoveVoucher');
    let selectedVoucherFile = null;

    function showVoucher(file){
      if(!voucherInfo) return;
      voucherInfo.style.display = 'flex';
      if(file){
        fileNameEl.textContent = file.name;
        // show thumbnail for images
        if(/image\//.test(file.type)){
          const url = file._objUrl || null;
          if(fileThumb) fileThumb.style.backgroundImage = url ? `url(${url})` : '';
        } else {
          if(fileThumb) fileThumb.style.backgroundImage = '';
        }
      } else {
        fileNameEl.textContent = '';
        if(fileThumb) fileThumb.style.backgroundImage = '';
      }
    }

    btnAdjuntar?.addEventListener('click', ()=> inputVoucher?.click());
    inputVoucher?.addEventListener('change', (e)=>{
      const f = e.target.files && e.target.files[0];
      if(!f) return;
      // validate type and size (<=5MB)
      const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
      if (!allowed.includes(f.type)){
        // mostrar error no intrusivo
        showFieldError('voucher', 'Tipo de archivo no permitido. Usa JPG/PNG/PDF.');
        return;
      }
      if (f.size > 5 * 1024 * 1024){ showFieldError('voucher', 'El archivo supera 5 MB'); return; }
      clearFieldError('voucher');
      selectedVoucherFile = f;
      // create object URL
      try{ selectedVoucherFile._objUrl = URL.createObjectURL(f); }catch(_){ selectedVoucherFile._objUrl = null; }
      showVoucher(f);
    });
    btnRemove?.addEventListener('click', ()=>{
      // revoke object URL if any and close preview
      try{ if(selectedVoucherFile && selectedVoucherFile._objUrl) { URL.revokeObjectURL(selectedVoucherFile._objUrl); } }catch(_){ }
      selectedVoucherFile = null;
      if(inputVoucher) inputVoucher.value = '';
      if(voucherInfo) voucherInfo.style.display = 'none';
      closePreview();
    });

    // Attach selectedVoucherFile to form before submit (store in dataset as temporary name)
    const form = document.getElementById('formTransaccion');
    if (form){
      form._getSelectedVoucher = ()=> selectedVoucherFile;
    }

    // ---------- Preview overlay logic
    let previewOverlay = null;
    function createPreviewOverlay(){
      if(previewOverlay) return previewOverlay;
      const ov = document.createElement('div'); ov.className='preview-overlay';
      ov.style.position='fixed'; ov.style.inset='0'; ov.style.display='flex'; ov.style.alignItems='center'; ov.style.justifyContent='center'; ov.style.zIndex='110'; ov.style.background='rgba(0,0,0,0.6)';
      const box = document.createElement('div'); box.className='preview-box'; box.style.maxWidth='90%'; box.style.maxHeight='90%'; box.style.background='var(--card)'; box.style.borderRadius='10px'; box.style.padding='12px'; box.style.position='relative'; box.style.overflow='auto';
      const closeBtn = document.createElement('button'); closeBtn.textContent='✖'; closeBtn.className='file-action remove'; closeBtn.style.position='absolute'; closeBtn.style.top='8px'; closeBtn.style.right='8px'; box.appendChild(closeBtn);
      const content = document.createElement('div'); content.className='preview-content'; content.style.maxHeight='80vh'; content.style.overflow='auto'; box.appendChild(content);
      ov.appendChild(box);
      // handlers
      function onClose(){ closePreview(); }
      closeBtn.addEventListener('click', onClose);
      ov.addEventListener('click', (ev)=>{ if(ev.target === ov) onClose(); });
      document.addEventListener('keydown', onKeyPreview);
      previewOverlay = { el: ov, content, handlers: { onClose, onKey: onKeyPreview, closeBtn } };
      return previewOverlay;
    }
    function onKeyPreview(e){ if(e.key === 'Escape') closePreview(); }
    function showPreviewFor(file){ if(!file) return; const p = createPreviewOverlay(); p.content.innerHTML='';
      if(file.type.startsWith('image/')){
        const img = document.createElement('img'); img.src = file._objUrl || ''; img.style.maxWidth='100%'; img.style.maxHeight='80vh'; img.style.display='block'; p.content.appendChild(img);
        document.body.appendChild(p.el);
      } else if (file.type === 'application/pdf'){
        // try embed
        const embed = document.createElement('embed'); embed.src = file._objUrl || ''; embed.type = 'application/pdf'; embed.style.width='80vw'; embed.style.height='80vh';
        p.content.appendChild(embed);
        document.body.appendChild(p.el);
        // fallback: if embed fails, open in new tab
        setTimeout(()=>{
          const emb = p.content.querySelector('embed'); if(emb && emb.clientWidth===0) window.open(file._objUrl,'_blank');
        }, 300);
      } else {
        // fallback open in new tab
        window.open(file._objUrl || '', '_blank');
      }
    }
    function closePreview(){ if(!previewOverlay) return; try{ document.removeEventListener('keydown', onKeyPreview); previewOverlay.el.remove(); }catch(_){ } previewOverlay=null; }

    // show preview on eye icon
    const eyeBtn = voucherInfo?.querySelector('.file-action.view');
    eyeBtn?.addEventListener('click', ()=>{
      const f = selectedVoucherFile; if(!f) return;
      showPreviewFor(f);
    });

    // cleanup on modal close
    const modalEl = document.getElementById('modalTransaccion');
    function cleanupOnClose(){
      // revoke objectURL
      try{ if(selectedVoucherFile && selectedVoucherFile._objUrl) { URL.revokeObjectURL(selectedVoucherFile._objUrl); } }catch(_){ }
      selectedVoucherFile = null;
      if(inputVoucher) inputVoucher.value = '';
      if(voucherInfo) voucherInfo.style.display = 'none';
      closePreview();
      // remove event listeners (best-effort)
      try{ eyeBtn?.removeEventListener('click', ()=>{}); btnAdjuntar?.removeEventListener('click', ()=>{}); btnRemove?.removeEventListener('click', ()=>{}); inputVoucher?.removeEventListener('change', ()=>{}); }catch(_){ }
    }
    modalEl?.addEventListener('modal:closed', cleanupOnClose);

  }catch(e){ console.warn('No se pudieron cargar selects de transacciones', e); }
}

async function fetchTransacciones(){
  const supabase = getClient();
  const { data, error } = await supabase.from('transacciones').select('*').order('created_at', {ascending:false}).limit(200);
  return { rows: data || [], error };
}

export async function renderTransacciones(){
  const cont = $('#transContent');
  cont.innerHTML = 'Cargando…';
  const r = await fetchTransacciones();
  if (r.error) return cont.innerHTML = '<div class="error">' + esc(r.error.message) + '</div>';
  if (!r.rows.length) return cont.innerHTML = '<div class="empty">No hay transacciones.</div>';

  const table = el('table', { class: 'list' });
  const thead = el('thead');
  thead.innerHTML = '<tr><th>Fecha</th><th>Origen</th><th>Destino</th><th>Valor</th><th>Comentario</th></tr>';
  table.appendChild(thead);
  const tbody = el('tbody');
  r.rows.forEach(t => {
    const tr = el('tr');
    tr.innerHTML = '<td>'+ esc(String(t.fecha||'')) +'</td>' +
                   '<td>'+ esc(String(t.origen_socio_id||t.origen_categoria_id||'')) +'</td>' +
                   '<td>'+ esc(String(t.destino_socio_id||t.destino_categoria_id||'')) +'</td>' +
                   '<td>$'+ esc(String(t.valor||0)) +'</td>' +
                   '<td>'+ esc(String(t.comentario||'')) +'</td>';
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  cont.innerHTML = '';
  cont.appendChild(table);
}

/* Form submit handling (delegated from app.js binding) */
export async function handleTransaccionFormSubmit(e){
  e.preventDefault();
  const f = e.target;

  // Recolectar campos obligatorios faltantes
  const missing = [];
  if (!f.origen_categoria_id.value) missing.push('Categoría origen');
  if (!f.origen_socio_id.value) missing.push('Socio origen');
  if (!f.destino_categoria_id.value) missing.push('Categoría destino');
  if (!f.destino_socio_id.value) missing.push('Socio destino');
  if (!f.valor.value || !String(f.valor.value).trim()) missing.push('Valor');
  if (!f.fecha.value) missing.push('Fecha y hora');

  const errElId = 'transError';
  let errEl = document.getElementById(errElId);
  if (!errEl){ errEl = document.createElement('div'); errEl.id = errElId; errEl.className='error-list'; f.prepend(errEl); }
  if (missing.length){
    errEl.innerHTML = '<strong>Faltan campos obligatorios:</strong><br>' + missing.map(m=> '- ' + m).join('<br>');
    return;
  }
  errEl.innerHTML = '';

  // Comentario obligatorio (UI requirement)
  const comentarioInput = f.comentario;
  let comentarioErr = document.getElementById('comentarioError');
  if (!comentarioErr){ comentarioErr = document.createElement('div'); comentarioErr.id='comentarioError'; comentarioErr.className='field-error'; comentarioInput.after(comentarioErr); }
  const comentarioVal = String(comentarioInput.value || '');
  if (!comentarioVal.trim()){
    comentarioErr.textContent = 'El comentario es obligatorio.';
    comentarioInput.setAttribute('aria-invalid','true'); comentarioInput.classList.add('invalid');
    return;
  }
  // clear comentario error if any
  comentarioErr.textContent = '';
  comentarioInput.removeAttribute('aria-invalid'); comentarioInput.classList.remove('invalid');

  // Convertir fecha local (datetime-local asume hora en Bogotá) -> ISO UTC
  function colombiaLocalToIsoUtc(localDatetimeValue){
    const colombiaOffsetMinutes = -300; // -5 * 60
    const [date, time] = localDatetimeValue.split('T');
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const utcMillis = Date.UTC(y, m - 1, d, hh, mm) - (colombiaOffsetMinutes * 60000);
    return new Date(utcMillis).toISOString();
  }

  // Parse currency colombiana: ejemplo "1.234.567,89" -> 1234567.89
  function parseCurrencyToNumber(str){
    if(!str) return 0;
    // quitar espacios y prefijos
    let s = String(str).replace(/\s/g,'').replace(/\$/g,'');
    // eliminar puntos de miles, cambiar coma decimal por punto
    s = s.replace(/\./g,'').replace(/,/g,'.');
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }

  const valorNum = parseCurrencyToNumber(f.valor.value);
  if (!valorNum || valorNum <= 0){ errEl.innerHTML = '<strong>Error:</strong> El valor debe ser mayor que 0'; return; }

  const payload = {
    p_origen_categoria_id: f.origen_categoria_id.value || null,
    p_origen_socio_id: f.origen_socio_id.value || null,
    p_destino_categoria_id: f.destino_categoria_id.value || null,
    p_destino_socio_id: f.destino_socio_id.value || null,
    p_valor: valorNum,
    p_fecha: colombiaLocalToIsoUtc(f.fecha.value),
    p_comentario: f.comentario.value || null,
    p_voucher_url: null,
    p_voucher_type: null
  };

  try{
    const supabase = getClient();
    // if there's a selected voucher file attached to the form, upload to storage first
    const selectedVoucher = (f._getSelectedVoucher && typeof f._getSelectedVoucher === 'function') ? f._getSelectedVoucher() : null;
    if (selectedVoucher){
      try{
        const path = `vouchers/${Date.now()}_${selectedVoucher.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
        const up = await supabase.storage.from('transacciones').upload(path, selectedVoucher, { upsert: false });
        if (!up.error){
          const pub = supabase.storage.from('transacciones').getPublicUrl(path);
          payload.p_voucher_url = pub?.data?.publicUrl || null;
          payload.p_voucher_type = selectedVoucher.type || null;
        } else {
          console.warn('No se pudo subir voucher, procediendo sin él', up.error.message);
        }
      }catch(e){ console.warn('Error subiendo voucher', e); }
    }

    const { data, error } = await supabase.rpc('insert_transaccion_and_update_balances', payload);
    if (error) throw error;
    closeTransaccionModal();
    await renderTransacciones();
    alert('Transacción creada');
  }catch(err){
    console.error(err);
    errEl.textContent = 'No se pudo crear la transacción: ' + (err.message || String(err));
  }
}

// Listener to support opening modal after mounting the transacciones view (used by Socios FAB)
window.addEventListener('openTransaccionAfterMount', async ()=>{
  try{ openTransaccionModal(); await prepareTransaccionModal(); }catch(_){ }
});
