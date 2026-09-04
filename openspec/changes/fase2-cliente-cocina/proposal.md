# Proposal: fase2-cliente-cocina — Fase 2 Diferenciación: Cliente (Mesa Virtual) + Cocina (KDS)

## Intent

Implementar 7 funcionalidades de diferenciación para la demo en dos vistas: **Cliente (Mesa Virtual)** — factura, tracking de pedido, verificación de alcohol, reconexión de sesión — y **Cocina (KDS)** — Expo View, vista agregada (batch), checklist de empaque delivery. Todo integra la arquitectura demo existente (stores Zustand `useClientStore`/`useSplitStore`/`useKdsStore`, bus realtime `useRealtimeBus` con BroadcastChannel, persistencia `useDemoStore` en localStorage). Sin backend, sin transporte nuevo, sin SII/verificación reales: demo-grade.

## Scope

### In Scope

**Track Cliente (4 work units)**
- **Factura**: flujo demo de solicitud de factura desde la Mesa Virtual (input RUT, estado de confirmación, sin SII real). Distinto del flujo DTE de caja (`PosView/DteModal.jsx`); integra el modelo de cuenta existente (`useSplitStore`/total del carrito).
- **Tracking de pedido**: progreso de estado (enviado a cocina → en preparación → listo → entregado) derivado del bus realtime existente (`order.status.change`/`TICKET_STATUS`), sin inventar transporte.
- **Verificación de alcohol**: modal demo (checkbox "mayor de edad"/fecha de nacimiento) antes de agregar al carrito ítems con flag `alcoholic` en el catálogo (`src/mocks/menu.json` — el flag se agrega al modelo).
- **Reconexión de sesión**: restaurar carrito + contexto de mesa desde localStorage al recargar/perder realtime (patrón `useDemoStore`), con indicador de reconexión y sin perder el carrito.

**Track Cocina (3 work units)**
- **Expo View (KDS)**: modo exhibición fullscreen de ciclo automático con órdenes pendientes en layout broadcast-friendly (barras de progreso grandes, tipografías grandes); sin interacción, oculta botones sensibles en modo expo.
- **Vista agregada (batch)**: agrupa órdenes pendientes por plato mostrando totales ("Milanesa x3"); derivada de los tickets existentes de `useKdsStore`, agregación read-only.
- **Checklist de empaque delivery**: al marcar un pedido listo para delivery, checklist de empaque (verificar ítems → despachado); integra el flujo de `DeliveryColumn` (RadarView) y persiste el estado del checklist (demo).

### Out of Scope
- Backend/API, SII real, verificación de edad real.
- Otros tracks de Fase 2 (Mozo, Caja, Radar gamificación, SuperAdmin) → cambio separado `fase2-mozo-caja-radar`.
- Fraccionar ítem compartido (queda para otro corte; "calificación flash" ya está cubierta por `customer-survey-ratings`).
- Arquitectura nueva: no crear transporte ni stores raíz nuevos; solo extender los existentes.

## Capabilities

### New Capabilities
- `client-factura`: solicitud de factura demo con RUT y estado de confirmación integrada a la cuenta (no DTE de caja).
- `client-order-tracking`: progreso de estado del pedido en Mesa Virtual derivado del bus realtime existente.
- `client-alcohol-verification`: gate demo de edad sobre ítems `alcoholic` del catálogo antes de agregar al carrito.
- `client-session-reconnect`: restauración de sesión (carrito + mesa) desde localStorage con indicador de reconexión.
- `kds-expo-view`: modo exhibición autónomo fullscreen de órdenes pendientes apto para pantalla pública.
- `kds-batch-view`: agregación read-only de tickets pendientes por plato con totales.
- `kds-delivery-checklist`: checklist de empaque para pedidos delivery listos, con persistencia demo.

### Modified Capabilities
- None: ningún spec existente cambia a nivel de requisito. El modelo de catálogo suma el flag `alcoholic` (mock + servicio) dentro de `client-alcohol-verification`; no existe spec previo de catálogo.

## Approach

7 work units independientes, cada una con su grupo de tasks y su propio commit directo a `main` (patrón aprobado en fase1). Cada unit: tests RED-GREEN (`strict_tdd: true`, `npm run test`), `npm run build` y `npm run lint` en verde. Integrar stores/servicios existentes por feature, siguiendo `AGENTS.md` (comentarios por línea en español, commits convencionales en español con porqué). El change es autocontenido: lo implementa Antigravity leyendo exclusivamente `openspec/`.

**Nota de presupuesto de revisión**: corte grande (7 units) vs. límite de 400 líneas del orquestador. La fase tasks DEBE planificar el slicing por unit y emitir el forecast con las líneas guard: `Decision needed before apply: Yes|No`, `Chained PRs recommended: Yes|No`, `400-line budget risk: Low|Medium|High`.

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/features/ClientView/pages/ClientPage.jsx` | Modified | Orquesta modales de factura/alcohol y banners de tracking/reconexión |
| `src/features/ClientView/components/InvoiceRequestModal.jsx` | New | Solicitud de factura demo (RUT + confirmación) |
| `src/features/ClientView/components/OrderTrackingBanner.jsx` | New | Progreso enviado → preparación → listo → entregado |
| `src/features/ClientView/components/AgeVerificationModal.jsx` | New | Gate demo de edad para ítems alcohólicos |
| `src/features/ClientView/components/ReconnectBanner.jsx` | New | Indicador de reconexión de sesión |
| `src/features/ClientView/store/useClientStore.js` | Modified | Persistencia del carrito/contexto (patrón useDemoStore) + restauración |
| `src/features/ClientView/services/clientService.js` | Modified | Envío demo de factura; flag `alcoholic` en menú |
| `src/mocks/menu.json` | Modified | Flag `alcoholic` en ítems de catálogo |
| `src/features/KdsView/pages/KdsPage.jsx` | Modified | Toggles de Expo View y vista batch; oculta controles sensibles en expo |
| `src/features/KdsView/components/ExpoDisplay.jsx` | New | Exhibición autónoma fullscreen con ciclo automático |
| `src/features/KdsView/components/BatchSummaryView.jsx` | New | Agregación read-only por plato con totales |
| `src/features/KdsView/components/PackingChecklistModal.jsx` | New | Checklist de empaque delivery con persistencia demo |
| `src/features/KdsView/store/useKdsStore.js` | Modified | Flags expo/batch, derivación agregada y estado persistido del checklist |
| `src/features/RadarView/components/DeliveryColumn.jsx` | Modified | Hook de estado "listo para despacho" hacia el checklist (donde aplique) |
| Tests en `src/features/ClientView/` y `src/features/KdsView/` | New/Modified | Suite RTL por unit (RED-GREEN) |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Superposición con flujo DTE de caja (factura) | Media | Factura cliente es flujo demo propio: RUT + confirmación, sin folio CAF ni `DteModal` |
| Alcohol sin flag en catálogo | Media | Extender `menu.json` + `clientService` dentro de la unit responsable |
| Tracking inventando transporte | Baja | Derivar SOLO de `useRealtimeBus` (`order.status.change`) y `TICKET_STATUS` |
| Checklist acoplado a RadarView | Media | Integrar vía estado existente de delivery ("donde sea posible"); diseño decide la fuente exacta |
| Unidad que excede 400 líneas | Alta | Forecast obligatorio en tasks; slicing por unit + commits por unit (rollback aislado) |

## Rollback Plan

Commits por unit directo a `main`: revertir la unidad fallida con `git revert <commit>` (aislado, no afecta las otras 6 units). Cada unit es autónoma: comienzo/verificación/rollback propios. No hay rama larga que deshacer.

## Dependencies

- Stores existentes: `useClientStore`, `useSplitStore`, `useKdsStore`, `useDemoStore` (patrón persist).
- Bus realtime: `useRealtimeBus` / `createRealtimeBus('mesasplit')` y tópicos `order.status.change`.
- Enums compartidos: `TICKET_STATUS` (src/shared/constants/statusEnums.js).
- `strict_tdd: true` / vitest / `npm run test` (openspec/config.yaml).

## Success Criteria

- [ ] Las 7 units pasan su suite RTL (`npm run test`), `npm run build` y `npm run lint` en verde.
- [ ] Cliente: solicitar factura con RUT → confirmación; tracking refleja 4 estados vía bus; ítem alcohólico exige verificación antes de sumar al carrito; reload restaura carrito/mesa con indicador.
- [ ] KDS: Expo View cicla autónomo y oculta botones sensibles; vista batch muestra totales por plato; pedido delivery listo abre checklist que persiste y llega a "despachado".
- [ ] Sin duplicación del flujo DTE de caja ni transporte nuevo; 7 commits en `main`, uno por unit.