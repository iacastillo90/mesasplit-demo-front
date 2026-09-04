# Proposal: Fase 19 — Perfil Interactivo de Comensal, Vistas de Puntos/Locales/Boletas y Chat de Soporte WhatsApp

## Contexto y Motivación

Para perfeccionar la experiencia móvil del cliente:
1. **Ocultar Footer en Móvil**: `AppFooter` se oculta en móviles (`hidden sm:block`).
2. **Pestañas de Perfil Responsivos (`ClientProfilePage.jsx`)**: Píldoras de navegación horizontalmente desplazables (`overflow-x-auto whitespace-nowrap`).
3. **Pestaña Puntos & Premios**: Catálogo interactivo de premios canjeables, promociones (Happy Hour 2x1) y eventos (Noche de Jazz).
4. **Pestaña Locales Visitados**: Tarjetas con fotos de frontis, dirección, horarios de atención y teléfono.
5. **Pestaña Boletas Emitidas DTE**: Desglose exacto del consumo pagado del total de la mesa y botón de descarga.
6. **Chat de Soporte WhatsApp (`ClientSupportChatModal.jsx`)**: Chat conversacional estilo WhatsApp con 4 opciones rápidas e ingreso libre de preguntas.

## Alcance del Cambio

- **`src/features/ClientView/pages/ClientProfilePage.jsx`**: [ACTUALIZADO] Pestañas responsivas y subvistas interactivas de Puntos, Locales y Boletas DTE.
- **`src/features/ClientView/components/ClientSupportChatModal.jsx`**: [NUEVO] Chat de soporte estilo WhatsApp con 4 opciones predefinidas.
- **`src/shared/ui/AppFooter.jsx`**: Oculto en dispositivos móviles (`hidden sm:block`).
