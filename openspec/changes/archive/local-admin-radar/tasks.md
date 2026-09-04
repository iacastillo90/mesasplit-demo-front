# Tasks: local-admin-radar — Local Admin / Radar de Turno

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Update `src/features/RadarView/RadarPage.test.jsx` with RED tests for:
  - Topological table map rendering by zones (Salón, Terraza, Barra) with semaphores
  - Omnichannel delivery virtual tables (Uber Eats, Rappi, PedidosYa)
  - Exception Feed drawer for `alert.fraud` audit logs
  - Hora Punta Focus Mode toggle and `MODO HORA PUNTA` badge
  - Merma command bar waste logging ("3 kilos de tomate vencido")
  - Panic button emergency alert broadcast
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Store & Services Implementation

- [x] 2.1 Update `src/features/RadarView/store/useRadarStore.js`:
  - Add `tables` list and `activeZone` filter ('todos', 'Salón', 'Terraza', 'Barra')
  - Add `deliveryOrders` array (Uber Eats, Rappi, PedidosYa)
  - Add `exceptionFeed` array listening to `alert.fraud` and `table.status_changed`
  - Add `focusMode` boolean and `toggleFocusMode()` action
  - Add `mermaLogs` array and `addMerma(text)` action
  - Add `panicActive` boolean and `triggerPanic()` action emitting `alert.panic`
- [x] 2.2 Update `src/features/RadarView/services/radarService.js` to connect to mock tables and delivery fixtures.

## Phase 3: Components & UI Implementation

- [x] 3.1 Create `src/features/RadarView/components/TopologicalMap.jsx` (Interactive floor plan with zone filtering and status semaphores).
- [x] 3.2 Create `src/features/RadarView/components/DeliveryColumn.jsx` (Cards for Uber Eats, Rappi, PedidosYa).
- [x] 3.3 Create `src/features/RadarView/components/ExceptionFeedDrawer.jsx` (Audit feed for PIN voids and fraud alerts).
- [x] 3.4 Create `src/features/RadarView/components/MermaBar.jsx` (Command bar for waste reporting).
- [x] 3.5 Update `src/features/RadarView/pages/RadarPage.jsx` with Focus Mode toggle, panic button, exception feed trigger, and layout.

## Phase 4: GREEN Verification & Code Quality

- [x] 4.1 Run `npm run test` to verify all tests pass GREEN.
- [x] 4.2 Run `npm run build` to verify clean production compilation.
- [x] 4.3 Run `npm run lint` and `npm run format` to ensure 0 lint errors and clean formatting.
- [x] 4.4 Commit changes in reviewable logical units with Spanish conventional commits explaining the WHY.
