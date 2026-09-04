# kds-kitchen Specification

## Purpose

Define the interactive requirements and behavior for the Kitchen Display System (KDS) in MesaSplit. The KDS must render in strict dark mode (`#011623`), process tickets in real time, display time semaphores, highlight declared allergies in pure red (`#EF4444`), support course control ("Marchar ahora" vs "En espera"), allow ticket completion and recall, and broadcast Lista 86 stock quiebre events across the ecosystem.

## Requirements

### Requirement: Strict Dark Mode Ergonomics

The KDS view MUST render exclusively in dark mode: background `brand-950` (`#011623`), ticket cards `brand-800` (`#024064`), high-contrast light text (`brand-50`), and NO light-mode backgrounds on any element.

#### Scenario: All surfaces are dark

- GIVEN the KDS view is mounted
- WHEN inspecting computed background colors of all containers, headers, and cards
- THEN background colors use dark brand tokens (`#011623`, `#024064`)
- AND text colors use light brand tokens (`#E6F6FF` / `#FFFFFF`)

---

### Requirement: Automatic Time Semaphores

Each ticket header MUST display an elapsed timer and automatically update its visual state based on minutes elapsed since order creation:
- **0 to 10 minutes**: Standard dark blue header (`#024064`).
- **10 to 20 minutes**: Amber warning header (`#F59E0B`).
- **> 20 minutes**: Flashing orange urgent header (`#FB923C`).

#### Scenario: Ticket transitions to amber warning at 10 minutes

- GIVEN an order created 11 minutes ago
- WHEN the ticket card renders
- THEN the header uses the amber warning background (`#F59E0B`)

#### Scenario: Ticket transitions to orange urgency at 20+ minutes

- GIVEN an order created 22 minutes ago
- WHEN the ticket card renders
- THEN the header uses the orange urgent background (`#FB923C`) with an urgent status label
- AND does NOT use pure red (`#EF4444`)

---

### Requirement: Escudo de Alergias (Pure Red Health/Safety Alert)

When an order ticket contains any item with declared allergy flags (e.g. `["Alergia Maní"]`):
1. The ticket card MUST render a **4px border in Pure Red (`#EF4444`)**.
2. An **Allergy Shield banner (`#EF4444`)** MUST flash at the top of the ticket item.
3. Pure red (`#EF4444`) MUST NOT be used for normal ticket delays or non-health alerts.

#### Scenario: Ticket with allergy renders pure red border and banner

- GIVEN an order item with `allergyFlags: ["Alergia Maní"]`
- WHEN the ticket card renders
- THEN the card border uses `#EF4444`
- AND a red alert banner displaying `⚠️ ALERGIA: MANÍ` is rendered above the item

---

### Requirement: Course Control Sections

The ticket card MUST separate items into two visual sections:
- **"Marchar Ahora" (Active)**: Full opacity, active items ready for cooking.
- **"En Espera" (On Hold)**: 50% opacity with a lock icon 🔒, waiting for the garzón to fire the next course.
- WHEN a `course.fire` event is received via `useRealtimeBus` matching the order ID and course type, the items MUST transition to full opacity with a visual flash animation.

#### Scenario: Fired course transitions from hold to active

- GIVEN a ticket with main course items in "En Espera" status
- WHEN a `course.fire` event for that order and course is received
- THEN those items move to the "Marchar Ahora" active section with 100% opacity

---

### Requirement: One-Tap Item & Ticket Completion

- Tapping an individual item MUST toggle its prepared state (strikethrough text).
- Tapping the green **"MARCAR LISTO"** button (`#10B981`) MUST mark the entire ticket as completed, remove it from the active screen, add it to the Recall history (up to 10 tickets), and broadcast a `kds.item_ready` event over `useRealtimeBus`.

#### Scenario: Completing a ticket broadcasts event and adds to recall

- GIVEN an active ticket on the KDS screen
- WHEN the user clicks "MARCAR LISTO"
- THEN the ticket is removed from the active grid
- AND a `kds.item_ready` event is published to `useRealtimeBus`
- AND the ticket becomes available in the Recall modal

---

### Requirement: Recall Modal

The KDS header MUST provide a **Recall** button displaying the count of recently completed tickets (last 10). Clicking Recall opens a modal allowing the user to restore any of the last 10 completed tickets back to the active KDS grid.

#### Scenario: Restoring a completed ticket from Recall

- GIVEN a ticket previously marked as completed
- WHEN the user opens the Recall modal and clicks "Restaurar"
- THEN the ticket disappears from the Recall list
- AND reappears on the active KDS grid

---

### Requirement: Lista 86 (Out-of-Stock) Toggle & Broadcast

The KDS header MUST provide a **"Lista 86 (Agotados)"** button opening a product availability manager:
- Clicking any menu item toggles its status between `available` and `out_of_stock`.
- Toggling a product MUST publish a `kds.stock_86` event via `useRealtimeBus` with payload `{ productId, status }`.

#### Scenario: Toggling a product to Lista 86 broadcasts stock_86 event

- GIVEN the product "Hamburguesa Doble Queso" currently available
- WHEN the user marks it as "Agotado" in the Lista 86 manager
- THEN a `kds.stock_86` event is published via `useRealtimeBus` with `status: "out_of_stock"`
- AND the product status updates in the local store
