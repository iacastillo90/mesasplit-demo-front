# Tasks: demo-fase1-gaps

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1000 (900–1200) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 5 PRs (uno por slice) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

Focused test = `npm run test <filtro>`.

| Unit | Goal | Likely PR | Focused test | Runtime harness | Rollback |
|------|------|-----------|--------------|-----------------|---------|
| 1 | Onboarding | PR 1 | test ClientView | dev /cliente | Revert WelcomeModal+ClientPage |
| 2 | Turno caja | PR 2 | test PosView | dev /admin/caja | Revert persist+CashShiftModal |
| 3 | KDS offline | PR 3 | test KdsView | dev KDS + offline | Revert adaptador+cola |
| 4 | Costo primario | PR 4 | test CorporateView | dev /admin/super | Revert card+foodCost |
| 5 | Compliance SII | PR 5 | test CorporateView | dev /admin/super | Revert panel+selectores |
| 6 | Verificación | con PR 5 | test+build+lint | N/A (local no-UI) | N/A (sin diff) |

## Phase 1: client-onboarding (PR 1) `[client-onboarding]`

- [x] 1.1 RED: `ClientView/WelcomeModal.test.jsx` — S1 guía visible / S2 descarte persiste `mesasplit-onboarding` / S3 no bloquea pedidos; debe fallar
- [x] 1.2 GREEN: crear `WelcomeModal.jsx`; render en `ClientPage.jsx` solo sin clave
- [x] 1.3 GREEN: persistir `mesasplit-onboarding=true` al descartar; Agregar/carrito/S.O.S. operativos
- [x] 1.4 Verificar: verde + eslint

## Phase 2: cash-shift (PR 2) `[cash-shift]`

- [x] 2.1 RED: `PosView/CashShift.test.jsx` — S1 apertura / S2 cierre resumen / S3 persistencia reload / S4 sin duplicación arqueo (spy `bus.publish`); debe fallar
- [x] 2.2 GREEN: en `usePosStore.js` estado `cashShift` (`status`, `openedAt`, `initialAmount?`, `closedAt?`, `summary?`) + `openCashShift`/`closeCashShift` con timestamps
- [x] 2.3 GREEN: `persist` clave `mesasplit-cash-shift`, `partialize` solo `cashShift`; `closeCashShift` no publica `shift.closed` ni toca `blindCloseOpen`
- [x] 2.4 GREEN: crear `CashShiftModal.jsx`; montar en `PosPage.jsx`; opcional: cerrar turno tras Cierre Ciego
- [x] 2.5 Verificar: verde

## Phase 3: kds-offline (PR 3) `[kds-offline]`

- [x] 3.1 RED: `KdsView/KdsOffline.test.jsx` — S1 banner offline / S2 encolado / S3 auto-flush / S4 sin canal no crashea (adaptador fake + vi.mock bus); debe fallar
- [x] 3.2 GREEN: `createConnectivityAdapter` (default `navigator.onLine` + online/offline; fake inyectable) en `KdsView/services/connectivityService.js`
- [x] 3.3 GREEN: en `useKdsStore.js` `isOnline` + `offlineQueue` FIFO; offline encola `completeTicket`/`toggleStock86`, online flush en orden y vacía
- [x] 3.4 GREEN: crear `OfflineBanner.jsx`; montar en `KdsPage.jsx`; NoopAdapter sin lanzar
- [x] 3.5 Verificar: verde

## Phase 4: costo-primario (PR 4) `[costo-primario]`

- [x] 4.1 RED: `CorporateView/CostoPrimarioCard.test.jsx` — S1 cálculo 30.0 / S2 read-only / S3 sin datos sin NaN; debe fallar
- [x] 4.2 GREEN: `foodCost` en `corporateService.js` y `INITIAL_BRANCHES`; propagado por `loadCorporateData`
- [x] 4.3 GREEN: selector `selectCostoPrimario` (ΣfoodCost/ΣsalesTotal×100, 1 decimal; 0% si Σ=0)
- [x] 4.4 GREEN: crear `CostoPrimarioCard.jsx` read-only; montar en `SuperAdminPage.jsx`
- [x] 4.5 Verificar: verde

## Phase 5: compliance-sii (PR 5) `[compliance-sii]`

- [x] 5.1 RED: `CorporateView/ComplianceSiiPanel.test.jsx` — S1 tres checks OK (1041-1043) / S2 quiebre (1041,1043) / S3 read-only; debe fallar
- [x] 5.2 GREEN: `dteFolio` en `INITIAL_EVENTS` y listener `payment.completed` de `useCorporateStore.js`
- [x] 5.3 GREEN: selectores `selectHasDteBoleta`, `selectFoliosConsecutivos` (Δ=1 cronológico; 0-1 → OK), `selectCierreCiegoOk` (`blindCloseOpen`+`submitBlindClose`)
- [x] 5.4 GREEN: crear `ComplianceSiiPanel.jsx` read-only; montar en `SuperAdminPage.jsx`; sin mutar stores
- [x] 5.5 Verificar: verde

## Phase 6: Verificación integrada

- [x] 6.1 `npm run test` (17 escenarios cubiertos) + `npm run build` + `npm run lint` sin errores