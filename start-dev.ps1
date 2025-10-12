# Script para iniciar servidor de desarrollo local
# Ecologist-GPT Panel

Write-Host "Iniciando servidor de desarrollo para Ecologist-GPT..." -ForegroundColor Green

# Verificar si el puerto 8000 esta disponible
$port = 8080
$listener = $null

try {
    $listener = [System.Net.HttpListener]::new()
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Start()
    Write-Host "Servidor iniciado en http://localhost:$port" -ForegroundColor Green
    Write-Host "Abre tu navegador en: http://localhost:$port" -ForegroundColor Cyan
    Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
    Write-Host ""
    
    # Servir archivos estaticos
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") {
            $localPath = "/index.html"
        }
        
        $filePath = Join-Path $PWD $localPath.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            # Determinar tipo MIME
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                ".html" { $response.ContentType = "text/html; charset=utf-8" }
                ".css" { $response.ContentType = "text/css; charset=utf-8" }
                ".js" { $response.ContentType = "application/javascript; charset=utf-8" }
                ".json" { $response.ContentType = "application/json; charset=utf-8" }
                ".png" { $response.ContentType = "image/png" }
                ".jpg" { $response.ContentType = "image/jpeg" }
                ".jpeg" { $response.ContentType = "image/jpeg" }
                ".gif" { $response.ContentType = "image/gif" }
                ".svg" { $response.ContentType = "image/svg+xml" }
                ".ico" { $response.ContentType = "image/x-icon" }
                default { $response.ContentType = "application/octet-stream" }
            }
            
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            $response.StatusCode = 404
            $errorContent = [System.Text.Encoding]::UTF8.GetBytes("404 - Archivo no encontrado")
            $response.ContentLength64 = $errorContent.Length
            $response.ContentType = "text/plain; charset=utf-8"
            $response.OutputStream.Write($errorContent, 0, $errorContent.Length)
        }
        
        $response.Close()
    }
} catch {
    Write-Host "Error al iniciar servidor: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Alternativa: Abre index.html directamente en tu navegador" -ForegroundColor Yellow
} finally {
    if ($listener) {
        $listener.Stop()
        $listener.Close()
    }
}