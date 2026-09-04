# Spec: modo-hora-punta — Modo Hora Punta en Local Admin Radar

## Purpose

Define authoritative specification for the **Modo Hora Punta (Focus Mode)** feature in the Local Admin Radar view.

---

## Requirement: Giant Header Toggle Button

The Radar header MUST feature a prominent giant toggle button "🔥 Modo Hora Punta ON/OFF":
- When pressed, it MUST toggle the `focusMode` boolean state in `useRadarStore`.
- When `focusMode` is `true`, the header MUST render a high-visibility animated `MODO HORA PUNTA` badge.
- The overall container MUST apply a high-contrast Focus theme with a prominent urgent border indicator (`ring-4 ring-semantic-urgent`).

---

## Requirement: Critical Table Filtering in Topological Map

When `focusMode` is `true`:
- `TopologicalMap` MUST show/highlight ONLY tables in critical bottleneck states:
  - 🟡 Waiting food (`status === 'waiting_food'`)
  - 🟠 Bill requested / paying (`status === 'bill_requested'` or `status === 'paying'`)
- Tables in non-critical states (`free`, `occupied` without food/bill pending) MUST be hidden or dimmed out of focus.
- A summary text MUST display the count of critical bottleneck tables requiring intervention (e.g. `2 mesas requieren atención urgente`).

### Scenario: Supervisor activates Modo Hora Punta

- GIVEN the Local Admin Radar with 6 total tables (2 free, 2 occupied eating normally, 1 waiting food 🟡, 1 bill requested 🟠)
- WHEN the supervisor toggles "🔥 Modo Hora Punta" to ON
- THEN the map displays only the 2 bottleneck tables (waiting food 🟡 and bill requested 🟠) and dims/hides normal tables.

---

## Requirement: Focus Delivery Column

When `focusMode` is `true`:
- `DeliveryColumn` MUST filter out completed or canceled orders and highlight active pending orders.
- An urgent counter banner MUST state the number of active delivery orders awaiting dispatch.

---

## Requirement: Quick Merma and Emergency Alerts Persistence

During `focusMode`:
- `MermaBar` MUST remain visible and fully functional for immediate waste logging without page navigation.
- `ExceptionFeedDrawer` (Audit & Fraud alerts) and Panic Button MUST remain accessible.
- Non-essential elements (detailed analytics, configuration panels, zone tab switches) MUST be hidden to reduce cognitive load.
