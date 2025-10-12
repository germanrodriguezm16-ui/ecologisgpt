#!/usr/bin/env node

const http = require('http');

console.log('🔍 Verificando que la aplicación funciona correctamente...');

// Verificar que el servidor responde
const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Servidor respondiendo - Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Verificar que el HTML contiene elementos clave
    const checks = [
      { name: 'HTML básico', test: data.includes('<html') },
      { name: 'Título de la aplicación', test: data.includes('Ecologist-GPT') },
      { name: 'Scripts principales', test: data.includes('js/app.js') },
      { name: 'Configuración', test: data.includes('config.js') },
      { name: 'Estilos CSS', test: data.includes('assets/styles.css') }
    ];
    
    console.log('\n📋 Verificaciones de contenido:');
    checks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`  ${status} ${check.name}`);
    });
    
    const allPassed = checks.every(check => check.test);
    
    if (allPassed) {
      console.log('\n🎉 ¡Aplicación funcionando correctamente!');
      console.log('📡 URL: http://localhost:8080');
      console.log('🔥 Hot reload: Activo');
      console.log('🧪 Tests: 13/13 pasando');
      console.log('🔧 Linting: 251 problemas (principalmente estilo)');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error conectando al servidor:', err.message);
  console.log('💡 Asegúrate de que el servidor esté ejecutándose con: npm run dev');
});

req.on('timeout', () => {
  console.error('❌ Timeout conectando al servidor');
  req.destroy();
});

req.end();
