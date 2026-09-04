# local-admin-radar Specification

## Purpose

Define the capability requirements for the Local Admin Radar (`RadarView`). The Radar provides shift supervisors and managers with real-time floor plan visibility, omnichannel delivery tracking, fraud exception auditing (`alert.fraud`), Hora Punta focus mode, merma logging, and emergency panic button actions.

## Requirements

### Requirement: Interactive Topological Table Map

The Radar MUST display an interactive floor plan map organized by zones (Salón, Terraza, Barra) showing table positions, seat counts, and live status semaphores:
- **Green (`#10B981`)**: Free or newly seated table.
- **Yellow (`#F59E0B`)**: Waiting for kitchen food.
- **Orange (`#FB923C`)**: Bill requested (operational urgency).
- Pure Red (`#EF4444`) MUST NOT be used for table status (reserved for health/safety alerts).
- The map MUST react in real time to `table.status_changed` events via `useRealtimeBus`.

#### Scenario: Realtime status update reflects on topological map

- GIVEN the Local Admin Radar open on the floor plan
- WHEN a `table.status_changed` event arrives for Table 1 with `status: "billing"`
- THEN Table 1 on the topological map transitions its semaphore badge to orange (`#FB923C`)
- AND the room occupancy calculation updates immediately

---

### Requirement: Omnichannel Delivery Virtual Tables

The Radar MUST display an Omnichannel Delivery section representing online delivery platforms:
- Virtual cards for **Uber Eats**, **Rappi**, and **PedidosYa**.
- Displaying active order count, customer name, platform badge, and delivery dispatch timer.

#### Scenario: Delivery column displays active online orders

- GIVEN the Radar page loaded
- WHEN viewing the Delivery section
- THEN virtual cards render for Uber Eats, Rappi, and PedidosYa
- AND each card shows platform logo/badge, customer name, order total, and dispatch status

---

### Requirement: Exception Feed Audit Drawer (`alert.fraud`)

The Radar MUST provide an Exception Feed drawer for operational compliance and fraud auditing:
- Listens to `alert.fraud` events published over `useRealtimeBus`.
- Logs PIN cancellations (e.g. items voided after kitchen dispatch), manual discounts, and cash drawer openings.
- Displays timestamp, staff member/PIN, reason, and severity badge.

#### Scenario: PIN void event appears in Exception Feed

- GIVEN an open Exception Feed drawer
- WHEN an `alert.fraud` event arrives with `type: "item_void_sent_to_kitchen"`
- THEN a new audit entry appears in the feed with red warning icon, reason, and timestamp

---

### Requirement: Focus Mode ("Hora Punta") Toggle

The Radar MUST include a **"Hora Punta"** Focus Mode toggle in the header:
- When active, the UI increases visual contrast and highlights urgent tables (orange semaphores for `bill_requested` and tickets +20m).

#### Scenario: Enabling Hora Punta highlights urgent tables

- GIVEN a supervisor on the Radar view
- WHEN the supervisor toggles "Hora Punta" ON
- THEN urgent tables (`bill_requested` and long wait times) pulse with high contrast borders
- AND the header displays a glowing "MODO HORA PUNTA" badge

---

### Requirement: Merma Command Bar

The Radar MUST provide a **Merma Command Bar** for recording food waste and inventory losses:
- Text input accepting natural descriptions (e.g. "3 kilos de tomate vencido").
- Submitting the entry adds it to the shift's waste log and updates total estimated loss value in CLP.

#### Scenario: Supervisor logs food waste in Merma Bar

- GIVEN the Merma Command Bar
- WHEN the supervisor enters `"3 kilos de tomate vencido"` and submits
- THEN the entry is appended to the Merma Log with timestamp and recorded loss

---

### Requirement: Emergency Panic Button

The Radar MUST provide an emergency **Panic Button** ("🚨 BOTÓN DE PÁNICO"):
- Requires press-and-hold or double confirmation to prevent accidental triggers.
- Triggering the panic button emits a high-priority `alert.panic` event via `useRealtimeBus` and displays a critical alert banner.

#### Scenario: Triggering Panic Button broadcasts emergency alert

- GIVEN the supervisor clicks "🚨 BOTÓN DE PÁNICO"
- WHEN confirmed
- THEN a critical banner "ALERTA DE EMERGENCIA ACTIVADA" displays
- AND an `alert.panic` event is published via `useRealtimeBus`
