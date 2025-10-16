#!/usr/bin/env node

/**
 * Dashboard de Status del Proyecto - Ecologist-GPT
 * Muestra el estado completo del proyecto de un vistazo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const http = require('http');

console.log('\n' + '═'.repeat(70));
console.log('📊 DASHBOARD DE STATUS - ECOLOGIST-GPT');
console.log('═'.repeat(70) + '\n');

// Función para ejecutar comando y capturar salida
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
  } catch (error) {
    return error.stdout?.toString() || error.stderr?.toString() || '';
  }
}

// Función para verificar si el servidor está corriendo
function checkServer(port = 8080) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve({ running: true, status: res.statusCode });
    });
    req.on('error', () => resolve({ running: false, status: null }));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve({ running: false, status: null });
    });
  });
}

// Función para obtener stats de tests
function getTestStats() {
  const output = runCommand('npm run test 2>&1');
  const match = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
  const timeMatch = output.match(/Time:\s+([\d.]+)\s*s/);
  
  if (match) {
    return {
      passed: parseInt(match[1]),
      total: parseInt(match[2]),
      time: timeMatch ? parseFloat(timeMatch[1]) : 0,
      success: parseInt(match[1]) === parseInt(match[2])
    };
  }
  
  return { passed: 0, total: 0, time: 0, success: false };
}

// Función para obtener stats de linting
function getLintStats() {
  const output = runCommand('npm run lint 2>&1');
  const match = output.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
  
  if (match) {
    return {
      total: parseInt(match[1]),
      errors: parseInt(match[2]),
      warnings: parseInt(match[3])
    };
  }
  
  return { total: 0, errors: 0, warnings: 0 };
}

// Función para obtener info de git
function getGitInfo() {
  try {
    const branch = runCommand('git rev-parse --abbrev-ref HEAD').trim();
    const lastCommit = runCommand('git log -1 --pretty=format:"%h - %s (%cr)"').trim();
    const hasChanges = runCommand('git status --porcelain').trim().length > 0;
    
    return { branch, lastCommit, hasChanges };
  } catch {
    return { branch: 'unknown', lastCommit: 'unknown', hasChanges: false };
  }
}

// Función para obtener info de package.json
function getProjectInfo() {
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description
    };
  } catch {
    return { name: 'unknown', version: 'unknown', description: 'unknown' };
  }
}

// Función para verificar estado de documentación
function getDocsStatus() {
  try {
    const stateFile = 'docs/.doc-state.json';
    if (!fs.existsSync(stateFile)) {
      return { updated: false, lastUpdate: 'Nunca' };
    }
    
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const lastUpdate = new Date(state.timestamp);
    const hoursAgo = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60));
    
    return {
      updated: hoursAgo < 24,
      lastUpdate: hoursAgo === 0 ? 'Hace menos de 1 hora' : `Hace ${hoursAgo} horas`
    };
  } catch {
    return { updated: false, lastUpdate: 'Desconocido' };
  }
}

// Función principal
async function main() {
  const startTime = Date.now();
  
  console.log('⏳ Recopilando información del proyecto...\n');
  
  // Información del proyecto
  const project = getProjectInfo();
  console.log('📦 PROYECTO');
  console.log('─'.repeat(70));
  console.log(`  Nombre:      ${project.name}`);
  console.log(`  Versión:     ${project.version}`);
  console.log(`  Descripción: ${project.description}`);
  console.log('');
  
  // Estado del servidor
  console.log('🌐 SERVIDOR');
  console.log('─'.repeat(70));
  const server = await checkServer(8080);
  if (server.running) {
    console.log(`  Estado:  ✅ CORRIENDO`);
    console.log(`  Puerto:  8080`);
    console.log(`  URL:     http://localhost:8080`);
    console.log(`  Status:  ${server.status}`);
  } else {
    console.log(`  Estado:  ❌ NO CORRIENDO`);
    console.log(`  Iniciar: npm run dev`);
  }
  console.log('');
  
  // Estado de tests
  console.log('🧪 TESTING');
  console.log('─'.repeat(70));
  const tests = getTestStats();
  const testIcon = tests.success ? '✅' : '❌';
  console.log(`  Estado:   ${testIcon} ${tests.passed}/${tests.total} pasando`);
  console.log(`  Tiempo:   ${tests.time.toFixed(2)}s`);
  console.log(`  Comando:  npm run test`);
  console.log('');
  
  // Estado de linting
  console.log('🔧 LINTING');
  console.log('─'.repeat(70));
  const lint = getLintStats();
  const lintIcon = lint.errors === 0 ? '✅' : '❌';
  console.log(`  Estado:   ${lintIcon} ${lint.errors} errores, ${lint.warnings} warnings`);
  console.log(`  Críticos: ${lint.errors === 0 ? '✅ Sin errores críticos' : '❌ ' + lint.errors + ' errores'}`);
  console.log(`  Autofix:  npm run lint:fix`);
  console.log('');
  
  // Estado de Git
  console.log('📂 GIT');
  console.log('─'.repeat(70));
  const git = getGitInfo();
  console.log(`  Branch:        ${git.branch}`);
  console.log(`  Último commit: ${git.lastCommit}`);
  console.log(`  Cambios:       ${git.hasChanges ? '⚠️  Hay cambios sin commitear' : '✅ Working directory limpio'}`);
  console.log('');
  
  // Estado de documentación
  console.log('📚 DOCUMENTACIÓN');
  console.log('─'.repeat(70));
  const docs = getDocsStatus();
  const docsIcon = docs.updated ? '✅' : '⚠️';
  console.log(`  Estado:          ${docsIcon} ${docs.updated ? 'Actualizada' : 'Desactualizada'}`);
  console.log(`  Última update:   ${docs.lastUpdate}`);
  console.log(`  Actualizar:      npm run docs:update`);
  console.log('');
  
  // Build status
  console.log('🏗️  BUILD');
  console.log('─'.repeat(70));
  const buildNormal = tests.success;
  const buildStrict = tests.success && lint.errors === 0;
  console.log(`  Build normal:   ${buildNormal ? '✅ PASA' : '❌ FALLA'} (npm run build)`);
  console.log(`  Build estricto: ${buildStrict ? '✅ PASA' : '⚠️  FALLA'} (npm run build:strict)`);
  console.log('');
  
  // Resumen final
  console.log('═'.repeat(70));
  console.log('📊 RESUMEN');
  console.log('═'.repeat(70));
  
  const allGood = server.running && tests.success && lint.errors === 0;
  
  if (allGood) {
    console.log('\n  🎉 ¡TODO FUNCIONANDO CORRECTAMENTE!\n');
    console.log('  ✅ Servidor corriendo');
    console.log('  ✅ Tests pasando');
    console.log('  ✅ Sin errores críticos');
    console.log('  ✅ Listo para desarrollo y deploy\n');
  } else {
    console.log('\n  ⚠️  ATENCIÓN REQUERIDA:\n');
    if (!server.running) console.log('  ❌ Servidor no está corriendo → npm run dev');
    if (!tests.success) console.log('  ❌ Tests fallando → npm run test');
    if (lint.errors > 0) console.log('  ❌ Errores de linting → npm run lint:fix');
    console.log('');
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`⏱️  Tiempo de verificación: ${duration}s`);
  console.log('═'.repeat(70) + '\n');
}

main().catch(error => {
  console.error('❌ Error obteniendo status:', error.message);
  process.exit(1);
});

