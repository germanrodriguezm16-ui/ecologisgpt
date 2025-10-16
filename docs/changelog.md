# Changelog - Ecologist-GPT

## [13/01/2025] Sistema Global de Fechas Bogotá v3 — Formato Unificado con Iniciales

### 🎯 **Objetivo**
Implementar sistema global de fechas con formato unificado para toda la aplicación, usando zona horaria "America/Bogota" y formato corto con iniciales.

### ✅ **Cambios Implementados**

#### **1. Nuevo Helper Global de Fechas**
- **Archivo:** `js/utils/datetime.js`
- **Funciones principales:**
  - `isoUtcToBogotaLabelShort()` - Formato corto "LUN 10 OCT 25 — 23:15"
  - `bogotaLocalToIsoUtc()` - Conversión datetime-local a UTC
  - `defaultDatetimeLocalBogota()` - Valor por defecto para inputs
  - `nowBogota()` - Fecha actual en zona Bogotá
  - `isoUtcToDateLocal()` - Para inputs type="date"
  - `isoUtcToTimeLocal()` - Para inputs type="time"

#### **2. Formato Estándar Aplicado**
- **Patrón:** `LUN 10 OCT 25 — 23:15`
- **DOW:** Iniciales días (DOM, LUN, MAR, MIE, JUE, VIE, SAB)
- **MES:** Iniciales meses (ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC)
- **Zona horaria:** America/Bogota (UTC-5)
- **Almacenamiento:** UTC en base de datos
- **Visualización:** Hora local de Bogotá

#### **3. Módulos Actualizados**

##### **Transacciones (`js/views/transacciones.js`)**
- ✅ Tabla de transacciones muestra formato corto
- ✅ Modal de creación usa `defaultDatetimeLocalBogota()`
- ✅ Envío al servidor usa `bogotaLocalToIsoUtc()`
- ✅ Display de fechas usa `isoUtcToBogotaLabelShort()`

##### **Socios (`js/views/socios.js`)**
- ✅ Vista de transacciones por socio usa formato corto
- ✅ Integración con sistema de fechas global

#### **4. Documentación Completa**
- **Archivo:** `docs/timezone.md`
- **Contenido:**
  - Convención global de fechas
  - API del sistema
  - Ejemplos de uso
  - Criterios de aceptación
  - Reglas de desarrollo
  - Guía de migración

### 🔧 **Implementación Técnica**

#### **Constantes del Sistema**
```javascript
export const TZ = 'America/Bogota'
const DOW = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']
const MON = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
```

#### **Ejemplo de Uso**
```javascript
import { isoUtcToBogotaLabelShort, bogotaLocalToIsoUtc, defaultDatetimeLocalBogota } from '../utils/datetime.js'

// Mostrar fecha
const fecha = isoUtcToBogotaLabelShort('2025-01-13T23:15:00.000Z')
// Resultado: "LUN 13 ENE 25 — 18:15"

// Inicializar input
fechaInput.value = defaultDatetimeLocalBogota()

// Enviar formulario
const isoUtc = bogotaLocalToIsoUtc(fechaInput.value)
```

### 📋 **Criterios de Aceptación Cumplidos**
- ✅ Todas las fechas visibles usan formato "LUN 10 OCT 25 — 23:15"
- ✅ Todas las fechas se almacenan en UTC
- ✅ No hay cálculos manuales de offset
- ✅ Cualquier módulo nuevo hereda el sistema automáticamente
- ✅ Consistencia visual en toda la aplicación

### 🚨 **Reglas de Desarrollo Establecidas**
1. **Nunca** formatear fechas manualmente con cálculos de offset
2. **Siempre** usar las funciones del helper `datetime.js`
3. **Verificar** que las fechas se muestren en formato corto
4. **Testear** en zona horaria de Bogotá
5. **Documentar** cualquier excepción al formato estándar

### 🔄 **Impacto en Futuros Módulos**
- **Pedidos:** Implementar al crear el módulo
- **Inventario:** Implementar al crear el módulo
- **Reportes:** Implementar al crear el módulo
- **Cualquier nueva vista:** Hereda automáticamente el sistema

### 📊 **Testing**
```javascript
// Test básico del sistema
const testIso = '2025-01-13T23:15:00.000Z'
const result = isoUtcToBogotaLabelShort(testIso)
console.assert(result.includes('LUN'), 'Formato de día incorrecto')
console.assert(result.includes('13'), 'Día incorrecto')
console.assert(result.includes('ENE'), 'Mes incorrecto')
console.assert(result.includes('25'), 'Año incorrecto')
console.assert(result.includes('18:15'), 'Hora incorrecta')
```

### 🎯 **Beneficios**
- **Consistencia:** Formato unificado en toda la aplicación
- **Mantenibilidad:** Helper centralizado para todas las operaciones de fecha
- **Precisión:** Manejo correcto de zona horaria sin cálculos manuales
- **Escalabilidad:** Sistema preparado para futuros módulos
- **UX:** Formato legible y familiar para usuarios colombianos

---

## [10/11/2025] Corrección de Transacciones por Socio

### ✅ **Problema Resuelto**
- **Issue:** Las transacciones no aparecían en la pestaña de transacciones del detalle de socio
- **Causa:** La función `renderSocioDetailPanel` mostraba HTML estático en lugar de cargar transacciones reales

### 🔧 **Solución Implementada**
- **Archivo:** `js/views/socios.js`
- **Cambios:**
  - Modificada función `renderSocioDetailPanel` para crear contenedor dinámico
  - Integración con `renderSocioTransacciones` del módulo de transacciones
  - Botón funcional "Agregar transacción" desde el detalle del socio
  - Manejo correcto de elementos DOM vs HTML strings

### 🎯 **Resultado**
- ✅ Las transacciones del socio se cargan correctamente
- ✅ Formato consistente con el módulo principal de transacciones
- ✅ Funcionalidad completa de creación de transacciones desde el detalle

---

## [10/11/2025] Políticas RLS de Supabase

### ✅ **Problema Resuelto**
- **Issue:** Las transacciones no se mostraban en la aplicación (array vacío desde Supabase)
- **Causa:** Falta de políticas Row Level Security (RLS) en la tabla `transacciones`

### 🔧 **Solución Implementada**
- **Políticas RLS creadas:**
  - `transacciones_read` - SELECT para usuarios anónimos
  - `transacciones_insert` - INSERT para usuarios anónimos  
  - `transacciones_update` - UPDATE para usuarios anónimos
  - `transacciones_delete` - DELETE para usuarios anónimos

### 🎯 **Resultado**
- ✅ Las transacciones se cargan correctamente en el módulo principal
- ✅ Las transacciones se muestran en la vista por socio
- ✅ Sistema de permisos configurado correctamente

---

*Changelog mantenido automáticamente por el sistema de documentación*
