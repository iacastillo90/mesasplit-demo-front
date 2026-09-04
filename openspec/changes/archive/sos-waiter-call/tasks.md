# Tasks: sos-waiter-call — S.O.S. de Mesa y Notificación al Mozo

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/ClientView/SosModal.test.jsx` with RED tests:
  - Renders "🆘 Llamar al Mozo" heading and 3 reason buttons
  - Emits `call.waiter` event on confirm
- [x] 1.2 Run `npm run test` — confirm RED failure.

## Phase 2: Implementation

- [x] 2.1 Create `src/features/ClientView/components/SosModal.jsx`.
- [x] 2.2 Update `src/features/ClientView/pages/ClientPage.jsx` to mount SOS button + `SosModal`.
- [x] 2.3 Update `src/features/WaiterView/pages/WaiterPage.jsx` to subscribe to `call.waiter` and show alert badge.

## Phase 3: GREEN Verification

- [x] 3.1 Run `npm run test` — all suites GREEN.
- [x] 3.2 Run `npm run build` and `npm run lint`.
- [x] 3.3 Commit with Spanish conventional commit explaining the WHY.
