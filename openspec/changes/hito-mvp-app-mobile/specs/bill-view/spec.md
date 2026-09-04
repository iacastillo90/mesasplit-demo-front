# Delta for bill-view (NEW)

## ADDED Requirements

### Requirement: Cuenta de la sesión `[session-bill]`

La app MUST cargar `GET /sessions/{sessionId}/bill` y mostrar subtotal, service charge, propina, total y balance.

#### Scenario: Cuenta OPEN

- GIVEN usuario en BillScreen
- WHEN cuenta status="OPEN"
- THEN muestra desglose completo

#### Scenario: Sin cuenta

- GIVEN sesión sin cuenta
- WHEN carga BillScreen
- THEN muestra "Esperando que el mesero abra la cuenta"

### Requirement: Resumen por comensal `[split-summary]`

La app MUST cargar `GET /bills/{billId}/summary-by-guest` cuando OPEN.

#### Scenario: Split con 2 comensales

- GIVEN cuenta $55.000, 2 comensales
- WHEN carga resumen
- THEN muestra "Juan: $27.500 (Pendiente)", "María: $27.500 (Pendiente)"

### Requirement: Navegación a pago `[navigate-to-pay]`

Desde BillScreen, MUST poder navegar a PaymentScreen.

#### Scenario: Botón "Pagar"

- GIVEN saldo pendiente
- WHEN presiona "Pagar mi parte"
- THEN navega a `/payment` con billId y totalAmount
