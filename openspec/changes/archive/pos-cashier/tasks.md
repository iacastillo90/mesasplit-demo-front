# Tasks: pos-cashier — Caja / POS (Punto de Venta)

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/PosView/PosPage.test.jsx` with RED tests for:
  - Cashier PIN session lock screen (`"9921"`)
  - Multi-method payment settlement (Cash, Card, Transfer) and change calculator (`vuelto`)
  - Chilean DTE Boleta/Factura emission, RUT validation, and CAF folio tracking
  - Cierre Ciego cash drawer auditing and `shift.closed` event emission
  - Realtime QR payment sync (`payment.qr_received`)
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Store & Services Implementation

- [x] 2.1 Update `src/features/PosView/store/usePosStore.js`:
  - Add `cashierUnlocked` state and `unlockCashier(pin)` action
  - Add `activeBill` state and `selectBill(tableId)` action
  - Add `paymentMethod`, `tenderedAmount`, `changeAmount` states and calculation actions
  - Add `dteType` ('boleta' | 'factura'), `rutData`, and `submitDte()` action emitting `payment.completed`
  - Add `blindCloseModalOpen`, `physicalCashCount`, and `submitBlindClose()` action emitting `shift.closed`
  - Add realtime listener for `payment.qr_received`
- [x] 2.2 Update `src/features/PosView/services/posService.js` with table bill fetching, RUT lookup, and DTE folio generator.

## Phase 3: Components & UI Implementation

- [x] 3.1 Create `src/features/PosView/components/PaymentMethodPicker.jsx` (Multi-method selector & change calculator).
- [x] 3.2 Create `src/features/PosView/components/DteModal.jsx` (Chilean SII Boleta/Factura document generator with RUT search & CAF folio).
- [x] 3.3 Create `src/features/PosView/components/BlindCloseModal.jsx` (Cierre Ciego cash drawer auditing modal).
- [x] 3.4 Update `src/features/PosView/pages/PosPage.jsx` with PIN lock overlay, open bills list, settlement panel, and header buttons.

## Phase 4: GREEN Verification & Code Quality

- [x] 4.1 Run `npm run test` to verify all tests pass GREEN.
- [x] 4.2 Run `npm run build` to verify clean production compilation.
- [x] 4.3 Run `npm run lint` and `npm run format` to ensure 0 lint errors and clean formatting.
- [x] 4.4 Commit changes in reviewable logical units with Spanish conventional commits explaining the WHY.
