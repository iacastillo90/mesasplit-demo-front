# Proposal: Fase 23 — Modal de Chat de Reservas en Banner & Pestañas Responsivas

## Contexto y Motivación

1. Al presionar el botón **"Reservar"** en el banner del comensal o la tarjeta **"Asistente de Reservas"**, el sistema debe desplegar el modal interactivo de conversación en formato WhatsApp (`WhatsAppReservationChatModal.jsx`).
2. En la barra de navegación de pestañas (Resumen, Puntos & Premios, Locales), la versión móvil sufría desbordamientos con la tarjeta de Locales. Se ajusta la disposición responsiva para que los 3 botones principales se mantengan en una sola línea o se reorganicen limpiamente abajo en pantallas estrechas.

## Alcance del Cambio

- **`src/features/ClientView/pages/ClientProfilePage.jsx`**:
  - Reemplazar el handler de reserva por `WhatsAppReservationChatModal.jsx`.
  - Rediseñar la barra de pestañas para evitar quiebres responsivos.
- **`src/features/ClientView/pages/ClientDashboardPage.jsx`**:
  - Vincular los botones de Reservar del Banner y de la Card al modal `WhatsAppReservationChatModal.jsx`.
