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

---

Nota rápida sobre el selector de fecha/hora (Flatpickr)

- El modal de "Nueva transacción" usa Flatpickr para seleccionar fecha y hora.
- Flatpickr está instalado localmente en `node_modules/flatpickr` y el proyecto carga los archivos desde `./node_modules/flatpickr/dist/`.
- Se añadió `assets/flatpickr-theme.css` con overrides para adaptar los colores al tema oscuro del panel.

Cómo probarlo localmente:

1. Desde la raíz del proyecto instala dependencias:

```bash
npm install
```

2. Sirve la carpeta con un servidor local y abre `http://localhost:8000`:

```bash
npx http-server . -p 8000
```

3. En la vista "Transacciones" abre "Nueva transacción" y haz clic en el ícono del calendario.

Notas técnicas:

- Si prefieres que el proyecto no haga referencia directa a `node_modules` desde `index.html`, puedo convertir la inicialización a un import ES module y usar un pequeño bundler o copiar los archivos necesarios a `assets/` durante el build.
- La inicialización se encuentra en `js/views/transacciones.js` y tiene fallback nativo si Flatpickr no está disponible.
