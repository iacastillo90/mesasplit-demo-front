# Proposal: Fase 22 — Sincronización Directa de Rutas para Reseñas, Reservas y Menú Lateral

## Contexto y Motivación

El usuario reporta que al hacer clic en las tarjetas de herramientas del Dashboard (ej. "Mis Reseñas de Platos", "Asistente de Reservas"), la aplicación debe dirigir al comensal directamente a la vista o modal correspondiente.

## Alcance del Cambio

- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [ACTUALIZADO] Sincronizar el estado `activeTab` con los parámetros de la URL (`?tab=reviews`, `?tab=payments`, etc.) y `location.state`.
- **`src/features/ClientView/pages/ClientDashboardPage.jsx`**: [ACTUALIZADO] Configurar enlaces directos con parámetros `?tab=...` en las cards de Reseñas, Referidos y Pagos DTE, así como la activación inmediata del Asistente de Reservas.
- **`src/features/ClientView/components/ClientDrawerMenu.jsx`**: [ACTUALIZADO] Ajustar todas las rutas del menú lateral para navegar con el parámetro de pestaña específico (`?tab=rewards`, `?tab=reviews`, etc.).
