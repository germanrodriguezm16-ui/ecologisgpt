# Ecologist-GPT · Panel

Panel administrativo cliente para gestionar socios y categorías. Implementado como aplicación frontend en Vanilla JS que usa Supabase (DB + Storage) y Sentry (errores).

Contenido importante

- `index.html` - Entrada principal de la aplicación.
- `config.js` - Configuración (SUPABASE_URL, SUPABASE_ANON_KEY, SENTRY_DSN). Actualmente puede contener claves; revisa más abajo.
- `js/` - Código fuente (vistas, servicios, utilidades, UI).
- `assets/` - Estilos.

Variables de entorno (recomendado en Vercel)

La app necesita las siguientes variables para funcionar correctamente en producción. Si estás en Vercel, añade estas variables en la sección Environment Variables (no las subas al repositorio):

- `SUPABASE_URL` - URL de tu instancia Supabase.
- `SUPABASE_ANON_KEY` - ANON key para clientes (valida políticas RLS en Supabase).
- `SENTRY_DSN` - (opcional) DSN de Sentry para reportar errores.

Nota de seguridad

- Actualmente el repositorio contiene un archivo `config.js` que en algunos entornos pudo haber sido usado para almacenar las claves. No lo borres automáticamente si no estás seguro. Lo recomendado es:
  1. Configurar las variables en el panel de Vercel.
  2. Actualizar `config.js` para leer las variables inyectadas en build (o reemplazarlo por un archivo que no incluya secretos).
  3. (Opcional) Rotar la ANON key si la clave fue publicada en un repositorio público.

Cómo correr localmente (rápido)

Puedes servir la carpeta estática localmente con un servidor simple:

```bash
# con Python 3
python -m http.server 8000

# o con npx http-server
npx http-server . -p 8000
```

Luego abre `http://localhost:8000` en tu navegador.

Notas para despliegue en Vercel

- Añade las variables `SUPABASE_URL`, `SUPABASE_ANON_KEY` y `SENTRY_DSN` en el dashboard de Vercel (Project → Settings → Environment Variables).
- Si cambias `config.js` para leer variables de entorno, prueba primero con un Preview Deploy antes de promover a producción.

Contribuciones y contacto

Si necesitas que haga cambios (mover secrets, añadir toasts, validar uploads), dime cuál opción prefieres y lo implemento.
