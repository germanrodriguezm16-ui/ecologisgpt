# 📚 Ecologist-GPT - Documentación Actualizada
*Actualizado: 2025-10-12 - 12:11:45 p. m.*

---

## 🎯 Estado del Proyecto

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Tests** | 13/13 pasando | ✅ |
| **Errores críticos** | 0 | ✅ |
| **Warnings estilo** | 195 | ⚠️ |
| **Build** | npm run build | ✅ |
| **Hot Reload** | Activo en :8080 | ✅ |

---

## 🚀 Comandos Esenciales

### **Desarrollo Diario:**
```bash
npm run dev           # Servidor con hot reload (:8080)
npm run test:watch    # Tests en modo watch
npm run lint:fix      # Corregir problemas de estilo
```

### **Antes de Commit:**
```bash
npm run test          # Verificar que tests pasen
npm run lint:fix      # Autofix de problemas
git add .
git commit -m "..."   # Pre-commit hook ejecuta autofix automáticamente
```

### **Build y Deploy:**
```bash
npm run build              # Build rápido (solo tests)
npm run build:strict       # Build estricto (tests + linting)
npm run deploy:staging     # Deploy a staging
npm run deploy:production  # Deploy a producción
```

### **Documentación:**
```bash
npm run docs:update   # Actualizar esta documentación
```

---

## ✅ Sistemas de Eficiencia Implementados

### **1. 🧪 Testing Automatizado**
- **Framework:** Jest + jsdom
- **Tests:** 13/13 pasando
- **Tipos:** Unit, Integration, Smoke
- **Cobertura:** Configurada (70% threshold)

### **2. 🔧 Linting Optimizado**
- **ESLint:** Configurado con Standard
- **Prettier:** Formateo automático
- **Errores:** 0 críticos
- **Warnings:** 195 estéticos
- **Autofix:** `npm run lint:fix`

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

```
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
```

---

## 🎯 Flujo de Desarrollo Optimizado

### **Iniciar desarrollo:**
1. `npm run dev` → Abre servidor en :8080 con hot reload
2. Editar código → Cambios se recargan automáticamente
3. Ver en navegador → http://localhost:8080

### **Trabajar con tests:**
1. `npm run test:watch` → Tests en modo watch (opcional)
2. Hacer cambios → Tests se ejecutan automáticamente
3. Ver resultados → En terminal

### **Hacer commit:**
1. `git add .`
2. `git commit -m "mensaje"`
3. **Husky ejecuta automáticamente:**
   - ESLint --fix
   - Prettier --write
   - Si hay errores → commit bloqueado
   - Si solo warnings → commit se realiza ✅

### **Deploy a producción:**
1. `npm run build` → Verifica que tests pasen
2. `npm run deploy:production` → Deploy con verificaciones
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
- Tests pasando: 13/13
- Success rate: 100%

**Linting:**
- Errores: 0
- Warnings: 195
- Estado: LIMPIO

**Build:**
- Build normal: PASA
- Build estricto: PASA

---

## 📝 Guía de Comandos por Situación

### **"Quiero empezar a desarrollar"**
```bash
npm run dev
```

### **"Quiero verificar que todo funciona"**
```bash
npm run test
npm run build
```

### **"Tengo problemas de linting"**
```bash
npm run lint:fix      # Corrige automáticamente
npm run lint          # Ver problemas restantes
```

### **"Quiero hacer commit"**
```bash
git add .
git commit -m "mensaje"
# Pre-commit hook hace autofix automáticamente
```

### **"Quiero deployar"**
```bash
npm run build         # Verificar build
npm run deploy:staging    # o deploy:production
```

### **"Quiero actualizar documentación"**
```bash
npm run docs:update
```

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
- Usar ES6 modules (`import/export`)
- Imports agrupados por tipo
- Paths relativos con `./` o `../`

### **Funciones:**
- Preferir arrow functions para exports
- Preferir `const fn = () => {}` sobre `function fn() {}`
- Async/await sobre Promises

### **Error Handling:**
- Usar try/catch en operaciones async
- Validar elementos DOM antes de usar
- No usar `alert()` en producción (solo desarrollo)

---

## 🚨 Troubleshooting Rápido

### **Tests fallan:**
```bash
npm run test          # Ver qué falla
npm install           # Reinstalar dependencias
```

### **Linting falla:**
```bash
npm run lint:fix      # Autofix
npm run lint          # Ver errores restantes
```

### **Hot reload no funciona:**
```bash
# Detener servidor (Ctrl+C)
npm run dev           # Reiniciar
```

### **Build falla:**
```bash
npm run test          # Verificar tests
npm run lint          # Verificar linting
npm run build         # Intentar de nuevo
```

---

## 📞 Soporte

**Documentación completa:**
- `docs/DEVELOPMENT_GUIDE.md` - Guía de desarrollo
- `docs/TROUBLESHOOTING_QUICK.md` - Solución de problemas
- `docs/ARCHITECTURE.md` - Arquitectura del proyecto

**Logs útiles:**
- Console del navegador - Errores de frontend
- Terminal del servidor - Errores de desarrollo
- Sentry - Errores en producción

---

*Documentación generada automáticamente por el sistema inteligente*
*Ejecuta `npm run docs:update` para actualizar*
*Última actualización: 2025-10-12*
