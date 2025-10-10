# Arquitectura - Ecologist-GPT

Resumen ejecutivo

Este proyecto es una aplicación de panel (single-page-ish) escrita en HTML/CSS y JavaScript (ES modules). Se integra con Supabase (Postgres + Storage + RPC) para persistencia y lógica server-side y está preparada para desplegarse como site estático (ej. Vercel).

Estructura principal del repositorio

- index.html — Shell de la aplicación, incluye estructura base y modales principales.
- assets/
  - styles.css — estilos globales y reglas de diseño (colores, modal, grid, inputs).
- js/ — código cliente dividido en módulos
  - app.js — punto de arranque, enrutado por hash, monta vistas y bind globales.
  - services/
    - supabase.js — cliente Supabase y helpers de conexión (getClient).
  - ui/
    - modals.js — helpers para abrir/cerrar modales y manejar backdrop/esc/scroll-lock.
  - utils/
    - dom.js — selectores, helpers DOM y utilidades pequeñas.
    - format.js — utilidades de formateo (histórico).
    - currency.js — FSM incremental para input de moneda (formateo seguro y caret-aware).
  - views/
    - categorias.js — vista y lógica para categorías de socios.
    - socios.js — vista y lógica para gestión de socios (list, create, avatar upload).
    - transacciones.js — vista y modal de creación de transacciones; formateo valor, validaciones, subida de comprobante.

Módulos (funcionalidad)

- Pedidos — placeholder de UI (archivo referenciado en nav). Implementado como demoCard.
- Seguimiento — placeholder de UI.
- Clientes — placeholder de UI.
- Inventario — placeholder de UI.
- Devoluciones — placeholder de UI.
- Transacciones — implementación actual: vista de listado y modal con formularios, validaciones client-side, FSM para input de valor, subida de comprobantes a Supabase Storage y llamada a RPC `insert_transaccion_and_update_balances`.
- Socios — CRUD de socios, con avatar upload a Supabase Storage y asociación a `categorias_socios`.

Flujo de montaje y navegación

- En `index.html` se carga `js/app.js` como módulo.
- `app.js` escucha `DOMContentLoaded` y `hashchange`.
- `mountView(tab)` monta vistas según `data-view` del nav. Cada vista es responsable de renderizar su UI y bindear handlers locales.
- Transacciones y Socios exponen funciones para abrir modales (por ejemplo `openTransaccionModal()`), y app.js vincula los formularios (submit) a los handlers exportados.

Manejo de modales

- `js/ui/modals.js` expone helpers `openModal`/`closeModal` y funciones específicas (`openTransaccionModal`, `openSocioModal`, etc.).
- Los modales están envueltos en un contenedor `.backdrop` que contiene `.modal`. Al abrir se añade `.open` y se bloquea el scroll del body; al cerrar se remueven los handlers.
- Se dispara un evento `modal:closed` desde `closeModal` que las vistas usan para limpieza de recursos (ej. revocar objectURLs del preview). 

Integración con Supabase

- `js/services/supabase.js` expone `getClient()` que devuelve el cliente Supabase usando la configuración de `config.js` (variables públicas del proyecto).
- Las vistas utilizan el cliente para CRUD directo (`.from(table).select/insert/update/delete`) y para RPC (`.rpc('function_name', payload)`).

Despliegue

- El sitio es estático y puede desplegarse en Vercel u otro proveedor static-hosting. El flujo de CI/CD (no incluido) debe ejecutar lint/tests y luego publicar la carpeta estática.

Notas finales

- Las decisiones UX y validaciones se aplican en cliente (ej. FSM para valor), mientras que lógicas críticas (balance updates) se delegan a una función RPC en Supabase.
- Mantener consistencia: no cambiar ids de inputs ni nombres de campos sin actualizar tanto front como RPC y storage.
