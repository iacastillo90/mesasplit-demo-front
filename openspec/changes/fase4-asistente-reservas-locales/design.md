# Design: fase4-asistente-reservas-locales — Arquitectura del Asistente de Reservas

## Arquitectura de Componentes

### 1. Store de Reservas por Local (`useReservationStore.js`)
- **Ubicación**: `src/features/ClientView/store/useReservationStore.js`.
- **Estado**: Catálogo de sucursales (`branches`), reservas por sucursal (`reservationsByBranch`), cola de espera (`waitlistByBranch`), sucursal seleccionada (`selectedBranch`).
- **Acciones**: `selectBranch`, `createReservation`, `joinWaitlist`, `cancelReservation`.
- **Eventos**: Integra `useRealtimeBus` para emitir `reservation.created` y `waitlist.joined`.

### 2. Componente de Asistente de Reservas (`ClientReservationAssistant.jsx`)
- **Ubicación**: `src/features/ClientView/components/ClientReservationAssistant.jsx`.
- **Interfaz**: Modal envolvente o Bottom-Sheet responsivo con navegación entre 4 pasos:
  1. `BranchSelector`: Tarjetas de sucursales con foto, dirección y badge de disponibilidad.
  2. `ReservationForm`: Selector de fecha, hora, comensales, zona (Salón/Terraza/Barra/Privado) y tags de requerimientos.
  3. `VirtualWaitlistBanner`: Estimación de minutos cuando no hay cupo directo.
  4. `ReservationVoucher`: Resumen con código QR simulado, ID de reserva y confirmación.

### 3. Integración en ClientView & Radar
- **Ubicación**:
  - `src/features/ClientView/pages/ClientPage.jsx`: Botón flotante/secundario "📅 Reservar Mesa / Fila Virtual".
  - `src/features/RadarView/components/ReservationModal.jsx`: Escucha eventos real-time y sincroniza la lista de reservas confirmadas y lista de espera.
