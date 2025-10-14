// js/ui/actions-delegation.js - Delegación de eventos para acciones UI
// Un solo listener que maneja todos los clics con data-action

// Registra UNA sola vez la delegación global
if (!window.__actionsBound) {
  window.__actionsBound = true;
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('[data-action]');
    if (!btn) return;
    
    const action = btn.getAttribute('data-action');
    try { 
      console.debug('[actions]', action, location.hash); 
    } catch(_){}
    
    if (btn.tagName === 'A' || btn.tagName === 'BUTTON') ev.preventDefault();
    
    try {
      switch (action) {
        case 'open-new-transaction': {
          const { openTransaccionModal } = await import('../ui/modals.js');
          const { prepareTransaccionModal } = await import('../views/transacciones.js');
          openTransaccionModal();
          try { 
            await prepareTransaccionModal(); 
          } catch (e) { 
            console.warn('prepareTransaccionModal fallo', e); 
          }
          break;
        }
        case 'open-new-product': {
          const modal = document.getElementById('modalProducto');
          if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
              const firstInput = modal.querySelector('input');
              if (firstInput) firstInput.focus();
            }, 100);
          }
          break;
        }
        case 'open-new-category': {
          const { openCatModal } = await import('../ui/modals.js');
          openCatModal('create');
          break;
        }
        case 'open-new-partner': {
          const { openSocioModal } = await import('../ui/modals.js');
          openSocioModal('create');
          break;
        }
        case 'edit-category': {
          const id = btn.getAttribute('data-id');
          let row = null;
          if (id) {
            const { getClient } = await import('../services/supabase.js');
            const supabase = getClient();
            const { data } = await supabase.from('categorias_socios').select('*').eq('id', id).single();
            row = data || null;
          }
          const { openCatModal } = await import('../ui/modals.js');
          openCatModal('edit', row);
          break;
        }
        case 'edit-partner': {
          const id = btn.getAttribute('data-id');
          let row = null;
          if (id) {
            const { getClient } = await import('../services/supabase.js');
            const supabase = getClient();
            const { data } = await supabase.from('socios').select('*').eq('id', id).single();
            row = data || null;
          }
          const { openSocioModal } = await import('../ui/modals.js');
          openSocioModal('edit', row);
          break;
        }
        case 'delete-category':
        case 'delete-partner': {
          const id = btn.getAttribute('data-id');
          const { openConfirm } = await import('../ui/modals.js');
          openConfirm('¿Seguro?', async () => {
            const { getClient } = await import('../services/supabase.js');
            const supabase = getClient();
            if (action === 'delete-category') {
              await supabase.from('categorias_socios').delete().eq('id', id);
            } else {
              await supabase.from('socios').delete().eq('id', id);
            }
            try {
              const hash = (location.hash || '#socios').slice(1);
              const mod = await import(`../views/${hash}.js`).catch(()=>({default:null}));
              if (typeof mod.renderTransacciones === 'function') mod.renderTransacciones();
              if (typeof mod.loadCategorias === 'function') mod.loadCategorias();
              if (typeof mod.openSociosList === 'function') mod.openSociosList();
            } catch(_) {}
          }, 'Confirmar eliminación');
          break;
        }
        case 'inv:edit-disponible': {
          const productId = btn.getAttribute('data-product-id');
          if (productId) {
            const { openEditarDisponibleModal } = await import('../views/inventario.js');
            openEditarDisponibleModal(productId);
          }
          break;
        }
        case 'inv:edit-lote': {
          const loteId = btn.getAttribute('data-lote-id');
          if (loteId) {
            const { openEditarLoteModal } = await import('../views/inventario.js');
            openEditarLoteModal(loteId);
          }
          break;
        }
        case 'inv:delete-lote': {
          const loteId = btn.getAttribute('data-lote-id');
          if (loteId) {
            const { deleteLote } = await import('../views/inventario.js');
            deleteLote(loteId);
          }
          break;
        }
        default: {/* noop */}
      }
    } catch (err) { 
      console.error('[actions] handler error:', action, err); 
    }
  }, { capture:false, passive:false });
}
