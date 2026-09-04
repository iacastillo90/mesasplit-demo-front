# Spec: bill-view — Visualización de Cuenta y Split

## Purpose

Mostrar la cuenta de la sesión con detalle de ítems, service charge, propina, total y resumen por comensal (split).

## Requirements

### Requirement: Cuenta de la sesión `[session-bill]`

La app MUST cargar la cuenta vía `GET /sessions/{sessionId}/bill` y mostrar subtotal, service charge, propina, total y balance due.

#### Scenario: Cuenta OPEN

- GIVEN el usuario en BillScreen
- WHEN la cuenta tiene status "OPEN"
- THEN muestra subtotal, service charge, propina, total y "Saldo pendiente: $XX.XXX"

#### Scenario: Sin cuenta abierta

- GIVEN una sesión sin cuenta
- WHEN se carga BillScreen
- THEN muestra "Esperando que el mesero abra la cuenta"

### Requirement: Resumen por comensal `[split-summary]`

La app MUST cargar `GET /bills/{billId}/summary-by-guest` cuando la cuenta está OPEN. Muestra cada comensal con su total, pagado y saldo.

#### Scenario: Split con 2 comensales

- GIVEN una cuenta de $55.000 con 2 comensales
- WHEN se carga el resumen
- THEN muestra "Juan: $27.500 (Pendiente)" y "María: $27.500 (Pendiente)"

#### Scenario: Un comensal ya pagó

- GIVEN un comensal con `guestPaid: $27.500`
- WHEN se muestra el resumen
- THEN su saldo es $0 y muestra "Pagado ✓"

### Requirement: Navegación a pago `[navigate-to-pay]`

Desde BillScreen, el usuario MUST poder navegar a PaymentScreen con `billId` y `totalAmount`.

#### Scenario: Botón "Pagar"

- GIVEN el usuario en BillScreen con saldo pendiente
- WHEN presiona "Pagar mi parte"
- THEN navega a `/payment` con `{billId, totalAmount, guestId}`
