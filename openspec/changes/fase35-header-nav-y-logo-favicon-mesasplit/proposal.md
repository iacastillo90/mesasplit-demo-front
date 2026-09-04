# Proposal: Fase 35 — AppHeader en Mesa Virtual, Logo Oficial HD y Favicon de MesaSplit

## Contexto y Motivación

El usuario solicita incorporar la cabecera universal `AppHeader` (el mismo nav de todas las páginas) en la vista de la Mesa Virtual (`/cliente` -> `ClientPage.jsx`). Adicionalmente, solicita el diseño de un Logo oficial HD y un Favicon vectorizado SVG para MesaSplit.

## Alcance del Cambio

- **Logo oficial HD**: Creado con IA y guardado en `public/images/mesasplit_logo.png`.
- **Favicon vectorizado**: Creado en `public/favicon.svg` y vinculado en `index.html`.
- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Incorporar la insignia del logo oficial `mesasplit_logo.png` junto al título de marca MesaSplit en la barra de navegación universal.
- **`src/features/ClientView/pages/ClientPage.jsx`**: [ACTUALIZADO] Montar el `AppHeader` en la parte superior de la pantalla para alinear la navegación con todas las vistas de la aplicación.
