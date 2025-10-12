// Archivo de configuración de ejemplo para Ecologist-GPT
// Copia este archivo como config.js y reemplaza los valores con tus credenciales

window.APP_CONFIG = {
  // URL de tu instancia de Supabase
  SUPABASE_URL: "https://tu-proyecto.supabase.co",
  
  // Clave anónima de Supabase (pública, segura para el frontend)
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  
  // DSN de Sentry para reportar errores (opcional)
  SENTRY_DSN: "https://tu-dsn@sentry.io/proyecto"
};

// Notas importantes:
// 1. La SUPABASE_ANON_KEY es segura para usar en el frontend
// 2. Configura las políticas RLS en Supabase para controlar el acceso
// 3. El SENTRY_DSN es opcional pero recomendado para producción
// 4. No subas config.js con credenciales reales al repositorio
