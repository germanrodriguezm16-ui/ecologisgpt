# Guía de Resolución Rápida - Ecologist-GPT
## Soluciones Inmediatas para Problemas Comunes

**Fecha:** 10 de Enero, 2025  
**Propósito:** Soluciones rápidas para problemas frecuentes

---

## 🚨 Problemas Críticos (App No Funciona)

### Pantalla Completamente Negra
**Síntomas:** App carga pero no se ve nada
```javascript
// 1. Verificar en consola:
console.log('DOM listo:', document.readyState);
console.log('#view existe:', !!$('#view'));
console.log('#view vacío:', $('#view')?.children?.length === 0);

// 2. Fix rápido:
setTimeout(() => {
  $('#view').innerHTML = '<div class="card"><h3>Loading...</h3></div>';
  mountView('socios');
}, 1000);
```

### Errores de JavaScript
**Síntomas:** Errores en consola, app no responde
```javascript
// 1. Verificar imports:
console.log('APP_CONFIG:', window.APP_CONFIG);
console.log('Supabase client:', !!getClient());

// 2. Fix común - orden de scripts:
// En index.html: config.js DEBE ir antes que app.js
```

---

## 🔧 Problemas de UI

### Botones Sin Estilo/Transparentes
**Síntomas:** Botones invisibles o sin contraste
```css
/* Fix rápido en assets/styles.css */
:root {
  --primary: var(--accent);
  --blue: #3b82f6;
  --red: #ef4444;
  --yellow: #f59e0b;
}

.btn.primary {
  background: var(--primary) !important;
  color: #0a140d !important;
}
```

### Modal No Se Abre
**Síntomas:** Click en botón no hace nada
```javascript
// 1. Verificar elementos:
console.log('Modal existe:', !!$('#modalSocio'));
console.log('Form existe:', !!$('#formSocio'));

// 2. Fix - verificar que modal esté en HTML:
// Buscar en index.html: <div class="backdrop" id="modalSocio">
```

### Elemento Debug Visible
**Síntomas:** Texto flotante como "[BOOT] DOM listo"
```html
<!-- Remover de index.html -->
<!-- <div class="debug" id="debug">listo</div> -->
```

---

## 📊 Problemas de Datos

### Categorías No Se Cargan
**Síntomas:** Lista vacía en vista Socios
```javascript
// 1. Verificar Supabase:
const supabase = getClient();
supabase.from('categorias_socios').select('*').then(console.log);

// 2. Fix - verificar elemento:
console.log('#socGrid existe:', !!$('#socGrid'));
```

### Socios No Se Muestran
**Síntomas:** Tarjetas vacías
```javascript
// 1. Verificar datos:
fetchSocios().then(r => console.log('Socios:', r));

// 2. Fix - verificar render:
console.log('currentCatName:', currentCatName);
console.log('rows length:', rows?.length);
```

### Modal de Edición Vacío
**Síntomas:** Modal abre como "Nuevo socio" sin datos
```javascript
// 1. Verificar ID:
const id = card?.dataset?.id;
console.log('ID tipo:', typeof id, 'Valor:', id);

// 2. Fix - comparar strings, no números:
const socio = rows.find(x => x.id === id); // ✅ Correcto
// const socio = rows.find(x => Number(x.id) === Number(id)); // ❌ Incorrecto para UUIDs
```

---

## 🔄 Problemas de Navegación

### Hash No Cambia
**Síntomas:** URL no actualiza al navegar
```javascript
// Fix rápido:
location.hash = '#socios';
window.dispatchEvent(new HashChangeEvent('hashchange'));
```

### Vista No Se Monta
**Síntomas:** Click en navegación no cambia contenido
```javascript
// Debug:
console.log('Hash actual:', location.hash);
console.log('onHashChange definido:', typeof onHashChange);

// Fix manual:
mountView('socios');
```

---

## 🎨 Problemas de Estilo

### FAB No Visible
**Síntomas:** Botón flotante no aparece
```css
/* Fix en assets/styles.css */
.fab {
  z-index: 9999 !important;
  position: fixed !important;
  right: 20px !important;
  bottom: 20px !important;
}
```

### Contraste Insuficiente
**Síntomas:** Texto difícil de leer
```css
/* Fix rápido */
.btn, .nav-btn, .icon-btn {
  background: var(--primary) !important;
  color: #0a140d !important;
  border: 1px solid rgba(255,255,255,0.2) !important;
}
```

---

## 🚀 Comandos de Emergencia

### Reset Completo
```javascript
// En consola del navegador:
$('#view').innerHTML = '';
location.hash = '#socios';
setTimeout(() => mountView('socios'), 500);
```

### Recargar Datos
```javascript
// Forzar recarga de categorías:
loadCategorias();

// Forzar recarga de socios:
renderSocios();
```

### Debug Completo
```javascript
// Verificar estado completo:
console.log('=== DEBUG COMPLETO ===');
console.log('DOM ready:', document.readyState);
console.log('APP_CONFIG:', window.APP_CONFIG);
console.log('Supabase client:', !!getClient());
console.log('#view:', $('#view'));
console.log('#socGrid:', $('#socGrid'));
console.log('Hash:', location.hash);
console.log('========================');
```

---

## 📋 Checklist de Verificación Rápida

### App Básica
- [ ] `http://localhost:8080` carga
- [ ] No hay errores en consola
- [ ] Sidebar visible
- [ ] Contenido principal visible

### Funcionalidad
- [ ] Click en "Socios" muestra contenido
- [ ] Categorías se cargan
- [ ] Socios se muestran
- [ ] Botón "Crear categoría" funciona

### Modales
- [ ] Modal de categoría abre
- [ ] Modal de socio abre
- [ ] Modal de transacción abre
- [ ] Formularios se envían

### Edición
- [ ] Botón editar abre modal con datos
- [ ] Campos prellenados
- [ ] Guardar actualiza correctamente

---

## 🆘 Escalación

### Si Nada Funciona
1. **Verificar servidor:** ¿Está corriendo en puerto 8080?
2. **Verificar archivos:** ¿Existe `config.js` con claves válidas?
3. **Verificar red:** ¿Conexión a Supabase funciona?
4. **Reset completo:** Cerrar navegador, reiniciar servidor

### Logs Importantes
```javascript
// Copiar estos logs al reportar problemas:
console.log('User Agent:', navigator.userAgent);
console.log('URL:', window.location.href);
console.log('Errors:', window.console.errors);
console.log('APP_CONFIG:', window.APP_CONFIG);
```

---

**Usa esta guía como referencia rápida. Para problemas complejos, consulta el documento técnico completo.**

## 🤖 Problemas Detectados Automáticamente
*Actualizado: 2025-10-11 00:44:02*

### app.js
**Problemas detectados:** debug_code_present, missing_dom_validation

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
- **Validación DOM:** Agregar if (!element) return; antes de manipular elementos
### supabase.js
**Problemas detectados:** debug_code_present

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
### fab.js
**Problemas detectados:** debug_code_present

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
### modals.js
**Problemas detectados:** debug_code_present

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
### dom.js
**Problemas detectados:** debug_code_present, missing_dom_validation

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
- **Validación DOM:** Agregar if (!element) return; antes de manipular elementos
### overlay-diagnose.js
**Problemas detectados:** debug_code_present

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
### categorias.js
**Problemas detectados:** debug_code_present, missing_dom_validation

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
- **Validación DOM:** Agregar if (!element) return; antes de manipular elementos
### socios.js
**Problemas detectados:** debug_code_present, undefined_css_variables, missing_dom_validation

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
- **Variables CSS:** Definir variables en :root antes de usarlas
- **Validación DOM:** Agregar if (!element) return; antes de manipular elementos
### transacciones.js
**Problemas detectados:** debug_code_present, undefined_css_variables

**Soluciones sugeridas:**
- **Código de debug:** Remover console.log y elementos de debug antes de commit
- **Variables CSS:** Definir variables en :root antes de usarlas
