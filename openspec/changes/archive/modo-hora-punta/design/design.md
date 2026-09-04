# Design: modo-hora-punta — Architectural & Component Design

## Architecture

The **Modo Hora Punta (Focus Mode)** leverages the existing Zustand store `useRadarStore.js` and component hierarchy in `src/features/RadarView/`.

```
RadarPage.jsx (Container)
  ├── Header Toggle ("🔥 Modo Hora Punta")
  ├── TopologicalMap (filtered by focusMode: critical tables only)
  ├── DeliveryColumn (filtered by focusMode: active urgent orders)
  ├── MermaBar (quick waste command bar)
  └── ExceptionFeedDrawer (fraud & emergency alerts drawer)
```

## State & Selectors (`useRadarStore.js`)

State property:
- `focusMode: boolean` (default `false`)

Selectors / Pure Helpers:
- `selectCriticalTables(tables)`: returns tables where `status === 'waiting_food'` || `status === 'bill_requested'` || `status === 'paying'`.
- `selectActiveDelivery(orders)`: returns orders where `status === 'pending'` || `status === 'in_prep'`.

## Component Responsibilities

1. **`RadarPage.jsx`**:
   - Giant header button with pulse animation when active.
   - Applies high-contrast Focus Mode container styles (`ring-4 ring-semantic-urgent`).
   - Hides non-essential zone tabs when `focusMode` is active.

2. **`TopologicalMap.jsx`**:
   - Accepts `focusMode` prop (or derives from store).
   - In Focus Mode, renders an emergency banner ("🔥 2 Mesas Atrasadas / Cuenta Pendiente") and hides non-critical tables (`free`, `occupied`).

3. **`DeliveryColumn.jsx`**:
   - Accepts `focusMode` prop.
   - Filters delivery orders to active pending dispatch items.

4. **`MermaBar.jsx`**:
   - Stays sticky at bottom for instant waste entry.
