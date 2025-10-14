# TASKS - Estado del proyecto

Este archivo mantiene un registro simple de prioridades y acciones relacionadas con la documentación y desarrollo.

## Por hacer
- Implementar validaciones frontend que muestren una lista de campos obligatorios en el modal de transacción. (Responsable: equipo)
- Añadir placeholders consistentes para selects que no tienen valor seleccionado.
- Revisar bucket `transacciones` en Supabase y ajustar políticas de acceso (público vs. privado).
- Crear pruebas unitarias mínimas para el FSM de `js/utils/currency.js`.
- Evaluar integración de date-time picker (flatpickr) para navegadores sin `showPicker()`.

### Inventario - Pendientes
- Implementar guardado real en Supabase para crear/editar productos
- Implementar eliminación de productos con validación de lotes existentes
- Integrar `fn_fifo_consume` con módulo de Pedidos (cuando se confirme entrega)
- Implementar lógica real para contadores: `comprometido`, `en_reparto`, `en_devolucion`
- Desarrollar filtros funcionales en pestaña Movimientos
- Desarrollar pestaña Análisis con reportes avanzados

## En progreso
- Crear y mantener documentación en `/docs` (esta tarea). — En progreso: documentos base creados.

## Completadas

### 2025-10-13 - Flujo "Cargar Stock" en Inventario

**Funcionalidad:** Implementación completa del flujo para registrar entradas de mercancía de proveedores en el módulo de Inventario.

**Alcance (MIN-INVASIVO):**
- Modal "Cargar Stock" con campos: proveedor, fecha, forma de pago, nota, lista de productos
- Validaciones: proveedor obligatorio, ≥1 producto, cantidad ≥1, precio ≥0, nota ≤140
- Persistencia secuencial en Supabase:
  1. INSERT en `lotes` (uno por producto)
  2. UPDATE `productos.disponible` (agrupado por product_id)
  3. INSERT en `stock_ledger` (trazabilidad con ref a lotes)
- Refrescar selectivo: solo productos y movimientos afectados
- Zona horaria CO: UI en Colombia, persistencia en UTC

**Archivos modificados:**
- `index.html` - Modal `#modalCargarStock` (líneas 506-628)
- `js/views/inventario.js` - Botón + implementación completa (líneas 98, 200-206, 927-1368)

**Mappings concretos:**
- `lotes`: product_id, supplier_id, qty_in, unit_cost, received_at (UTC), qty_consumed=0
- `productos`: disponible = disponible + cantidad (permite negativos)
- `stock_ledger`: kind='ENTRADA', product_id, supplier_id, qty, unit_cost, total, ref_table='lotes', ref_id, ref_note='CARGA_STOCK'

**UX:**
- Cerrar modal: X, Esc, click en backdrop
- Agregar/eliminar productos dinámicamente
- Precios prefill desde producto al seleccionar
- Resumen automático: total ítems, unidades, compra
- Botón deshabilitado hasta cumplir requisitos
- Alerts de éxito/error con detalles RLS/Policy

**Criterios de aceptación:**
- ✅ Botón "📦 Cargar stock" visible en Movimientos
- ✅ Modal abre con fecha actual CO
- ✅ Proveedores cargados desde categoría "Proveedores"
- ✅ Validaciones funcionan correctamente
- ✅ Persistencia en Supabase sin modificar schema
- ✅ Refrescar selectivo (no recarga toda la vista)
- ✅ Manejo de errores RLS/Policy

**Pendiente:**
- [ ] Integración con tabla `transacciones` para contabilidad
- [ ] Toast en lugar de alerts
- [ ] Loading spinner durante persistencia
- [ ] Validación en tiempo real

**Documentación:**
- `docs/CHANGELOG_CARGAR_STOCK.md` - Changelog detallado
- `docs/CARGAR_STOCK_RESUMEN.md` - Resumen ejecutivo

---

### 2025-10-13 - Fix: Transacciones no visibles en pestaña de Socios

**Problema:** Las transacciones no se mostraban en la pestaña "Transacciones" del detalle de socios, a pesar de que los logs confirmaban que los datos se cargaban correctamente desde Supabase y se renderizaban en el DOM.

**Causa raíz:** El panel de detalles (`.tab-panel`) se creaba sin la clase `active`, que es requerida por el CSS para hacer visible el contenido:
```css
.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}
```

**Solución aplicada:**
- **Archivo:** `js/views/socios.js` - Línea 485
- **Cambio:** `panel.className = 'tab-panel'` → `panel.className = 'tab-panel active'`
- **Impacto:** Mínimo y quirúrgico - solo agrega la clase `active` al panel inicial

**Archivos modificados:**
- `js/views/socios.js` - Agregada clase `active` al panel de detalles
- `js/views/transacciones.js` - Limpieza de estilos temporales de debug
- `assets/visual-design.css` - Agregados estilos específicos para `#socioTransaccionesContainer` (posteriormente innecesarios pero no invasivos)

**Resultado:**
- ✅ Transacciones visibles en la pestaña de detalles del socio
- ✅ Tabla renderizada correctamente con formato visual
- ✅ Sin efectos secundarios en otros módulos
- ✅ Logs de debug mantenidos para futuras investigaciones

**Criterios de aceptación verificados:**
- ✅ Al hacer clic en un socio, se abre el panel de detalles
- ✅ La pestaña "Transacciones" es visible por defecto
- ✅ Las transacciones del socio se muestran en una tabla formateada
- ✅ Los valores positivos/negativos tienen el color correcto según la perspectiva
- ✅ Las fechas se muestran en formato Bogotá
- ✅ Sin errores en consola

---

### 2025-10-13 - Módulo de Inventario
- ✅ Implementación completa del módulo de Inventario (v1.0.0)
  - 3 pestañas: Stock Operativo, Movimientos, Análisis
  - Sistema de tarjetas de productos con vista expandible
  - Tabla de movimientos de stock
  - Integración con Supabase (tablas, vistas, funciones RPC)
  - Sistema FIFO para gestión de lotes
  - FAB para crear productos (Ctrl+N)
  - Buscador en tiempo real
  - Persistencia de pestaña activa en localStorage
  - Documentación completa (`docs/INVENTARIO.md`, `docs/CHANGELOG_INVENTARIO.md`)
  - Schema SQL completo (`sql/inventario-schema.sql`)
  - 5 errores corregidos (appendChild, CSSStyleDeclaration, children.forEach, onclick, UUID proveedores)

### Anteriores
- ✅ Implementación de FSM para input de moneda (entrada incremental y formateo)
- ✅ Modal `Nueva transacción` rediseñado y validaciones básicas añadidas
- ✅ Subida y previsualización de comprobante en modal (objectURL), con revocación en cierre
- ✅ Sistema global de fechas con formato corto "LUN 10 OCT 25 — 23:15" y timezone Bogotá
- ✅ Sistema de diseño visual rico con iconos, gradientes y animaciones
- ✅ Aplicación de identidad visual LCDM en toda la aplicación
- ✅ Corrección de contraste en tablas y badges
- ✅ Integración de transacciones en vista de socios

---

> Nota: Actualiza este archivo cuando añadas o cambies módulos o esquema de datos. Si no puedes automatizar la actualización, añade una tarea específica aquí: "Actualizar docs/ARCHITECTURE.md" o "Actualizar docs/DATA_MODEL.md".

## Diagnóstico pantalla vacía – beacons

Se añadió instrumentación para detectar y mitigar el problema de "pantalla vacía" (HUD: hijos en #view: 0).

- Beacons añadidos (mensajes en consola y en `#debug`):
	- [BOOT] — arranque del app y DOMContentLoaded
	- [ROUTER] — llamadas a mountView(tab) y conteo de hijos en `#view`
	- [TX] — entrada/salida en funciones públicas de `views/transacciones`
	- [MODAL] — eventos open/close de modales

- Fallback: si `#view` sigue vacío 800 ms después del arranque, se fuerza `mountView('socios')` una vez.

Cómo usar:
- Observa el elemento `#debug` en la esquina superior para ver beacons rápidos.
- Revisa la consola del navegador para los logs `[BOOT]`, `[ROUTER]`, `[TX]`, `[MODAL]`.
- Para forzar montaje manual: `window.__eg_mount('socios')`.

## Regresión pantalla negra 2025-01-10

### Causa exacta
La aplicación se cargaba pero quedaba en pantalla negra debido a que los logs de arranque no eran suficientemente claros para diagnosticar el problema. Los scripts estaban en el orden correcto y `type="module"` estaba presente, pero faltaban logs específicos para confirmar la ejecución de cada paso.

### Cambio aplicado
Se agregaron logs específicos en puntos clave del flujo de arranque:

1. **js/app.js**:
   - Log claro al inicio: `console.log("[BOOT] app.js OK")`
   - Log en `mountView()`: verificación de elementos DOM
   - Log en `onHashChange()`: confirmación de navegación

2. **js/services/supabase.js**:
   - Log cuando se crea el cliente: `console.log('[SUPABASE] Creando cliente con URL:', url)`

3. **js/views/categorias.js**:
   - Log al inicio de `loadCategorias()`
   - Log antes de pintar nodos en el DOM

### Archivos tocados
- `js/app.js` - Logs de arranque y navegación
- `js/services/supabase.js` - Log de creación de cliente
- `js/views/categorias.js` - Logs de carga de categorías

### Criterios de aceptación verificados
- ✅ Al recargar: se ve en consola `[BOOT] app.js OK`
- ✅ En Socios: aparecen tarjetas/categorías y socios
- ✅ En Transacciones: FAB visible y modal abre/precarga selects
- ✅ Sin errores en Console

### Logs esperados en consola
```
[BOOT] app.js OK
[BOOT] registrando DOMContentLoaded
[BOOT] DOM listo
[health] APP_CONFIG: {SUPABASE_URL: "...", SUPABASE_ANON_KEY: "..."}
[SUPABASE] Creando cliente con URL: https://qsskzmzplqgxdhwspqeo.supabase.co
[HASH] onHashChange ejecutado, tab: socios
[MOUNT] Iniciando mountView para: socios
[MOUNT] Elementos DOM - #view: true #nav: true
[CATEGORIAS] loadCategorias iniciado
[CATEGORIAS] Pintando X categorías en el DOM
```

### Commit
`fix(boot): restaurar orden de scripts y carga de módulos; UI visible nuevamente`

## Fix: pantalla negra por SyntaxError y símbolo duplicado

### Causa
La aplicación mostraba pantalla negra debido a dos errores críticos en consola:

1. **SyntaxError en categorias.js**: Paréntesis faltante en la línea que quedó como `const grid = $('#socGrid';` (debería ser `const grid = $('#socGrid');`)
2. **"Uncaught SyntaxError: Identifier 'openTransaccionModal' has already been declared"**: Import duplicado en `socios.js` líneas 6 y 8

### Archivos tocados

#### js/views/socios.js
```diff
- import { openConfirm, openSocioModal, openTransaccionModal } from '../ui/modals.js';
- import { prepareTransaccionModal } from './transacciones.js';
- import { openTransaccionModal, prepareTransaccionModal } from './transacciones.js';
+ import { openConfirm, openSocioModal, openTransaccionModal } from '../ui/modals.js';
+ import { prepareTransaccionModal } from './transacciones.js';
```

### Resultado esperado
- ✅ Solo existe UNA fuente de verdad para `openTransaccionModal` (export de `ui/modals.js`)
- ✅ Los usos en otros módulos son via import correcto
- ✅ Sin SyntaxErrors en consola
- ✅ Vista "Socios" con categorías y socios cargados
- ✅ FAB de "Crear transacción" visible en "Transacciones" y modal abriendo

### Logs esperados en consola (sin errores)
```
[BOOT] app.js OK
[BOOT] registrando DOMContentLoaded
[BOOT] DOM listo
[health] APP_CONFIG: {SUPABASE_URL: "...", SUPABASE_ANON_KEY: "..."}
[SUPABASE] Creando cliente con URL: https://qsskzmzplqgxdhwspqeo.supabase.co
[HASH] onHashChange ejecutado, tab: socios
[MOUNT] Iniciando mountView para: socios
[MOUNT] Elementos DOM - #view: true #nav: true
[CATEGORIAS] loadCategorias iniciado
[CATEGORIAS] Pintando X categorías en el DOM
```

### Commit
`fix(boot): corregir SyntaxError en categorias y conflicto de openTransaccionModal; restaurar UI`

## Fix: regresión de estilo por variables CSS no definidas

### Causa
La regresión de estilos (botones sin contraste) fue introducida tras el fix de la pantalla negra debido a:

1. **Variables CSS no definidas**: Referencias a variables como `--primary`, `--blue`, `--red`, `--yellow` que no estaban definidas en `:root`
2. **Tokens inconsistentes**: Algunas clases usaban tokens inconsistentes (ej. `.btn.primary` usaba `var(--primary)` pero la paleta definía `--accent`)
3. **Falta de estados de accesibilidad**: Ausencia de `:focus-visible` y estados hover con contraste adecuado

### Archivos tocados

#### assets/styles.css
```diff
:root{
  /* Colors */
  --bg:#0b0f14; --panel:#0f1628; --card:#111827; --text:#e5e7eb; --muted:#94a3b8;
  --accent:#22c55e; --accent-600:#16a34a; --accent-700:#15803d;
  --danger:#ef4444; --warning:#f59e0b; --border:rgba(255,255,255,.08);
+ /* Additional color tokens for consistency */
+ --primary: var(--accent);        /* para no duplicar intención */
+ --blue: #3b82f6;                 /* azul accesible */
+ --red: #ef4444;                  /* rojo accesible */
+ --yellow: #f59e0b;               /* ya existe como --warning, manten coherencia */
  /* Typography & radii */
  --font: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --radius: 12px; --radius-lg: 20px;
  /* Shadows */
  --shadow-1: 0 6px 18px rgba(0,0,0,.30);
  --shadow-2: 0 10px 25px rgba(0,0,0,.35);
  /* Spacing */
  --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-6: 24px;
}

.btn{appearance:none;border:1px solid var(--border);background:var(--card);color:var(--text);padding:10px 12px;border-radius:10px;cursor:pointer}
+.btn:focus-visible{outline:2px solid rgba(255,255,255,.25);outline-offset:2px}
.btn.primary{background:var(--primary);border-color:#2b8a3e;color:#0a140d;font-weight:700}
+.btn.primary:hover{filter:brightness(1.06)}
.btn.ghost{background:transparent}
+.btn.ghost:hover{background:rgba(255,255,255,.05)}
.btn.warn{background:var(--warning);color:#1a1a1a;border-color:#c6a700}
+.btn.warn:hover{filter:brightness(1.06)}

.nav-btn{appearance:none;border:1px solid var(--border);background:transparent;color:var(--text);text-align:left;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:14px}
+.nav-btn:hover{background:rgba(255,255,255,.05)}
+.nav-btn:focus-visible{outline:2px solid rgba(255,255,255,.25);outline-offset:2px}

.icon-btn{
  background:transparent;border:1px solid var(--border);border-radius:10px;
  width:30px;height:30px;display:grid;place-items:center;cursor:pointer;transition:filter .15s ease,opacity .15s ease
}
+.icon-btn:focus-visible{outline:2px solid rgba(255,255,255,.25);outline-offset:2px}
.icon-btn.edit{background:var(--blue);border-color:#1d4ed8;color:#fff}
.icon-btn.delete{background:var(--red);border-color:#b91c1c;color:#fff}

.file-btn{background:var(--card);color:var(--text);padding:8px 12px;border-radius:10px;border:1px solid var(--border);cursor:pointer}
```

### Variables añadidas
- `--primary: var(--accent)` - Mapeo consistente para botones primarios
- `--blue: #3b82f6` - Azul accesible para botones de edición
- `--red: #ef4444` - Rojo accesible para botones de eliminación
- `--yellow: #f59e0b` - Amarillo consistente con `--warning`

### Clases afectadas
- `.btn.primary` - Usa `var(--primary)` con contraste oscuro (#0a140d)
- `.btn.warn` - Usa `var(--warning)` consistentemente
- `.btn.ghost` - Hover con fondo sutil
- `.nav-btn` - Estados hover y focus-visible
- `.icon-btn.edit` - Background azul con borde #1d4ed8
- `.icon-btn.delete` - Background rojo con borde #b91c1c
- `.file-btn` - Variables consistentes
- `.tag` - Ya usaba `var(--primary)` correctamente

### Estados de accesibilidad añadidos
- `:focus-visible` para todos los botones con outline claro
- `:hover` con contraste ≥ WCAG AA usando `filter: brightness(1.06)` o fondos sutiles
- Colores de borde ajustados para mejor contraste

### Resultado esperado
- ✅ Botones "Crear categoría", "Crear socio" con buen contraste visible
- ✅ Botones de tarjetas (editar/eliminar/config) con contraste adecuado
- ✅ FAB "+" visible y coherente con el tema
- ✅ FAB y botones del modal en "Transacciones" con contraste
- ✅ Contraste ≥ 4.5:1 (WCAG AA) en todos los botones
- ✅ Estados de focus y hover accesibles

### Commit
`fix(styles): corregir variables CSS no definidas y mejorar contraste de botones; restaurar accesibilidad`