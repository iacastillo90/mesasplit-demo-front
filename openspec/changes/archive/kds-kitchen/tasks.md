# Tasks: kds-kitchen — Cocina / KDS (Kitchen Display System)

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Expand `src/features/KdsView/KdsPage.test.jsx` with RED tests for:
  - Strict dark mode surfaces (brand-950, brand-800, no light mode leakage)
  - Time semaphores (0-10m blue, 10-20m amber `#F59E0B`, +20m orange `#FB923C`)
  - Escudo de Alergias (pure red `#EF4444` border and banner)
  - Course control sections ("Marchar ahora" vs "En espera" opacity)
  - One-tap ticket completion, recall history, and `kds.item_ready` event pub
  - Lista 86 toggle modal and `kds.stock_86` event pub
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Store & Services Implementation

- [x] 2.1 Update `src/features/KdsView/store/useKdsStore.js`:
  - Add `recallStack` (max 10 completed tickets) and `restoreTicket(id)` action
  - Add 10s ticker `updateElapsedTimes()`
  - Add `toggleItemPrepared(ticketId, itemId)` and `completeTicket(ticketId)` actions
  - Add `toggleStock86(productId)` action and bus event publication
  - Add `fireCourse(orderId, courseType)` handler reacting to `course.fire`
- [x] 2.2 Update `src/features/KdsView/services/kdsService.js` to connect to mock data and store actions.

## Phase 3: Components & UI Implementation

- [x] 3.1 Create `src/features/KdsView/components/RecallModal.jsx` (Modal showing last 10 completed tickets with "Restaurar" button).
- [x] 3.2 Create `src/features/KdsView/components/Lista86Modal.jsx` (Modal listing menu items with toggle for out-of-stock).
- [x] 3.3 Update `src/features/KdsView/components/KdsHeader.jsx` to include Recall badge button and Lista 86 launcher.
- [x] 3.4 Update `src/features/KdsView/components/TicketCard.jsx`:
  - Implement header time semaphore logic (blue `#024064`, amber `#F59E0B`, orange `#FB923C`)
  - Implement pure red `#EF4444` card border when any item has `allergyFlags`
  - Implement Course Control grouping ("Marchar Ahora" 100% opacity vs "En Espera" 50% opacity + 🔒 icon)
  - Implement item strike-through click handler and "MARCAR LISTO" button
- [x] 3.5 Update `src/features/KdsView/components/AllergyShieldAlert.jsx` to render flashing red alert banner `⚠️ ALERGIA: MANÍ`.
- [x] 3.6 Update `src/features/KdsView/pages/KdsPage.jsx` to wire store subscriptions, bus events, modals, and station filtering.

## Phase 4: GREEN Verification & Code Quality

- [x] 4.1 Run `npm run test` to verify all tests pass GREEN.
- [x] 4.2 Run `npm run build` to verify clean production compilation.
- [x] 4.3 Run `npm run lint` and `npm run format` to ensure 0 lint errors and clean formatting.
- [x] 4.4 Commit changes in reviewable logical units with Spanish conventional commits explaining the WHY.
