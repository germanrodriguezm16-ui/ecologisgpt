# Sistema de Actualización Automática de Documentación
## Ecologist-GPT - Documentación Viva

**Fecha:** 10 de Enero, 2025  
**Propósito:** Sistema automático para mantener la documentación actualizada

---

## 🚀 Uso Rápido

### Comandos Básicos
```powershell
# Actualizar toda la documentación
.\docs\update_docs.ps1

# Actualizar solo patrones de código
.\docs\update_docs.ps1 -Type patterns

# Actualizar solo troubleshooting
.\docs\update_docs.ps1 -Type troubleshooting

# Generar reporte de cambios
.\docs\update_docs.ps1 -Type report

# Actualizar con mensaje personalizado
.\docs\update_docs.ps1 -Type all -Message "Después de implementar nueva funcionalidad"
```

### Tipos de Actualización
- **`all`** - Actualiza todos los documentos
- **`patterns`** - Solo CODE_PATTERNS.md
- **`troubleshooting`** - Solo TROUBLESHOOTING_QUICK.md
- **`reference`** - Solo QUICK_REFERENCE.md
- **`report`** - Genera reporte de cambios

---

## 🔧 Configuración

### Archivo de Configuración
El sistema usa `docs/auto_update_config.json` para configurar:

- **Patrones a detectar** en el código
- **Problemas comunes** a identificar
- **Soluciones sugeridas** para cada problema
- **Rutas a monitorear** para cambios
- **Configuración de notificaciones**

### Personalizar Detección
```json
{
  "patterns_to_detect": {
    "mi_nuevo_patron": [
      "regex_pattern_1",
      "regex_pattern_2"
    ]
  },
  "issues_to_detect": {
    "mi_nuevo_problema": [
      "regex_para_detectar_problema"
    ]
  }
}
```

---

## 📊 Qué Detecta Automáticamente

### Patrones de Código
- ✅ **Validación defensiva:** `if (!element) return;`
- ✅ **Manejo de errores:** `try/catch`, `console.error`
- ✅ **Manipulación DOM:** `$()`, `querySelector`, `addEventListener`
- ✅ **Operaciones async:** `async/await`, `Promise`, `.then()`
- ✅ **Operaciones Supabase:** `supabase.from()`, `getClient()`

### Problemas Comunes
- ⚠️ **UUID a número:** `Number(dataset.id)` incorrecto
- ⚠️ **Código debug:** `console.log` en producción
- ⚠️ **Variables CSS:** `var(--undefined)` sin definir
- ⚠️ **Validación DOM:** Falta validación antes de manipular
- ⚠️ **Valores hardcodeados:** URLs, passwords en código

### Funciones Exportadas
- 📝 **Nuevas funciones:** Detecta `export function`
- 📝 **Archivos modificados:** Últimos 7 días
- 📝 **Dependencias:** Relaciones entre archivos

---

## 🔄 Flujo de Actualización

### 1. Análisis de Código
```
js/ → Escanear archivos → Extraer patrones → Detectar problemas
```

### 2. Generación de Contenido
```
Patrones → CODE_PATTERNS.md
Problemas → TROUBLESHOOTING_QUICK.md
Funciones → QUICK_REFERENCE.md
Cambios → CHANGE_REPORT_YYYY-MM-DD.md
```

### 3. Actualización de Documentos
```
Contenido generado → Agregar a documentos existentes → Backup automático
```

---

## 📋 Ejemplos de Uso

### Después de Implementar Nueva Funcionalidad
```powershell
# Ejecutar después de cambios importantes
.\docs\update_docs.ps1 -Type all -Message "Implementación de sistema de notificaciones"
```

### Antes de Commit
```powershell
# Verificar problemas detectados
.\docs\update_docs.ps1 -Type troubleshooting
```

### Generar Reporte Semanal
```powershell
# Reporte de cambios de la semana
.\docs\update_docs.ps1 -Type report
```

---

## 🎯 Beneficios

### Para Desarrolladores
- ✅ **Documentación siempre actualizada**
- ✅ **Detección automática de problemas**
- ✅ **Patrones probados documentados**
- ✅ **Soluciones sugeridas automáticamente**

### Para el Proyecto
- ✅ **Conocimiento preservado**
- ✅ **Buenas prácticas documentadas**
- ✅ **Problemas comunes identificados**
- ✅ **Onboarding más rápido**

---

## 🚨 Solución de Problemas

### Error: "Execution Policy"
```powershell
# Permitir ejecución de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Archivo no encontrado"
```powershell
# Verificar que estás en el directorio correcto
Get-Location
# Debe mostrar: C:\Users\...\ecologisgpt
```

### Error: "Permisos de escritura"
```powershell
# Ejecutar como administrador o verificar permisos
Get-Acl docs\ | Format-List
```

---

## 🔧 Personalización Avanzada

### Agregar Nuevos Patrones
1. Editar `docs/auto_update_config.json`
2. Agregar regex patterns en `patterns_to_detect`
3. Ejecutar `.\docs\update_docs.ps1 -Type patterns`

### Agregar Nuevos Problemas
1. Editar `docs/auto_update_config.json`
2. Agregar regex en `issues_to_detect`
3. Agregar solución en `solutions_templates`
4. Ejecutar `.\docs\update_docs.ps1 -Type troubleshooting`

### Configurar Notificaciones
```json
{
  "notification_settings": {
    "enabled": true,
    "email": "tu@email.com",
    "webhook_url": "https://hooks.slack.com/...",
    "console_output": true
  }
}
```

---

## 📈 Métricas y Reportes

### Reporte de Cambios
- **Archivos modificados** en los últimos 7 días
- **Patrones detectados** en cada archivo
- **Problemas identificados** con soluciones
- **Funciones nuevas** exportadas

### Backup Automático
- **Backup antes de actualizar** (configurable)
- **Retención de 30 días** (configurable)
- **Ubicación:** `docs/backups/`

---

## 🎯 Mejores Prácticas

### Cuándo Ejecutar
- ✅ **Después de implementar funcionalidades**
- ✅ **Antes de commits importantes**
- ✅ **Semanalmente** para reportes
- ✅ **Después de resolver problemas complejos**

### Qué Revisar
- ✅ **Problemas detectados** en troubleshooting
- ✅ **Nuevos patrones** en code patterns
- ✅ **Funciones nuevas** en quick reference
- ✅ **Reportes de cambios** para tendencias

---

## 🔮 Futuras Mejoras

### Funcionalidades Planificadas
- 🔄 **Integración con Git hooks**
- 🔄 **Notificaciones por email/Slack**
- 🔄 **Análisis de dependencias**
- 🔄 **Métricas de calidad de código**
- 🔄 **Integración con CI/CD**

### Contribuciones
Para mejorar el sistema:
1. Editar `docs/update_docs.ps1`
2. Actualizar `docs/auto_update_config.json`
3. Probar con `.\docs\update_docs.ps1 -Type all`
4. Documentar cambios en este README

---

**¡Mantén tu documentación siempre actualizada con este sistema automático!**
