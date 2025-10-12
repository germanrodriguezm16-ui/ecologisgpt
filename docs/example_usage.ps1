# Ejemplo de Uso del Sistema de Actualización Automática
# Ecologist-GPT - Documentación Viva

Write-Host "📚 Ejemplo de Uso - Sistema de Actualización Automática" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Ejemplo 1: Actualización completa después de cambios
Write-Host "`n🔄 Ejemplo 1: Actualización completa" -ForegroundColor Yellow
Write-Host "Comando: .\docs\update_docs.ps1 -Type all -Message 'Después de implementar nueva funcionalidad'"
Write-Host "Resultado: Actualiza todos los documentos con los últimos cambios"

# Ejemplo 2: Solo detectar problemas
Write-Host "`n⚠️ Ejemplo 2: Detectar problemas" -ForegroundColor Yellow
Write-Host "Comando: .\docs\update_docs.ps1 -Type troubleshooting"
Write-Host "Resultado: Agrega problemas detectados a TROUBLESHOOTING_QUICK.md"

# Ejemplo 3: Generar reporte semanal
Write-Host "`n📊 Ejemplo 3: Reporte de cambios" -ForegroundColor Yellow
Write-Host "Comando: .\docs\update_docs.ps1 -Type report"
Write-Host "Resultado: Genera CHANGE_REPORT_YYYY-MM-DD.md con cambios de la semana"

# Ejemplo 4: Actualizar solo patrones
Write-Host "`n🔧 Ejemplo 4: Solo patrones de código" -ForegroundColor Yellow
Write-Host "Comando: .\docs\update_docs.ps1 -Type patterns"
Write-Host "Resultado: Actualiza CODE_PATTERNS.md con nuevos patrones detectados"

Write-Host "`n💡 Tips de Uso:" -ForegroundColor Green
Write-Host "- Ejecuta 'all' después de cambios importantes" -ForegroundColor White
Write-Host "- Usa 'troubleshooting' antes de commits" -ForegroundColor White
Write-Host "- Ejecuta 'report' semanalmente" -ForegroundColor White
Write-Host "- Personaliza patrones en auto_update_config.json" -ForegroundColor White

Write-Host "`n🚀 Para empezar:" -ForegroundColor Cyan
Write-Host ".\docs\update_docs.ps1" -ForegroundColor White
