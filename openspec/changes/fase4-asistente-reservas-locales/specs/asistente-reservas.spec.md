# Spec: Asistente Inteligente de Reservas por Local — MesaSplit

## Requisitos de Capacidad

### `branch-selection-and-availability`
- MUST proporcionar un catálogo interactivo de locales/sucursales con información de zona, dirección y nivel de ocupación en vivo.
- MUST permitir filtrar disponibilidad de horarios según el número de comensales seleccionados.

### `client-reservation-assistant-stepper`
- MUST ofrecer un asistente guiado por pasos (Sucursal ➔ Detalles/Zona ➔ Fila Virtual u Ocupación ➔ Voucher QR).
- MUST permitir al cliente especificar preferencias de zona (*Salón*, *Terraza*, *Barra*, *Zona Privada*) y notas especiales (*Cumpleaños*, *Silla de Bebé*, *Accesibilidad*, *Mascota*).

### `virtual-queue-and-realtime-sync`
- MUST calcular el tiempo de espera estimado en minutos para la lista de espera virtual cuando la capacidad del local esté al 100%.
- MUST publicar el evento `reservation.created` o `waitlist.joined` a través del bus en tiempo real `useRealtimeBus` para sincronización instantánea con el Radar del Administrador (`RadarPage.jsx`).

### `voucher-confirmation-and-qr`
- MUST generar un resumen interactivo de la reserva con código QR simulado, identificador único de reserva y opción de copiar resumen o cancelar reserva.
