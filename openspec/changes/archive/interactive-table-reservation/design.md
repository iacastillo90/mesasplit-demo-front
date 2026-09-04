# Design: interactive-table-reservation — Reservas de Mesas y Lista de Espera Virtual

## Architecture Decisions

| # | Decision | Choice |
|---|----------|--------|
| D1 | Reservation State | Managed in local component state / store and broadcast via `createRealtimeBus('mesasplit')`. |
| D2 | Event Topics | `reservation.created`, `waitlist.updated`. |

## Affected Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/RadarView/components/ReservationModal.jsx` | Create | Modal for managing reservations and virtual waitlist queue |
| `src/features/RadarView/ReservationModal.test.jsx` | Create | RTL test suite verifying creation, status update, and event emission |
| `src/features/RadarView/pages/RadarPage.jsx` | Modify | Integrates `ReservationModal` and trigger button |
