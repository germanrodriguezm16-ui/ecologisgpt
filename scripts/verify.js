#!/usr/bin/env node

/**
 * Verificación Completa del Proyecto - Ecologist-GPT
 * Ejecuta todas las verificaciones necesarias antes de deploy
 */

const { execSync } = require('child_process');

console.log('\n' + '═'.repeat(70));
console.log('🔍 VERIFICACIÓN COMPLETA DEL PROYECTO');
console.log('═'.repeat(70) + '\n');

let allPassed = true;
const results = [];

// Función para ejecutar verificación
function runCheck(name, command, successMsg, failMsg) {
  console.log(`⏳ ${name}...`);
  
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${successMsg}\n`);
    results.push({ name, passed: true, message: successMsg });
    return true;
  } catch (error) {
    console.log(`❌ ${failMsg}\n`);
    results.push({ name, passed: false, message: failMsg });
    allPassed = false;
    return false;
  }
}

// 1. Verificar que package.json existe
console.log('📦 Verificando configuración del proyecto...\n');
try {
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Proyecto: ${pkg.name} v${pkg.version}\n`);
} catch {
  console.log('❌ package.json no encontrado o inválido\n');
  process.exit(1);
}

// 2. Tests
runCheck(
  'Tests Automatizados',
  'npm run test',
  'Todos los tests pasando correctamente',
  'Hay tests fallando - Ejecuta: npm run test para ver detalles'
);

// 3. Linting (solo errores críticos)
const lintOutput = execSync('npm run lint 2>&1', { encoding: 'utf8' }).toString();
const lintMatch = lintOutput.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);

if (lintMatch) {
  const errors = parseInt(lintMatch[2]);
  const warnings = parseInt(lintMatch[3]);
  
  if (errors === 0) {
    console.log('✅ Linting: Sin errores críticos\n');
    results.push({ name: 'Linting', passed: true, message: `0 errores, ${warnings} warnings` });
  } else {
    console.log(`❌ Linting: ${errors} errores críticos - Ejecuta: npm run lint:fix\n`);
    results.push({ name: 'Linting', passed: false, message: `${errors} errores críticos` });
    allPassed = false;
  }
}

// 4. Build
runCheck(
  'Build del Proyecto',
  'npm run build',
  'Build completado exitosamente',
  'Build falló - Verifica tests y configuración'
);

// 5. Security Audit
console.log('⏳ Auditoría de Seguridad...');
try {
  execSync('npm audit --audit-level moderate', { encoding: 'utf8', stdio: 'pipe' });
  console.log('✅ Sin vulnerabilidades críticas o moderadas\n');
  results.push({ name: 'Security', passed: true, message: 'Sin vulnerabilidades' });
} catch (error) {
  const output = error.stdout?.toString() || '';
  if (output.includes('found 0 vulnerabilities')) {
    console.log('✅ Sin vulnerabilidades\n');
    results.push({ name: 'Security', passed: true, message: 'Sin vulnerabilidades' });
  } else {
    console.log('⚠️  Hay vulnerabilidades - Revisa: npm audit\n');
    results.push({ name: 'Security', passed: false, message: 'Vulnerabilidades detectadas' });
    // No bloqueamos por vulnerabilidades, solo advertimos
  }
}

// 6. Verificar archivos críticos
console.log('⏳ Verificando archivos críticos...');
const fs = require('fs');
const criticalFiles = [
  'index.html',
  'config.js',
  'js/app.js',
  'assets/styles.css',
  'package.json'
];

let filesMissing = [];
criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    filesMissing.push(file);
  }
});

if (filesMissing.length === 0) {
  console.log('✅ Todos los archivos críticos presentes\n');
  results.push({ name: 'Archivos Críticos', passed: true, message: 'Todos presentes' });
} else {
  console.log(`❌ Archivos faltantes: ${filesMissing.join(', ')}\n`);
  results.push({ name: 'Archivos Críticos', passed: false, message: `Faltan ${filesMissing.length} archivos` });
  allPassed = false;
}

// Resumen final
console.log('═'.repeat(70));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('═'.repeat(70) + '\n');

results.forEach(result => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`  ${icon} ${result.name}: ${result.message}`);
});

console.log('\n' + '═'.repeat(70));

if (allPassed) {
  console.log('🎉 VERIFICACIÓN COMPLETA: TODO OK');
  console.log('═'.repeat(70));
  console.log('\n✅ El proyecto está listo para:\n');
  console.log('  • Continuar desarrollo');
  console.log('  • Hacer commit');
  console.log('  • Deploy a staging');
  console.log('  • Deploy a producción\n');
  console.log('💡 Comandos útiles:');
  console.log('  npm run deploy:staging');
  console.log('  npm run deploy:production\n');
  process.exit(0);
} else {
  console.log('⚠️  VERIFICACIÓN COMPLETA: HAY PROBLEMAS');
  console.log('═'.repeat(70));
  console.log('\n❌ Corrige los problemas antes de deploy:\n');
  
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  • ${r.name}: ${r.message}`);
  });
  
  console.log('\n💡 Comandos para corregir:');
  if (results.find(r => r.name === 'Tests' && !r.passed)) {
    console.log('  npm run test          # Ver tests fallando');
  }
  if (results.find(r => r.name === 'Linting' && !r.passed)) {
    console.log('  npm run lint:fix      # Corregir errores de linting');
  }
  console.log('');
  process.exit(1);
}

