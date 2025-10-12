# 🚀 Guía de Desarrollo - Ecologist-GPT

## 📋 Requisitos Previos

### Opción 1: Con Node.js (Recomendado)
```bash
# Instalar Node.js desde https://nodejs.org/
# Luego instalar dependencias:
npm install

# Servir con http-server:
npx http-server . -p 8000
```

### Opción 2: Con Python
```bash
# Python 3:
python -m http.server 8000

# Python 2:
python -m SimpleHTTPServer 8000
```

### Opción 3: Con PowerShell (Windows)
```powershell
# Ejecutar el script incluido:
.\start-dev.ps1
```

### Opción 4: Abrir directamente
- Abre `index.html` directamente en tu navegador
- ⚠️ Algunas funciones pueden no funcionar por restricciones CORS

## 🔧 Configuración

1. **Configurar Supabase:**
   ```bash
   # Copiar archivo de ejemplo:
   cp config.example.js config.js
   
   # Editar config.js con tus credenciales:
   # - SUPABASE_URL: URL de tu proyecto Supabase
   # - SUPABASE_ANON_KEY: Clave anónima (pública)
   # - SENTRY_DSN: DSN de Sentry (opcional)
   ```

2. **Verificar configuración:**
   - Abre la consola del navegador
   - Busca mensajes de error relacionados con Supabase
   - Verifica que las credenciales sean correctas

## 🏗️ Estructura del Proyecto

```
ecologisgpt/
├── index.html              # Punto de entrada
├── config.js               # Configuración (crear desde config.example.js)
├── assets/                 # Estilos y recursos
│   ├── styles.css          # Estilos principales
│   └── vendor/             # Librerías externas
├── js/                     # Código fuente
│   ├── app.js              # Aplicación principal
│   ├── services/           # Servicios (Supabase)
│   ├── ui/                 # Componentes UI
│   ├── utils/              # Utilidades
│   └── views/              # Vistas de la aplicación
└── docs/                   # Documentación
```

## 🧪 Desarrollo

### Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm start                    # Si tienes Node.js
python -m http.server 8000   # Con Python
.\start-dev.ps1             # Con PowerShell (Windows)

# Verificar sintaxis
# (Usar extensiones de VS Code para JavaScript/HTML/CSS)
```

### Debugging

- **Consola del navegador:** Mensajes con prefijos `[BOOT]`, `[ROUTER]`, `[TX]`, `[MODAL]`
- **Elemento debug:** Mira el elemento `#debug` en la esquina superior
- **Sentry:** Errores se reportan automáticamente si está configurado

### Funciones Principales

- **Socios:** CRUD completo con avatares
- **Transacciones:** Crear transacciones con comprobantes
- **Categorías:** Gestión de categorías de socios
- **Modales:** Sistema de modales reutilizable

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SENTRY_DSN`
3. Desplegar automáticamente

### Otros proveedores
- Cualquier servicio de hosting estático
- Asegúrate de configurar las variables de entorno

## 🐛 Solución de Problemas

### Pantalla en blanco
- Verifica la consola del navegador
- Comprueba que `config.js` esté configurado correctamente
- Usa `window.__eg_mount('socios')` para forzar montaje

### Errores de CORS
- Usa un servidor local (no abrir HTML directamente)
- Verifica configuración de Supabase

### Flatpickr no funciona
- Verifica que los archivos estén en `assets/vendor/flatpickr/`
- Comprueba la consola por errores de carga

## 📚 Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Flatpickr Documentation](https://flatpickr.js.org/)
- [Sentry Documentation](https://docs.sentry.io/)

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request
