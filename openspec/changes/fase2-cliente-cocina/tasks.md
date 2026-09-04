# Tasks: fase2-cliente-cocina

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2000 (1800–2200) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 7 commits/PRs (uno por unit) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

Focused test = `npm run test -- <filtro>`.

| Unit | ID | Commit target | Focused test | Runtime harness | Rollback |
|------|----|---------------|--------------|-----------------|---------|
| U1 | client-factura | Commit 1 → main | `npm run test -- InvoiceRequestModal` | dev /cliente (solicitar factura) | `git revert` del commit 1; archivos: InvoiceRequestModal + wiring en ClientPage |
| U2 | client-order-tracking | Commit 2 → main | `npm run test -- OrderTrackingBanner` | dev /cliente + bus.publish en devtools/test | `git revert` del commit 2; archivos: OrderTrackingBanner + wiring |
| U3 | client-alcohol-verification | Commit 3 → main | `npm run test -- AgeVerificationModal` | dev /cliente (agregar Cerveza IPA) | `git revert` del commit 3; archivos: AgeVerificationModal + menu.json + wiring |
| U4 | client-session-reconnect | Commit 4 → main | `npm run test -- useClientStore` | dev /cliente (reload con carrito) | `git revert` del commit 4; archivos: ReconnectBanner + useClientStore (persist) |
| U5 | kds-expo-view | Commit 5 → main | `npm run test -- ExpoDisplay` | dev /cocina (toggle Expo View) | `git revert` del commit 5; archivos: ExpoDisplay + useKdsStore + KdsPage |
| U6 | kds-batch-view | Commit 6 → main | `npm run test -- BatchSummaryView` | dev /cocina (toggle Vista Batch) | `git revert` del commit 6; archivos: BatchSummaryView + KdsHeader + KdsPage |
| U7 | kds-delivery-checklist | Commit 7 → main | `npm run test -- PackingChecklistModal` | dev /cocina (empaque delivery) | `git revert` del commit 7; archivos: PackingChecklistModal + useRadarStore + wiring |

## Fase 1: client-factura — Solicitud de factura demo (spec R1, escenarios 1–3)

- [x] 1.1 RED: crear `src/features/ClientView/components/InvoiceRequestModal.test.jsx`
- [x] 1.2 GREEN: crear `InvoiceRequestModal.jsx` — input RUT validado con `validateRut`
- [x] 1.3 GREEN: conectar en `src/features/ClientView/pages/ClientPage.jsx`
- [x] 1.4 Verificar `npm run test` en verde; commit `feat: factura en Mesa Virtual (client-factura)`

## Fase 2: client-order-tracking — Tracking de pedido (spec R2, escenarios 1–3)

- [x] 2.1 RED: crear `src/features/ClientView/components/OrderTrackingBanner.test.jsx`
- [x] 2.2 GREEN: crear `OrderTrackingBanner.jsx` — mapeo `payload.status` con `TICKET_STATUS`
- [x] 2.3 GREEN: en `ClientPage.jsx` — suscribirse a `order.status.change`
- [x] 2.4 Verificar `npm run test` en verde; commit `feat: tracking de pedido en Mesa Virtual (client-order-tracking)`

## Fase 3: client-alcohol-verification — Verificación de edad (spec R3, escenarios 1–3)

- [x] 3.1 RED: crear `src/features/ClientView/components/AgeVerificationModal.test.jsx`
- [x] 3.2 GREEN: `src/mocks/menu.json` — agregar `alcoholic:false` y `alcoholic:true` en "Cerveza Artesanal IPA"
- [x] 3.3 GREEN: crear `AgeVerificationModal.jsx` — confirmación demo
- [x] 3.4 GREEN: `ClientPage.jsx` — `handleAdd` abre el modal si `item.alcoholic`
- [x] 3.5 Verificar `npm run test` en verde; commit `feat: verificación de alcohol al agregar bebida (client-alcohol-verification)`

## Fase 4: client-session-reconnect — Reconexión de sesión (spec R4, escenarios 1–3)

- [x] 4.1 RED: crear `src/features/ClientView/store/useClientStore.test.js`
- [x] 4.2 GREEN: `useClientStore.js` — envolver con `persist` + `createJSONStorage(() => localStorage)` (`mesasplit-client`)
- [x] 4.3 GREEN: crear `src/features/ClientView/components/ReconnectBanner.jsx`
- [x] 4.4 GREEN: `ClientPage.jsx` — render `ReconnectBanner`
- [x] 4.5 Verificar `npm run test` en verde; commit `feat: reconexión de sesión de Mesa Virtual (client-session-reconnect)`

## Fase 5: kds-expo-view — Expo View fullscreen (spec R5, escenarios 1–3)

- [x] 5.1 RED: crear `src/features/KdsView/components/ExpoDisplay.test.jsx`
- [x] 5.2 GREEN: crear `ExpoDisplay.jsx` — fullscreen con tipografías grandes y temporizador
- [x] 5.3 GREEN: `useKdsStore.js` — flag `expoMode` + `toggleExpoMode`; `KdsPage.jsx` — toggle e integración
- [x] 5.4 Verificar `npm run test` en verde; commit `feat: Expo View en KDS (kds-expo-view)`

## Fase 6: kds-batch-view — Vista agregada por plato (spec R6, escenarios 1–3)

- [x] 6.1 RED: crear `src/features/KdsView/components/BatchSummaryView.test.jsx`
- [x] 6.2 GREEN: crear `BatchSummaryView.jsx` — agregación read-only por plato
- [x] 6.3 GREEN: `KdsPage.jsx` — toggle de vista batch
- [x] 6.4 Verificar `npm run test` en verde; commit `feat: vista agregada batch en KDS (kds-batch-view)`

## Fase 7: kds-delivery-checklist — Checklist de empaque delivery (spec R7, escenarios 1–4)

- [x] 7.1 RED: crear `src/features/KdsView/components/PackingChecklistModal.test.jsx`
- [x] 7.2 GREEN: `src/features/RadarView/store/useRadarStore.js` — acción `completeDeliveryOrder`
- [x] 7.3 GREEN: crear `PackingChecklistModal.jsx` — fuente `useRadarStore.deliveryOrders`, persist `mesasplit-packing-{orderId}`
- [x] 7.4 GREEN: wiring en `KdsPage.jsx` y `KdsHeader.jsx`
- [x] 7.5 Verificar `npm run test` en verde; commit `feat: checklist de empaque delivery en KDS (kds-delivery-checklist)`

## Fase 8: Verificación integrada final

- [x] 8.1 `npm run test` completo: 30 test suites en verde (124 tests).
- [x] 8.2 `npm run build` en verde.
- [x] 8.3 `npm run lint` en verde.
- [x] 8.4 Cumplimiento de contratos R1–R7 sin duplicaciones.
