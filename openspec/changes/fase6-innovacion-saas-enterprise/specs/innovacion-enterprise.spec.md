# Spec: Innovaciones SaaS Enterprise — MesaSplit

## Requisitos de Capacidad

### `realtime-inventory-recipe-deduction` (Track 1)
- MUST mantener el stock en tiempo real de insumos críticos (*Carne Lomo*, *Pisco*, *Queso*, *Papas*).
- MUST descontar las cantidades de insumos asociadas a cada receta al confirmar la orden en cocina o POS.
- MUST marcar automáticamente un plato en Lista 86 (agotado) cuando alguno de sus insumos obligatorios llegue a stock 0.

### `omnichannel-delivery-live-tracking` (Track 2)
- MUST gestionar órdenes de delivery de plataformas de terceros (*Uber Eats*, *Rappi*, *PedidosYa*).
- MUST ofrecer un modal interactivo `DeliveryTrackingModal` con estados en vivo (*Recibido* ➔ *En Preparación* ➔ *Repartidor Asignado* ➔ *En Camino* ➔ *Entregado*) y mapa simulado de tracking.

### `web-audio-synth-auditory-ux` (Track 3)
- MUST generar ondas de sonido nativas vía `Web Audio API` (sin depender de archivos `.mp3` externos) para notificaciones clave.
- MUST ofrecer un control toggle `🔊/🔇` en el `AppHeader` para activar/silenciar sonidos globales.

### `dynamic-multi-language-i18n` (Track 4)
- MUST proporcionar un selector de idioma en tiempo real (Español, English, Português).
- MUST traducir dinámicamente los textos clave de la Mesa Virtual y navegación según el idioma seleccionado.
