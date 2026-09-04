# Proposal: pos-cashier — Caja / POS (Punto de Venta)

## Intent

Implement the complete interactive Cashier POS (`PosView`). The module covers cashier PIN authentication, multi-method payment settlement (Cash, Card, Transfer, Mixed) with automatic change calculation, Chilean DTE tax invoice/receipt emission (Boleta and Factura Electrónica with RUT completion), CAF folio consumption, Blind Close cash drawer auditing ("Cierre Ciego" arqueo with variance calculation), and realtime QR payment synchronization (`payment.qr_received`).

## Scope

### In Scope
- **Cashier Session Lock Screen**: PIN keypad authentication (`"9921"`) before accessing checkout operations.
- **Multi-Method Checkout**: Payment breakdown supporting Cash (`efectivo`), Card (`tarjeta`), Bank Transfer (`transferencia`), or Mixed payments with automatic change (`vuelto`) calculator.
- **DTE Tax Receipt Emission**: Generation of Chilean SII electronic tax documents (Boleta Electrónica vs Factura Electrónica with RUT validation & completion) and CAF folio tracking.
- **Blind Cash Drawer Close ("Cierre Ciego")**: Cashier shift closing modal hiding expected system totals until physical count is entered, calculating cash drawer variance (`diferencia de arqueo`).
- **Realtime QR Payment Sync**: Real-time listener for table QR payments (`payment.qr_received`) automatically updating table settlement status.
- **Strict TDD & Tests**: Unit & RTL tests written RED-GREEN under `strict_tdd: true` in `src/features/PosView/PosPage.test.jsx`.

### Out of Scope
- Physical thermal printer USB drivers (browser print / simulated PDF used).

## Capabilities

### New Capabilities
- `pos-cashier`: Interactive POS Cashier terminal with PIN session lock, multi-payment settlement, change calculator, Chilean DTE Boleta/Factura emission, CAF folio tracking, Cierre Ciego cash drawer auditing, and QR payment sync.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Work executed in `src/features/PosView/`. Writes RED tests first in `src/features/PosView/PosPage.test.jsx`, then updates components in `src/features/PosView/` to pass tests GREEN. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/PosView/pages/PosPage.jsx` | Modified | Main POS checkout layout, PIN lock overlay, table bill settlement, payment method picker |
| `src/features/PosView/components/BlindCloseModal.jsx` | New | Cierre Ciego cash drawer auditing modal with physical count & variance calculation |
| `src/features/PosView/components/DteModal.jsx` | New | SII DTE document generator (Boleta / Factura Electrónica with RUT & CAF folio) |
| `src/features/PosView/components/PaymentMethodPicker.jsx` | New | Multi-method payment selector (Efectivo, Tarjeta, Transferencia, Mixto) and change calculator |
| `src/features/PosView/services/posService.js` | Modified | Service connecting to mock tables, DTE folios, and settlement endpoints |
| `src/features/PosView/store/usePosStore.js` | Modified | Zustand slice: cashierLock, activeTableBill, paymentState, dteType, rutData, blindCloseData |
| `src/features/PosView/PosPage.test.jsx` | Modified | Comprehensive RTL test suite verifying PIN lock, multi-payment, DTE emission, Cierre Ciego, and QR sync |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlap with `account-split` (opencode) | Low | Antigravity strictly isolated to `src/features/PosView/`; opencode works on Client bill splitting |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/pos-cashier`.

## Success Criteria

- [ ] All tests in `src/features/PosView/PosPage.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
- [ ] POS Cashier view renders PIN session lock, multi-payment settlement, change calculator, Chilean DTE Boleta/Factura emission, CAF folio tracking, Cierre Ciego arqueo, and QR sync.
