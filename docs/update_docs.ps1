# Sistema de Actualización Automática de Documentación
# Ecologist-GPT - Documentación Viva

param(
    [string]$Type = "all",  # all, patterns, troubleshooting, development, reference
    [string]$Message = "",
    [switch]$Force = $false
)

Write-Host "🔄 Sistema de Actualización de Documentación - Ecologist-GPT" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Configuración
$docsPath = "docs"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Función para log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $color = switch($Level) {
        "ERROR" { "Red" }
        "WARN" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Función para detectar cambios en archivos
function Get-FileChanges {
    param([string]$Path, [int]$Days = 1)
    
    $files = Get-ChildItem -Path $Path -Recurse -File | Where-Object {
        $_.LastWriteTime -gt (Get-Date).AddDays(-$Days) -and
        $_.Extension -in @('.js', '.css', '.html', '.md')
    }
    
    return $files
}

# Función para extraer patrones de código
function Extract-CodePatterns {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    $patterns = @()
    
    # Detectar funciones de validación
    if ($content -match "function.*validate|if\s*\(\s*!\s*\w+\s*\)") {
        $patterns += "validation_pattern"
    }
    
    # Detectar manejo de errores
    if ($content -match "try\s*\{|catch\s*\(|console\.error") {
        $patterns += "error_handling"
    }
    
    # Detectar operaciones DOM
    if ($content -match "\$\w+\(|querySelector|addEventListener") {
        $patterns += "dom_manipulation"
    }
    
    # Detectar operaciones async
    if ($content -match "async|await|Promise|\.then\(") {
        $patterns += "async_operations"
    }
    
    return $patterns
}

# Función para detectar problemas comunes
function Detect-CommonIssues {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw
    $issues = @()
    
    # Detectar uso de Number() con UUIDs
    if ($content -match "Number\(.*\.dataset\.id\)") {
        $issues += "uuid_to_number_conversion"
    }
    
    # Detectar elementos de debug
    if ($content -match "debug|console\.log.*\[.*\]") {
        $issues += "debug_code_present"
    }
    
    # Detectar variables CSS no definidas
    if ($content -match "var\(--\w+\)" -and $content -notmatch ":root\s*\{") {
        $issues += "undefined_css_variables"
    }
    
    # Detectar falta de validación DOM
    if ($content -match "\$\w+\(.*\)" -and $content -notmatch "if\s*\(\s*!\s*\$\w+") {
        $issues += "missing_dom_validation"
    }
    
    return $issues
}

# Función para actualizar CODE_PATTERNS.md
function Update-CodePatterns {
    Write-Log "Actualizando CODE_PATTERNS.md..." "INFO"
    
    $jsFiles = Get-ChildItem -Path "js" -Recurse -Filter "*.js"
    $newPatterns = @()
    
    foreach ($file in $jsFiles) {
        $patterns = Extract-CodePatterns $file.FullName
        $issues = Detect-CommonIssues $file.FullName
        
        if ($patterns.Count -gt 0 -or $issues.Count -gt 0) {
            $newPatterns += [PSCustomObject]@{
                File = $file.Name
                Patterns = $patterns
                Issues = $issues
                LastModified = $file.LastWriteTime
            }
        }
    }
    
    # Generar contenido para agregar
    $newContent = @"

## 🔄 Patrones Detectados Automáticamente
*Actualizado: $timestamp*

### Archivos Analizados
"@
    
    foreach ($item in $newPatterns) {
        $newContent += @"

#### $($item.File)
- **Patrones encontrados:** $($item.Patterns -join ', ')
- **Problemas detectados:** $($item.Issues -join ', ')
- **Última modificación:** $($item.LastModified)
"@
    }
    
    # Agregar al archivo existente
    $existingContent = Get-Content "$docsPath/CODE_PATTERNS.md" -Raw
    if ($existingContent -notmatch "Patrones Detectados Automáticamente") {
        Add-Content "$docsPath/CODE_PATTERNS.md" $newContent
        Write-Log "Patrones agregados a CODE_PATTERNS.md" "SUCCESS"
    } else {
        Write-Log "CODE_PATTERNS.md ya contiene sección automática" "WARN"
    }
}

# Función para actualizar TROUBLESHOOTING_QUICK.md
function Update-Troubleshooting {
    Write-Log "Actualizando TROUBLESHOOTING_QUICK.md..." "INFO"
    
    $jsFiles = Get-ChildItem -Path "js" -Recurse -Filter "*.js"
    $newIssues = @()
    
    foreach ($file in $jsFiles) {
        $issues = Detect-CommonIssues $file.FullName
        
        if ($issues.Count -gt 0) {
            $newIssues += [PSCustomObject]@{
                File = $file.Name
                Issues = $issues
                Solutions = @()
            }
        }
    }
    
    # Generar soluciones basadas en problemas detectados
    $newContent = @"

## 🤖 Problemas Detectados Automáticamente
*Actualizado: $timestamp*

"@
    
    foreach ($item in $newIssues) {
        $newContent += @"

### $($item.File)
**Problemas detectados:** $($item.Issues -join ', ')

**Soluciones sugeridas:**
"@
        
        foreach ($issue in $item.Issues) {
            switch ($issue) {
                "uuid_to_number_conversion" {
                    $newContent += @"

- **UUID a número:** Cambiar `Number(dataset.id)` por `dataset.id` (mantener como string)
"@
                }
                "debug_code_present" {
                    $newContent += @"

- **Código de debug:** Remover `console.log` y elementos de debug antes de commit
"@
                }
                "undefined_css_variables" {
                    $newContent += @"

- **Variables CSS:** Definir variables en `:root` antes de usarlas
"@
                }
                "missing_dom_validation" {
                    $newContent += @"

- **Validación DOM:** Agregar `if (!element) return;` antes de manipular elementos
"@
                }
            }
        }
    }
    
    # Agregar al archivo existente
    $existingContent = Get-Content "$docsPath/TROUBLESHOOTING_QUICK.md" -Raw
    if ($existingContent -notmatch "Problemas Detectados Automáticamente") {
        Add-Content "$docsPath/TROUBLESHOOTING_QUICK.md" $newContent
        Write-Log "Problemas agregados a TROUBLESHOOTING_QUICK.md" "SUCCESS"
    } else {
        Write-Log "TROUBLESHOOTING_QUICK.md ya contiene sección automática" "WARN"
    }
}

# Función para actualizar QUICK_REFERENCE.md
function Update-QuickReference {
    Write-Log "Actualizando QUICK_REFERENCE.md..." "INFO"
    
    # Detectar nuevas funciones exportadas
    $jsFiles = Get-ChildItem -Path "js" -Recurse -Filter "*.js"
    $newFunctions = @()
    
    foreach ($file in $jsFiles) {
        $content = Get-Content $file.FullName -Raw
        $exports = [regex]::Matches($content, "export\s+(?:async\s+)?function\s+(\w+)")
        
        foreach ($match in $exports) {
            $newFunctions += [PSCustomObject]@{
                Function = $match.Groups[1].Value
                File = $file.Name
                Path = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
            }
        }
    }
    
    # Generar contenido para agregar
    $newContent = @"

## 🔄 Funciones Detectadas Automáticamente
*Actualizado: $timestamp*

### Funciones Exportadas
"@
    
    foreach ($func in $newFunctions) {
        $newContent += @"

- **$($func.Function)** - `$($func.Path)`
"@
    }
    
    # Agregar al archivo existente
    $existingContent = Get-Content "$docsPath/QUICK_REFERENCE.md" -Raw
    if ($existingContent -notmatch "Funciones Detectadas Automáticamente") {
        Add-Content "$docsPath/QUICK_REFERENCE.md" $newContent
        Write-Log "Funciones agregadas a QUICK_REFERENCE.md" "SUCCESS"
    } else {
        Write-Log "QUICK_REFERENCE.md ya contiene sección automática" "WARN"
    }
}

# Función para generar reporte de cambios
function Generate-ChangeReport {
    Write-Log "Generando reporte de cambios..." "INFO"
    
    $changedFiles = Get-FileChanges "." 7  # Últimos 7 días
    $reportPath = "$docsPath/CHANGE_REPORT_$(Get-Date -Format 'yyyy-MM-dd').md"
    
    $reportContent = @"
# Reporte de Cambios - $(Get-Date -Format 'yyyy-MM-dd')
## Archivos Modificados en los Últimos 7 Días

"@
    
    foreach ($file in $changedFiles) {
        $reportContent += @"

### $($file.Name)
- **Ruta:** $($file.FullName)
- **Última modificación:** $($file.LastWriteTime)
- **Tamaño:** $($file.Length) bytes
"@
        
        # Analizar contenido si es archivo JS
        if ($file.Extension -eq ".js") {
            $patterns = Extract-CodePatterns $file.FullName
            $issues = Detect-CommonIssues $file.FullName
            
            if ($patterns.Count -gt 0) {
                $reportContent += @"

- **Patrones detectados:** $($patterns -join ', ')
"@
            }
            
            if ($issues.Count -gt 0) {
                $reportContent += @"

- **⚠️ Problemas detectados:** $($issues -join ', ')
"@
            }
        }
    }
    
    $reportContent += @"

---
*Reporte generado automáticamente por el sistema de documentación*
"@
    
    Set-Content $reportPath $reportContent
    Write-Log "Reporte generado: $reportPath" "SUCCESS"
}

# Función principal
function Update-Documentation {
    param([string]$Type, [string]$Message)
    
    Write-Log "Iniciando actualización de documentación..." "INFO"
    
    if ($Message) {
        Write-Log "Mensaje personalizado: $Message" "INFO"
    }
    
    switch ($Type.ToLower()) {
        "patterns" {
            Update-CodePatterns
        }
        "troubleshooting" {
            Update-Troubleshooting
        }
        "reference" {
            Update-QuickReference
        }
        "report" {
            Generate-ChangeReport
        }
        "all" {
            Update-CodePatterns
            Update-Troubleshooting
            Update-QuickReference
            Generate-ChangeReport
        }
        default {
            Write-Log "Tipo no reconocido: $Type" "ERROR"
            Write-Log "Tipos válidos: all, patterns, troubleshooting, reference, report" "INFO"
            return
        }
    }
    
    Write-Log "Actualización completada!" "SUCCESS"
}

# Ejecutar actualización
try {
    Update-Documentation -Type $Type -Message $Message
} catch {
    Write-Log "Error durante la actualización: $($_.Exception.Message)" "ERROR"
    exit 1
}

Write-Host "=================================================" -ForegroundColor Green
Write-Host "✅ Sistema de actualización completado" -ForegroundColor Green
