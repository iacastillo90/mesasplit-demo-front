# Proposal: Fase 16 — Dashboard de Cliente y Menú Lateral Colapsable con Botón de Hamburguesa 🍔

## Contexto y Motivación

Para centralizar todas las capacidades de la experiencia de comensal en un centro de mando moderno e interactivo, se requiere:
1. **Dashboard de Cliente (`/cliente/dashboard`)**: Pantalla principal post-login con resumen visual de puntos de lealtad, mesa activa, cupones, boletas recientes e invitaciones.
2. **Menú Lateral Colapsable con Botón de Hamburguesa 🍔 (`ClientDrawerMenu.jsx`)**: Drawer deslizable accesible desde la cabecera que esconde y despliega todas las funcionalidades del cliente en un solo lugar.

## Alcance del Cambio

- **`src/features/ClientView/components/ClientDrawerMenu.jsx`**: [NUEVO] Menú de hamburguesa lateral colapsable con accesos directos a todas las vistas del cliente.
- **`src/features/ClientView/pages/ClientDashboardPage.jsx`**: [NUEVO] Dashboard central de comensal post-login.
- **`src/features/ClientView/pages/ClientLoginPage.jsx` & `ClientRegisterPage.jsx`**: Redirección a `/cliente/dashboard`.
- **`src/routes/views.jsx` & `src/routes/index.jsx`**: Registro de la ruta `/cliente/dashboard`.
