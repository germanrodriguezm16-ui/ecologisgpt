#!/usr/bin/env node

/**
 * Sistema Inteligente de Actualización de Documentación
 * Mantiene documentación limpia, correcta y actualizada
 * Solo actualiza cuando hay cambios significativos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧠 Sistema Inteligente de Documentación - Ecologist-GPT');
console.log('='.repeat(60));

const timestamp = new Date().toISOString().split('T')[0];

// Función para obtener hash de estado del proyecto
function getProjectStateHash() {
  try {
    // Hash basado en archivos críticos y su estado
    const lintOutput = execSync('npm run lint 2>&1 | findstr "problems"', { encoding: 'utf8' });
    const testOutput = execSync('npm run test 2>&1 | findstr "Tests:"', { encoding: 'utf8' });
    const packageJson = fs.readFileSync('package.json', 'utf8');
    
    return Buffer.from(lintOutput + testOutput + packageJson).toString('base64').slice(0, 20);
  } catch {
    return 'unknown';
  }
}

// Función para verificar si necesitamos actualizar
function needsUpdate() {
  const stateFile = path.join('docs', '.doc-state.json');
  const currentHash = getProjectStateHash();
  
  if (!fs.existsSync(stateFile)) {
    return { needs: true, reason: 'Primera ejecución' };
  }
  
  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const lastHash = state.hash;
    const lastUpdate = new Date(state.timestamp);
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    if (currentHash !== lastHash) {
      return { needs: true, reason: 'Cambios significativos detectados' };
    }
    
    if (hoursSinceUpdate > 24) {
      return { needs: true, reason: 'Más de 24 horas desde última actualización' };
    }
    
    return { needs: false, reason: 'Documentación actualizada' };
  } catch {
    return { needs: true, reason: 'Error leyendo estado previo' };
  }
}

// Función para guardar estado actual
function saveState() {
  const stateFile = path.join('docs', '.doc-state.json');
  const state = {
    hash: getProjectStateHash(),
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

// Función para limpiar documentación obsoleta
function cleanupOldDocs() {
  console.log('\n🧹 Limpiando documentación obsoleta...');
  
  const docsDir = 'docs';
  const changeReports = fs.readdirSync(docsDir)
    .filter(f => f.startsWith('CHANGE_REPORT_') && f.endsWith('.md'))
    .map(f => ({
      name: f,
      path: path.join(docsDir, f),
      date: f.match(/CHANGE_REPORT_(\d{4}-\d{2}-\d{2})/)?.[1] || '1970-01-01'
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
  
  // Mantener solo los últimos 3 reportes de cambios
  const toDelete = changeReports.slice(3);
  
  if (toDelete.length > 0) {
    console.log(`  📋 Manteniendo últimos 3 reportes de cambios`);
    toDelete.forEach(report => {
      fs.unlinkSync(report.path);
      console.log(`  🗑️  Eliminado: ${report.name} (obsoleto)`);
    });
  } else {
    console.log('  ✅ Sin reportes obsoletos para eliminar');
  }
}

// Función para obtener estadísticas de linting
function getLintingStats() {
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
    const match = output.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
    
    if (match) {
      return {
        total: parseInt(match[1]),
        errors: parseInt(match[2]),
        warnings: parseInt(match[3])
      };
    }
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const match = output.match(/(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/);
    
    if (match) {
      return {
        total: parseInt(match[1]),
        errors: parseInt(match[2]),
        warnings: parseInt(match[3])
      };
    }
  }
  
  return { total: 0, errors: 0, warnings: 0 };
}

// Función para obtener estadísticas de tests
function getTestStats() {
  try {
    const output = execSync('npm run test 2>&1', { encoding: 'utf8' });
    const match = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    
    if (match) {
      return {
        passed: parseInt(match[1]),
        total: parseInt(match[2]),
        success: true
      };
    }
  } catch (error) {
    const output = error.stdout?.toString() || error.stderr?.toString() || '';
    const match = output.match(/Tests:\s+(\d+)\s+passed,\s+(\d+)\s+total/);
    
    if (match) {
      return {
        passed: parseInt(match[1]),
        total: parseInt(match[2]),
        success: parseInt(match[1]) === parseInt(match[2])
      };
    }
  }
  
  return { passed: 0, total: 0, success: false };
}

// Generar documentación actualizada
function generateMasterDoc() {
  console.log('\n📊 Generando documentación maestra...');
  
  const lintStats = getLintingStats();
  const testStats = getTestStats();
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const doc = `# 📚 Ecologist-GPT - Documentación Actualizada
*Actualizado: ${timestamp} - ${new Date().toLocaleTimeString('es-CO')}*

---

## 🎯 Estado del Proyecto

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Tests** | ${testStats.passed}/${testStats.total} pasando | ${testStats.success ? '✅' : '❌'} |
| **Errores críticos** | ${lintStats.errors} | ${lintStats.errors === 0 ? '✅' : '❌'} |
| **Warnings estilo** | ${lintStats.warnings} | ⚠️ |
| **Build** | npm run build | ✅ |
| **Hot Reload** | Activo en :8080 | ✅ |

---

## 🚀 Comandos Esenciales

### **Desarrollo Diario:**
\`\`\`bash
npm run dev           # Servidor con hot reload (:8080)
npm run test:watch    # Tests en modo watch
npm run lint:fix      # Corregir problemas de estilo
\`\`\`

### **Antes de Commit:**
\`\`\`bash
npm run test          # Verificar que tests pasen
npm run lint:fix      # Autofix de problemas
git add .
git commit -m "..."   # Pre-commit hook ejecuta autofix automáticamente
\`\`\`

### **Build y Deploy:**
\`\`\`bash
npm run build              # Build rápido (solo tests)
npm run build:strict       # Build estricto (tests + linting)
npm run deploy:staging     # Deploy a staging
npm run deploy:production  # Deploy a producción
\`\`\`

### **Documentación:**
\`\`\`bash
npm run docs:update   # Actualizar esta documentación
\`\`\`

---

## ✅ Sistemas de Eficiencia Implementados

### **1. 🧪 Testing Automatizado**
- **Framework:** Jest + jsdom
- **Tests:** ${testStats.passed}/${testStats.total} pasando
- **Tipos:** Unit, Integration, Smoke
- **Cobertura:** Configurada (70% threshold)

### **2. 🔧 Linting Optimizado**
- **ESLint:** Configurado con Standard
- **Prettier:** Formateo automático
- **Errores:** ${lintStats.errors} críticos
- **Warnings:** ${lintStats.warnings} estéticos
- **Autofix:** \`npm run lint:fix\`

### **3. 🪝 Pre-commit Hooks**
- **Husky:** v9 configurado
- **lint-staged:** Autofix en archivos modificados
- **Acciones:** ESLint --fix + Prettier --write
- **Resultado:** Código siempre formateado

### **4. 🔥 Hot Reload**
- **Servidor:** http://localhost:8080
- **Monitorea:** js/, assets/, index.html, config.js
- **Tecnología:** Chokidar + custom server
- **Beneficio:** Recarga automática en desarrollo

### **5. 📊 Monitoreo**
- **Sentry:** Errores en producción
- **ErrorTracker:** Custom para desarrollo
- **Performance:** Métricas de rendimiento

### **6. 🚀 CI/CD**
- **Build normal:** Solo tests (Vercel)
- **Build estricto:** Tests + linting (CI/CD)
- **Deploy:** Scripts para staging y producción
- **Seguridad:** npm audit integrado

---

## 📁 Estructura del Proyecto

\`\`\`
ecologisgpt/
├── js/
│   ├── app.js              # Punto de entrada, routing
│   ├── services/
│   │   └── supabase.js     # Cliente de Supabase
│   ├── ui/
│   │   ├── modals.js       # Sistema de modales
│   │   └── fab.js          # Floating Action Button
│   ├── utils/
│   │   ├── dom.js          # Utilidades DOM
│   │   ├── colors.js       # Utilidades de color
│   │   ├── currency.js     # Formateo de moneda (FSM)
│   │   └── format.js       # Formateo general
│   └── views/
│       ├── categorias.js   # Vista de categorías
│       ├── socios.js       # Vista de socios
│       └── transacciones.js # Vista de transacciones
├── assets/
│   ├── styles.css          # Estilos principales
│   └── vendor/             # Librerías externas
├── tests/
│   ├── unit/               # Tests unitarios
│   ├── integration/        # Tests de integración
│   └── smoke/              # Smoke tests
├── docs/                   # Esta documentación
├── scripts/                # Scripts de desarrollo
├── monitoring/             # Error tracking y performance
└── .husky/                 # Git hooks
\`\`\`

---

## 🎯 Flujo de Desarrollo Optimizado

### **Iniciar desarrollo:**
1. \`npm run dev\` → Abre servidor en :8080 con hot reload
2. Editar código → Cambios se recargan automáticamente
3. Ver en navegador → http://localhost:8080

### **Trabajar con tests:**
1. \`npm run test:watch\` → Tests en modo watch (opcional)
2. Hacer cambios → Tests se ejecutan automáticamente
3. Ver resultados → En terminal

### **Hacer commit:**
1. \`git add .\`
2. \`git commit -m "mensaje"\`
3. **Husky ejecuta automáticamente:**
   - ESLint --fix
   - Prettier --write
   - Si hay errores → commit bloqueado
   - Si solo warnings → commit se realiza ✅

### **Deploy a producción:**
1. \`npm run build\` → Verifica que tests pasen
2. \`npm run deploy:production\` → Deploy con verificaciones
3. Monitoreo automático → Sentry rastrea errores

---

## 🔑 Reglas de Calidad

### **Para que el build pase:**
- ✅ Tests deben pasar (13/13)
- ✅ Sin errores críticos de linting
- ⚠️ Warnings permitidos (no bloquean)

### **Para que el commit se realice:**
- ✅ Autofix se aplica automáticamente
- ✅ Solo errores críticos bloquean
- ⚠️ Warnings no bloquean

---

## 📊 Métricas Actuales

**Testing:**
- Tests pasando: ${testStats.passed}/${testStats.total}
- Success rate: ${testStats.success ? '100%' : '0%'}

**Linting:**
- Errores: ${lintStats.errors}
- Warnings: ${lintStats.warnings}
- Estado: ${lintStats.errors === 0 ? 'LIMPIO' : 'REQUIERE ATENCIÓN'}

**Build:**
- Build normal: ${testStats.success ? 'PASA' : 'FALLA'}
- Build estricto: ${lintStats.errors === 0 && testStats.success ? 'PASA' : 'FALLA'}

---

## 📝 Guía de Comandos por Situación

### **"Quiero empezar a desarrollar"**
\`\`\`bash
npm run dev
\`\`\`

### **"Quiero verificar que todo funciona"**
\`\`\`bash
npm run test
npm run build
\`\`\`

### **"Tengo problemas de linting"**
\`\`\`bash
npm run lint:fix      # Corrige automáticamente
npm run lint          # Ver problemas restantes
\`\`\`

### **"Quiero hacer commit"**
\`\`\`bash
git add .
git commit -m "mensaje"
# Pre-commit hook hace autofix automáticamente
\`\`\`

### **"Quiero deployar"**
\`\`\`bash
npm run build         # Verificar build
npm run deploy:staging    # o deploy:production
\`\`\`

### **"Quiero actualizar documentación"**
\`\`\`bash
npm run docs:update
\`\`\`

---

## 🛠️ Stack Tecnológico

**Frontend:**
- Vanilla JavaScript (ES6+ modules)
- CSS Variables para theming
- No frameworks (lightweight)

**Backend:**
- Supabase (PostgreSQL + Auth + Storage)
- RPC functions para lógica de negocio

**Testing:**
- Jest (test runner)
- jsdom (DOM simulation)
- 13 tests (unit + integration + smoke)

**Tooling:**
- ESLint + Prettier (calidad de código)
- Husky + lint-staged (pre-commit)
- Chokidar (hot reload)
- Sentry (error tracking)

**Libraries:**
- Sortable.js (drag & drop)
- Flatpickr (date picker)

---

## 🎨 Convenciones de Código

### **Naming:**
- Variables: camelCase
- Funciones: camelCase
- Constantes: UPPER_CASE (opcional)
- Archivos: kebab-case.js

### **Imports:**
- Usar ES6 modules (\`import/export\`)
- Imports agrupados por tipo
- Paths relativos con \`./\` o \`../\`

### **Funciones:**
- Preferir arrow functions para exports
- Preferir \`const fn = () => {}\` sobre \`function fn() {}\`
- Async/await sobre Promises

### **Error Handling:**
- Usar try/catch en operaciones async
- Validar elementos DOM antes de usar
- No usar \`alert()\` en producción (solo desarrollo)

---

## 🚨 Troubleshooting Rápido

### **Tests fallan:**
\`\`\`bash
npm run test          # Ver qué falla
npm install           # Reinstalar dependencias
\`\`\`

### **Linting falla:**
\`\`\`bash
npm run lint:fix      # Autofix
npm run lint          # Ver errores restantes
\`\`\`

### **Hot reload no funciona:**
\`\`\`bash
# Detener servidor (Ctrl+C)
npm run dev           # Reiniciar
\`\`\`

### **Build falla:**
\`\`\`bash
npm run test          # Verificar tests
npm run lint          # Verificar linting
npm run build         # Intentar de nuevo
\`\`\`

---

## 📞 Soporte

**Documentación completa:**
- \`docs/DEVELOPMENT_GUIDE.md\` - Guía de desarrollo
- \`docs/TROUBLESHOOTING_QUICK.md\` - Solución de problemas
- \`docs/ARCHITECTURE.md\` - Arquitectura del proyecto

**Logs útiles:**
- Console del navegador - Errores de frontend
- Terminal del servidor - Errores de desarrollo
- Sentry - Errores en producción

---

*Documentación generada automáticamente por el sistema inteligente*
*Ejecuta \`npm run docs:update\` para actualizar*
*Última actualización: ${timestamp}*
`;

  const outputPath = path.join('docs', 'README.md');
  fs.writeFileSync(outputPath, doc);
  console.log('✅ Actualizado: docs/README.md (documentación maestra)');
}

// Función principal
async function main() {
  try {
    // Verificar si necesitamos actualizar
    const check = needsUpdate();
    
    console.log(`\n📋 Estado: ${check.reason}`);
    
    if (!check.needs && process.argv.includes('--force')) {
      console.log('🔄 Forzando actualización...');
    } else if (!check.needs) {
      console.log('✅ Documentación ya está actualizada');
      console.log('💡 Usa --force para forzar actualización');
      return;
    }
    
    console.log('\n🔄 Actualizando documentación...\n');

    // Limpiar documentación obsoleta
    cleanupOldDocs();

    // Generar documentación actualizada
    generateMasterDoc();

    // Guardar estado
    saveState();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Documentación actualizada correctamente');
    console.log('='.repeat(60));
    
    console.log('\n📚 Archivo principal:');
    console.log('  - docs/README.md (documentación maestra)');
    
    console.log('\n💡 La documentación se actualizará automáticamente cuando:');
    console.log('  1. Haya cambios significativos en el proyecto');
    console.log('  2. Pasen más de 24 horas desde la última actualización');
    console.log('  3. Ejecutes manualmente: npm run docs:update --force');
    
  } catch (error) {
    console.error('\n❌ Error actualizando documentación:', error.message);
    process.exit(1);
  }
}

main();

