# Spec: payment — Proceso de Pago

## Purpose

Permitir al guest pagar su parte de la cuenta mediante diferentes métodos de pago, incluyendo propina.

## Requirements

### Requirement: Métodos de pago `[payment-methods]`

La app MUST soportar 4 métodos de pago: Efectivo, Transferencia, Tarjeta (WebView Mercado Pago), QR. Cada método muestra su icono y descripción.

#### Scenario: Selección de método

- GIVEN el usuario en PaymentScreen con saldo $27.500
- WHEN selecciona "Efectivo"
- THEN se resalta el método seleccionado
- AND se muestra el monto a pagar

#### Scenario: Propina

- GIVEN el usuario en PaymentScreen
- WHEN selecciona propina de $3.000
- THEN el total a pagar es $30.500
- AND la propina se envía en `tipAmount`

### Requirement: Envío de pago `[payment-submit]`

La app MUST enviar `POST /payments` con `{billId, amount, tipAmount, totalAmount, method, currency: "CLP"}`. El backend valida y registra.

#### Scenario: Pago exitoso

- GIVEN el usuario con método "Efectivo" seleccionado
- WHEN confirma el pago de $30.500
- THEN la app llama `POST /payments`
- AND el backend retorna `Payment {id, status: "COMPLETED"}`
- AND navega a PaymentSuccessScreen con `{amount, method}`

#### Scenario: Pago rechazado

- GIVEN el usuario confirmando un pago
- WHEN `POST /payments` retorna error
- THEN muestra "Error al procesar pago"
- AND permite reintentar con otro método

### Requirement: Pantalla de éxito `[payment-success]`

Después de un pago exitoso, la app MUST mostrar confirmación con monto y método, y botón para volver a la cuenta.

#### Scenario: Éxito mostrado

- GIVEN un pago de $30.500 en Efectivo
- WHEN se completa el pago
- THEN muestra "¡Pago exitoso!" con monto "$30.500" y método "Efectivo"
- AND botón "Volver a mi cuenta"
