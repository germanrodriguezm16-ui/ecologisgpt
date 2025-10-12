# Referencia Rápida - Ecologist-GPT
## Comandos, URLs y Información Esencial

**Fecha:** 10 de Enero, 2025  
**Propósito:** Referencia rápida para desarrollo diario

---

## 🚀 Comandos Esenciales

### Servidor de Desarrollo
```bash
# Iniciar servidor
powershell -ExecutionPolicy Bypass -File start-dev.ps1

# URL de desarrollo
http://localhost:8080

# Verificar puerto
netstat -an | findstr :8080
```

### Navegador
```javascript
// Abrir en navegador
Start-Process 'http://localhost:8080'

// Hard refresh
Ctrl + Shift + R

// Abrir DevTools
F12
```

---

## 🔧 URLs y Endpoints

### Desarrollo Local
- **App Principal:** `http://localhost:8080`
- **Configuración:** `./config.js`
- **Logs:** Consola del navegador (F12)

### Supabase
- **URL:** `https://qsskzmzplqgxdhwspqeo.supabase.co`
- **Tablas principales:**
  - `categorias_socios`
  - `socios`
  - `transacciones`

---

## 📁 Archivos Clave

### Configuración
- `config.js` - Claves de Supabase y Sentry
- `package.json` - Dependencias y scripts
- `index.html` - Punto de entrada

### JavaScript Principal
- `js/app.js` - Aplicación principal
- `js/services/supabase.js` - Cliente de BD
- `js/ui/modals.js` - Gestión de modales
- `js/views/socios.js` - Lógica de socios
- `js/views/categorias.js` - Lógica de categorías
- `js/views/transacciones.js` - Lógica de transacciones

### Estilos
- `assets/styles.css` - Estilos principales
- `assets/flatpickr-theme.css` - Tema del date picker

---

## 🎯 Funciones Importantes

### DOM Utilities
```javascript
// Selectores
$('#elementId')           // Por ID
$all('.class')            // Por clase
el('div', {class: 'card'}) // Crear elemento

// Manipulación
element.innerHTML = ''    // Limpiar
element.appendChild(child) // Agregar hijo
element.setAttribute('data-id', value) // Setear atributo
```

### Supabase
```javascript
// Cliente
const supabase = getClient()

// Queries comunes
supabase.from('categorias_socios').select('*')
supabase.from('socios').select('*').eq('categoria_id', id)
supabase.from('socios').insert([data])
supabase.from('socios').update(data).eq('id', id)
```

### Modales
```javascript
// Abrir modales
openSocioModal(socio, currentCatName)
openCatModal('create')
openTransaccionModal()

// Cerrar modales
closeSocioModal()
closeCatModal()
closeTransaccionModal()
```

---

## 🐛 Debugging Rápido

### Verificar Estado
```javascript
// En consola del navegador
console.log('APP_CONFIG:', window.APP_CONFIG);
console.log('Supabase client:', !!getClient());
console.log('#view:', $('#view'));
console.log('Hash:', location.hash);
```

### Logs Útiles
```javascript
// Para debugging
console.log('[DEBUG]', variable);
console.table(arrayData);
console.group('Section');
console.error('Error:', error);
```

### Reset Rápido
```javascript
// Reset completo
$('#view').innerHTML = '';
location.hash = '#socios';
setTimeout(() => mountView('socios'), 500);
```

---

## 🎨 CSS Rápido

### Variables Esenciales
```css
:root {
  --primary: var(--accent);
  --blue: #3b82f6;
  --red: #ef4444;
  --yellow: #f59e0b;
  --text: #0f172a;
  --muted: #64748b;
}
```

### Clases Útiles
```css
.btn.primary    /* Botón principal */
.btn.warn       /* Botón de advertencia */
.card           /* Tarjeta de contenido */
.grid           /* Grid de tarjetas */
.modal          /* Modal */
.fab            /* Botón flotante */
```

### Estados
```css
:hover          /* Hover */
:focus-visible  /* Focus accesible */
:active         /* Activo */
:disabled       /* Deshabilitado */
```

---

## 📊 Estructura de Datos

### Socio
```javascript
{
  id: "uuid-string",
  empresa: "string",
  titular: "string", 
  telefono: "string",
  direccion: "string",
  card_color: "#hex",
  categoria_id: "uuid-string",
  avatar_url: "string"
}
```

### Categoría
```javascript
{
  id: "uuid-string",
  nombre: "string",
  color: "#hex",
  balance: number,
  orden: number
}
```

### Transacción
```javascript
{
  id: "uuid-string",
  origen_socio_id: "uuid-string",
  destino_socio_id: "uuid-string",
  valor: number,
  fecha: "datetime",
  descripcion: "string"
}
```

---

## 🔄 Flujos Comunes

### Cargar Vista de Socios
1. `mountView('socios')`
2. `loadCategorias()`
3. `renderSocios()`
4. `buildSociosCards(rows, currentCatName)`

### Editar Socio
1. Click en botón editar
2. `openSocioModal(socio, currentCatName)`
3. Prellenar formulario
4. `handleSocioFormSubmit()`
5. Update en Supabase

### Crear Transacción
1. Click en FAB
2. `openTransaccionModal()`
3. `prepareTransaccionModal()`
4. `handleTransaccionFormSubmit()`
5. Insert en Supabase

---

## ⚡ Tips de Productividad

### Atajos de Teclado
- `Ctrl + Shift + R` - Hard refresh
- `F12` - DevTools
- `Ctrl + F` - Buscar en archivo
- `Ctrl + Shift + F` - Buscar en proyecto

### Comandos PowerShell Útiles
```powershell
# Ver procesos en puerto
netstat -ano | findstr :8080

# Listar archivos JS
Get-ChildItem -Recurse -Name "*.js"

# Buscar texto en archivos
Select-String -Path "*.js" -Pattern "pattern"
```

### Snippets de Código
```javascript
// Validación rápida
if (!element) return;

// Try-catch básico
try {
  // código
} catch (error) {
  console.error('Error:', error);
}

// Log de debugging
console.log('[COMPONENTE]', variable);
```

---

## 🚨 Señales de Alerta

### Errores Comunes
- `NaN` en IDs → Problema de tipos
- `undefined` en elementos → DOM no listo
- Botones transparentes → Variables CSS faltantes
- Modal vacío → Objeto no pasado

### Soluciones Rápidas
- **Pantalla negra:** Verificar `#view` y `mountView()`
- **Sin datos:** Verificar Supabase y `loadCategorias()`
- **Modal vacío:** Verificar tipos de ID (UUID vs número)
- **Sin estilos:** Verificar variables CSS en `:root`

---

## 📋 Checklist Diario

### Al Empezar
- [ ] Servidor corriendo en puerto 8080
- [ ] App carga sin errores
- [ ] Consola limpia
- [ ] Config.js válido

### Al Terminar
- [ ] Remover logs de debug
- [ ] Verificar funcionalidad completa
- [ ] No hay elementos debug visibles
- [ ] Código limpio y comentado

---

**Mantén esta referencia actualizada con nuevos comandos y patrones útiles.**

## 🔄 Funciones Detectadas Automáticamente
*Actualizado: 2025-10-11 00:44:02*

### Funciones Exportadas
- **getClient** - $(@{Function=getClient; File=supabase.js; Path=js\services\supabase.js}.Path)
- **getCategoriaById** - $(@{Function=getCategoriaById; File=supabase.js; Path=js\services\supabase.js}.Path)
- **createFAB** - $(@{Function=createFAB; File=fab.js; Path=js\ui\fab.js}.Path)
- **removeFAB** - $(@{Function=removeFAB; File=fab.js; Path=js\ui\fab.js}.Path)
- **openConfirm** - $(@{Function=openConfirm; File=modals.js; Path=js\ui\modals.js}.Path)
- **bindConfirm** - $(@{Function=bindConfirm; File=modals.js; Path=js\ui\modals.js}.Path)
- **openCatModal** - $(@{Function=openCatModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **closeCatModal** - $(@{Function=closeCatModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **getCatEditId** - $(@{Function=getCatEditId; File=modals.js; Path=js\ui\modals.js}.Path)
- **openCatConfig** - $(@{Function=openCatConfig; File=modals.js; Path=js\ui\modals.js}.Path)
- **closeCatConfig** - $(@{Function=closeCatConfig; File=modals.js; Path=js\ui\modals.js}.Path)
- **getCatCfgId** - $(@{Function=getCatCfgId; File=modals.js; Path=js\ui\modals.js}.Path)
- **openSocioModal** - $(@{Function=openSocioModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **closeSocioModal** - $(@{Function=closeSocioModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **getSocioEditId** - $(@{Function=getSocioEditId; File=modals.js; Path=js\ui\modals.js}.Path)
- **bindModalCloseButtons** - $(@{Function=bindModalCloseButtons; File=modals.js; Path=js\ui\modals.js}.Path)
- **closeAllModalsAndOverlays** - $(@{Function=closeAllModalsAndOverlays; File=modals.js; Path=js\ui\modals.js}.Path)
- **openTransaccionModal** - $(@{Function=openTransaccionModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **closeTransaccionModal** - $(@{Function=closeTransaccionModal; File=modals.js; Path=js\ui\modals.js}.Path)
- **contrastColor** - $(@{Function=contrastColor; File=colors.js; Path=js\utils\colors.js}.Path)
- **mutedFor** - $(@{Function=mutedFor; File=colors.js; Path=js\utils\colors.js}.Path)
- **borderOn** - $(@{Function=borderOn; File=colors.js; Path=js\utils\colors.js}.Path)
- **initials** - $(@{Function=initials; File=colors.js; Path=js\utils\colors.js}.Path)
- **formatThousands** - $(@{Function=formatThousands; File=currency.js; Path=js\utils\currency.js}.Path)
- **createCurrencyFSM** - $(@{Function=createCurrencyFSM; File=currency.js; Path=js\utils\currency.js}.Path)
- **el** - $(@{Function=el; File=dom.js; Path=js\utils\dom.js}.Path)
- **debug** - $(@{Function=debug; File=dom.js; Path=js\utils\dom.js}.Path)
- **esc** - $(@{Function=esc; File=dom.js; Path=js\utils\dom.js}.Path)
- **fmt** - $(@{Function=fmt; File=format.js; Path=js\utils\format.js}.Path)
- **formatCurrencyLive** - $(@{Function=formatCurrencyLive; File=format.js; Path=js\utils\format.js}.Path)
- **loadCategorias** - $(@{Function=loadCategorias; File=categorias.js; Path=js\views\categorias.js}.Path)
- **buildCatCard** - $(@{Function=buildCatCard; File=categorias.js; Path=js\views\categorias.js}.Path)
- **openSociosList** - $(@{Function=openSociosList; File=socios.js; Path=js\views\socios.js}.Path)
- **renderSocios** - $(@{Function=renderSocios; File=socios.js; Path=js\views\socios.js}.Path)
- **openSocioDetail** - $(@{Function=openSocioDetail; File=socios.js; Path=js\views\socios.js}.Path)
- **handleSocioFormSubmit** - $(@{Function=handleSocioFormSubmit; File=socios.js; Path=js\views\socios.js}.Path)
- **openTransaccionesView** - $(@{Function=openTransaccionesView; File=transacciones.js; Path=js\views\transacciones.js}.Path)
- **prepareTransaccionModal** - $(@{Function=prepareTransaccionModal; File=transacciones.js; Path=js\views\transacciones.js}.Path)
- **renderTransacciones** - $(@{Function=renderTransacciones; File=transacciones.js; Path=js\views\transacciones.js}.Path)
- **handleTransaccionFormSubmit** - $(@{Function=handleTransaccionFormSubmit; File=transacciones.js; Path=js\views\transacciones.js}.Path)
