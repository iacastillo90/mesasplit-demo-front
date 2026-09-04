# Proposal: Fase 24 — Vinculación Directa de la Card y Avatar "Mi Perfil"

## Contexto y Motivación

El usuario solicita que al hacer clic en la tarjeta **"Mi Perfil"** (así como en el avatar/encabezado de usuario del Dashboard y menú lateral), la aplicación redirija de inmediato a la vista completa del perfil del comensal (`/cliente/perfil`).

## Alcance del Cambio

- **`src/features/ClientView/pages/ClientDashboardPage.jsx`**:
  - Enlazar la tarjeta **"Mi Perfil VIP Gold"** y la sección con avatar/nombre del banner de bienvenida hacia `/cliente/perfil`.
- **`src/features/ClientView/components/ClientDrawerMenu.jsx`**:
  - Enlazar la cabecera de usuario en el menú lateral para que al hacer clic dirija a `/cliente/perfil`.
