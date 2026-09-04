# Proposal: local-admin-radar — Local Admin / Radar de Turno

## Intent

Implement the interactive Local Admin Radar (`RadarView`) for restaurant managers and shift supervisors. The Radar provides real-time oversight of the dining room floor through an interactive topological table map, omnichannel delivery virtual tables (Uber Eats, Rappi, PedidosYa), a live Exception Feed auditing PIN voids and discounts (`alert.fraud`), a "Hora Punta" Focus Mode toggle, inventory waste ("Merma") entry, and a Panic Button emergency alert system.

## Scope

### In Scope
- **Topological Table Map**: Interactive floor plan displaying tables by zone (Salón, Terraza, Barra) with live status semaphores, seat counts, and realtime updates via `table.status_changed`.
- **Omnichannel Delivery Column**: Virtual table cards for online delivery platforms (Uber Eats, Rappi, PedidosYa) showing pending delivery orders.
- **Exception Feed Drawer**: Live audit drawer listening to `alert.fraud` and tracking PIN cancellations, manual discounts, and cash drawer openings.
- **Focus Mode ("Hora Punta")**: Toggle adjusting visual contrast and highlighting tables requiring urgent attention (e.g. `bill_requested`).
- **Merma Command Bar**: Quick input field for reporting food waste (e.g. "3 kilos de tomate vencido") and recording inventory losses.
- **Panic Button**: Emergency action button triggering high-priority security notifications.
- **Strict TDD & Tests**: Unit & RTL tests written RED-GREEN under `strict_tdd: true` in `src/features/RadarView/RadarPage.test.jsx`.

### Out of Scope
- Direct thermal receipt printer hardware drivers (browser print API / simulation used).

## Capabilities

### New Capabilities
- `local-admin-radar`: Realtime Local Admin overview with interactive topological map, omnichannel delivery tracking, fraud exception auditing feed, Hora Punta focus mode, merma logging, and panic button.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Work executed in `src/features/RadarView/`. Writes RED tests first in `src/features/RadarView/RadarPage.test.jsx`, then updates components in `src/features/RadarView/` to pass tests GREEN. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/RadarView/pages/RadarPage.jsx` | Modified | Main Radar dashboard page layout, state orchestration, exception feed, and header controls |
| `src/features/RadarView/components/TopologicalMap.jsx` | New/Modify | Interactive salon floor plan map with zone filters and status semaphores |
| `src/features/RadarView/components/DeliveryColumn.jsx` | New | Omnichannel delivery virtual tables card list (Uber Eats, Rappi, PedidosYa) |
| `src/features/RadarView/components/ExceptionFeedDrawer.jsx` | New | Drawer component auditing `alert.fraud` events, PIN voids, and manual overrides |
| `src/features/RadarView/components/MermaBar.jsx` | New | Command bar input for inventory waste recording |
| `src/features/RadarView/services/radarService.js` | Modified | Data service fetching tables, delivery orders, and audit logs |
| `src/features/RadarView/store/useRadarStore.js` | Modified | Zustand slice for radar state, active zone, focus mode, exception log, and merma entries |
| `src/features/RadarView/RadarPage.test.jsx` | Modified | RTL test suite verifying map render, delivery column, exception feed, focus mode, and panic button |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlap with `account-split` (opencode) | Low | Antigravity strictly isolated to `src/features/RadarView/`; opencode works on Client bill splitting |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/local-admin-radar`.

## Success Criteria

- [ ] All tests in `src/features/RadarView/RadarPage.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
- [ ] Local Admin Radar renders interactive topological map, delivery column, exception feed drawer, Hora Punta toggle, merma command bar, and panic button.
