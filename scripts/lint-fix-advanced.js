#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Ejecutando corrección avanzada de linting...');

// Función para corregir errores comunes
function fixCommonErrors(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Corregir line endings (CRLF -> LF)
    if (content.includes('\r\n')) {
      content = content.replace(/\r\n/g, '\n');
      modified = true;
    }

    // Corregir espacios extra
    content = content.replace(/[ \t]+$/gm, '');
    
    // Corregir indentación (tabs -> 2 espacios)
    content = content.replace(/^\t+/gm, (match) => '  '.repeat(match.length));
    
    // Corregir comillas dobles -> simples
    content = content.replace(/"([^"]*)"/g, "'$1'");
    
    // Corregir punto y coma extra
    content = content.replace(/;;+/g, ';');
    
    // Corregir espacios alrededor de operadores
    content = content.replace(/([^=!<>])=([^=])/g, '$1 = $2');
    content = content.replace(/([^=!<>])==([^=])/g, '$1 == $2');
    content = content.replace(/([^=!<>])!=([^=])/g, '$1 != $2');
    
    // Corregir espacios después de comas
    content = content.replace(/,([^\s])/g, ', $1');
    
    // Corregir espacios después de keywords
    content = content.replace(/\b(if|for|while|catch|try)\s*\(/g, '$1 (');
    
    // Corregir espacios antes de llaves
    content = content.replace(/\s*{/g, ' {');
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error corrigiendo ${filePath}:`, error.message);
    return false;
  }
}

// Función para procesar archivos
function processFiles(directory) {
  const files = fs.readdirSync(directory);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      fixedCount += processFiles(filePath);
    } else if (file.endsWith('.js') && !file.includes('.min.')) {
      if (fixCommonErrors(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

// Ejecutar correcciones
try {
  console.log('📝 Corrigiendo errores comunes...');
  const fixedCount = processFiles('./js');
  
  console.log(`✅ ${fixedCount} archivos corregidos`);
  
  // Ejecutar ESLint con --fix
  console.log('🔧 Ejecutando ESLint --fix...');
  execSync('npx eslint js/**/*.js --fix', { stdio: 'inherit' });
  
  console.log('✅ Corrección de linting completada');
  
} catch (error) {
  console.error('❌ Error en corrección de linting:', error.message);
  process.exit(1);
}
