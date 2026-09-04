# Apply Progress & TDD Evidence: demo-fase1-gaps

**De**: Antigravity (implementador)
**Para**: opencode (orquestador)
**Fecha**: 2026-08-17

## Slices Completados y Commits (Slices + Fixes)

Se han implementado y corregido los 5 slices de gaps del MVP requeridos en `demo-fase1-gaps`:

1. **`client-onboarding`**:
   - Refactor a banner/tip strip flotante no bloqueante en [`WelcomeModal.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/ClientView/components/WelcomeModal.jsx).
   - Test suite: [`WelcomeModal.test.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/ClientView/WelcomeModal.test.jsx) con aserción estricta de modificación del carrito mientras la guía sigue visible.

2. **`cash-shift`**:
   - Persistencia en localStorage bajo `mesasplit-cash-shift` en [`usePosStore.js`](file:///home/ivan/Desktop/MesaSplit/src/features/PosView/store/usePosStore.js), [`CashShiftModal.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/PosView/components/CashShiftModal.jsx) y `PosPage.jsx`.
   - Test suite: [`CashShift.test.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/PosView/CashShift.test.jsx) con verificación de JSON persistido sin `openBills` transitorios y spy sobre `posBus` exportado.

3. **`kds-offline`**:
   - Adaptador [`connectivityService.js`](file:///home/ivan/Desktop/MesaSplit/src/features/KdsView/services/connectivityService.js), cola FIFO `offlineQueue` en [`useKdsStore.js`](file:///home/ivan/Desktop/MesaSplit/src/features/KdsView/store/useKdsStore.js), [`OfflineBanner.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/KdsView/components/OfflineBanner.jsx) e integración en `KdsPage.jsx`.
   - Test suite: [`KdsOffline.test.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/KdsView/KdsOffline.test.jsx).

4. **`costo-primario`**:
   - Propiedad `foodCost` en sucursales, selector puro `selectCostoPrimario` (prevención de `NaN` ante ventas 0), componente read-only [`CostoPrimarioCard.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/CorporateView/components/CostoPrimarioCard.jsx) y montaje en `SuperAdminPage.jsx`.
   - Test suite: [`CostoPrimarioCard.test.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/CorporateView/CostoPrimarioCard.test.jsx).

5. **`compliance-sii`**:
   - Campo `dteFolio` en eventos, selectores `selectHasDteBoleta`, `selectFoliosConsecutivos` (detección de quiebres $\Delta \neq 1$) y `selectCierreCiegoOk` (deriva del estado real de `usePosStore`), componente read-only [`ComplianceSiiPanel.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/CorporateView/components/ComplianceSiiPanel.jsx) y montaje en `SuperAdminPage.jsx`.
   - Test suite: [`ComplianceSiiPanel.test.jsx`](file:///home/ivan/Desktop/MesaSplit/src/features/CorporateView/ComplianceSiiPanel.test.jsx) con aserciones visuales en UI (`✅ OK` / `🚨 Riesgo`).

---

## Tabla de Evidencia del Ciclo TDD (TDD Cycle Evidence Table)

| Slice | Test RED File | Resultado RED | Componente / Store GREEN | Resultado GREEN & Wiring |
|-------|---------------|---------------|--------------------------|---------------------------|
| **1. client-onboarding** | `src/features/ClientView/WelcomeModal.test.jsx` | FAIL (Missing WelcomeModal component & non-blocking guide) | `components/WelcomeModal.jsx` + `pages/ClientPage.jsx` | PASS (3 tests, 0 errors, non-blocking tip strip) |
| **2. cash-shift** | `src/features/PosView/CashShift.test.jsx` | FAIL (Missing openCashShift/closeCashShift & storage) | `store/usePosStore.js` + `components/CashShiftModal.jsx` + `PosPage.jsx` | PASS (4 tests, storage partialize check, posBus spy) |
| **3. kds-offline** | `src/features/KdsView/KdsOffline.test.jsx` | FAIL (Missing isOnline, offlineQueue FIFO) | `services/connectivityService.js` + `store/useKdsStore.js` + `KdsPage.jsx` | PASS (3 tests, kdsBus spy, auto-flush FIFO) |
| **4. costo-primario** | `src/features/CorporateView/CostoPrimarioCard.test.jsx` | FAIL (Missing foodCost & selectCostoPrimario) | `services/corporateService.js` + `store/useCorporateStore.js` + `CostoPrimarioCard.jsx` | PASS (3 tests, useShallow render check) |
| **5. compliance-sii** | `src/features/CorporateView/ComplianceSiiPanel.test.jsx` | FAIL (Missing compliance selectors & panel UI) | `store/useCorporateStore.js` + `components/ComplianceSiiPanel.jsx` + `SuperAdminPage.jsx` | PASS (3 tests, UI OK / Riesgo badge assertions) |

---

## Verificación Integrada

- **Pruebas (Vitest)**: **20/20 test suites pasando en GREEN (90/90 tests en verde)**.
- **Compilación (Vite)**: `npm run build` compilado exitosamente sin errores.
- **Linter (ESLint)**: `npm run lint` finalizado con **0 errores y 0 advertencias**.
