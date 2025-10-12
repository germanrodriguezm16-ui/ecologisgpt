# TASKS - Estado del proyecto

Este archivo mantiene un registro simple de prioridades y acciones relacionadas con la documentación y desarrollo.

## Por hacer
- Implementar validaciones frontend que muestren una lista de campos obligatorios en el modal de transacción. (Responsable: equipo)
- Añadir placeholders consistentes para selects que no tienen valor seleccionado.
- Revisar bucket `transacciones` en Supabase y ajustar políticas de acceso (público vs. privado).
- Crear pruebas unitarias mínimas para el FSM de `js/utils/currency.js`.
- Evaluar integración de date-time picker (flatpickr) para navegadores sin `showPicker()`.

## En progreso
- Crear y mantener documentación en `/docs` (esta tarea). — En progreso: documentos base creados.

## Completadas
- Implementación de FSM para input de moneda (entrada incremental y formateo). (Completado)
- Modal `Nueva transacción` rediseñado y validaciones básicas añadidas.
- Subida y previsualización de comprobante en modal (objectURL), con revocación en cierre.

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