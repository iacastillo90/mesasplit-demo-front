# Proposal: interactive-table-reservation — Reservas de Mesas y Lista de Espera Virtual

## Intent

Implement an interactive Table Reservation and Virtual Waitlist management module in Local Admin (`RadarView`), complete with reservation status tracking, wait time calculator, notification simulator, and real-time event broadcasting over `useRealtimeBus`.

## Scope

### In Scope
- **Reservation & Waitlist Drawer/Modal (`ReservationModal.jsx`)**: Manage active table reservations (Customer name, time, guest count, status: Confirmed, Waiting, Seated) and virtual waitlist queue with estimated wait times.
- **Realtime Event Emission**: Emits `reservation.created` and `waitlist.updated` over `useRealtimeBus`.
- **RadarView Integration**: Adds a "Reservas y Lista de Espera" action button in `RadarPage.jsx`.
- **Strict TDD & Tests**: Written RED-GREEN in `src/features/RadarView/ReservationModal.test.jsx`.

### Out of Scope
- Twilio / External SMS gateway integration (simulated locally).

## Capabilities

### New Capabilities
- `interactive-table-reservation`: Interactive table reservations and virtual waitlist queue in Local Admin.

## Approach

Implemented under `strict_tdd: true`. Writes RED tests first in `src/features/RadarView/ReservationModal.test.jsx`, creates components in `src/features/RadarView/`, and updates `RadarPage.jsx`. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/RadarView/components/ReservationModal.jsx` | New | Reservation manager and virtual waitlist queue modal |
| `src/features/RadarView/ReservationModal.test.jsx` | New | RTL test suite verifying reservation creation, waitlist queue, and event publication |
| `src/features/RadarView/pages/RadarPage.jsx` | Modified | Adds button and integrates `ReservationModal` |

## Success Criteria

- [ ] All tests in `ReservationModal.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
