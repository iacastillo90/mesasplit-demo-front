# Tasks: fase4-asistente-reservas-locales — Tareas por Fases de Desarrollo

## Fase 1: Store de Reservas y Sincronización Realtime
- [ ] 1.1 Crear `useReservationStore.js` con catálogo de sucursales, reservas por local y cola de espera virtual.
- [ ] 1.2 Integrar emisión de eventos `reservation.created` y `waitlist.joined` vía `useRealtimeBus`.
- [ ] 1.3 Escribir tests unitarios en `useReservationStore.test.js`.

## Fase 2: Componente Asistente de Reservas (Client-Side Stepper)
- [ ] 2.1 Crear `ClientReservationAssistant.jsx` con selector de sucursal (Providencia, Santiago Centro, Vitacura).
- [ ] 2.2 Implementar formulario de reserva (comensales, fecha/hora, ambiente y notas de salud/requerimientos).
- [ ] 2.3 Implementar pantalla de Fila Virtual con estimación de tiempo dinámico.
- [ ] 2.4 Diseñar Voucher de confirmación con código QR simulado e identificador único de reserva.
- [ ] 2.5 Escribir tests unitarios en `ClientReservationAssistant.test.jsx`.

## Fase 3: Integración en Vistas Cliente & Admin Radar
- [ ] 3.1 Integrar activador de reservas en `ClientPage.jsx` y `PortalPage.jsx`.
- [ ] 3.2 Conectar la sincronización reactiva en tiempo real con `ReservationModal.jsx` en la vista de Admin Radar (`/admin`).
- [ ] 3.3 Verificar compilación (`npm run build`), linter (`npm run lint`) y suite de pruebas (`npm run test`).
