# Proposal: Fase 26 — Selector de Tema Claro/Oscuro Totalmente Funcional

## Contexto y Motivación

El usuario solicita activar el funcionamiento dinámico del botón selector de tema Claro ☀️ / Oscuro 🌙 en la cabecera `AppHeader.jsx`, de modo que al hacer clic cambie instantáneamente los colores y paletas visuales de todas las vistas del sistema.

## Alcance del Cambio

- **`src/shared/store/useThemeStore.js`**: [NUEVO] Store global Zustand para gestión reactiva de tema `'light'` / `'dark'` con almacenamiento en `localStorage` y toggle de la clase `dark` en `document.documentElement`.
- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Conectar el botón ☀️/🌙 directamente con `useThemeStore.getState().toggleTheme()`.
- **`src/shared/ui/AdminLayout.jsx`**: [ACTUALIZADO] Utilizar `useThemeStore` para responder reactivamente a cambios de tema entre claro y oscuro.
- **`src/features/CorporateView/pages/SuperAdminPage.jsx`**, **`src/features/RadarView/pages/RadarPage.jsx`**, **`src/features/PosView/pages/PosPage.jsx`**: [ACTUALIZADOS] Permitir cambio dinámico de tema sin forzar un prop estático.
