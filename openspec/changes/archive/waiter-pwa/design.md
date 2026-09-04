# Design: waiter-pwa — PWA del Mozo / Garzón

## Technical Approach

Implement the interactive Waiter PWA in `src/features/WaiterView/` under `strict_tdd: true`. The implementation expands `WaiterPage.jsx`, `TableGrid.jsx`, `OrderPad.jsx`, `waiterService.js`, and `useWaiterStore.js`, and creates `CourseControlPicker.jsx` and `PinAuthModal.jsx`.

The PWA operates in dark mode (`#011623`), providing single-hand mobile interactions (min 56px thumb zone, tap-to-add counters), pure red allergy highlights (`#EF4444`), course control firing (`course.fire`), PIN authorization for voiding kitchen-sent items (`alert.fraud`), and table status management (`table.status_changed`).

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Shift State & Lock Screen | A: In-memory shift status in `useWaiterStore`. B: Persisted in localStorage. | **A**: In-memory `shiftStatus` (`clocked_out` vs `clocked_in`) in store slice. Simple & reactive. |
| D2 | PIN Verification | A: Hardcoded mock PINs (`"1234"` for waiter, `"9921"` for admin) in `useWaiterStore.js`. B: Backend API call. | **A**: Hardcoded mock PIN check in `useWaiterStore.js` with delay simulation. |
| D3 | Order Line Counter Badges | A: Map of `productId -> quantity` in order draft state. B: Plain array of items with `qty`. | **B**: Array of order items `{ id, productId, name, price, qty, allergens, course, sentToKitchen }`. |
| D4 | Realtime Integration | A: Inline `useRealtimeBus` calls in components. B: Store-level event publication on state actions. | **B**: Store-level publication of `shift.clock_in`, `course.fire`, `alert.fraud`, and `table.status_changed` via `createRealtimeBus('mesasplit')`. |

## Data Flow

```
[Waiter User]
     │
     ├── Clock-In (PIN 1234) ──► useWaiterStore.clockIn() ──► publishBusEvent('shift.clock_in')
     │
     ├── Select Table 1 ───────► useWaiterStore.selectTable('table-1')
     │
     ├── Tap Menu Card ────────► useWaiterStore.addToDraft(item) ──► Increment counter badge (2x)
     │
     ├── Select Allergy ───────► Add 'Alergia Maní' ──► Render pure red (#EF4444) border
     │
     ├── Marchar Fondo ────────► useWaiterStore.fireCourse('fondo') ──► publishBusEvent('course.fire')
     │
     ├── Void Sent Item ───────► PinAuthModal (PIN 9921) ──► publishBusEvent('alert.fraud')
     │
     └── Liberar Mesa ─────────► useWaiterStore.releaseTable() ──► publishBusEvent('table.status_changed')
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/WaiterView/pages/WaiterPage.jsx` | Modify | Full Waiter PWA screen: shift lock, table grid, single-hand order pad |
| `src/features/WaiterView/components/TableGrid.jsx` | Modify | Table grid with guest counts and colored status badges |
| `src/features/WaiterView/components/OrderPad.jsx` | Modify | Single-hand catalog, category tabs, order summary, course control, release button |
| `src/features/WaiterView/components/CourseControlPicker.jsx` | Create | Selector for `[Entrada - Enviar Ahora]` vs `[Fondo - Marchar]` |
| `src/features/WaiterView/components/PinAuthModal.jsx` | Create | PIN authorization modal for item cancellations |
| `src/features/WaiterView/services/waiterService.js` | Modify | Service connecting to mockFetch & store |
| `src/features/WaiterView/store/useWaiterStore.js` | Modify | Zustand slice: shiftStatus, activeTableId, orderDraft, PIN verification, bus events |
| `src/features/WaiterView/WaiterPage.test.jsx` | Create | Comprehensive RTL & unit test suite for all waiter scenarios under `strict_tdd: true` |

## Testing Strategy

All tests written RED first in `src/features/WaiterView/WaiterPage.test.jsx`:
1. **Clock-In**: Verify shift lock screen renders initially; entering PIN `"1234"` unlocks table grid and emits `shift.clock_in`.
2. **Table Grid**: Verify assigned tables render with correct status semaphores (green/yellow/orange) and no red for table status.
3. **Single-Hand Order Entry**: Tap item card, verify counter badge `1x` -> `2x` updates without modal.
4. **Escudo de Alergias**: Add item with `allergens: ["maní"]`, verify item line has pure red border (`#EF4444`) and `⚠️ ALERGIA: MANÍ` tag.
5. **Course Control**: Click "Marchar Fondo", verify `course.fire` event is published.
6. **PIN Voiding**: Attempt to delete kitchen-sent item, verify PIN modal appears, entering PIN `"9921"` deletes item and emits `alert.fraud`.
7. **Table Release**: Click "Cerrar y Liberar Mesa", verify table status becomes `free` and `table.status_changed` is emitted.

## Threat Matrix

N/A — Client-side SPA feature with mock realtime bus and fixtures.

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/waiter-pwa`.
