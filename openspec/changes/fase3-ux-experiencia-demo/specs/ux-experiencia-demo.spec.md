# Spec: UX y Experiencia de Usuario Demo — MesaSplit

## Requisitos de Capacidad

### `demo-control-bar` (Fase 1)
- MUST proporcionar un componente flotante `DemoControlBar` disponible globalmente en la demo.
- MUST permitir gatillar los eventos demo principales en 1 clic: pedido de mesa, alerta S.O.S., plato listo en KDS, pago QR y reset.
- MUST actualizar de forma reactiva los stores Zustand (`useClientStore`, `useKdsStore`, `useSplitStore`) y el bus `useRealtimeBus`.

### `cross-view-realtime-feedback` (Fase 2)
- MUST desplegar alertas flotantes con pulso de color en la vista `/garzon` y `/admin` cuando se emita un S.O.S. desde `/cliente`.
- MUST transformar el `OrderTrackingBanner` de la vista cliente en un stepper de 4 etapas (`Enviado` ➔ `Preparando` ➔ `Listo` ➔ `Entregado`).
- MUST ofrecer una notificación flotante Toast con botón "Deshacer" (`Undo`) de 5 segundos tras finalizar un ticket en KDS o anular un ítem en Waiter.

### `split-bill-ux-enhancements` (Fase 3)
- MUST mostrar una barra de progreso de pago grupal en el flujo de división de cuenta (monto pagado vs pendiente y % acumulado).
- MUST incluir un botón interactivo para compartir el enlace/QR de pago por WhatsApp o copiar al portapapeles.
- MUST ofrecer un selector de propina sugerida (0%, 10%, 15%, 20%) con cálculo dinámico por persona antes de pagar.

### `client-menu-customization` (Fase 4)
- MUST proveer chips de filtrado rápido por dieta (`Vegano`, `Gluten Free`, `Picante`, `Popular`) en la carta digital.
- MUST desplegar un modal de personalización de plato al hacer clic en ítems configurables (término de cocción, acompañamiento, notas).

### `pos-kds-ergonomics-shortcuts` (Fase 5)
- MUST mapear atajos globales de teclado (`F2` en POS para pagar, `Espacio` en KDS para avanzar, `Esc` para cerrar modales) con badges visuales.
- MUST ofrecer un toggle de "Modo Táctil Extragrande" para adaptar la UI a pantallas táctiles de baja precisión.
