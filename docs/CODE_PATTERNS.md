# Patrones de Código - Ecologist-GPT
## Templates y Patrones Reutilizables

**Fecha:** 10 de Enero, 2025  
**Propósito:** Patrones probados para desarrollo consistente y eficiente

---

## 🏗️ Patrones de DOM

### Validación Defensiva de Elementos
```javascript
// ✅ Patrón recomendado
function safeElementManipulation(elementId, callback) {
  const element = $(elementId);
  if (!element) {
    console.error(`[ERROR] Elemento ${elementId} no encontrado`);
    return false;
  }
  
  try {
    callback(element);
    return true;
  } catch (error) {
    console.error(`[ERROR] Manipulando ${elementId}:`, error);
    return false;
  }
}

// Uso:
safeElementManipulation('#view', (el) => {
  el.innerHTML = '<div class="loading">Cargando...</div>';
});
```

### Renderizado con Fallback
```javascript
// ✅ Patrón para renderizado seguro
function renderWithFallback(containerId, renderFunction, fallbackContent) {
  const container = $(containerId);
  if (!container) {
    console.error(`Container ${containerId} no encontrado`);
    return;
  }
  
  try {
    const content = renderFunction();
    container.innerHTML = content;
  } catch (error) {
    console.error('Error en renderizado:', error);
    container.innerHTML = fallbackContent || '<div class="error">Error cargando contenido</div>';
  }
}

// Uso:
renderWithFallback('#socGrid', () => {
  return rows.map(r => buildCard(r)).join('');
}, '<div class="empty">No hay datos disponibles</div>');
```

---

## 🔄 Patrones de Event Handlers

### Handler con Validación de Datos
```javascript
// ✅ Patrón para event handlers seguros
function createEditHandler(rows, currentCatName) {
  return function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Validar datos necesarios
    if (!rows || !Array.isArray(rows)) {
      console.error('[EDIT] rows no válido:', rows);
      return;
    }
    
    if (!currentCatName) {
      console.error('[EDIT] currentCatName no definido');
      return;
    }
    
    // Extraer ID de manera segura
    const card = e.target.closest('.card');
    if (!card) {
      console.error('[EDIT] Card no encontrada');
      return;
    }
    
    const id = card.dataset.id;
    if (!id) {
      console.error('[EDIT] ID no encontrado en card');
      return;
    }
    
    // Buscar socio
    const socio = rows.find(x => x.id === id);
    if (!socio) {
      console.error('[EDIT] Socio no encontrado para ID:', id);
      return;
    }
    
    // Ejecutar acción
    openSocioModal(socio, currentCatName);
  };
}

// Uso:
$all('.icon-btn.edit', grid).forEach(btn => {
  btn.addEventListener('click', createEditHandler(rows, currentCatName));
});
```

### Handler con Timeout para DOM
```javascript
// ✅ Patrón para operaciones que dependen del DOM
function delayedDOMOperation(operation, delay = 200) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = operation();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}

// Uso:
delayedDOMOperation(() => {
  const grid = $('#socGrid');
  if (!grid) throw new Error('Grid no encontrado');
  loadCategorias();
}).catch(error => {
  console.error('Error en operación DOM:', error);
});
```

---

## 🎨 Patrones de CSS

### Variables CSS Defensivas
```css
/* ✅ Patrón para variables CSS seguras */
:root {
  /* Colores base - SIEMPRE definir */
  --primary: var(--accent, #22c55e);
  --secondary: #64748b;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #3b82f6;
  
  /* Colores de texto con fallbacks */
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  
  /* Fondos con fallbacks */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-muted: #f1f5f9;
}

/* Uso con fallbacks */
.btn {
  background: var(--primary, #22c55e);
  color: var(--text-primary, #0f172a);
  border: 1px solid var(--border-color, rgba(0,0,0,0.1));
}
```

### Estados de Accesibilidad
```css
/* ✅ Patrón para estados accesibles */
.interactive-element {
  /* Estado base */
  transition: all 0.2s ease;
  
  /* Hover */
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  /* Focus visible */
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  
  /* Active */
  &:active {
    transform: translateY(0);
    transition: all 0.1s ease;
  }
  
  /* Disabled */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
}
```

---

## 📊 Patrones de Datos

### Fetch con Manejo de Errores
```javascript
// ✅ Patrón para fetch seguro
async function safeFetch(queryFunction, errorMessage = 'Error cargando datos') {
  try {
    const result = await queryFunction();
    
    if (result.error) {
      console.error('[FETCH] Error de Supabase:', result.error);
      return { data: null, error: result.error };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    console.error('[FETCH] Error general:', error);
    return { data: null, error: error };
  }
}

// Uso:
const { data: categorias, error } = await safeFetch(
  () => supabase.from('categorias_socios').select('*'),
  'Error cargando categorías'
);

if (error) {
  showErrorMessage('No se pudieron cargar las categorías');
  return;
}
```

### Validación de Tipos de Datos
```javascript
// ✅ Patrón para validación de tipos
function validateSocioData(socio) {
  const errors = [];
  
  if (!socio) {
    errors.push('Socio es requerido');
    return { valid: false, errors };
  }
  
  if (!socio.id || typeof socio.id !== 'string') {
    errors.push('ID debe ser un string válido');
  }
  
  if (!socio.empresa || typeof socio.empresa !== 'string') {
    errors.push('Empresa es requerida');
  }
  
  if (!socio.titular || typeof socio.titular !== 'string') {
    errors.push('Titular es requerido');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Uso:
const validation = validateSocioData(socio);
if (!validation.valid) {
  console.error('Datos de socio inválidos:', validation.errors);
  return;
}
```

---

## 🔧 Patrones de Modales

### Modal con Validación
```javascript
// ✅ Patrón para modales seguros
function openModalSafely(modalId, data = null) {
  const modal = $(modalId);
  if (!modal) {
    console.error(`[MODAL] Modal ${modalId} no encontrado`);
    return false;
  }
  
  try {
    // Prellenar datos si se proporcionan
    if (data) {
      prefillModalData(modal, data);
    }
    
    // Mostrar modal
    openModal(modal);
    return true;
  } catch (error) {
    console.error(`[MODAL] Error abriendo ${modalId}:`, error);
    return false;
  }
}

function prefillModalData(modal, data) {
  const form = modal.querySelector('form');
  if (!form) return;
  
  // Prellenar campos de manera segura
  Object.keys(data).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field && data[key] !== undefined) {
      field.value = data[key] || '';
    }
  });
}

// Uso:
openModalSafely('#modalSocio', {
  empresa: socio.empresa,
  titular: socio.titular,
  telefono: socio.telefono
});
```

---

## 🚀 Patrones de Performance

### Debounce para Búsquedas
```javascript
// ✅ Patrón para búsquedas eficientes
function createDebouncedSearch(searchFunction, delay = 300) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      searchFunction.apply(this, args);
    }, delay);
  };
}

// Uso:
const debouncedSearch = createDebouncedSearch((query) => {
  filterSocios(query);
});

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### Lazy Loading de Componentes
```javascript
// ✅ Patrón para carga diferida
function lazyLoadComponent(componentName, loadFunction) {
  let component = null;
  
  return async function(...args) {
    if (!component) {
      console.log(`[LAZY] Cargando componente ${componentName}`);
      component = await loadFunction();
    }
    return component.apply(this, args);
  };
}

// Uso:
const lazyLoadTransacciones = lazyLoadComponent('transacciones', async () => {
  const module = await import('./views/transacciones.js');
  return module.renderTransacciones;
});
```

---

## 📋 Templates de Archivos

### Template de Vista
```javascript
// ✅ Template para nuevas vistas
export async function renderNuevaVista() {
  const container = $('#view');
  if (!container) {
    console.error('[NUEVA_VISTA] Container no encontrado');
    return;
  }
  
  try {
    // Cargar datos
    const { data, error } = await fetchData();
    if (error) {
      container.innerHTML = '<div class="error">Error cargando datos</div>';
      return;
    }
    
    // Renderizar
    container.innerHTML = buildVistaHTML(data);
    
    // Bindear eventos
    bindVistaEvents(data);
    
  } catch (error) {
    console.error('[NUEVA_VISTA] Error:', error);
    container.innerHTML = '<div class="error">Error inesperado</div>';
  }
}

function buildVistaHTML(data) {
  if (!data || data.length === 0) {
    return '<div class="empty">No hay datos disponibles</div>';
  }
  
  return data.map(item => buildItemHTML(item)).join('');
}

function bindVistaEvents(data) {
  // Bindear eventos específicos de la vista
}
```

### Template de Modal
```javascript
// ✅ Template para nuevos modales
export function openNuevoModal(data = null) {
  const modal = $('#modalNuevo');
  if (!modal) {
    console.error('[MODAL] Modal no encontrado');
    return;
  }
  
  // Configurar título
  const title = modal.querySelector('#modalNuevoTitle');
  if (title) {
    title.textContent = data ? 'Editar Item' : 'Nuevo Item';
  }
  
  // Prellenar datos si se proporcionan
  if (data) {
    prefillForm(modal, data);
  }
  
  // Mostrar modal
  openModal(modal);
}

function prefillForm(modal, data) {
  const form = modal.querySelector('form');
  if (!form) return;
  
  // Prellenar campos
  Object.keys(data).forEach(key => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) {
      field.value = data[key] || '';
    }
  });
}
```

---

## 🎯 Mejores Prácticas

### 1. **Siempre Validar**
```javascript
// ✅ Validar antes de usar
if (!element) return;
if (!data) return;
if (!Array.isArray(items)) return;
```

### 2. **Manejar Errores Gracefully**
```javascript
// ✅ Try-catch con fallbacks
try {
  const result = await operation();
  // Usar result
} catch (error) {
  console.error('Error:', error);
  // Fallback o mensaje de error
}
```

### 3. **Logs Informativos**
```javascript
// ✅ Logs útiles para debugging
console.log('[COMPONENTE] Operación iniciada:', { param1, param2 });
console.log('[COMPONENTE] Resultado:', result);
console.error('[COMPONENTE] Error:', error);
```

### 4. **Código Autodocumentado**
```javascript
// ✅ Nombres descriptivos y comentarios útiles
function validateSocioData(socio) {
  // Validar que el socio tenga los campos requeridos
  // Retorna { valid: boolean, errors: string[] }
}
```

---

**Usa estos patrones como base para desarrollo consistente y mantenible.**

## 🔄 Patrones Detectados Automáticamente
*Actualizado: 2025-10-11 00:44:02*

### Archivos Analizados
#### app.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation, async_operations
- **Problemas detectados:** debug_code_present, missing_dom_validation
- **Última modificación:** 10/10/2025 23:24:52
#### supabase.js
- **Patrones encontrados:** async_operations
- **Problemas detectados:** debug_code_present
- **Última modificación:** 10/10/2025 23:00:12
#### fab.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation
- **Problemas detectados:** debug_code_present
- **Última modificación:** 10/10/2025 23:33:10
#### modals.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation
- **Problemas detectados:** debug_code_present
- **Última modificación:** 10/11/2025 00:35:43
#### currency.js
- **Patrones encontrados:** validation_pattern
- **Problemas detectados:** 
- **Última modificación:** 10/10/2025 17:41:01
#### dom.js
- **Patrones encontrados:** dom_manipulation
- **Problemas detectados:** debug_code_present, missing_dom_validation
- **Última modificación:** 10/10/2025 17:41:01
#### overlay-diagnose.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation
- **Problemas detectados:** debug_code_present
- **Última modificación:** 10/10/2025 17:41:01
#### categorias.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation, async_operations
- **Problemas detectados:** debug_code_present, missing_dom_validation
- **Última modificación:** 10/10/2025 23:00:12
#### socios.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation, async_operations
- **Problemas detectados:** debug_code_present, undefined_css_variables, missing_dom_validation
- **Última modificación:** 10/11/2025 00:35:43
#### transacciones.js
- **Patrones encontrados:** validation_pattern, error_handling, dom_manipulation, async_operations
- **Problemas detectados:** debug_code_present, undefined_css_variables
- **Última modificación:** 10/10/2025 17:41:01
