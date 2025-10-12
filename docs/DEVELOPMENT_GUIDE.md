# Guía de Desarrollo - Ecologist-GPT
## Mejores Prácticas y Flujo de Trabajo

**Fecha:** 10 de Enero, 2025  
**Propósito:** Guía rápida para desarrollo eficiente y evitar errores comunes

---

## 🚀 Setup Rápido

### Iniciar Servidor de Desarrollo
```bash
# Opción 1: PowerShell (recomendado)
powershell -ExecutionPolicy Bypass -File start-dev.ps1

# Opción 2: npm (si está disponible)
npm run dev

# URL: http://localhost:8080
```

### Verificar Configuración
- ✅ `config.js` existe y tiene claves válidas de Supabase
- ✅ `index.html` carga scripts en orden correcto
- ✅ No hay elementos de debug visibles en producción

---

## 🔧 Checklist de Desarrollo

### Antes de Hacer Cambios
- [ ] Abrir consola del navegador (F12)
- [ ] Verificar que la app carga sin errores
- [ ] Confirmar conexión a Supabase
- [ ] Hacer backup mental del estado actual

### Al Modificar JavaScript
- [ ] Validar elementos DOM antes de manipularlos
- [ ] Usar timeouts para operaciones que dependen del DOM
- [ ] Verificar tipos de datos (especialmente IDs UUID vs números)
- [ ] Pasar todos los parámetros necesarios a funciones
- [ ] Agregar logs temporales para debugging

### Al Modificar CSS
- [ ] Definir variables en `:root` antes de usarlas
- [ ] Mantener contraste WCAG AA
- [ ] Incluir estados hover/focus
- [ ] Probar en diferentes tamaños de pantalla

### Antes de Commit
- [ ] Remover logs de debug temporales
- [ ] Verificar que no hay elementos de debug visibles
- [ ] Probar funcionalidad completa
- [ ] Limpiar código comentado

---

## 🐛 Debugging Rápido

### Problemas Comunes y Soluciones

#### Pantalla Negra
```javascript
// Verificar en consola:
console.log('[DEBUG] #view existe:', !!$('#view'));
console.log('[DEBUG] #view children:', $('#view')?.children?.length);
```

#### Modal No Se Abre
```javascript
// Verificar elementos:
console.log('[DEBUG] Modal existe:', !!$('#modalSocio'));
console.log('[DEBUG] Form existe:', !!$('#formSocio'));
```

#### Datos No Se Cargan
```javascript
// Verificar Supabase:
console.log('[DEBUG] APP_CONFIG:', window.APP_CONFIG);
console.log('[DEBUG] Cliente Supabase:', !!getClient());
```

#### Botones Sin Estilo
```css
/* Verificar variables CSS: */
:root {
  --primary: var(--accent); /* ✅ Definida */
  --blue: #3b82f6;         /* ✅ Definida */
}
```

---

## 📁 Estructura de Archivos

```
js/
├── app.js              # Punto de entrada principal
├── services/
│   └── supabase.js     # Cliente y funciones de BD
├── ui/
│   ├── modals.js       # Gestión de modales
│   └── fab.js          # Botones flotantes
├── views/
│   ├── categorias.js   # Lógica de categorías
│   ├── socios.js       # Lógica de socios
│   └── transacciones.js # Lógica de transacciones
└── utils/
    ├── dom.js          # Utilidades DOM
    ├── colors.js       # Utilidades de color
    └── format.js       # Formateo de datos
```

---

## 🔄 Flujo de Datos

### Carga Inicial
1. `index.html` → Carga `config.js` → Carga `app.js`
2. `app.js` → Inicializa routing → Monta vista inicial
3. Vista → Carga datos de Supabase → Renderiza UI

### Edición de Socios
1. Click en "Editar" → Handler extrae ID → Busca socio en array
2. `openSocioModal(socio, currentCatName)` → Prellena formulario
3. Submit → `handleSocioFormSubmit()` → Update/Insert en Supabase

---

## ⚡ Tips de Eficiencia

### Logs Útiles
```javascript
// Para debugging rápido
console.log('[QUICK]', { variable1, variable2 });
console.table(arrayData); // Para arrays
console.group('Section'); // Para agrupar logs
```

### Validaciones Rápidas
```javascript
// Patrón para validar DOM
const element = $('#elementId');
if (!element) {
  console.error('Elemento no encontrado:', '#elementId');
  return;
}
```

### Manejo de Errores
```javascript
// Patrón para operaciones async
try {
  const result = await operation();
  // Usar result
} catch (error) {
  console.error('Error en operation:', error);
  // Fallback o mensaje de error
}
```

---

## 🎯 Comandos Útiles

### PowerShell
```powershell
# Verificar puerto
netstat -an | findstr :8080

# Abrir navegador
Start-Process 'http://localhost:8080'

# Verificar archivos
Get-ChildItem -Name "*.js" | Select-String "pattern"
```

### Navegador
```javascript
// En consola del navegador
window.__eg_mount('socios'); // Montar vista manualmente
$('#view').innerHTML = '';   // Limpiar vista
location.hash = '#socios';   // Cambiar hash
```

---

## 📋 Checklist de Testing

### Funcionalidad Básica
- [ ] App carga sin errores
- [ ] Navegación lateral funciona
- [ ] Categorías se cargan
- [ ] Socios se muestran
- [ ] FAB de transacciones visible

### Modales
- [ ] Modal de categoría abre/cierra
- [ ] Modal de socio abre/cierra
- [ ] Modal de transacción abre/cierra
- [ ] Formularios se envían correctamente

### Edición
- [ ] Botón editar abre modal con datos
- [ ] Campos se prellenan correctamente
- [ ] Guardar actualiza sin duplicar
- [ ] Título del modal es correcto

---

## 🚨 Señales de Alerta

### En Consola
- `NaN` en IDs → Problema de tipos de datos
- `undefined` en elementos → DOM no listo
- `Error: Supabase no configurado` → Config faltante
- `Identifier already declared` → Imports duplicados

### En UI
- Botones transparentes → Variables CSS faltantes
- Modal vacío → Objeto no pasado correctamente
- Elementos flotantes extraños → Debug no removido
- Pantalla negra → DOM no montado

---

**Mantén este documento actualizado con nuevos patrones y soluciones encontradas.**
