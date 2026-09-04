# Tasks: fase2-mozo-caja-radar — Fase 2: Diferenciación (Mozo · Caja · Radar · Super Admin)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1.000–1.300 (9 unidades + fixture) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Commit por unidad directo a main (11 commits atómicos) |
| Delivery strategy | exception-ok |
| Chain strategy | pending |

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fixture `cost` en menu.json | Commit 1 → main | `npm run test` | N/A (fixture) | `git revert` commit 1 |
| 2 | `waiter-upsell` | Commit 2 → main | `npx vitest run src/features/WaiterView/services/upsellService.test.js` | `npm run dev` → /garzon | `git revert` commit 2 |
| 3 | `waiter-table-transfer` | Commit 3 → main | `npx vitest run src/features/WaiterView/store/waiterTableTransfer.test.js` | `npm run dev` → /garzon | `git revert` commit 3 |
| 4 | `waiter-performance` | Commit 4 → main | `npx vitest run src/features/WaiterView/services/performanceService.test.js` | `npm run dev` → /garzon | `git revert` commit 4 |
| 5 | `pos-credit-note` | Commit 5 → main | `npx vitest run src/features/PosView/creditNote.test.js` | `npm run dev` → /admin/caja | `git revert` commit 5 |
| 6 | `pos-cfd` | Commit 6 → main | `npx vitest run src/features/PosView/cfd.test.js` | `npm run dev` → /admin/caja | `git revert` commit 6 |
| 7 | `pos-counter-mode` | Commit 7 → main | `npx vitest run src/features/PosView/counterMode.test.js` | `npm run dev` → /admin/caja | `git revert` commit 7 |
| 8 | `radar-gamification` | Commit 8 → main | `npx vitest run src/features/RadarView/leaderboard.test.js` | `npm run dev` → /admin | `git revert` commit 8 |
| 9 | `corporate-what-if` | Commit 9 → main | `npx vitest run src/features/CorporateView/whatIf.test.js` | `npm run dev` → /admin/super | `git revert` commit 9 |
| 10 | `corporate-menu-engineering` | Commit 10 → main | `npx vitest run src/features/CorporateView/menuEngineering.test.js` | `npm run dev` → /admin/super | `git revert` commit 10 |
| 11 | Verificación integrada | Commit 11 → main | `npm run test && npm run build && npm run lint` | `npm run dev` (9 vistas) | `git revert` commit 11 |

## Phase 1: Fixture e infraestructura base (campo `cost`)

- [x] 1.1 RED: crear `src/mocks/menu.test.js` — cada ítem de `menu.json` MUST tener `cost` entero con `0 < cost < price`. *(commit f0d1228)*
- [x] 1.2 GREEN: agregar `cost` (CLP entero) a los 6 ítems de `src/mocks/menu.json`. *(commit 488003b / f0d1228)*
- [x] 1.3 Revisar tests existentes que asumen forma del menú. *(confirmado: verdes)*
- [x] 1.4 Ejecutar `npm run test` completo.
- [x] 1.5 Commit `test: fijar contrato de costo del menú demo (0 < cost < price)`. *(commit f0d1228)*

## Phase 2: Upsell asistido en OrderPad `[waiter-upsell]`

- [x] 2.1 RED: `upsellService.test.js` — escenarios S1–S4. *(commit 9bae8f4)*
- [x] 2.2 GREEN: crear `src/features/WaiterView/services/upsellService.js`. *(commit 9bae8f4)*
- [x] 2.3 GREEN: renderizar chip de sugerencia en `OrderPad.jsx`. *(commit 9bae8f4)*
- [x] 2.4 Commit `feat: sugerir upsell explícito al garzón al agregar platos con regla (waiter-upsell)`. *(commit 9bae8f4)*

## Phase 3: Unir y ceder mesa `[waiter-table-transfer]`

- [x] 3.1 RED: `src/features/WaiterView/store/waiterTableTransfer.test.js` — escenarios S1–S5. *(commit 2cec822)*
- [x] 3.2 GREEN: en `useWaiterStore.js` agregar `mergeBills` y `transferTable`. *(commit 2cec822)*
- [x] 3.3 GREEN: `TransferModal.jsx` y botones en `OrderPad.jsx`. *(commit 2cec822)*
- [x] 3.4 Commit `feat: unir y ceder mesa preservando integridad de la cuenta (waiter-table-transfer)`. *(commit 2cec822)*

## Phase 4: Mi Rendimiento (read-only) `[waiter-performance]`

- [x] 4.1 RED: `src/features/WaiterView/services/performanceService.test.js` — escenarios S1–S3. *(commit 7b6465a)*
- [x] 4.2 GREEN: selector `selectWaiterPerformance` en `performanceService.js`. *(commit 7b6465a)*
- [x] 4.3 GREEN: `WaiterPerformanceCard.jsx` e integración en `WaiterPage.jsx`. *(commit 7b6465a)*
- [x] 4.4 Commit `feat: panel de rendimiento del garzón read-only (waiter-performance)`. *(commit 7b6465a)*

## Phase 5: Nota de crédito con PIN admin `[pos-credit-note]`

- [x] 5.1 RED: `src/features/PosView/creditNote.test.js` — escenarios S1–S4. *(commit 7b87c8c)*
- [x] 5.2 GREEN: acción `issueCreditNote` con PIN 9921 en `usePosStore.js`. *(commit 7b87c8c)*
- [x] 5.3 GREEN: `CreditNoteModal.jsx` en `PosView`. *(commit 7b87c8c)*
- [x] 5.4 Commit `feat: nota de crédito con PIN admin en Caja (pos-credit-note)`. *(commit 7b87c8c)*

## Phase 6: Comprobante CFD (demo) `[pos-cfd]`

- [x] 6.1 RED: `src/features/PosView/cfd.test.js` — escenarios S1–S3. *(commit 1c80d6b)*
- [x] 6.2 GREEN: acción `issueCfd` en `usePosStore.js`. *(commit 1c80d6b)*
- [x] 6.3 GREEN: `CfdModal.jsx` en `PosView`. *(commit 1c80d6b)*
- [x] 6.4 Commit `feat: comprobante CFD demo en Caja (pos-cfd)`. *(commit 1c80d6b)*

## Phase 7: Modo mostrador `[pos-counter-mode]`

- [x] 7.1 RED: `src/features/PosView/counterMode.test.js` — escenarios S1–S3. *(commit 01680f7)*
- [x] 7.2 GREEN: estado `counterMode` y `counterCart` en `usePosStore.js`. *(commit 01680f7)*
- [x] 7.3 GREEN: acción `payCounterCart` emite `payment.completed` con `tableNumber: null`. *(commit 01680f7)*
- [x] 7.4 Commit `feat: modo mostrador de venta rápida en Caja (pos-counter-mode)`. *(commit 01680f7)*

## Phase 8: Leaderboard de staff `[radar-gamification]`

- [x] 8.1 RED: `src/features/RadarView/leaderboard.test.js` — escenarios S1–S4. *(commit 7c02456)*
- [x] 8.2 GREEN: selector `selectStaffLeaderboard` en `leaderboardService.js`. *(commit 7c02456)*
- [x] 8.3 GREEN: `StaffLeaderboard.jsx` e integración en `RadarPage.jsx`. *(commit 7c02456)*
- [x] 8.4 Commit `feat: leaderboard de staff en Radar (radar-gamification)`. *(commit 7c02456)*

## Phase 9: Simulador What-If `[corporate-what-if]`

- [x] 9.1 RED: `src/features/CorporateView/whatIf.test.js` — escenarios S1–S3. *(commit ff75afd)*
- [x] 9.2 GREEN: función pura `simulatePriceChange` en `whatIfService.js`. *(commit ff75afd)*
- [x] 9.3 GREEN: `WhatIfSimulator.jsx` e integración en `SuperAdminPage.jsx`. *(commit ff75afd)*
- [x] 9.4 Commit `feat: simulador What-If de precios en Super Admin (corporate-what-if)`. *(commit ff75afd)*

## Phase 10: Matriz de ingeniería de menú `[corporate-menu-engineering]`

- [x] 10.1 RED: `src/features/CorporateView/menuEngineering.test.js` — escenarios S1–S3. *(commit cc7fe28)*
- [x] 10.2 GREEN: selector `classifyMenu` en `menuEngineeringService.js`. *(commit cc7fe28)*
- [x] 10.3 GREEN: `MenuEngineeringMatrix.jsx` e integración en `SuperAdminPage.jsx`. *(commit cc7fe28)*
- [x] 10.4 Commit `feat: matriz de ingeniería de menú en Super Admin (corporate-menu-engineering)`. *(commit cc7fe28)*

## Phase 11: Verificación integrada final

- [x] 11.1 `npm run test` completo: 38 test suites en verde (153 tests).
- [x] 11.2 `npm run build` en verde.
- [x] 11.3 `npm run lint` en verde.
