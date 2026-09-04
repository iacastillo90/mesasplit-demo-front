# Design: local-admin-radar — Local Admin / Radar de Turno

## Technical Approach

Implement the interactive Local Admin Radar in `src/features/RadarView/` under `strict_tdd: true`. The implementation updates `RadarPage.jsx`, `radarService.js`, `useRadarStore.js`, and `RadarPage.test.jsx`, and creates `TopologicalMap.jsx`, `DeliveryColumn.jsx`, `ExceptionFeedDrawer.jsx`, and `MermaBar.jsx`.

The Radar provides real-time salon monitoring, omnichannel delivery cards, exception feed auditing (`alert.fraud`), "Hora Punta" focus mode, waste tracking, and panic button emergency broadcast.

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Floor Plan Zone Layout | A: Single flat grid. B: Tabbed/zoned map (Salón, Terraza, Barra) with seat coordinates. | **B**: Zoned topological floor plan with `x`, `y` percentage coordinates for realistic rendering. |
| D2 | Exception Feed Realtime Listener | A: Polling backend. B: Subscribe to `useRealtimeBus` topics (`alert.fraud`, `table.status_changed`, `kds.stock_86`). | **B**: Store-level subscription to bus topics using `createRealtimeBus('mesasplit')`. |
| D3 | Focus Mode (Hora Punta) | A: CSS class on root container `data-focus-mode="true"`. B: In-component inline state. | **A**: Store state `focusMode` toggling `data-focus-mode` and high-contrast CSS utilities. |
| D4 | Merma Log Persistence | A: In-memory array in `useRadarStore.js`. B: Backend DB table. | **A**: In-memory `mermaLogs` array in `useRadarStore.js` with timestamp and CLP estimate. |

## Data Flow

```
[Realtime Bus / User]
     │
     ├── table.status_changed ──► useRadarStore.onTableStatusChanged() ──► Update map semaphore
     │
     ├── alert.fraud ──────────► useRadarStore.onFraudAlert() ──────────► Append to Exception Feed
     │
     ├── Toggle Focus Mode ────► useRadarStore.toggleFocusMode() ──────► Apply high contrast style
     │
     ├── Submit Waste ─────────► useRadarStore.addMerma(text) ─────────► Append to Merma Log
     │
     └── Click Panic Button ──► useRadarStore.triggerPanic() ─────────► publishBusEvent('alert.panic')
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/RadarView/pages/RadarPage.jsx` | Modify | Radar dashboard layout, header controls, exception drawer trigger |
| `src/features/RadarView/components/TopologicalMap.jsx` | Create | Interactive floor plan map by zones (Salón, Terraza, Barra) |
| `src/features/RadarView/components/DeliveryColumn.jsx` | Create | Omnichannel delivery virtual tables (Uber Eats, Rappi, PedidosYa) |
| `src/features/RadarView/components/ExceptionFeedDrawer.jsx` | Create | Audit drawer for `alert.fraud`, PIN voids, and overrides |
| `src/features/RadarView/components/MermaBar.jsx` | Create | Command bar for food waste entry |
| `src/features/RadarView/services/radarService.js` | Modify | Service connecting to mock tables, delivery orders, and audit logs |
| `src/features/RadarView/store/useRadarStore.js` | Modify | Zustand slice: tables, deliveryOrders, exceptionFeed, focusMode, mermaLogs, panicAlert |
| `src/features/RadarView/RadarPage.test.jsx` | Modify | RTL test suite verifying topological map, delivery cards, exception feed, focus mode, and panic button |

## Testing Strategy

All tests written RED first in `src/features/RadarView/RadarPage.test.jsx`:
1. **Topological Map**: Verify tables render by zone (Salón, Terraza, Barra) with seat counts and status semaphores.
2. **Omnichannel Delivery**: Verify delivery section renders cards for Uber Eats, Rappi, and PedidosYa.
3. **Exception Feed**: Verify opening drawer displays audit feed with `alert.fraud` entries.
4. **Hora Punta Focus Mode**: Toggle "Hora Punta", verify `MODO HORA PUNTA` badge renders and high contrast styling applies.
5. **Merma Bar**: Submit `"3 kilos de tomate vencido"`, verify item appears in Merma Log.
6. **Panic Button**: Click "🚨 BOTÓN DE PÁNICO", verify critical emergency banner renders and `alert.panic` event is published.

## Threat Matrix

N/A — Client-side SPA feature with mock realtime bus and fixtures.

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/local-admin-radar`.
