# Spec: Modal de Conversación de Reserva y Pestañas Responsivas (fase23-reserva-chat-y-pestanas-responsive)

## Requerimientos Funcionales y Contratos

### REQUIREMENT 1: Modal de Chat de Reservas en Banner y Cards
- **MUST** abrir `WhatsAppReservationChatModal.jsx` al hacer clic en el botón `📅 Reservar` del banner o en la card `Asistente de Reservas`.

### REQUIREMENT 2: Layout Responsivo de Pestañas
- **MUST** ajustar la barra de navegación de pestañas (`Resumen`, `Puntos & Premios`, `Locales`, etc.) utilizando clases de flexbox flexible (`flex-wrap sm:flex-nowrap`, `min-w-fit`, `text-[11px]`) para prevenir rupturas en pantallas de celular.
