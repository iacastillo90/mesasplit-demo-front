# Delta for payment (NEW)

## ADDED Requirements

### Requirement: Métodos de pago `[payment-methods]`

La app MUST soportar 4 métodos: Efectivo, Transferencia, Tarjeta (MP WebView), QR.

#### Scenario: Selección de método

- GIVEN saldo $27.500
- WHEN selecciona "Efectivo"
- THEN se resalta y muestra monto

#### Scenario: Propina

- GIVEN propina $3.000
- WHEN se confirma
- THEN total=$30.500

### Requirement: Envío de pago `[payment-submit]`

La app MUST enviar `POST /payments` con `{billId, amount, tipAmount, totalAmount, method, currency}`.

#### Scenario: Pago exitoso

- GIVEN método "Efectivo", monto $30.500
- WHEN confirma
- THEN llama `POST /payments`, navega a success

#### Scenario: Pago rechazado

- WHEN `POST /payments` retorna error
- THEN muestra error, permite reintentar

### Requirement: Pantalla de éxito `[payment-success]`

MUST mostrar confirmación con monto y método.

#### Scenario: Éxito

- GIVEN pago $30.500 Efectivo
- WHEN se completa
- THEN muestra "¡Pago exitoso!" y botón volver
