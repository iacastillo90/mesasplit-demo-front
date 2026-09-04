# Spec: order-placement — Creación de Pedidos

## Purpose

Permitir al guest agregar platos a un carrito local, enviar el pedido al backend y ver el historial de pedidos de la sesión.

## Requirements

### Requirement: Carrito local `[cart-local]`

La app MUST mantener un carrito en memoria (StateNotifier) con items que tienen `dish`, `quantity`, `notes` y `courseType`. El carrito NO persiste entre sesiones.

#### Scenario: Agregar plato

- GIVEN el usuario en DishDetailScreen con "Ceviche" a $12.000
- WHEN presiona "Agregar" con quantity=2
- THEN el carrito tiene 1 item con quantity=2, lineTotal=$24.000

#### Scenario: Agregar plato existente

- GIVEN el carrito con "Ceviche" x1
- WHEN agrega "Ceviche" x1 más
- THEN el carrito tiene "Ceviche" x2 (merge por dish.id)

#### Scenario: Eliminar plato

- GIVEN el carrito con 3 items
- WHEN elimina el item 2
- THEN el carrito tiene 2 items y el total se recalcula

### Requirement: Envío de pedido `[order-submit]`

La app MUST enviar el pedido vía `POST /orders` con `{dineSessionId, channel: "QR", lines: [{dishId, quantity, unitPrice, itemNotes, courseType, dineGuestId}]}`. El backend calcula precios reales (zero-trust).

#### Scenario: Pedido exitoso

- GIVEN el carrito con 2 platos
- WHEN presiona "Enviar Pedido"
- THEN la app llama `POST /orders`
- AND el backend retorna `Order {id, status: "PENDING", lines: [...]}`
- AND el carrito se vacía
- AND se navega a la lista de pedidos

#### Scenario: Error de envío

- GIVEN el carrito con items
- WHEN `POST /orders` falla (network error)
- THEN muestra "Error al enviar pedido"
- AND el carrito NO se vacía
- AND permite reintentar

### Requirement: Lista de pedidos `[order-list]`

La app MUST mostrar los pedidos de la sesión vía `GET /sessions/{sessionId}/orders`. Cada línea muestra `dishName`, `quantity`, `status` con color coding.

#### Scenario: Pedido con líneas en diferentes estados

- GIVEN una sesión con 1 pedido de 3 líneas
- WHEN se carga la lista
- THEN las líneas muestran colores: PENDING=naranja, IN_PROGRESS=azul, SERVED=verde

#### Scenario: Sin pedidos

- GIVEN una sesión sin pedidos
- WHEN se carga la lista
- THEN muestra "Aún no has pedido nada"
