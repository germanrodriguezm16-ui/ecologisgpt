/**
 * Módulo Inventario - Gestión de stock operativo, movimientos y análisis
 * Implementa sistema FIFO, tarjetas de productos y persistencia de pestañas
 */

import { el } from '../utils/dom.js';
import { isoUtcToBogotaLabelShort } from '../utils/datetime.js';
import { getClient } from '../services/supabase.js';
// FAB se maneja centralmente en fab-manager.js

// Estado del módulo
let currentTab = localStorage.getItem('inventoryTab') || 'stock';
let productos = [];
let movimientos = [];
let proveedores = [];

// Elementos DOM
let containerEl;
let tabsContainer;
let tabContent;
let fabButton;

/**
 * Inicializa el módulo de inventario
 */
export function initInventario(container) {
  containerEl = container;
  
  // Configurar FAB para inventario
  // FAB se maneja centralmente en fab-manager.js
  
  setupHTML();
  setupEventListeners();
  loadData();
}

/**
 * Configura la estructura HTML del módulo
 */
function setupHTML() {
  containerEl.innerHTML = `
    <div class="inventario-module">
      <!-- Header con título y controles -->
      <div class="module-header">
        <h2>📦 Inventario</h2>
        <div class="header-controls">
          <div class="balance-info" id="balanceInfo" style="display: none;">
            <span class="balance-label">Valor Total FIFO:</span>
            <span class="balance-value" id="totalFifoValue">$ 0</span>
          </div>
        </div>
      </div>

      <!-- Pestañas del módulo -->
      <div class="tabs-container">
        <div class="tabs-header">
          <button class="tab-btn ${currentTab === 'stock' ? 'active' : ''}" data-tab="stock">
            📊 Stock Operativo
          </button>
          <button class="tab-btn ${currentTab === 'movimientos' ? 'active' : ''}" data-tab="movimientos">
            📋 Movimientos
          </button>
          <button class="tab-btn ${currentTab === 'analisis' ? 'active' : ''}" data-tab="analisis">
            📈 Análisis
          </button>
        </div>
        
        <div class="tab-content">
          <!-- Pestaña 1: Stock Operativo -->
          <div class="tab-panel ${currentTab === 'stock' ? 'active' : ''}" id="stockPanel">
            <div class="stock-container">
              <div class="stock-header">
                <div class="search-container">
                  <input type="text" id="stockSearch" placeholder="Buscar productos..." class="search-input">
                </div>
                <div class="stock-actions">
                  <button class="btn btn--secondary" id="btnRefreshStock">🔄 Actualizar</button>
                </div>
              </div>
              <div class="productos-list" id="productosList">
                <div class="loading-state">Cargando productos...</div>
              </div>
            </div>
          </div>

          <!-- Pestaña 2: Movimientos -->
          <div class="tab-panel ${currentTab === 'movimientos' ? 'active' : ''}" id="movimientosPanel">
            <div class="movimientos-container">
              <div class="movimientos-header">
                <div class="filters-container">
                  <select id="filterProducto" class="filter-select">
                    <option value="">Todos los productos</option>
                  </select>
                  <input type="date" id="filterFechaInicio" class="filter-date">
                  <input type="date" id="filterFechaFin" class="filter-date">
                  <button class="btn btn--secondary" id="btnApplyFilters">Filtrar</button>
                </div>
                <button class="btn btn--primary" id="btnCargarStock">📦 Cargar stock</button>
              </div>
              <div class="movimientos-table-container" id="movimientosTable">
                <div class="loading-state">Cargando movimientos...</div>
              </div>
            </div>
          </div>

          <!-- Pestaña 3: Análisis -->
          <div class="tab-panel ${currentTab === 'analisis' ? 'active' : ''}" id="analisisPanel">
            <div class="analisis-container">
              <div class="analisis-placeholder">
                <div class="placeholder-icon">📈</div>
                <h3>Análisis de Inventario</h3>
                <p>Esta sección se habilitará en próximas iteraciones.</p>
                <div class="placeholder-cards">
                  <div class="placeholder-card">
                    <h4>Rotación de Stock</h4>
                    <p>Análisis de velocidad de venta por producto</p>
                  </div>
                  <div class="placeholder-card">
                    <h4>Valoración FIFO</h4>
                    <p>Valor actual del inventario por método FIFO</p>
                  </div>
                  <div class="placeholder-card">
                    <h4>Tendencias</h4>
                    <p>Predicción de demanda y reposición</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón flotante para crear producto -->
      <button class="fab" id="fabProducto" title="Crear producto (N)">
        <svg viewBox="0 0 48 32" width="36" height="24">
          <rect x="2" y="4" width="44" height="24" rx="4" fill="#f97316" stroke="#ea580c" stroke-width="1"/>
          <text x="24" y="18" text-anchor="middle" fill="white" font-size="8" font-weight="bold">📦</text>
        </svg>
      </button>
    </div>
  `;

  tabsContainer = containerEl.querySelector('.tabs-container');
  tabContent = containerEl.querySelector('.tab-content');
  fabButton = containerEl.querySelector('.fab');
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
  // Pestañas
  const tabButtons = containerEl.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchTab(tab);
    });
  });

  // FAB para crear producto
  fabButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openProductoModal();
  });

  // Tecla rápida N para nuevo producto
  document.addEventListener('keydown', (e) => {
    if (e.key === 'n' && e.ctrlKey && currentTab === 'stock') {
      e.preventDefault();
      openProductoModal();
    }
  });

  // Búsqueda de productos
  const stockSearch = containerEl.querySelector('#stockSearch');
  if (stockSearch) {
    stockSearch.addEventListener('input', (e) => {
      filterProductos(e.target.value);
    });
  }

  // Botón actualizar stock
  const btnRefresh = containerEl.querySelector('#btnRefreshStock');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      loadProductos();
    });
  }

  // Filtros de movimientos
  const btnApplyFilters = containerEl.querySelector('#btnApplyFilters');
  if (btnApplyFilters) {
    btnApplyFilters.addEventListener('click', () => {
      loadMovimientos();
    });
  }

  // Botón cargar stock
  const btnCargarStock = containerEl.querySelector('#btnCargarStock');
  if (btnCargarStock) {
    btnCargarStock.addEventListener('click', () => {
      openCargarStockModal();
    });
  }

  // Event listeners para el modal de producto
  const modalProducto = document.getElementById('modalProducto');
  const btnCancelProducto = document.getElementById('btnCancelProducto');
  const btnCloseProducto = document.getElementById('btnCloseProducto');
  const formProducto = document.getElementById('formProducto');

  if (btnCancelProducto) {
    btnCancelProducto.addEventListener('click', closeProductoModal);
  }

  if (btnCloseProducto) {
    btnCloseProducto.addEventListener('click', closeProductoModal);
  }

  if (formProducto) {
    formProducto.addEventListener('submit', handleProductoFormSubmit);
  }

  // Event listeners para modal de editar disponible
  const btnCancelEditarDisponible = document.getElementById('btnCancelEditarDisponible');
  const btnCloseEditarDisponible = document.getElementById('btnCloseEditarDisponible');
  const formEditarDisponible = document.getElementById('formEditarDisponible');
  
  if (btnCancelEditarDisponible) {
    btnCancelEditarDisponible.addEventListener('click', closeEditarDisponibleModal);
  }
  if (btnCloseEditarDisponible) {
    btnCloseEditarDisponible.addEventListener('click', closeEditarDisponibleModal);
  }
  if (formEditarDisponible) {
    formEditarDisponible.addEventListener('submit', handleEditarDisponibleSubmit);
  }

  // Event listeners para modal de editar lote
  const btnCancelEditarLote = document.getElementById('btnCancelEditarLote');
  const btnCloseEditarLote = document.getElementById('btnCloseEditarLote');
  const formEditarLote = document.getElementById('formEditarLote');
  
  if (btnCancelEditarLote) {
    btnCancelEditarLote.addEventListener('click', closeEditarLoteModal);
  }
  if (btnCloseEditarLote) {
    btnCloseEditarLote.addEventListener('click', closeEditarLoteModal);
  }
  if (formEditarLote) {
    formEditarLote.addEventListener('submit', handleEditarLoteSubmit);
  }
}

/**
 * Cambia entre pestañas
 */
function switchTab(tab) {
  // Actualizar estado
  currentTab = tab;
  localStorage.setItem('inventoryTab', tab);

  // Actualizar botones
  const tabButtons = containerEl.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Actualizar paneles
  const panels = containerEl.querySelectorAll('.tab-panel');
  panels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tab}Panel`);
  });

  // Cargar datos según la pestaña
  if (tab === 'stock') {
    loadProductos();
  } else if (tab === 'movimientos') {
    loadMovimientos();
  }
}

/**
 * Carga todos los datos iniciales
 */
async function loadData() {
  try {
    await Promise.all([
      loadProveedores(),
      loadProductos(),
      loadMovimientos()
    ]);
  } catch (error) {
    console.error('Error cargando datos de inventario:', error);
  }
}

/**
 * Carga la lista de proveedores
 */
async function loadProveedores() {
  try {
    // Primero obtener la categoría de proveedores
    const { data: categoriaData, error: categoriaError } = await getClient()
      .from('categorias_socios')
      .select('id')
      .eq('nombre', 'Proveedores')
      .single();

    if (categoriaError) {
      console.warn('No se encontró categoría de proveedores:', categoriaError);
      proveedores = [];
      updateProveedorSelects();
      return;
    }

    // Luego obtener los socios de esa categoría
    const { data, error } = await getClient()
      .from('socios')
      .select('id, empresa')
      .eq('categoria_id', categoriaData.id)
      .order('empresa');

    if (error) throw error;
    
    proveedores = data || [];
    updateProveedorSelects();
  } catch (error) {
    console.error('Error cargando proveedores:', error);
    proveedores = [];
    updateProveedorSelects();
  }
}

/**
 * Actualiza los selects de proveedores en los formularios
 */
function updateProveedorSelects() {
  const selects = document.querySelectorAll('select[name="supplier_id"], #filterProducto');
  selects.forEach(select => {
    if (select.name === 'supplier_id') {
      // Select para modal de producto
      const currentValue = select.value;
      select.innerHTML = '<option value="" disabled selected hidden>Seleccione proveedor</option>';
      
      proveedores.forEach(proveedor => {
        const option = el('option', { value: proveedor.id }, [proveedor.empresa]);
        select.appendChild(option);
      });
      
      if (currentValue) select.value = currentValue;
    } else if (select.id === 'filterProducto') {
      // Select para filtro de movimientos
      const currentValue = select.value;
      select.innerHTML = '<option value="">Todos los productos</option>';
      
      productos.forEach(producto => {
        const option = el('option', { value: producto.id }, [`${producto.name} (${producto.sku})`]);
        select.appendChild(option);
      });
      
      if (currentValue) select.value = currentValue;
    }
  });
}

/**
 * Carga la lista de productos con stock
 */
async function loadProductos() {
  const productosList = containerEl.querySelector('#productosList');
  if (!productosList) return;

  try {
    productosList.innerHTML = '<div class="loading-state">Cargando productos...</div>';

    console.log('Cargando productos desde Supabase...');
    
    // Cargar productos reales desde Supabase
    const { data: productosData, error } = await getClient()
      .from('productos')
      .select(`
        *,
        proveedor:supplier_id (
          id,
          empresa
        )
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error en consulta de productos:', error);
      throw error;
    }

    console.log('Productos cargados desde Supabase:', productosData);
    console.log('Primer producto (ejemplo):', productosData[0]);

    // Mapear productos y calcular contadores reales desde lotes
    productos = await Promise.all(productosData.map(async (producto) => {
      // Calcular contadores reales desde lotes
      const { data: stockData, error: stockError } = await getClient()
        .from('vw_stock_operativo_counts')
        .select('disponible, comprometido, en_reparto, en_devolucion, total_bodega')
        .eq('id', producto.id)
        .single();
      
      const contadores = stockError ? {
        disponible: 0,
        comprometido: 0,
        en_reparto: 0,
        en_devolucion: 0,
        total_bodega: 0
      } : stockData;
      
      return {
        ...producto,
        // Mapear nombres de columnas para compatibilidad
        precio_compra_default: producto.buy_price,
        precio_venta_default: producto.sell_price,
        // Contadores reales desde la vista
        disponible: contadores.disponible || 0,
        comprometido: contadores.comprometido || 0,
        en_reparto: contadores.en_reparto || 0,
        en_devolucion: contadores.en_devolucion || 0,
        total_bodega: contadores.total_bodega || 0
      };
    }));
    
    console.log('Productos mapeados:', productos);

    renderProductos(productos);
  } catch (error) {
    console.error('Error cargando productos:', error);
    productosList.innerHTML = '<div class="error-state">Error cargando productos: ' + error.message + '</div>';
  }
}

/**
 * Renderiza la lista de productos
 */
function renderProductos(productosList) {
  const container = containerEl.querySelector('#productosList');
  if (!container) return;

  if (!productosList || productosList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>No hay productos</h3>
        <p>Comienza agregando tu primer producto al inventario.</p>
        <button class="btn btn--primary" onclick="openProductoModal()">+ Crear Producto</button>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  
  productosList.forEach(producto => {
    const card = createProductoCard(producto);
    container.appendChild(card);
  });
}

/**
 * Crea una tarjeta de producto
 */
function createProductoCard(producto) {
  const totalBodega = producto.disponible + producto.comprometido;
  const utilidadBruta = producto.sell_price - producto.buy_price;
  
  const card = el('div', { 
    class: 'producto-card',
    'data-producto-id': producto.id,
    'data-action': 'toggle',
    style: { cursor: 'pointer' }
  }, [
    // Header de la tarjeta
    el('div', { class: 'producto-header' }, [
      el('div', { class: 'producto-info' }, [
        el('h4', { class: 'producto-name' }, [producto.name]),
        el('span', { class: 'producto-sku' }, [producto.sku])
      ]),
      el('div', { class: 'producto-actions' }, [
        el('button', { 
          class: 'btn-icon btn-icon--edit',
          title: 'Editar producto',
          'data-producto-id': producto.id,
          'data-action': 'edit'
        }, ['✏️']),
        el('button', { 
          class: 'btn-icon btn-icon--delete',
          title: 'Eliminar producto',
          'data-producto-id': producto.id,
          'data-action': 'delete'
        }, ['🗑️']),
        el('button', { 
          class: 'btn-icon btn-icon--expand',
          title: 'Ver detalles',
          'aria-expanded': 'false',
          'data-producto-id': producto.id,
          'data-action': 'toggle'
        }, ['▼'])
      ])
    ]),

    // Contadores de stock
    el('div', { class: 'producto-stock' }, [
      el('div', { class: 'stock-badges' }, [
        el('div', { class: 'badge badge--success', 'data-counter': 'disponible', 'data-action': 'inv:edit-disponible', 'data-product-id': producto.id, style: { cursor: 'pointer' } }, [
          el('span', { class: 'badge-icon' }, ['📦']),
          el('span', { class: 'badge-label' }, ['Disponible']),
          el('span', { class: 'badge-value' }, [String(producto.disponible)])
        ]),
        el('div', { class: 'badge badge--warning', 'data-counter': 'comprometido' }, [
          el('span', { class: 'badge-icon' }, ['🔒']),
          el('span', { class: 'badge-label' }, ['Comprometido']),
          el('span', { class: 'badge-value' }, [String(producto.comprometido)])
        ]),
        el('div', { class: 'badge badge--info', 'data-counter': 'en_reparto' }, [
          el('span', { class: 'badge-icon' }, ['🚚']),
          el('span', { class: 'badge-label' }, ['En reparto']),
          el('span', { class: 'badge-value' }, [String(producto.en_reparto)])
        ]),
        el('div', { class: 'badge badge--danger', 'data-counter': 'en_devolucion' }, [
          el('span', { class: 'badge-icon' }, ['↩️']),
          el('span', { class: 'badge-label' }, ['En devolución']),
          el('span', { class: 'badge-value' }, [String(producto.en_devolucion)])
        ])
      ]),
      el('div', { class: 'stock-total' }, [
        el('span', { class: 'total-label' }, ['Total bodega:']),
        el('span', { class: 'total-value badge', 'data-counter': 'total_bodega' }, [String(totalBodega)])
      ])
    ]),

    // Vista extendida (oculta inicialmente)
    el('div', { 
      class: 'producto-details',
      id: `details-${producto.id}`,
      style: { display: 'none' }
    }, [
      el('div', { class: 'details-section' }, [
        el('h5', {}, ['Información del Producto']),
        el('div', { class: 'details-grid' }, [
          el('div', { class: 'detail-item' }, [
            el('span', { class: 'detail-label' }, ['Proveedor:']),
            el('span', { class: 'detail-value' }, [getProveedorName(producto.supplier_id)])
          ]),
          el('div', { class: 'detail-item' }, [
            el('span', { class: 'detail-label' }, ['Precio compra:']),
            el('span', { class: 'detail-value' }, [`$ ${producto.buy_price.toLocaleString()}`])
          ]),
          el('div', { class: 'detail-item' }, [
            el('span', { class: 'detail-label' }, ['Precio venta:']),
            el('span', { class: 'detail-value' }, [`$ ${producto.sell_price.toLocaleString()}`])
          ]),
          el('div', { class: 'detail-item' }, [
            el('span', { class: 'detail-label' }, ['Utilidad bruta:']),
            el('span', { class: 'detail-value' }, [`$ ${utilidadBruta.toLocaleString()}`])
          ])
        ])
      ]),

      // Tabla de lotes FIFO
      el('div', { class: 'details-section' }, [
        el('h5', {}, ['Lotes FIFO Activos']),
        el('div', { class: 'lotes-table-container' }, [
          el('table', { class: 'lotes-table fifo-table' }, [
            el('thead', {}, [
              el('tr', {}, [
                el('th', {}, ['Fecha']),
                el('th', {}, ['Cantidad']),
                el('th', {}, ['Proveedor']),
                el('th', {}, ['Precio Unit.']),
                el('th', {}, ['Total Lote']),
                el('th', {}, ['Acciones'])
              ])
            ]),
            el('tbody', { id: `lotes-${producto.id}` }, [
              // Se cargará dinámicamente
              el('tr', {}, [
                el('td', { colspan: 6, class: 'loading-lotes' }, ['Cargando lotes...'])
              ])
            ])
          ])
        ])
      ])
    ])
  ]);

  // Event listener para toda la tarjeta (expandir/colapsar)
  card.addEventListener('click', (e) => {
    // Solo expandir si no se hizo clic en un botón de acción específico
    const actionElement = e.target.closest('[data-action]');
    if (!actionElement || actionElement === card) {
      window.toggleProductoDetails(producto.id);
    } else {
      // Verificar si es un botón de lote (permitir que funcione)
      const action = actionElement.getAttribute('data-action');
      if (action === 'inv:edit-lote' || action === 'inv:delete-lote') {
        // Permitir que el botón de lote funcione, no expandir tarjeta
        return;
      }
      // Para otros botones de acción, no expandir la tarjeta
    }
  });

  // Event listeners para botones de acción
  const editBtn = card.querySelector('[data-action="edit"]');
  const deleteBtn = card.querySelector('[data-action="delete"]');

  if (editBtn) {
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que se propague al clic de la tarjeta
      window.editProducto(producto.id);
    });
  }
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Evitar que se propague al clic de la tarjeta
      window.deleteProducto(producto.id);
    });
  }

  return card;
}

/**
 * Obtiene el nombre del proveedor por ID
 */
function getProveedorName(supplierId) {
  if (!supplierId) return 'Sin proveedor';
  
  // Primero buscar en el array de proveedores cargado
  const proveedor = proveedores.find(p => p.id === supplierId);
  if (proveedor) return proveedor.empresa;
  
  // Si no se encuentra, buscar en los datos del producto actual
  const productoActual = productos.find(p => p.supplier_id === supplierId);
  if (productoActual && productoActual.proveedor) {
    return productoActual.proveedor.empresa;
  }
  
  return 'Sin proveedor';
}

/**
 * Filtra productos por término de búsqueda
 */
function filterProductos(searchTerm) {
  if (!searchTerm) {
    renderProductos(productos);
    return;
  }

  const filtered = productos.filter(producto => 
    producto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  renderProductos(filtered);
}

/**
 * Carga los movimientos de inventario
 */
async function loadMovimientos() {
  const container = containerEl.querySelector('#movimientosTable');
  if (!container) return;

  try {
    container.innerHTML = '<div class="loading-state">Cargando movimientos...</div>';

    // TODO: Implementar cuando esté la tabla stock_ledger
    // Por ahora mostramos datos de prueba
    movimientos = [
      {
        id: '1',
        product_id: '1',
        kind: 'in',
        qty: 20,
        unit_value: 25000,
        total_value: 500000,
        ref_type: 'lote',
        ref_id: 'LOT-001',
        note: 'Carga inicial de mercancía',
        created_at: '2025-01-13T10:30:00Z'
      },
      {
        id: '2',
        product_id: '1',
        kind: 'out',
        qty: 5,
        unit_value: 25000,
        total_value: 125000,
        ref_type: 'venta',
        ref_id: 'VTA-001',
        note: 'Venta a cliente',
        created_at: '2025-01-13T14:15:00Z'
      }
    ];

    renderMovimientos(movimientos);
  } catch (error) {
    console.error('Error cargando movimientos:', error);
    container.innerHTML = '<div class="error-state">Error cargando movimientos</div>';
  }
}

/**
 * Renderiza la tabla de movimientos
 */
function renderMovimientos(movimientosList) {
  const container = containerEl.querySelector('#movimientosTable');
  if (!container) return;

  if (!movimientosList || movimientosList.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>No hay movimientos</h3>
        <p>Los movimientos de inventario aparecerán aquí.</p>
      </div>
    `;
    return;
  }

  const table = el('table', { class: 'table-visual' }, [
    el('thead', {}, [
      el('tr', {}, [
        el('th', {}, ['Fecha']),
        el('th', {}, ['Concepto']),
        el('th', {}, ['Cantidad']),
        el('th', {}, ['Valor Unit.']),
        el('th', {}, ['Total'])
      ])
    ]),
    el('tbody', {}, 
      movimientosList.map(mov => {
        const producto = productos.find(p => p.id === mov.product_id);
        const concepto = buildMovimientoConcepto(mov, producto);
        
        return el('tr', {}, [
          el('td', { class: 'tx-col-fecha' }, [isoUtcToBogotaLabelShort(mov.created_at)]),
          el('td', { class: 'tx-col-concepto' }, [concepto]),
          el('td', {}, [String(mov.qty)]),
          el('td', {}, [`$ ${mov.unit_value.toLocaleString()}`]),
          el('td', { class: 'tx-col-valor' }, [`$ ${mov.total_value.toLocaleString()}`])
        ]);
      })
    )
  ]);

  container.innerHTML = '';
  container.appendChild(table);
}

/**
 * Construye el concepto de un movimiento
 */
function buildMovimientoConcepto(mov, producto) {
  const productoName = producto ? producto.name : 'Producto desconocido';
  const tipoIcon = mov.kind === 'in' ? '📥' : mov.kind === 'out' ? '📤' : '⚖️';
  const tipoTexto = mov.kind === 'in' ? 'Entrada' : mov.kind === 'out' ? 'Salida' : 'Ajuste';
  
  return el('div', { class: 'tx-concepto' }, [
    el('span', { class: 'tx-icon' }, [tipoIcon]),
    el('span', { class: 'tx-badge', 'data-tipo': tipoTexto }, [tipoTexto]),
    el('span', {}, [`${productoName} - ${mov.note}`])
  ]);
}

/**
 * Maneja el envío del formulario de producto
 */
async function handleProductoFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  
  const producto = {
    name: formData.get('name'),
    sku: formData.get('sku'),
    supplier_id: formData.get('supplier_id') || null,
    buy_price: parseFloat(formData.get('buy_price')),
    sell_price: parseFloat(formData.get('sell_price'))
  };

  // Validaciones básicas
  if (!producto.name || !producto.sku || !producto.buy_price || !producto.sell_price) {
    alert('Por favor completa todos los campos obligatorios');
    return;
  }

  if (producto.buy_price <= 0 || producto.sell_price <= 0) {
    alert('Los precios deben ser mayores a 0');
    return;
  }

  try {
    // Guardar en Supabase
    const { data, error } = await getClient()
      .from('productos')
      .insert([producto])
      .select()
      .single();

    if (error) throw error;

    console.log('Producto guardado exitosamente:', data);
    
    // Cerrar modal
    closeProductoModal();
    
    // Recargar la lista completa desde Supabase
    await loadProductos();
    
    // Mostrar mensaje de éxito
    alert('Producto creado exitosamente');
    
  } catch (error) {
    console.error('Error guardando producto:', error);
    alert('Error al guardar el producto: ' + error.message);
  }
}

/**
 * Abre el modal de producto
 */
function openProductoModal() {
  const modal = document.getElementById('modalProducto');
  const title = document.getElementById('modalProductoTitle');
  const form = document.getElementById('formProducto');
  
  title.innerHTML = '<span class="modal-icon">📦</span> Nuevo Producto';
  form.reset();
  
  modal.style.display = 'flex';
  
  // Enfocar el primer input
  setTimeout(() => {
    const firstInput = form.querySelector('input[name="name"]');
    if (firstInput) firstInput.focus();
  }, 100);
}

/**
 * Cierra el modal de producto
 */
function closeProductoModal() {
  const modal = document.getElementById('modalProducto');
  const form = document.getElementById('formProducto');
  
  modal.style.display = 'none';
  form.reset();
}

/**
 * Función global para editar producto (llamada desde HTML)
 */
window.editProducto = function(productId) {
  const producto = productos.find(p => p.id === productId);
  if (!producto) return;

  const modal = document.getElementById('modalProducto');
  const title = document.getElementById('modalProductoTitle');
  const form = document.getElementById('formProducto');
  
  title.innerHTML = '<span class="modal-icon">📦</span> Editar Producto';
  
  // Llenar el formulario
  form.name.value = producto.name;
  form.sku.value = producto.sku;
  form.supplier_id.value = producto.supplier_id;
  form.buy_price.value = producto.buy_price;
  form.sell_price.value = producto.sell_price;
  
  modal.style.display = 'flex';
};

/**
 * Función global para eliminar producto (llamada desde HTML)
 */
window.deleteProducto = function(productId) {
  const producto = productos.find(p => p.id === productId);
  if (!producto) return;

  // TODO: Implementar validación de lotes y ledger
  if (confirm(`¿Estás seguro de eliminar el producto "${producto.name}"?`)) {
    console.log('Eliminar producto:', productId);
    // TODO: Implementar eliminación
  }
};

/**
 * Función global para alternar detalles de producto (llamada desde HTML)
 */
window.toggleProductoDetails = function(productId) {
  const details = document.getElementById(`details-${productId}`);
  const card = document.querySelector(`[data-producto-id="${productId}"][data-action="toggle"]`);
  const expandButton = card?.querySelector('[data-action="toggle"]');
  
  if (!details || !card) {
    console.error('No se encontraron elementos para toggle:', { details, card, productId });
    return;
  }

  const isExpanded = details.style.display !== 'none';
  
  if (isExpanded) {
    // Contraer
    details.style.display = 'none';
    if (expandButton) {
      expandButton.innerHTML = '▼';
      expandButton.setAttribute('aria-expanded', 'false');
    }
    card.setAttribute('aria-expanded', 'false');
  } else {
    // Expandir
    details.style.display = 'block';
    if (expandButton) {
      expandButton.innerHTML = '▲';
      expandButton.setAttribute('aria-expanded', 'true');
    }
    card.setAttribute('aria-expanded', 'true');
    
    // Cargar lotes FIFO si no se han cargado
    loadLotesFIFO(productId);
  }
};

/**
 * Carga los lotes FIFO para un producto específico
 */
async function loadLotesFIFO(productId) {
  const tbody = document.getElementById(`lotes-${productId}`);
  if (!tbody) return;

  try {
    console.log('Cargando lotes FIFO para producto:', productId);
    
    // Cargar lotes reales desde Supabase
    const { data: lotes, error } = await getClient()
      .from('lotes')
      .select(`
        *,
        proveedor:supplier_id (
          id,
          empresa
        )
      `)
      .eq('product_id', productId)
      .gt('qty_in', 0) // Solo lotes con cantidad > 0
      .order('received_at', { ascending: true }); // FIFO: más antiguos primero

    if (error) {
      console.error('Error en consulta de lotes:', error);
      throw error;
    }

    console.log('Lotes cargados:', lotes);

    tbody.innerHTML = '';
    
    if (lotes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay lotes activos</td></tr>';
      return;
    }
    
    let sumaTotal = 0;
    let sumaUnidades = 0;
    lotes.forEach(lote => {
      const cantidadDisponible = lote.qty_in - (lote.qty_consumed || 0);
      const totalLote = cantidadDisponible * lote.unit_cost;
      sumaTotal += totalLote;
      sumaUnidades += cantidadDisponible;
      
      const row = el('tr', {}, [
        el('td', {}, [isoUtcToBogotaLabelShort(lote.received_at)]),
        el('td', {}, [String(cantidadDisponible)]),
        el('td', {}, [lote.proveedor?.empresa || 'Sin proveedor']),
        el('td', {}, [`$ ${lote.unit_cost.toLocaleString()}`]),
        el('td', {}, [`$ ${totalLote.toLocaleString()}`]),
        el('td', { style: { textAlign: 'center' } }, [
          el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center' } }, [
            el('button', { 
              class: 'btn-icon btn-icon--edit btn-inv', 
              'data-action': 'inv:edit-lote', 
              'data-lote-id': lote.id,
              title: 'Editar lote',
              style: { padding: '4px 8px', fontSize: '12px' }
            }, ['✏️']),
            el('button', { 
              class: 'btn-icon btn-icon--delete btn-inv', 
              'data-action': 'inv:delete-lote', 
              'data-lote-id': lote.id,
              title: 'Eliminar lote',
              style: { padding: '4px 8px', fontSize: '12px' }
            }, ['🗑️'])
          ])
        ])
      ]);
      tbody.appendChild(row);
    });

    // Fila de total
    const totalRow = el('tr', { class: 'total-row' }, [
      el('td', { class: 'total-label' }, ['Suma de lotes activos:']),
      el('td', { class: 'total-value' }, [String(sumaUnidades)]),
      el('td', { colspan: 3, class: 'total-label' }, ['']),
      el('td', { class: 'total-value' }, [`$ ${sumaTotal.toLocaleString()}`])
    ]);
    tbody.appendChild(totalRow);

  } catch (error) {
    console.error('Error cargando lotes FIFO:', error);
    tbody.innerHTML = '<tr><td colspan="6" class="error-lotes">Error cargando lotes: ' + error.message + '</td></tr>';
  }
}

// ========== CARGAR STOCK ==========

let cargarStockItems = []; // Lista de productos a cargar

/**
 * Abre el modal de cargar stock
 */
function openCargarStockModal() {
  console.log('[inv:stock] Abriendo modal Cargar Stock');
  
  const modal = document.getElementById('modalCargarStock');
  const form = document.getElementById('formCargarStock');
  const fechaInput = document.getElementById('cargarStockFecha');
  const notaInput = document.getElementById('cargarStockNota');
  const notaCount = document.getElementById('notaCount');
  
  // Reset
  form.reset();
  cargarStockItems = [];
  updateCargarStockResumen();
  renderCargarStockItems();
  
  // Cargar proveedores
  loadProveedoresForCargarStock();
  
  // Fecha por defecto: ahora en CO
  const now = new Date();
  const coOffset = -5 * 60; // Colombia UTC-5
  const coTime = new Date(now.getTime() + coOffset * 60 * 1000);
  const isoString = coTime.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  fechaInput.value = isoString;
  
  // Contador de nota
  notaInput.addEventListener('input', () => {
    notaCount.textContent = notaInput.value.length;
  });
  
  // Actualizar productos cuando cambie el proveedor
  const proveedorSelect = document.getElementById('cargarStockProveedor');
  if (proveedorSelect) {
    proveedorSelect.addEventListener('change', () => {
      // Re-renderizar todos los productos existentes
      renderCargarStockItems();
    });
  }
  
  // Mostrar modal
  modal.style.display = 'flex';
  
  // Event listeners
  setupCargarStockEventListeners();
}

/**
 * Cierra el modal de cargar stock
 */
function closeCargarStockModal() {
  const modal = document.getElementById('modalCargarStock');
  modal.style.display = 'none';
  cargarStockItems = [];
}

/**
 * Configura los event listeners del modal
 */
function setupCargarStockEventListeners() {
  const btnClose = document.getElementById('btnCloseCargarStock');
  const btnCancel = document.getElementById('btnCancelCargarStock');
  const btnAgregar = document.getElementById('btnAgregarProducto');
  const form = document.getElementById('formCargarStock');
  const modal = document.getElementById('modalCargarStock');
  
  // Cerrar modal
  if (btnClose) {
    btnClose.onclick = closeCargarStockModal;
  }
  if (btnCancel) {
    btnCancel.onclick = closeCargarStockModal;
  }
  
  // Cerrar con Esc
  modal.onkeydown = (e) => {
    if (e.key === 'Escape') closeCargarStockModal();
  };
  
  // Cerrar al hacer clic en el backdrop
  modal.onclick = (e) => {
    if (e.target === modal) closeCargarStockModal();
  };
  
  // Agregar producto
  if (btnAgregar) {
    btnAgregar.onclick = agregarProductoItem;
  }
  
  // Submit form
  if (form) {
    form.onsubmit = handleCargarStockSubmit;
  }
}

/**
 * Carga los proveedores para el select
 */
async function loadProveedoresForCargarStock() {
  try {
    const s = getClient();
    
    // Buscar la categoría "Proveedores"
    const { data: categorias, error: catError } = await s
      .from('categorias_socios')
      .select('id')
      .eq('nombre', 'Proveedores')
      .single();
    
    if (catError || !categorias) {
      console.warn('[inv:stock] Categoría Proveedores no encontrada');
      return;
    }
    
    // Obtener socios de esa categoría
    const { data: provs, error: provError } = await s
      .from('socios')
      .select('id, empresa')
      .eq('categoria_id', categorias.id)
      .order('empresa');
    
    if (provError) throw provError;
    
    const select = document.getElementById('cargarStockProveedor');
    select.innerHTML = '<option value="">Seleccionar proveedor...</option>';
    
    (provs || []).forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.empresa;
      select.appendChild(option);
    });
    
  } catch (error) {
    console.error('[inv:stock] Error cargando proveedores:', error);
  }
}

/**
 * Agrega un nuevo producto a la lista
 */
function agregarProductoItem() {
  const newItem = {
    id: Date.now(), // ID temporal
    product_id: '',
    cantidad: 1,
    precio_compra: 0,
    precio_venta: 0
  };
  
  cargarStockItems.push(newItem);
  renderCargarStockItems();
  updateCargarStockResumen();
}

/**
 * Renderiza la lista de productos
 */
function renderCargarStockItems() {
  const container = document.getElementById('productosListCargarStock');
  
  if (cargarStockItems.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 24px; text-align: center; color: #94a3b8;">No hay productos agregados. Haz clic en "+ Agregar producto"</div>';
    return;
  }
  
  container.innerHTML = '';
  
  cargarStockItems.forEach((item, index) => {
    const itemEl = createCargarStockItemElement(item, index);
    container.appendChild(itemEl);
  });
}

/**
 * Crea el elemento HTML de un producto
 */
function createCargarStockItemElement(item, index) {
  const div = document.createElement('div');
  div.className = 'cargar-stock-item';
  div.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 12px; align-items: end; padding: 12px; background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);';
  
  // Producto
  const productSelect = document.createElement('select');
  productSelect.className = 'input-visual';
  productSelect.style.cssText = 'font-size: 14px;';
  productSelect.innerHTML = '<option value="">Seleccionar producto...</option>';
  
  // Filtrar productos por proveedor seleccionado
  const proveedorSelect = document.getElementById('cargarStockProveedor');
  const proveedorId = proveedorSelect ? proveedorSelect.value : null;
  
  if (!proveedorId) {
    productSelect.innerHTML = '<option value="">Primero selecciona un proveedor</option>';
    return div;
  }
  
  // Filtrar productos del proveedor seleccionado
  const productosDelProveedor = productos.filter(p => p.supplier_id === proveedorId);
  
  console.log('[inv:stock] Proveedor seleccionado:', proveedorId);
  console.log('[inv:stock] Total productos cargados:', productos.length);
  console.log('[inv:stock] Productos del proveedor:', productosDelProveedor);
  
  if (productosDelProveedor.length === 0) {
    productSelect.innerHTML = '<option value="">⚠ Este proveedor no tiene productos</option>';
    return div;
  }
  
  productosDelProveedor.forEach(p => {
    const option = document.createElement('option');
    option.value = p.id;
    option.textContent = `${p.name} (${p.sku})`; // Usar 'name' en lugar de 'nombre'
    option.selected = p.id === item.product_id;
    productSelect.appendChild(option);
  });
  
  productSelect.onchange = (e) => {
    item.product_id = e.target.value;
    const producto = productos.find(p => p.id === e.target.value);
    if (producto) {
      item.precio_compra = producto.precio_compra_default || 0;
      item.precio_venta = producto.precio_venta_default || 0;
      renderCargarStockItems();
    }
    updateCargarStockResumen();
  };
  
  // Cantidad
  const cantidadInput = document.createElement('input');
  cantidadInput.type = 'number';
  cantidadInput.min = '1';
  cantidadInput.value = item.cantidad;
  cantidadInput.placeholder = 'Cant.';
  cantidadInput.className = 'input-visual';
  cantidadInput.style.cssText = 'font-size: 14px;';
  cantidadInput.oninput = (e) => {
    item.cantidad = parseInt(e.target.value) || 1;
    updateCargarStockResumen();
  };
  
  // Precio compra
  const precioCompraInput = document.createElement('input');
  precioCompraInput.type = 'number';
  precioCompraInput.min = '0';
  precioCompraInput.step = '0.01';
  precioCompraInput.value = item.precio_compra;
  precioCompraInput.placeholder = 'P. Compra';
  precioCompraInput.className = 'input-visual';
  precioCompraInput.style.cssText = 'font-size: 14px;';
  precioCompraInput.oninput = (e) => {
    item.precio_compra = parseFloat(e.target.value) || 0;
    updateCargarStockResumen();
  };
  
  // Precio venta
  const precioVentaInput = document.createElement('input');
  precioVentaInput.type = 'number';
  precioVentaInput.min = '0';
  precioVentaInput.step = '0.01';
  precioVentaInput.value = item.precio_venta;
  precioVentaInput.placeholder = 'P. Venta';
  precioVentaInput.className = 'input-visual';
  precioVentaInput.style.cssText = 'font-size: 14px;';
  precioVentaInput.oninput = (e) => {
    item.precio_venta = parseFloat(e.target.value) || 0;
  };
  
  // Botón eliminar
  const btnEliminar = document.createElement('button');
  btnEliminar.type = 'button';
  btnEliminar.innerHTML = '🗑️';
  btnEliminar.className = 'icon-btn icon-btn--delete';
  btnEliminar.style.cssText = 'width: 36px; height: 36px;';
  btnEliminar.onclick = () => {
    cargarStockItems.splice(index, 1);
    renderCargarStockItems();
    updateCargarStockResumen();
  };
  
  div.appendChild(productSelect);
  div.appendChild(cantidadInput);
  div.appendChild(precioCompraInput);
  div.appendChild(precioVentaInput);
  div.appendChild(btnEliminar);
  
  return div;
}

/**
 * Actualiza el resumen del modal
 */
function updateCargarStockResumen() {
  const totalItems = cargarStockItems.length;
  const totalUnidades = cargarStockItems.reduce((sum, item) => sum + item.cantidad, 0);
  const totalCompra = cargarStockItems.reduce((sum, item) => sum + (item.cantidad * item.precio_compra), 0);
  
  document.getElementById('resumenItems').textContent = totalItems;
  document.getElementById('resumenUnidades').textContent = totalUnidades;
  document.getElementById('resumenTotal').textContent = `$ ${totalCompra.toLocaleString()}`;
  
  // Habilitar/deshabilitar botón de confirmar
  const btnConfirmar = document.getElementById('btnConfirmarCargarStock');
  const proveedorId = document.getElementById('cargarStockProveedor').value;
  const hasItems = cargarStockItems.length > 0 && cargarStockItems.every(item => item.product_id && item.cantidad >= 1 && item.precio_compra >= 0);
  
  btnConfirmar.disabled = !proveedorId || !hasItems;
}

/**
 * Maneja el submit del formulario
 */
async function handleCargarStockSubmit(e) {
  e.preventDefault();
  
  console.log('[inv:stock] Iniciando carga de stock...');
  
  const form = e.target;
  const proveedorId = form.proveedor_id.value;
  const fechaCarga = form.fecha_carga.value;
  const formaPago = form.forma_pago.value;
  const nota = form.nota.value;
  
  // Validaciones
  if (!proveedorId) {
    alert('Selecciona un proveedor');
    return;
  }
  
  if (cargarStockItems.length === 0) {
    alert('Agrega al menos un producto');
    return;
  }
  
  const invalidItems = cargarStockItems.filter(item => !item.product_id || item.cantidad < 1 || item.precio_compra < 0);
  if (invalidItems.length > 0) {
    alert('Verifica que todos los productos tengan cantidad ≥1 y precio ≥0');
    return;
  }
  
  if (nota.length > 140) {
    alert('La nota no puede exceder 140 caracteres');
    return;
  }
  
  // Deshabilitar botón
  const btnConfirmar = document.getElementById('btnConfirmarCargarStock');
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = 'Cargando...';
  
  try {
    const s = getClient();
    
    // Convertir fecha local CO a UTC
    const fechaUTC = new Date(fechaCarga).toISOString();
    
    console.log('[inv:load] Iniciando carga de stock...');
    console.log('[inv:load] Datos:', { proveedorId, fechaUTC, formaPago, nota, items: cargarStockItems.length });
    
    // 1. Insertar lotes (uno por producto)
    const lotesData = cargarStockItems.map(item => ({
      product_id: item.product_id,
      supplier_id: proveedorId,
      qty_in: item.cantidad,
      unit_cost: item.precio_compra,
      received_at: fechaUTC,
      qty_consumed: 0
    }));
    
    const { data: lotes, error: lotesError } = await s
      .from('lotes')
      .insert(lotesData)
      .select();
    
    if (lotesError) {
      console.error('[inv:stock] Error insertando lotes:', lotesError);
      throw new Error(`Error al crear lotes: ${lotesError.message}`);
    }
    
    console.log('[inv:load] Lotes creados:', lotes.length);
    
    // 2. Actualizar productos.disponible usando la función SQL
    console.log('[inv:load] Actualizando productos.disponible...');
    
    for (const item of cargarStockItems) {
      const { error: updateError } = await s.rpc('fn_update_disponible_on_stock_in', {
        p_product_id: item.product_id,
        p_qty: item.cantidad
      });
      
      if (updateError) {
        console.error('[inv:load] Error actualizando disponible:', updateError);
        // Continuar con los demás productos aunque uno falle
      }
    }
    
    console.log('[inv:load] Productos.disponible actualizado exitosamente');
    
    // 3. Insertar registros en stock_ledger
    const ledgerData = lotes.map((lote, index) => {
      const item = cargarStockItems[index];
      return {
        product_id: lote.product_id,
        kind: 'in', // 'in' en lugar de 'ENTRADA'
        qty: lote.qty_in,
        unit_value: lote.unit_cost, // 'unit_value' en lugar de 'unit_cost'
        total_value: lote.qty_in * lote.unit_cost, // 'total_value' en lugar de 'total'
        ref_type: 'lotes', // 'ref_type' en lugar de 'ref_table'
        ref_id: lote.id,
        note: 'CARGA_STOCK' // 'note' en lugar de 'ref_note'
      };
    });
    
    const { error: ledgerError } = await s
      .from('stock_ledger')
      .insert(ledgerData);
    
    if (ledgerError) {
      console.error('[inv:stock] Error insertando en stock_ledger:', ledgerError);
      // No fallar si esto falla, solo loguear
      console.warn('[inv:stock] Continuando sin stock_ledger');
    } else {
      console.log('[inv:load] Stock ledger actualizado:', ledgerData.length);
    }
    
    // 4. TODO: Insertar en transacciones si se usa para inventario
    console.log('[inv:load] TODO: Integrar con tabla transacciones para contabilidad');
    
    // Éxito
    console.log('[inv:load] ✅ Carga de stock completada');
    alert(`✅ Stock cargado exitosamente:\n${cargarStockItems.length} productos\n${cargarStockItems.reduce((s, i) => s + i.cantidad, 0)} unidades`);
    
    // Cerrar modal
    closeCargarStockModal();
    
    // Refrescar solo lo necesario
    const productIdsAfectados = cargarStockItems.map(item => item.product_id);
    console.log('[inv:load] Productos afectados:', productIdsAfectados);
    
    // Actualizar contadores de stock operativo solo para productos afectados
    await refreshProductCards(productIdsAfectados);
    
    await loadMovimientos(); // Recargar movimientos para mostrar la nueva entrada
    
  } catch (error) {
    console.error('[inv:stock] Error en carga de stock:', error);
    
    let errorMsg = 'Error al cargar stock: ' + error.message;
    
    if (error.message.includes('Policy') || error.message.includes('RLS') || error.message.includes('401') || error.message.includes('403')) {
      errorMsg = '⚠️ Error de permisos/RLS. Verifica las políticas de seguridad en Supabase para las tablas: lotes, productos, stock_ledger';
    }
    
    alert(errorMsg);
    
  } finally {
    // Rehabilitar botón
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<span class="icon-save"></span> Cargar stock';
  }
}

// ========== HELPER PARA ACTUALIZACIÓN SELECTIVA DE STOCK ==========

/**
 * Actualiza los contadores de stock operativo solo para productos específicos
 * @param {string[]} productIds - Array de IDs de productos a actualizar
 */
async function refreshProductCards(productIds) {
  if (!productIds || productIds.length === 0) {
    console.log('[inv:ui] No hay productos para actualizar');
    return;
  }
  
  console.log('[inv:ui] Actualizando contadores para productos:', productIds);
  
  try {
    const s = getClient();
    
    // Consultar contadores desde la vista vw_stock_operativo_counts
    const { data: stockData, error } = await s
      .from('vw_stock_operativo_counts')
      .select('id, disponible, comprometido, en_reparto, en_devolucion, total_bodega')
      .in('id', productIds);
    
    if (error) {
      console.error('[inv:ui] Error consultando stock operativo:', error);
      return;
    }
    
    console.log('[inv:ui] Datos de stock obtenidos:', stockData);
    
    // Actualizar cada tarjeta de producto
    stockData.forEach(producto => {
      updateProductCardCounters(producto);
    });
    
    console.debug('[inv:ui] cards updated', { productIds });
    
  } catch (error) {
    console.error('[inv:ui] Error en refreshProductCards:', error);
  }
}

/**
 * Actualiza directamente el contador disponible de un producto (para ajustes manuales)
 * @param {string} productId - ID del producto
 * @param {number} nuevoDisponible - Nuevo valor de disponible
 */
function updateDisponibleDirecto(productId, nuevoDisponible) {
  const card = document.querySelector(`[data-producto-id="${productId}"]`);
  if (!card) {
    console.warn('[inv:ui] Tarjeta no encontrada para producto:', productId);
    return;
  }
  
  const badgeDisponible = card.querySelector('.badge[data-counter="disponible"]');
  if (badgeDisponible) {
    // Actualizar solo el valor numérico
    const badgeValue = badgeDisponible.querySelector('.badge-value');
    if (badgeValue) {
      badgeValue.textContent = nuevoDisponible;
    }
    
    // Actualizar clase de color
    const colorClass = nuevoDisponible >= 0 ? 'badge--success' : 'badge--danger';
    badgeDisponible.className = `badge ${colorClass}`;
    
    // Asegurar que los atributos data se mantengan
    badgeDisponible.setAttribute('data-action', 'inv:edit-disponible');
    badgeDisponible.setAttribute('data-product-id', productId);
    badgeDisponible.setAttribute('data-counter', 'disponible');
    badgeDisponible.style.cursor = 'pointer';
    
    console.log('[inv:ui] Disponible actualizado directamente:', { productId, nuevoDisponible });
  }
}

/**
 * Actualiza los contadores de una tarjeta de producto específica
 * @param {Object} producto - Datos del producto con contadores actualizados
 */
function updateProductCardCounters(producto) {
  // Buscar la tarjeta del producto
  const card = document.querySelector(`[data-producto-id="${producto.id}"]`);
  if (!card) {
    console.warn('[inv:ui] Tarjeta no encontrada para producto:', producto.id);
    return;
  }
  
  // Actualizar badges de contadores
  const badges = {
    disponible: card.querySelector('.badge[data-counter="disponible"]'),
    comprometido: card.querySelector('.badge[data-counter="comprometido"]'),
    en_reparto: card.querySelector('.badge[data-counter="en_reparto"]'),
    en_devolucion: card.querySelector('.badge[data-counter="en_devolucion"]'),
    total_bodega: card.querySelector('.badge[data-counter="total_bodega"]')
  };
  
  // Actualizar cada badge si existe
  if (badges.disponible) {
    // Actualizar solo el valor numérico, no el texto completo
    const badgeValue = badges.disponible.querySelector('.badge-value');
    if (badgeValue) {
      badgeValue.textContent = producto.disponible;
    }
    
    // Actualizar clase de color preservando atributos data
    const colorClass = producto.disponible >= 0 ? 'badge--success' : 'badge--danger';
    badges.disponible.className = `badge ${colorClass}`;
    
    // Asegurar que los atributos data se mantengan
    badges.disponible.setAttribute('data-action', 'inv:edit-disponible');
    badges.disponible.setAttribute('data-product-id', producto.id);
    badges.disponible.setAttribute('data-counter', 'disponible');
    badges.disponible.style.cursor = 'pointer';
  }
  
  if (badges.comprometido) {
    const badgeValue = badges.comprometido.querySelector('.badge-value');
    if (badgeValue) {
      badgeValue.textContent = producto.comprometido;
    }
  }
  
  if (badges.en_reparto) {
    const badgeValue = badges.en_reparto.querySelector('.badge-value');
    if (badgeValue) {
      badgeValue.textContent = producto.en_reparto;
    }
  }
  
  if (badges.en_devolucion) {
    const badgeValue = badges.en_devolucion.querySelector('.badge-value');
    if (badgeValue) {
      badgeValue.textContent = producto.en_devolucion;
    }
  }
  
  if (badges.total_bodega) {
    badges.total_bodega.textContent = producto.total_bodega;
  }
  
  console.log('[inv:ui] Contadores actualizados para producto:', producto.id, {
    disponible: producto.disponible,
    comprometido: producto.comprometido,
    en_reparto: producto.en_reparto,
    en_devolucion: producto.en_devolucion,
    total_bodega: producto.total_bodega
  });
}

// ========== EDITAR DISPONIBLE ==========

/**
 * Abre el modal para editar disponible
 */
function openEditarDisponibleModal(productId) {
  console.log('[inv] edit disponible: abriendo modal para producto:', productId);
  
  const producto = productos.find(p => p.id === productId);
  if (!producto) {
    console.error('[inv] edit disponible: producto no encontrado:', productId);
    return;
  }
  
  const modal = document.getElementById('modalEditarDisponible');
  const form = document.getElementById('formEditarDisponible');
  
  // Llenar datos actuales
  document.getElementById('editarDisponibleActual').value = producto.disponible;
  document.getElementById('editarDisponibleNuevo').value = producto.disponible;
  document.getElementById('editarDisponibleNota').value = '';
  
  // Guardar ID del producto en el formulario
  form.dataset.productId = productId;
  
  // Mostrar modal
  modal.style.display = 'flex';
  
  // Focus en el campo nuevo disponible
  setTimeout(() => {
    document.getElementById('editarDisponibleNuevo').focus();
  }, 100);
}

/**
 * Cierra el modal de editar disponible
 */
function closeEditarDisponibleModal() {
  const modal = document.getElementById('modalEditarDisponible');
  const form = document.getElementById('formEditarDisponible');
  
  modal.style.display = 'none';
  form.reset();
  delete form.dataset.productId;
}

/**
 * Maneja el submit del formulario de editar disponible
 */
async function handleEditarDisponibleSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const productId = form.dataset.productId;
  const formData = new FormData(form);
  
  const disponibleActual = parseInt(formData.get('disponible_actual'));
  const nuevoDisponible = parseInt(formData.get('nuevo_disponible'));
  const nota = formData.get('nota') || '';
  
  if (nuevoDisponible < 0) {
    alert('El nuevo disponible no puede ser negativo');
    return;
  }
  
  const delta = nuevoDisponible - disponibleActual;
  
  console.log('[inv] edit disponible: procesando cambio:', {
    productId,
    actual: disponibleActual,
    nuevo: nuevoDisponible,
    delta,
    nota
  });
  
  try {
    const s = getClient();
    
    // Usar la función SQL para ajustar disponible
    const { error } = await s.rpc('fn_adjust_disponible_manual', {
      p_product_id: productId,
      p_new_disponible: nuevoDisponible,
      p_note: nota || null
    });
    
    if (error) {
      console.error('[inv] edit disponible: error en función SQL:', error);
      throw error;
    }
    
    console.log('[inv] edit disponible: cambio registrado exitosamente');
    
    // Cerrar modal
    closeEditarDisponibleModal();
    
    // Refrescar contador del producto usando la vista actualizada
    await refreshProductCards([productId]);
    
    // Mostrar mensaje de éxito
    alert(`✅ Disponible actualizado exitosamente\nCambio: ${delta > 0 ? '+' : ''}${delta}`);
    
  } catch (error) {
    console.error('[inv] edit disponible: error:', error);
    alert('Error al actualizar disponible: ' + error.message);
  }
}

// ========== EDITAR LOTE ==========

/**
 * Abre el modal para editar lote
 */
function openEditarLoteModal(loteId) {
  console.log('[inv] edit lote: abriendo modal para lote:', loteId);
  
  // Buscar el lote en los datos actuales
  // Por simplicidad, vamos a recargar el lote desde Supabase
  loadLoteData(loteId);
}

/**
 * Carga los datos del lote desde Supabase
 */
async function loadLoteData(loteId) {
  try {
    const s = getClient();
    
    const { data: lote, error } = await s
      .from('lotes')
      .select('*')
      .eq('id', loteId)
      .single();
    
    if (error) {
      console.error('[inv] edit lote: error cargando lote:', error);
      throw error;
    }
    
    console.log('[inv] edit lote: datos cargados:', lote);
    
    // Llenar el modal
    const modal = document.getElementById('modalEditarLote');
    const form = document.getElementById('formEditarLote');
    
    // Convertir fecha UTC a local para el input
    const fechaLocal = new Date(lote.received_at);
    const fechaLocalString = fechaLocal.toISOString().slice(0, 16);
    
    document.getElementById('editarLoteCantidad').value = lote.qty_in;
    document.getElementById('editarLoteCosto').value = lote.unit_cost;
    document.getElementById('editarLoteFecha').value = fechaLocalString;
    document.getElementById('editarLoteNota').value = '';
    
    // Guardar ID del lote en el formulario
    form.dataset.loteId = loteId;
    
    // Mostrar modal
    modal.style.display = 'flex';
    
    // Focus en el primer campo
    setTimeout(() => {
      document.getElementById('editarLoteCantidad').focus();
    }, 100);
    
  } catch (error) {
    console.error('[inv] edit lote: error:', error);
    alert('Error al cargar datos del lote: ' + error.message);
  }
}

/**
 * Cierra el modal de editar lote
 */
function closeEditarLoteModal() {
  const modal = document.getElementById('modalEditarLote');
  const form = document.getElementById('formEditarLote');
  
  modal.style.display = 'none';
  form.reset();
  delete form.dataset.loteId;
}

/**
 * Maneja el submit del formulario de editar lote
 */
async function handleEditarLoteSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const loteId = form.dataset.loteId;
  const formData = new FormData(form);
  
  const qtyIn = parseInt(formData.get('qty_in'));
  const unitCost = parseFloat(formData.get('unit_cost'));
  const receivedAt = formData.get('received_at');
  const nota = formData.get('nota') || '';
  
  console.log('[inv] edit lote: procesando cambios:', {
    loteId,
    qtyIn,
    unitCost,
    receivedAt,
    nota
  });
  
  try {
    const s = getClient();
    
    // Convertir fecha local a UTC
    const fechaUTC = new Date(receivedAt).toISOString();
    
    // Actualizar lote
    const { error } = await s
      .from('lotes')
      .update({
        qty_in: qtyIn,
        unit_cost: unitCost,
        received_at: fechaUTC,
        updated_at: new Date().toISOString()
      })
      .eq('id', loteId);
    
    if (error) {
      console.error('[inv] edit lote: error actualizando:', error);
      throw error;
    }
    
    console.log('[inv] edit lote: lote actualizado exitosamente');
    
    // Cerrar modal
    closeEditarLoteModal();
    
    // Recargar la tabla de lotes del producto
    const lote = await s.from('lotes').select('product_id').eq('id', loteId).single();
    if (lote.data) {
      await loadLotesFIFO(lote.data.product_id);
      // NO actualizar contadores de stock operativo porque los ajustes manuales
      // no se reflejan en la vista vw_stock_operativo_counts
      console.log('[inv] edit lote: tabla de lotes recargada, contadores no actualizados');
    }
    
    // Mostrar mensaje de éxito
    alert('✅ Lote actualizado exitosamente');
    
  } catch (error) {
    console.error('[inv] edit lote: error:', error);
    alert('Error al actualizar lote: ' + error.message);
  }
}

// ========== ELIMINAR LOTE ==========

/**
 * Elimina un lote (soft delete)
 */
async function deleteLote(loteId) {
  console.log('[inv] delete lote: eliminando lote:', loteId);
  
  try {
    const s = getClient();
    
    // Primero verificar si el lote tiene consumo
    const { data: lote, error: fetchError } = await s
      .from('lotes')
      .select('qty_consumed, product_id')
      .eq('id', loteId)
      .single();
    
    if (fetchError) {
      console.error('[inv] delete lote: error obteniendo lote:', fetchError);
      throw fetchError;
    }
    
    if (lote.qty_consumed > 0) {
      alert('⚠️ Este lote tiene consumo y no puede eliminarse');
      return;
    }
    
    // Confirmar eliminación
    if (!confirm('¿Estás seguro de que quieres eliminar este lote?')) {
      return;
    }
    
    // Hard delete: eliminar el lote
    const { error } = await s
      .from('lotes')
      .delete()
      .eq('id', loteId);
    
    if (error) {
      console.error('[inv] delete lote: error eliminando:', error);
      throw error;
    }
    
    console.log('[inv] delete lote: lote eliminado exitosamente');
    
    // Recargar la tabla de lotes del producto
    await loadLotesFIFO(lote.product_id);
    
    // Mostrar mensaje de éxito
    alert('✅ Lote eliminado exitosamente');
    
  } catch (error) {
    console.error('[inv] delete lote: error:', error);
    alert('Error al eliminar lote: ' + error.message);
  }
}

// Exportar funciones para el sistema de delegación
export {
  openEditarDisponibleModal,
  openEditarLoteModal,
  deleteLote
};
