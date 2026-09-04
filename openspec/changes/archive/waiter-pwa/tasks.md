# Tasks: waiter-pwa — PWA del Mozo / Garzón

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/WaiterView/WaiterPage.test.jsx` with RED tests for:
  - Shift clock-in lock screen and `shift.clock_in` event emission
  - Table grid rendering with guest count and status semaphores (green/yellow/orange)
  - Single-hand tap-to-add menu cards with circular counter badges (`1x`, `2x`)
  - Escudo de Alergias (pure red `#EF4444` border and `⚠️ ALERGIA: MANÍ` tag)
  - Course Control picker (`[Entrada]` vs `[Fondo - Marchar]`) and `course.fire` event emission
  - PIN authorization modal for kitchen-sent item cancellation and `alert.fraud` event emission
  - Table release action and `table.status_changed` event emission
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Store & Services Implementation

- [x] 2.1 Update `src/features/WaiterView/store/useWaiterStore.js`:
  - Add `shiftStatus` (`clocked_out` / `clocked_in`) and `clockIn(pin)` action
  - Add `activeTableId` and `selectTable(id)` action
  - Add `orderDraft` items array, `addToDraft(item)`, `incrementQty(itemId)`, `decrementQty(itemId)` actions
  - Add `toggleAllergyFlag(itemId, allergen)` action
  - Add `setCourse(courseType)` and `fireCourse(courseType)` action emitting `course.fire`
  - Add `voidItemWithPin(itemId, adminPin, reason)` action emitting `alert.fraud`
  - Add `releaseTable(tableId)` action emitting `table.status_changed`
- [x] 2.2 Update `src/features/WaiterView/services/waiterService.js` to connect to mock tables and user data.

## Phase 3: Components & UI Implementation

- [x] 3.1 Create `src/features/WaiterView/components/CourseControlPicker.jsx` (Course selector for Entradas vs Fondos).
- [x] 3.2 Create `src/features/WaiterView/components/PinAuthModal.jsx` (Modal for Admin PIN input and void reason selection).
- [x] 3.3 Update `src/features/WaiterView/components/TableGrid.jsx` with status semaphores (green, yellow, orange) and guest count badges.
- [x] 3.4 Update `src/features/WaiterView/components/OrderPad.jsx`:
  - Single-hand menu cards with circular counter badges (`1x`, `2x`)
  - Item lines with pure red `#EF4444` borders for declared allergies
  - Course Control picker integration
  - PIN Void modal launcher for sent items
  - Table release button ("Cerrar y Liberar Mesa")
- [x] 3.5 Update `src/features/WaiterView/pages/WaiterPage.jsx` with shift lock screen overlay and table grid / order pad view.

## Phase 4: GREEN Verification & Code Quality

- [x] 4.1 Run `npm run test` to verify all tests pass GREEN.
- [x] 4.2 Run `npm run build` to verify clean production compilation.
- [x] 4.3 Run `npm run lint` and `npm run format` to ensure 0 lint errors and clean formatting.
- [x] 4.4 Commit changes in reviewable logical units with Spanish conventional commits explaining the WHY.
