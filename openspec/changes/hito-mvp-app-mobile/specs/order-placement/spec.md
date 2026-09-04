# Delta for order-placement (NEW)

## ADDED Requirements

### Requirement: Carrito local `[cart-local]`

La app MUST mantener un carrito en memoria con items (dish, quantity, notes, courseType).

#### Scenario: Agregar plato

- GIVEN "Ceviche" a $12.000
- WHEN agrega quantity=2
- THEN carrito tiene 1 item, lineTotal=$24.000

#### Scenario: Merge por dish.id

- GIVEN carrito con "Ceviche" x1
- WHEN agrega "Ceviche" x1
- THEN carrito tiene "Ceviche" x2

### Requirement: Envío de pedido `[order-submit]`

La app MUST enviar `POST /orders` con `{dineSessionId, channel, lines}`.

#### Scenario: Pedido exitoso

- GIVEN carrito con 2 platos
- WHEN presiona "Enviar Pedido"
- THEN llama `POST /orders`, carrito se vacía, navega a lista

#### Scenario: Error de envío

- GIVEN carrito con items
- WHEN `POST /orders` falla
- THEN muestra error, carrito NO se vacía

### Requirement: Lista de pedidos `[order-list]`

La app MUST mostrar pedidos vía `GET /sessions/{sessionId}/orders` con color coding por status.

#### Scenario: Colores por estado

- GIVEN pedido con líneas PENDING, IN_PROGRESS, SERVED
- WHEN se muestra la lista
- THEN PENDING=naranja, IN_PROGRESS=azul, SERVED=verde
