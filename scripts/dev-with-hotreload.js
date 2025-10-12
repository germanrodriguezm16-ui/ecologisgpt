// Script para iniciar desarrollo con hot reload
// Combina el servidor HTTP con recarga automática

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando desarrollo con hot reload...');

// Función para iniciar el servidor de desarrollo
function startDevServer() {
  console.log('📡 Iniciando servidor de desarrollo...');
  
  const serverProcess = spawn('node', ['dev-server.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Error iniciando servidor:', error);
  });
  
  serverProcess.on('exit', (code) => {
    console.log(`🛑 Servidor terminado con código: ${code}`);
  });
  
  return serverProcess;
}

// Función para abrir navegador
function openBrowser() {
  const { exec } = require('child_process');
  const url = 'http://localhost:8080';
  
  console.log('🌐 Abriendo navegador...');
  
  // Detectar sistema operativo y abrir navegador
  const command = process.platform === 'win32' 
    ? `start ${url}`
    : process.platform === 'darwin'
    ? `open ${url}`
    : `xdg-open ${url}`;
  
  exec(command, (error) => {
    if (error) {
      console.log('⚠️ No se pudo abrir el navegador automáticamente');
      console.log(`📱 Abre manualmente: ${url}`);
    } else {
      console.log(`✅ Navegador abierto en: ${url}`);
    }
  });
}

// Función para mostrar información de desarrollo
function showDevInfo() {
  console.log('\n🎯 Información de Desarrollo:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 Servidor: http://localhost:8080');
  console.log('🔥 Hot Reload: Activado');
  console.log('👀 Monitoreando: js/, assets/, index.html');
  console.log('📊 Testing: npm run test');
  console.log('🔧 Linting: npm run lint');
  console.log('📈 Coverage: npm run test:coverage');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Comandos útiles:');
  console.log('  Ctrl+C - Detener servidor');
  console.log('  npm run test:watch - Tests en modo watch');
  console.log('  npm run lint:fix - Arreglar problemas de linting');
  console.log('  npm run build - Build completo');
  console.log('\n🚀 ¡Desarrollo iniciado!');
}

// Función principal
function main() {
  try {
    // Verificar que estamos en el directorio correcto
    if (!require('fs').existsSync('package.json')) {
      console.error('❌ package.json no encontrado. Ejecuta desde el directorio raíz del proyecto.');
      process.exit(1);
    }
    
    // Verificar que dev-server.js existe
    if (!require('fs').existsSync('dev-server.js')) {
      console.error('❌ dev-server.js no encontrado. Asegúrate de que el archivo existe.');
      process.exit(1);
    }
    
    // Mostrar información
    showDevInfo();
    
    // Iniciar servidor
    const serverProcess = startDevServer();
    
    // Abrir navegador después de un delay
    setTimeout(() => {
      openBrowser();
    }, 2000);
    
    // Manejar cierre graceful
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo servidor de desarrollo...');
      serverProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Deteniendo servidor de desarrollo...');
      serverProcess.kill('SIGTERM');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error iniciando desarrollo:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, startDevServer, openBrowser, showDevInfo };
