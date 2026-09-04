# Proposal: Fase 32 — Limitación a la Última Card de Delivery en Vista Resumen Admin

## Contexto y Motivación

El usuario solicita que en la vista completa/resumen de administración (`/admin`), la sección de Canal Delivery despliegue **únicamente la última card del pedido más reciente** (`limit={1}`), evitando que el panel lateral se extienda verticalmente y rompa el diseño compacto junto al Plano Topológico.

## Alcance del Cambio

- **`src/features/RadarView/components/DeliveryColumn.jsx`**: [ACTUALIZADO] Añadir prop `limit` (opcional) para limitar la cantidad de cards mostradas en la vista comprimida de la columna, agregando un enlace/botón "Ver todas las comandas de delivery ➔".
- **`src/features/RadarView/pages/RadarPage.jsx`**: [ACTUALIZADO] Pasar `limit={1}` en las vistas `all` y `overview`, mientras que en la pestaña dedicada `delivery` se muestran todas las comandas.
- **`src/features/RadarView/components/DeliveryColumn.test.jsx`**: [ACTUALIZADO] Verificar la limitación de tarjetas con prop `limit={1}`.
