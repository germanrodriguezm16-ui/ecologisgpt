# Changelog - Módulo de Inventario

Registro detallado de cambios, correcciones y mejoras del módulo de inventario.

---

## [1.0.0] - 2025-10-13

### ✨ Nueva Funcionalidad

#### **Módulo de Inventario Completo**
- ✅ **Pestaña "Stock Operativo":**
  - Listado vertical de tarjetas de productos
  - Vista compacta con nombre, SKU, contadores (Disponible, Comprometido, En reparto, En devolución), Total bodega
  - Vista expandida con información detallada: proveedor, precios, utilidad bruta, tabla FIFO de lotes
  - Botones de acción: editar, eliminar, expandir/contraer
  - Buscador en tiempo real por nombre o SKU
  - Botón de actualizar
  - Estado de carga y error

- ✅ **Pestaña "Movimientos":**
  - Tabla de historial de movimientos de stock
  - Columnas: Fecha (formato Bogotá), Concepto (con iconos y badges), Cantidad, Valor Unitario, Total
  - Filtros por producto y rango de fechas
  - Display de "Valor Total Mercancía FIFO"
  - Estado vacío y de error

- ✅ **Pestaña "Análisis":**
  - Placeholder para futuras funcionalidades
  - Tarjetas de vista previa de reportes, optimización, alertas
  - Título editable desde configuración

- ✅ **Floating Action Button (FAB):**
  - Botón para crear nuevo producto
  - Atajo de teclado: `Ctrl+N`
  - Color primario naranja LCDM
  - Visible solo en pestaña "Stock Operativo"

- ✅ **Modal de Producto:**
  - Formulario para crear/editar productos
  - Campos: Nombre, SKU, Proveedor, Precio Compra, Precio Venta
  - Diseño visual rico con iconos y gradientes
  - Validaciones básicas

- ✅ **Persistencia:**
  - Pestaña activa guardada en `localStorage` (`inventoryTab`)

#### **Sistema de Datos (Supabase)**
- ✅ **Tablas:**
  - `productos`: Catálogo de productos con SKU único
  - `lotes`: Control de lotes para sistema FIFO
  - `stock_ledger`: Registro histórico de movimientos

- ✅ **Vistas:**
  - `vw_stock_operativo_counts`: Contadores de stock por producto
  - `vw_fifo_value`: Valoración FIFO total
  - `vw_inventario_dashboard`: Métricas resumidas

- ✅ **Funciones RPC:**
  - `fn_fifo_pending(product_id)`: Obtiene lotes pendientes ordenados por FIFO
  - `fn_fifo_consume(product_id, qty, ref_type, ref_id, note)`: Consume stock FIFO y registra movimiento
  - `fn_stock_entrada(product_id, supplier_id, qty, unit_cost, note)`: Registra entrada de mercancía

- ✅ **Índices:**
  - Optimización de consultas en productos, lotes y stock_ledger

- ✅ **Triggers:**
  - Auto-actualización de `updated_at` en productos y lotes

- ✅ **RLS (Row Level Security):**
  - Políticas básicas habilitadas (TODO: ajustar para producción)

### 🐛 Correcciones de Errores

#### **Error 1: `appendChild` - Números como strings**
- **Problema:** Se pasaban números directamente a la función `el()` causando `TypeError: Failed to execute 'appendChild' on 'Node'`
- **Ubicación:** `js/views/inventario.js` líneas 428, 432, 436, 440, 445, 613, 811
- **Solución:** Convertir todos los valores numéricos a strings con `String()`
- **Archivos:** `js/views/inventario.js`

#### **Error 2: `CSSStyleDeclaration` - Style como string**
- **Problema:** Atributo `style` pasado como string `'display: none;'` causando `TypeError: Failed to set an indexed property`
- **Ubicación:** `js/views/inventario.js` línea 469
- **Solución:** Cambiar a objeto `style: { display: 'none' }`
- **Archivos:** `js/views/inventario.js`

#### **Error 3: `children.forEach` - Arrays en el()**
- **Problema:** Se pasaban strings directamente como tercer argumento de `el()` en lugar de arrays
- **Ubicación:** `js/views/inventario.js` líneas 312, 323
- **Solución:** Envolver strings en arrays: `[string]`
- **Archivos:** `js/views/inventario.js`

#### **Error 4: `onclick` atributos**
- **Problema:** Uso de atributos `onclick` con strings de código JavaScript
- **Ubicación:** `js/views/inventario.js` líneas 423, 428, 434
- **Solución:** 
  - Cambiar a atributos `data-action` y `data-producto-id`
  - Agregar event listeners con `addEventListener`
  - Usar funciones globales `window.editProducto()`, etc.
- **Archivos:** `js/views/inventario.js`

#### **Error 5: UUID de proveedores**
- **Problema:** Query con string literal `'proveedores'` en `eq('categoria_id', 'proveedores')` causando error `invalid input syntax for type uuid`
- **Ubicación:** `js/views/inventario.js` línea 271
- **Solución:** 
  1. Buscar categoría "Proveedores" por nombre para obtener UUID
  2. Usar ese UUID para filtrar socios
  3. Manejo de errores si no existe la categoría
- **Archivos:** `js/views/inventario.js`

### 📝 Documentación

- ✅ **`docs/INVENTARIO.md`:**
  - Descripción completa del módulo
  - Estructura UI y funcionalidades
  - Lógica JavaScript detallada
  - Contrato de datos con Supabase
  - UX/Estilo
  - Validaciones
  - Pruebas manuales
  - Deuda técnica y TODOs
  - Historial de errores corregidos

- ✅ **`sql/inventario-schema.sql`:**
  - Schema completo de tablas, vistas, funciones
  - Comentarios en español
  - Índices optimizados
  - Triggers para timestamps
  - RLS básico
  - Datos de ejemplo (comentados)

- ✅ **`docs/CHANGELOG_INVENTARIO.md`:** Este archivo

### 🎨 Estilos

- ✅ **`assets/visual-design.css`:**
  - Estilos para el módulo de inventario
  - `.inventario-module`, `.module-header`, `.balance-info`
  - `.tabs-container`, `.tab-btn`, `.tab-panel`
  - `.stock-container`, `.producto-card`, `.producto-header`
  - `.stock-badges`, `.badge`, `.badge--success/warning/info/danger`
  - `.producto-details`, `.details-section`, `.lotes-table`
  - `.movimientos-container`, `.analisis-container`
  - Estados: `empty-state`, `loading-state`, `error-state`
  - Animaciones: expand/collapse, hover, badges

### 🔧 Mejoras Técnicas

- ✅ **Event Delegation:** Listeners agregados dinámicamente a cada tarjeta
- ✅ **Lazy Loading:** Lotes FIFO se cargan solo al expandir detalles
- ✅ **Error Handling:** Manejo robusto de errores en todas las funciones async
- ✅ **Estado de Carga:** Feedback visual durante operaciones asíncronas
- ✅ **Accesibilidad:** `aria-expanded`, `aria-selected`, focus visible
- ✅ **Performance:** Índices en Supabase, queries optimizadas

### ⚠️ Deuda Técnica Conocida

#### Alta Prioridad
- [ ] Integrar `fn_fifo_consume` con módulo de Pedidos
- [ ] Implementar guardado real en Supabase para crear/editar productos
- [ ] Implementar eliminación de productos con validación

#### Media Prioridad
- [ ] Lógica real para contadores `comprometido`, `en_reparto`, `en_devolucion`
- [ ] Filtros funcionales en pestaña Movimientos
- [ ] Balance total calculado
- [ ] Desarrollo completo de pestaña Análisis

#### Baja Prioridad
- [ ] Validación SKU único en servidor
- [ ] Toasts para feedback de usuario
- [ ] Paginación para listados grandes
- [ ] Exportación de datos
- [ ] Modo oscuro

### 📊 Estadísticas

- **Archivos creados:** 3 (`js/views/inventario.js`, `docs/INVENTARIO.md`, `sql/inventario-schema.sql`)
- **Archivos modificados:** 3 (`js/app.js`, `index.html`, `assets/visual-design.css`)
- **Líneas de código (JS):** ~850
- **Líneas de documentación:** ~650
- **Líneas de SQL:** ~450
- **Errores corregidos:** 5
- **Funciones JavaScript:** 15+
- **Tablas Supabase:** 3
- **Vistas Supabase:** 3
- **Funciones RPC:** 3

---

## [Próxima Versión] - Planificado

### 🚀 Funcionalidades Futuras

- [ ] **Módulo de Pedidos:**
  - Integración con consumo FIFO automático
  - Estado "comprometido" funcional

- [ ] **Módulo de Seguimiento:**
  - Tracking de productos en reparto
  - Estado "en_reparto" funcional

- [ ] **Módulo de Devoluciones:**
  - Gestión de devoluciones
  - Estado "en_devolucion" funcional

- [ ] **Alertas y Notificaciones:**
  - Bajo stock
  - Productos por vencer
  - Alertas personalizadas

- [ ] **Reportes Avanzados:**
  - Productos más vendidos
  - Análisis de rentabilidad
  - Proyecciones de stock

- [ ] **Optimización:**
  - Sugerencias de reorden
  - Análisis de tendencias
  - Predicción de demanda

---

**Última actualización:** 2025-10-13  
**Versión actual:** 1.0.0  
**Estado:** ✅ Funcional con TODOs pendientes

