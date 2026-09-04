# Proposal: modo-hora-punta — Modo Hora Punta en Radar de Local Admin

## Intent

Implement the **Modo Hora Punta (Focus Mode)** in the Local Admin Radar (`RadarPage.jsx`).
During high-demand peak service hours, the supervisor needs zero-friction decision making:
- A giant toggle button in the Radar header ("🔥 Modo Hora Punta ON/OFF").
- When active (`focusMode: true`), secondary non-essential controls (zone tabs, general navigation, non-urgent reports) are hidden or collapsed.
- Only critical bottleneck tables (🟡 `waiting_food` / amber, 🟠 `bill_requested` / orange), quick waste logging (`MermaBar`), active delivery orders (`DeliveryColumn`), and critical alerts (`ExceptionFeedDrawer`, Panic button) remain displayed.

## Scope

### In Scope
- `focusMode` state in `useRadarStore.js` with helper selectors `selectCriticalTables`, `selectActiveDelivery`.
- Header giant toggle button in `RadarPage.jsx`.
- High-contrast Focus Mode styling (`bg-brand-950` with urgent border ring, focus banner).
- Filtering in `TopologicalMap.jsx`: hides/dims non-critical tables (`free`, `occupied` without pending food/bill) when `focusMode` is `true`.
- Filtering in `DeliveryColumn.jsx`: focuses on active pending/in-prep delivery orders.
- Strict TDD test suite (`FocusMode.test.jsx` / `RadarPage.test.jsx`) covering RED → GREEN transitions.

### Out of Scope
- Changes to `src/features/ClientView/` (reserved for opencode).
- Backend persistence.

## Approach

Follow SDD workflow: proposal → spec → design → tasks → RED test → implementation → GREEN verification.

## Affected Areas

| File | Action | Description |
|------|--------|-------------|
| `src/features/RadarView/store/useRadarStore.js` | Modify | Selectors for critical tables and urgent delivery filtering |
| `src/features/RadarView/components/TopologicalMap.jsx` | Modify | Focus filtering mode for bottleneck tables (amber/orange) |
| `src/features/RadarView/components/DeliveryColumn.jsx` | Modify | Focus filtering mode for active delivery orders |
| `src/features/RadarView/pages/RadarPage.jsx` | Modify | Giant header toggle and layout focus adaptation |
| `src/features/RadarView/FocusMode.test.jsx` | New | Vitest test suite for Modo Hora Punta |

## Success Criteria

- All unit tests pass (`npm run test`).
- Production build succeeds (`npm run build`).
- ESLint passes with 0 errors (`npm run lint`).
