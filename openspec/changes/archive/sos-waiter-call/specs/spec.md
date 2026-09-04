# Spec: sos-waiter-call — S.O.S. de Mesa

## Purpose

Define requirements for the S.O.S. feature in the Mesa Virtual Client view. Specs are authoritative per `openspec/config.yaml`.

---

## Requirement: S.O.S. Button in Mesa Virtual

The Mesa Virtual MUST render a visually prominent S.O.S. button that:
- Is always visible (not hidden behind the cart drawer).
- Uses a pulsing red `#EF4444` animation (reserved for emergencies per design token rules).
- Opens `SosModal` when tapped.

---

## Requirement: SOS Modal with Reason Selector

`SosModal` MUST:
- Display a heading "🆘 Llamar al Mozo".
- Present 3 selectable reason options: "Limpiar mesa", "Falta cubierto", "Ayuda general" (per `call.waiter` payload spec).
- Allow customer to type their name (optional, defaults to "Cliente").
- Emit `call.waiter` event via `useRealtimeBus` with payload: `{ tableId, reason, customerName, timestamp }`.

### Scenario: Customer sends S.O.S. call

- GIVEN a customer on the Mesa Virtual
- WHEN tapping the S.O.S. button and selecting "Falta cubierto", then pressing "Llamar"
- THEN the `call.waiter` event is emitted on the real-time bus with `reason: "Falta cubierto"`.

---

## Requirement: Waiter Receives Notification Badge

The Mozo view (`WaiterPage`) MUST:
- Subscribe to the `call.waiter` event on mount.
- Display a badge/notification indicator showing the table and reason when a call is received.
