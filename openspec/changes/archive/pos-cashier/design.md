# Design: pos-cashier — Caja / POS (Punto de Venta)

## Technical Approach

Implement the interactive POS Cashier terminal in `src/features/PosView/` under `strict_tdd: true`. The implementation updates `PosPage.jsx`, `posService.js`, `usePosStore.js`, and `PosPage.test.jsx`, and creates `BlindCloseModal.jsx`, `DteModal.jsx`, and `PaymentMethodPicker.jsx`.

The POS provides cashier PIN authentication (`"9921"`), multi-method payment settlement, change calculation, Chilean DTE document generation (Boleta & Factura with RUT validation), CAF folio tracking, Blind Close cash drawer auditing, and real-time QR payment sync (`payment.qr_received`).

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Cashier Lock Screen | A: In-memory `cashierUnlocked` flag in `usePosStore`. B: Persisted in localStorage. | **A**: In-memory `cashierUnlocked` state in store slice. PIN `"9921"` unlocks session. |
| D2 | Chilean DTE & RUT Validation | A: External SII API call. B: Local RUT format validator & mock company dictionary in `posService.js`. | **B**: Local RUT validator & mock company dictionary for offline demo reliability. |
| D3 | Payment State & Change Calc | A: State object `{ method, tenderedAmount, changeAmount }`. B: Inline component state. | **A**: Store slice state for reactive change calculation and multi-method breakdown. |
| D4 | Realtime Integration | A: Inline `useRealtimeBus` calls in components. B: Store-level event publication on settlement and listener for `payment.qr_received`. | **B**: Store-level publication of `payment.completed`, `shift.closed`, and listener for `payment.qr_received`. |

## Data Flow

```
[Cashier User / Realtime Bus]
     │
     ├── Enter PIN 9921 ─────────► usePosStore.unlockCashier('9921') ──► Unlock POS billing UI
     │
     ├── Select Table Bill ──────► usePosStore.selectBill('t1')
     │
     ├── Select Cash Payment ────► Enter tendered $25.000 ──► Calculate vuelto $5.000
     │
     ├── Select DTE Factura ─────► Enter RUT 76.123.456-7 ──► Auto-fill "Gastronomía Demo SpA"
     │
     ├── Confirm Payment ────────► usePosStore.confirmPayment() ──► publishBusEvent('payment.completed')
     │
     ├── QR Payment Arrives ─────► Listen to 'payment.qr_received' ──► Mark bill as paid
     │
     └── Cierre Ciego ───────────► BlindCloseModal ──► Enter $150.000 ──► publishBusEvent('shift.closed')
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/PosView/pages/PosPage.jsx` | Modify | Main POS layout, PIN lock overlay, open bills list, payment panel |
| `src/features/PosView/components/BlindCloseModal.jsx` | Create | Cierre Ciego cash drawer auditing modal with variance calculation |
| `src/features/PosView/components/DteModal.jsx` | Create | Chilean SII DTE document generator (Boleta / Factura Electrónica & Folio) |
| `src/features/PosView/components/PaymentMethodPicker.jsx` | Create | Multi-method payment selector and automatic change calculator |
| `src/features/PosView/services/posService.js` | Modify | Service fetching table bills, RUT lookup, DTE folios, and settlement |
| `src/features/PosView/store/usePosStore.js` | Modify | Zustand slice for POS cashier lock, active bill, payment method, DTE, Cierre Ciego |
| `src/features/PosView/PosPage.test.jsx` | Create | Comprehensive RTL test suite verifying PIN lock, multi-payment, DTE emission, Cierre Ciego, and QR sync |

## Testing Strategy

All tests written RED first in `src/features/PosView/PosPage.test.jsx`:
1. **Cashier PIN Lock**: Verify PIN lock screen renders; entering PIN `"9921"` unlocks cashier terminal.
2. **Multi-Payment & Change Calc**: Select table bill `$20.000`, select Cash, enter `$25.000`, verify change `$5.000` is displayed.
3. **DTE Factura Emission**: Select Factura Electrónica, enter RUT `"76.123.456-7"`, verify company name auto-fills and DTE folio is assigned.
4. **Cierre Ciego Shift Close**: Open Cierre Ciego modal, enter physical cash count `$150.000`, verify variance `$0` and `shift.closed` event emission.
5. **Realtime QR Sync**: Emit `payment.qr_received` event, verify table bill status updates to `paid`.

## Threat Matrix

N/A — Client-side SPA feature with mock realtime bus and fixtures.

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/pos-cashier`.
