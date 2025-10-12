// Script para arreglar automáticamente problemas de linting
// Ejecuta ESLint con --fix y reporta resultados

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Ejecutando linting automático...');

try {
  // Ejecutar ESLint con --fix
  console.log('📝 Arreglando problemas de código...');
  execSync('npx eslint js/**/*.js --fix', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Linting automático completado');
  
  // Verificar si hay problemas restantes
  try {
    execSync('npx eslint js/**/*.js', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('🎉 No hay problemas de linting restantes');
  } catch (error) {
    console.log('⚠️  Algunos problemas requieren atención manual:');
    console.log(error.stdout.toString());
  }
  
} catch (error) {
  console.error('❌ Error ejecutando linting:', error.message);
  process.exit(1);
}

// Generar reporte de calidad
console.log('📊 Generando reporte de calidad...');

const reportPath = 'reports/quality-report.json';
const reportDir = path.dirname(reportPath);

if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

const qualityReport = {
  timestamp: new Date().toISOString(),
  files: [],
  summary: {
    totalFiles: 0,
    filesWithIssues: 0,
    totalIssues: 0,
    fixedIssues: 0
  }
};

// Analizar archivos JavaScript
const jsFiles = getAllJSFiles('js/');
qualityReport.summary.totalFiles = jsFiles.length;

jsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  const fileReport = {
    path: file,
    lines: lines.length,
    issues: [],
    quality: 'good'
  };
  
  // Detectar problemas comunes
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Console.log sin contexto
    if (line.includes('console.log') && !line.includes('// TODO: remove')) {
      fileReport.issues.push({
        line: lineNumber,
        type: 'console.log',
        message: 'Console.log encontrado - considerar remover en producción'
      });
    }
    
    // Variables no utilizadas
    if (line.includes('let ') && !line.includes('=')) {
      fileReport.issues.push({
        line: lineNumber,
        type: 'unused-variable',
        message: 'Variable declarada pero posiblemente no utilizada'
      });
    }
    
    // Funciones muy largas
    if (line.includes('function ') && lines.length > 50) {
      fileReport.issues.push({
        line: lineNumber,
        type: 'long-function',
        message: 'Función muy larga - considerar dividir'
      });
    }
  });
  
  if (fileReport.issues.length > 0) {
    qualityReport.summary.filesWithIssues++;
    qualityReport.summary.totalIssues += fileReport.issues.length;
    fileReport.quality = fileReport.issues.length > 5 ? 'poor' : 'fair';
  }
  
  qualityReport.files.push(fileReport);
});

// Guardar reporte
fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));

console.log('📈 Reporte de calidad generado:');
console.log(`   Total de archivos: ${qualityReport.summary.totalFiles}`);
console.log(`   Archivos con problemas: ${qualityReport.summary.filesWithIssues}`);
console.log(`   Total de problemas: ${qualityReport.summary.totalIssues}`);
console.log(`   Reporte guardado en: ${reportPath}`);

// Función para obtener todos los archivos JS
function getAllJSFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}
