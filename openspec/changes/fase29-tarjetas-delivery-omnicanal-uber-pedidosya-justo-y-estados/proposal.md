# Proposal: Fase 29 — Tarjetas de Delivery Omnicanal (Uber Eats, PedidosYa, Rappi, Justo) y Estados de Entrega

## Contexto y Motivación

El usuario solicita enriquecer las tarjetas del **Canal Delivery Omnicanal** en la vista de administración `/admin`, agregando ejemplos de plataformas como **Uber Eats, PedidosYa, Rappi y Justo App**, e incluyendo distintivos de estados operacionales reales:
- 🍳 **En Preparación**
- 🛵 **En Camino**
- ✅ **Entregado Recientemente**

## Alcance del Cambio

- **`src/features/RadarView/store/useRadarStore.js`**: [ACTUALIZADO] Incorporar fixture realista de comandas con plataformas Uber Eats, PedidosYa, Rappi y Justo, clasificadas por los estados *En Preparación*, *En Camino* y *Entregado Recientemente*.
- **`src/features/RadarView/components/DeliveryColumn.jsx`**: [ACTUALIZADO] Rediseñar el componente con branding distintivo por plataforma (incluyendo Justo 🟣), badges coloridos por estado de pedido, filtro por pestañas de estado (*Todos, En Preparación, En Camino, Entregados*) y soporte de tema Claro/Oscuro con `useThemeStore`.
- **`src/features/RadarView/components/DeliveryColumn.test.jsx`**: [NUEVO/ACTUALIZADO] Agregar pruebas unitarias para validar las tarjetas de Uber, PedidosYa, Justo y Rappi y la conmutación de estados.
