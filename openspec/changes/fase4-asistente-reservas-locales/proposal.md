# Proposal: fase4-asistente-reservas-locales — Asistente Inteligente de Reservas por Local

## Intent

Elevar la experiencia de usuario (**UX**) del cliente y la capacidad multiliteral de la plataforma **MesaSplit** introduciendo un **Asistente Inteligente de Reservas e Integración de Fila Virtual por Sucursal/Local**. Este módulo permite a los comensales seleccionar sucursal, interactuar con un asistente guiado (comensales, fecha/hora, zona/ambiente y requerimientos especiales), unirse a la lista de espera virtual si no hay cupo directo, y recibir confirmación inmediata sincronizada en tiempo real con el Radar del Administrador Local.

## Scope

### In Scope
1. **Store de Reservas por Sucursal (`useReservationStore.js`)**:
   - Administración del catálogo de sucursales (Santiago Centro, Providencia, Vitacura).
   - Gestión de reservas confirmadas y lista de espera virtual por local.
   - Publicación de eventos `reservation.created` y `waitlist.joined` mediante `useRealtimeBus`.

2. **Componente de Asistente de Reservas Cliente (`ClientReservationAssistant.jsx`)**:
   - Stepper conversacional de 4 pasos:
     1. *Selección de Sucursal / Local* (fotos, dirección, disponibilidad).
     2. *Detalles de Reserva* (comensales, fecha/hora, ambiente: Salón/Terraza/Barra y notas especiales: Cumpleaños, Silla Bebé, Accesibilidad).
     3. *Fila Virtual / Lista de Espera* (estimación de minutos y turno cuando el local esté completo).
     4. *Voucher & QR de Confirmación* (resumen, código QR y botón de agregar a calendario).

3. **Integración en Mesa Virtual y Radar Admin**:
   - Acceso desde `ClientPage.jsx` mediante botón de acción `📅 Reservar Mesa`.
   - Sincronización en tiempo real con `ReservationModal.jsx` y `TopologicalMap.jsx` en `/admin`.

4. **Suite de Tests Unitarios (`Vitest`)**:
   - Tests de store y de integración de UI para el flujo del asistente por local.

### Out of Scope
- Integración con APIs externas de Google Maps o WhatsApp Business API real.
- Pasarela de pago de reservas con depósito bancario en producción.

## Approach
Desarrollar incrementalmente con TDD (`strict_tdd: true`), respetando `AGENTS.md` (comentarios por línea en español, commits convencional en español con el porqué de la decisión técnica).
