# Tasks: interactive-table-reservation — Reservas de Mesas y Lista de Espera Virtual

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/RadarView/ReservationModal.test.jsx` with RED tests for:
  - Rendering reservation list and waitlist queue
  - Adding a new reservation (Familia Pérez, 4 guests, 20:30 hrs)
  - Publishing `reservation.created` event on submission
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Implementation

- [x] 2.1 Create `src/features/RadarView/components/ReservationModal.jsx`.
- [x] 2.2 Update `src/features/RadarView/pages/RadarPage.jsx` to mount `ReservationModal`.

## Phase 3: GREEN Verification

- [x] 3.1 Run `npm run test` to verify GREEN state.
- [x] 3.2 Run `npm run build` and `npm run lint`.
- [x] 3.3 Commit changes with Spanish conventional commit explaining the WHY.
