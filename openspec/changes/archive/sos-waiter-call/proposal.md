# Proposal: sos-waiter-call — S.O.S. de Mesa: Llamada Urgente al Mozo desde la Mesa Virtual

## Intent

Implement the **S.O.S. de Mesa** feature in the Client (Mesa Virtual) view. Allows a customer to send an immediate call to the waiter from their table with a reason selector (Limpieza, Falta Cubierto, Ayuda General) and emits the `call.waiter` real-time event defined in `openspec/docs/api-contracts/websocket-payloads.md`.

The Waiter (`/garzon`) view will receive and display a `call.waiter` notification badge so the demo shows the full cross-view real-time loop.

## Scope

### In Scope
- **SOS Button** in `ClientPage.jsx`: a dedicated, visually prominent S.O.S. button (red pulse animation, Fase 1 MVP requirement).
- **SosModal.jsx**: Bottom-sheet modal with reason picker (3 options), customer name field, and send button.
- **`call.waiter` event emission** via `useRealtimeBus`.
- **WaiterPage waiter alert badge**: When a `call.waiter` event is received, show a badge/notification indicator in `WaiterPage.jsx` (the waiter is alerted).
- **Strict TDD** test suite covering: modal rendering, event publish, waiter badge reception.

### Out of Scope
- Push notifications via Service Worker (out of scope for demo).
- Persisting call history in backend.

## Approach

SDD cycle. Tests RED → implementation → GREEN. All code commented in Spanish per AGENTS.md.

## Affected Areas

| File | Action | Description |
|------|--------|-------------|
| `src/features/ClientView/components/SosModal.jsx` | New | Bottom-sheet SOS modal with reason selector and `call.waiter` emission |
| `src/features/ClientView/SosModal.test.jsx` | New | RTL test suite: renders, emits event, reason selector |
| `src/features/ClientView/pages/ClientPage.jsx` | Modify | Adds SOS button and mounts `SosModal` |
| `src/features/WaiterView/WaiterPage.test.jsx` | Modify | Adds test: badge appears when `call.waiter` event is received |

## Success Criteria

- All tests pass in GREEN (`npm run test`).
- `npm run build` exits 0.
- `npm run lint` reports 0 errors.
