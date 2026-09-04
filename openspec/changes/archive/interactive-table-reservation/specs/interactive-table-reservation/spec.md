# interactive-table-reservation Specification

## Purpose

Define requirements for the Table Reservation and Virtual Waitlist queue management module in Local Admin (`RadarView`).

## Requirements

### Requirement: Reservation & Waitlist Queue Management

The Local Admin Radar MUST render a reservation and virtual waitlist panel allowing managers to:
- Create new table reservations (Customer name, time, guest count, table assignment).
- Manage virtual waitlist queue with estimated wait time (15m, 30m, 45m).
- Change status (Confirmada, En Espera, Sentado, Cancelada).

#### Scenario: Administrator creates a new reservation

- GIVEN the Local Admin opening `ReservationModal`
- WHEN adding a reservation for "Familia Pérez" (4 guests, 20:30 hrs)
- THEN the reservation appears in the active list and publishes `reservation.created` over `useRealtimeBus`

---

### Requirement: Realtime Reservation Event Broadcasting

Upon creating or updating a reservation/waitlist entry, the modal MUST emit real-time events over `useRealtimeBus`:
- `reservation.created`: Carries reservation details and table assignment.
- `waitlist.updated`: Carries waitlist count and estimated wait times.
