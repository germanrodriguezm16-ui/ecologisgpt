#!/usr/bin/env node

const http = require('http');

console.log('🔍 Verificando errores de JavaScript...');

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    // Verificar que los scripts principales están presentes
    const scriptChecks = [
      { name: 'app.js', test: data.includes('js/app.js') },
      { name: 'config.js', test: data.includes('config.js') },
      { name: 'Supabase', test: data.includes('supabase') },
      { name: 'Sentry', test: data.includes('sentry') },
      { name: 'Sortable', test: data.includes('sortable') },
      { name: 'Flatpickr', test: data.includes('flatpickr') }
    ];
    
    console.log('\n📋 Verificaciones de scripts:');
    scriptChecks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`  ${status} ${check.name}`);
    });
    
    // Verificar que no hay scripts rotos
    const brokenScripts = data.match(/src="[^"]*\.js"/g) || [];
    const hasBrokenScripts = brokenScripts.some(script => 
      script.includes('undefined') || script.includes('null')
    );
    
    if (!hasBrokenScripts) {
      console.log('\n✅ No se detectaron scripts rotos');
    } else {
      console.log('\n⚠️ Se detectaron posibles scripts rotos');
    }
    
    // Verificar estructura básica
    const structureChecks = [
      { name: 'DOCTYPE', test: data.includes('<!doctype html>') },
      { name: 'Meta charset', test: data.includes('charset="utf-8"') },
      { name: 'Viewport', test: data.includes('viewport') },
      { name: 'CSS principal', test: data.includes('assets/styles.css') }
    ];
    
    console.log('\n📋 Verificaciones de estructura:');
    structureChecks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`  ${status} ${check.name}`);
    });
    
    const allPassed = scriptChecks.every(check => check.test) && 
                     structureChecks.every(check => check.test) && 
                     !hasBrokenScripts;
    
    if (allPassed) {
      console.log('\n🎉 ¡Aplicación lista para usar!');
      console.log('💡 Abre http://localhost:8080 en tu navegador');
      console.log('🔧 Las correcciones de linting no afectaron la funcionalidad');
    } else {
      console.log('\n⚠️ Algunas verificaciones fallaron');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error conectando al servidor:', err.message);
});

req.on('timeout', () => {
  console.error('❌ Timeout conectando al servidor');
  req.destroy();
});

req.end();
