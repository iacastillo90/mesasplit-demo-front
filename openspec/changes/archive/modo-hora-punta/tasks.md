# Tasks: modo-hora-punta — Modo Hora Punta en Radar Local Admin

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/RadarView/FocusMode.test.jsx`:
  - Test `focusMode` toggle in store and giant button click in header.
  - Test filtering of non-critical tables in `TopologicalMap` when `focusMode` is `true`.
  - Test filtering of delivery orders in `DeliveryColumn` when `focusMode` is `true`.
  - Test that `MermaBar` and `ExceptionFeedDrawer` remain accessible.
- [x] 1.2 Run `npm run test` to verify RED test state.

## Phase 2: Implementation

- [x] 2.1 Update `src/features/RadarView/store/useRadarStore.js`:
  - Add `selectCriticalTables` and `selectActiveDelivery` pure helpers/selectors.
- [x] 2.2 Update `src/features/RadarView/components/TopologicalMap.jsx`:
  - Integrate `focusMode` filtering for critical tables (🟡 `waiting_food`, 🟠 `bill_requested` / `paying`).
- [x] 2.3 Update `src/features/RadarView/components/DeliveryColumn.jsx`:
  - Integrate `focusMode` filtering for active delivery orders.
- [x] 2.4 Update `src/features/RadarView/pages/RadarPage.jsx`:
  - Add giant Focus Mode header toggle button, focus banner, and ring container styling.

## Phase 3: GREEN Verification & Archive

- [x] 3.1 Run `npm run test` — all test suites GREEN.
- [x] 3.2 Run `npm run build` — confirm clean production build.
- [x] 3.3 Run `npm run lint` — confirm 0 ESLint errors.
- [x] 3.4 Commit changes in Spanish with conventional commit format.
