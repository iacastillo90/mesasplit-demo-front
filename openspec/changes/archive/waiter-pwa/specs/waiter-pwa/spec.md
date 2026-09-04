# waiter-pwa Specification

## Purpose

Define the capability requirements for the Waiter PWA (`WaiterView`). The PWA operates in dark mode (`#011623`), enabling waiters to start shifts (clock-in for Ley 40 Horas compliance), manage assigned tables, enter orders using single-hand touch interactions with counter badges, enforce the pure red (`#EF4444`) Escudo de Alergias, fire course control events (`course.fire`), require PIN authorization for voiding kitchen-sent items, and release tables (`table.status_changed`).

## Requirements

### Requirement: Shift Clock-In / Ley 40 Horas Compliance

The Waiter PWA MUST require an initial PIN/employee clock-in screen ("Iniciar Turno") before accessing table management.
- Clicking "Iniciar Turno" with a valid PIN MUST transition the waiter to active shift status and publish a `shift.clock_in` event over `useRealtimeBus`.

#### Scenario: Waiter clocks in with valid PIN

- GIVEN a waiter on the shift lock screen
- WHEN the waiter enters PIN `"1234"` and clicks "Iniciar Turno"
- THEN the shift status transitions to `clocked_in`
- AND the assigned table grid renders
- AND a `shift.clock_in` event is published via `useRealtimeBus`

---

### Requirement: "Mis Mesas" Table Grid & Status Semaphores

The PWA MUST display a grid of tables assigned to the logged-in waiter with status semaphores:
- **Green (`#10B981`)**: Newly seated / free table.
- **Yellow (`#F59E0B`)**: Table waiting for food.
- **Orange (`#FB923C`)**: Account/bill requested (operational urgency).
- **Pure Red (`#EF4444`)**: NOT used for table status (reserved for health/safety allergies).

#### Scenario: Table grid displays assigned tables with semaphores

- GIVEN the waiter is clocked in
- WHEN the table grid renders
- THEN each table displays its number, guest count, and colored status badge
- AND table waiting for food shows a yellow badge (`#F59E0B`)
- AND table with bill requested shows an orange badge (`#FB923C`)

---

### Requirement: Single-Hand Order Entry & Tap-to-Add

When a table is selected, the PWA MUST present a single-hand catalog interface:
- Sticky category bar at the top for quick switching.
- Tapping a menu item card adds it to the current order draft and displays a circular counter badge (`1x`, `2x`, `3x`).
- Re-tapping increments the counter without opening popups.

#### Scenario: Tapping menu item increments counter badge

- GIVEN an active order draft for Table 1
- WHEN the waiter taps "Hamburguesa Clásica" twice
- THEN the item card displays a circular counter badge showing `2x`
- AND the order total updates in real time

---

### Requirement: Escudo de Alergias (Pure Red Item Border & Flag)

When an item in the order has an allergy selection (e.g. `[Alergia Maní]`):
1. The item card and order line MUST render a **border in Pure Red (`#EF4444`)**.
2. An allergy tag `⚠️ ALERGIA: MANÍ` MUST be attached to the item line.
3. Pure red (`#EF4444`) MUST NOT be used for ordinary items or non-health alerts.

#### Scenario: Item with allergy displays pure red border and tag

- GIVEN an order item with allergy selection `["Alergia Maní"]`
- WHEN the item line is added to the order pad
- THEN the item line renders a pure red border (`#EF4444`)
- AND displays the tag `⚠️ ALERGIA: MANÍ`

---

### Requirement: Course Control Selector & Realtime Firing

The order pad MUST provide a Course Control selector:
- **`[Entrada – Enviar Ahora]`**: Marks item as immediate cooking (active).
- **`[Fondo – Marchar]`**: Marks main course items on hold (`onHold: true`). Clicking "Marchar Fondo" publishes a `course.fire` event via `useRealtimeBus`.

#### Scenario: Clicking Marchar Fondo fires course event

- GIVEN an active order with main course items on hold
- WHEN the waiter clicks "Marchar Fondo"
- THEN a `course.fire` event is published via `useRealtimeBus` with `courseType: "FONDO"`
- AND the main course items transition to active status

---

### Requirement: PIN-Authorized Item Voiding

- Items not yet sent to kitchen MUST allow instant swipe-to-delete / click-delete without PIN.
- Items ALREADY sent to kitchen MUST require Local Admin PIN authorization and a mandatory reason selection ("Cortesía", "Cliente insatisfecho", "Error de carga").
- Successful PIN authorization MUST publish an `alert.fraud` event via `useRealtimeBus`.

#### Scenario: Voiding kitchen-sent item requires admin PIN

- GIVEN an item already dispatched to kitchen
- WHEN the waiter attempts to delete the item
- THEN a PIN Authorization modal appears
- WHEN the admin PIN `"9921"` and reason `"Cortesía"` are provided
- THEN the item is deleted from the order
- AND an `alert.fraud` event is published via `useRealtimeBus`

---

### Requirement: Table Release & Status Update

The PWA MUST provide a **"Cerrar y Liberar Mesa"** button when a table account is settled:
- Clicking "Liberar Mesa" resets table status to free (`status: "free"`), clears the active order draft, and publishes a `table.status_changed` event via `useRealtimeBus`.

#### Scenario: Releasing table updates status to free

- GIVEN a table with settled bill
- WHEN the waiter clicks "Cerrar y Liberar Mesa"
- THEN the table status updates to `free`
- AND a `table.status_changed` event is published with `status: "free"`
