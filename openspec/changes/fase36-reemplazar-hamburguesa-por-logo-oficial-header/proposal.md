# Proposal: Fase 36 — Reemplazar Ícono de Hamburguesa (🍔) por Logo Oficial de MesaSplit en AppHeader

## Contexto y Motivación

El usuario solicita eliminar el ícono duplicado del header y reemplazar el emoticón de hamburguesa (`🍔`) en el botón de navegación del drawer por el logo recién diseñado (`public/images/mesasplit_logo.png`), dejando un único logo oficial como botón de menú.

## Alcance del Cambio

- **`src/shared/ui/AppHeader.jsx`**: [ACTUALIZADO] Reemplazar `🍔` por `<img src="/images/mesasplit_logo.png" />` dentro del botón de apertura del drawer y mantener el texto de título `MesaSplit` sin redundancia.
- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [REFACTOR] Solucionar advertencia de linter en dependency array.
