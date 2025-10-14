# Sistema Global de Fechas - Ecologist-GPT

## 📅 Convención Global de Fechas

**Fecha de implementación:** 13 de enero de 2025  
**Versión:** v3.0  
**Zona horaria oficial:** `America/Bogota`

### 🎯 Formato Estándar

Todas las fechas visibles en la aplicación siguen el formato unificado:

```
LUN 10 OCT 25 — 23:15
```

**Componentes:**
- **DOW:** Iniciales del día de la semana (LUN, MAR, MIE, JUE, VIE, SAB, DOM)
- **DD:** Día del mes (2 dígitos)
- **MES:** Iniciales del mes (ENE, FEB, MAR, ABR, MAY, JUN, JUL, AGO, SEP, OCT, NOV, DIC)
- **YY:** Año (2 dígitos)
- **HH:mm:** Hora en formato 24 horas

### 🗄️ Almacenamiento

- **Base de datos:** Todas las fechas se almacenan en formato **UTC (ISO 8601)**
- **Visualización:** Siempre se muestran en hora local de **Bogotá (UTC-5)**
- **Inputs:** Los campos datetime-local asumen hora de Bogotá

## 🛠️ API del Sistema

### Archivo: `js/utils/datetime.js`

#### Funciones Principales

```javascript
import { 
  isoUtcToBogotaLabelShort, 
  bogotaLocalToIsoUtc, 
  defaultDatetimeLocalBogota,
  nowBogota,
  isoUtcToDateLocal,
  isoUtcToTimeLocal
} from '../utils/datetime.js'
```

#### `isoUtcToBogotaLabelShort(iso)`
Convierte fecha ISO UTC a formato corto de Bogotá.

```javascript
const fecha = isoUtcToBogotaLabelShort('2025-01-13T23:15:00.000Z')
// Resultado: "LUN 13 ENE 25 — 18:15"
```

#### `bogotaLocalToIsoUtc(localValue)`
Convierte valor datetime-local de Bogotá a ISO UTC.

```javascript
const isoUtc = bogotaLocalToIsoUtc('2025-01-13T18:15')
// Resultado: "2025-01-13T23:15:00.000Z"
```

#### `defaultDatetimeLocalBogota()`
Genera valor por defecto para inputs datetime-local.

```javascript
const defaultValue = defaultDatetimeLocalBogota()
// Resultado: "2025-01-13T18:15" (hora actual de Bogotá)
```

#### `nowBogota()`
Obtiene la fecha/hora actual en zona horaria de Bogotá.

```javascript
const ahora = nowBogota()
// Resultado: Date object en hora de Bogotá
```

### Funciones Auxiliares

#### `isoUtcToDateLocal(iso)`
Convierte ISO UTC a formato de fecha para inputs `type="date"`.

#### `isoUtcToTimeLocal(iso)`
Convierte ISO UTC a formato de hora para inputs `type="time"`.

## 📋 Implementación por Módulo

### ✅ Transacciones
- **Tabla de transacciones:** Formato corto en columna fecha
- **Modal de creación:** Input datetime-local con valor por defecto
- **Display de fecha:** Usa `isoUtcToBogotaLabelShort()`
- **Envío al servidor:** Usa `bogotaLocalToIsoUtc()`

### ✅ Socios
- **Detalle de socio:** Transacciones muestran formato corto
- **Fechas de creación:** No visible en UI principal

### 🔄 Futuros Módulos
- **Pedidos:** Implementar al crear el módulo
- **Inventario:** Implementar al crear el módulo
- **Reportes:** Implementar al crear el módulo

## 🎨 Ejemplos de Uso

### En Componentes de Tabla
```javascript
// Mostrar fecha en tabla
const fecha = isoUtcToBogotaLabelShort(transaccion.fecha)
const cell = el('td', { class: 'tx-col-fecha' }, [esc(fecha)])
```

### En Formularios
```javascript
// Inicializar input datetime-local
const fechaInput = document.querySelector('input[name="fecha"]')
if (fechaInput && !fechaInput.value) {
  fechaInput.value = defaultDatetimeLocalBogota()
}

// Enviar formulario
const isoUtc = bogotaLocalToIsoUtc(fechaInput.value)
const payload = {
  fecha: isoUtc,
  // ... otros campos
}
```

### En Display de Fechas
```javascript
// Mostrar fecha en cualquier parte de la UI
const fechaDisplay = isoUtcToBogotaLabelShort(item.created_at)
element.textContent = fechaDisplay
```

## 🔧 Configuración Técnica

### Zona Horaria
- **Constante:** `TZ = 'America/Bogota'`
- **Offset:** UTC-5 (sin cambios por DST en Colombia)
- **API:** `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`

### Arrays de Referencia
```javascript
const DOW = ['DOM','LUN','MAR','MIE','JUE','VIE','SAB']
const MON = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
```

## 📝 Criterios de Aceptación

- ✅ Todas las fechas visibles usan formato "LUN 10 OCT 25 — 23:15"
- ✅ Todas las fechas se almacenan en UTC
- ✅ No hay cálculos manuales de offset
- ✅ Cualquier módulo nuevo hereda el sistema automáticamente
- ✅ Consistencia visual en toda la aplicación

## 🚨 Reglas de Desarrollo

1. **Nunca** formatear fechas manualmente con cálculos de offset
2. **Siempre** usar las funciones del helper `datetime.js`
3. **Verificar** que las fechas se muestren en formato corto
4. **Testear** en zona horaria de Bogotá
5. **Documentar** cualquier excepción al formato estándar

## 🔄 Migración de Fechas Existentes

Si encuentras fechas que no siguen este formato:

1. Identificar el archivo y función
2. Importar `isoUtcToBogotaLabelShort`
3. Reemplazar formato manual por la función
4. Verificar que la fecha se almacene en UTC
5. Testear la visualización

## 📊 Testing

Para verificar que el sistema funciona correctamente:

```javascript
// Test básico
const testIso = '2025-01-13T23:15:00.000Z'
const result = isoUtcToBogotaLabelShort(testIso)
console.assert(result.includes('LUN'), 'Formato de día incorrecto')
console.assert(result.includes('13'), 'Día incorrecto')
console.assert(result.includes('ENE'), 'Mes incorrecto')
console.assert(result.includes('25'), 'Año incorrecto')
console.assert(result.includes('18:15'), 'Hora incorrecta')
```

## 📚 Referencias

- [MDN - Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [IANA Time Zone Database - America/Bogota](https://en.wikipedia.org/wiki/Time_in_Colombia)
- [ISO 8601 Standard](https://en.wikipedia.org/wiki/ISO_8601)
