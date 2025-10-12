// Servidor de desarrollo con hot reload para Ecologist-GPT
// Recarga automáticamente el navegador cuando hay cambios

const http = require('http');
const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

class DevServer {
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.watchPaths = options.watchPaths || ['js/', 'assets/', 'index.html'];
    this.excludePaths = options.excludePaths || ['node_modules/', '.git/', 'coverage/'];
    this.clients = new Set();
    
    this.init();
  }
  
  init() {
    console.log('🚀 Iniciando servidor de desarrollo con hot reload...');
    
    // Crear servidor HTTP
    this.createServer();
    
    // Configurar file watcher
    this.setupFileWatcher();
    
    // Configurar WebSocket para hot reload
    this.setupWebSocket();
    
    console.log(`📡 Servidor iniciado en http://localhost:${this.port}`);
    console.log(`👀 Monitoreando cambios en: ${this.watchPaths.join(', ')}`);
  }
  
  createServer() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    this.server.listen(this.port, () => {
      console.log(`✅ Servidor escuchando en puerto ${this.port}`);
    });
  }
  
  handleRequest(req, res) {
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 - Archivo no encontrado');
      return;
    }
    
    // Determinar tipo de contenido
    const ext = path.extname(filePath);
    const contentType = this.getContentType(ext);
    
    // Leer y servir archivo
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Error interno del servidor');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  }
  
  getContentType(ext) {
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    return types[ext] || 'application/octet-stream';
  }
  
  setupFileWatcher() {
    const watcher = chokidar.watch(this.watchPaths, {
      ignored: this.excludePaths,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher.on('change', (filePath) => {
      console.log(`📝 Archivo modificado: ${filePath}`);
      this.notifyClients('reload', { file: filePath });
    });
    
    watcher.on('add', (filePath) => {
      console.log(`➕ Archivo agregado: ${filePath}`);
      this.notifyClients('reload', { file: filePath });
    });
    
    watcher.on('unlink', (filePath) => {
      console.log(`🗑️ Archivo eliminado: ${filePath}`);
      this.notifyClients('reload', { file: filePath });
    });
  }
  
  setupWebSocket() {
    // Simular WebSocket con Server-Sent Events
    this.server.on('request', (req, res) => {
      if (req.url === '/hot-reload') {
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Cache-Control'
        });
        
        // Agregar cliente
        this.clients.add(res);
        
        // Enviar mensaje de conexión
        res.write('data: {"type":"connected","message":"Hot reload activado"}\n\n');
        
        // Manejar desconexión
        req.on('close', () => {
          this.clients.delete(res);
        });
      }
    });
  }
  
  notifyClients(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
    
    this.clients.forEach(client => {
      try {
        client.write(`data: ${message}\n\n`);
      } catch (error) {
        this.clients.delete(client);
      }
    });
  }
  
  stop() {
    console.log('🛑 Deteniendo servidor de desarrollo...');
    this.server.close();
  }
}

// Script de hot reload para el navegador
const hotReloadScript = `
<script>
(function() {
  console.log('🔥 Hot reload activado');
  
  const eventSource = new EventSource('/hot-reload');
  
  eventSource.onmessage = function(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        console.log('✅ Hot reload conectado:', data.message);
        return;
      }
      
      if (data.type === 'reload') {
        console.log('🔄 Recargando por cambio en:', data.data.file);
        
        // Recargar página después de un pequeño delay
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('Error procesando mensaje de hot reload:', error);
    }
  };
  
  eventSource.onerror = function(error) {
    console.warn('⚠️ Error en hot reload:', error);
  };
  
  // Limpiar al cerrar página
  window.addEventListener('beforeunload', () => {
    eventSource.close();
  });
})();
</script>
`;

// Función para inyectar script de hot reload en HTML
function injectHotReloadScript(html) {
  return html.replace('</body>', `${hotReloadScript}</body>`);
}

// Exportar para uso
module.exports = { DevServer, injectHotReloadScript };

// Ejecutar si se llama directamente
if (require.main === module) {
  const server = new DevServer({
    port: process.env.PORT || 8080,
    watchPaths: ['js/', 'assets/', 'index.html', 'config.js'],
    excludePaths: ['node_modules/', '.git/', 'coverage/', 'tests/']
  });
  
  // Manejar cierre graceful
  process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
  });
}
