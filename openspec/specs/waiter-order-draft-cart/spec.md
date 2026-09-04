# Spec: waiter-order-draft-cart — Borrador de comanda con add/remove dinámico

## Purpose

Hace dinámico el borrador de comanda del garzón (`orderDraft` en `useWaiterStore`): hoy solo existe `addToDraft` (acumula cantidad por `productId` + `course`); este change agrega `increaseQty`, `decreaseQty` (remueve la línea al llegar a 0) y `removeItem`, con controles −/qty/+ por línea en `OrderPad` consistentes con `SharedCartDrawer` del cliente. Es una capability NUEVA sobre estado existente: no modifica requirements spec-level existentes.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **Consistencia con el cliente**: el patrón de qty del cliente (`SharedCartDrawer` con −/qty/+) es la referencia de interacción; no se modifica el carrito del cliente.
2. **Semántica de agregación**: las líneas siguen agregando por `productId` + `course`; el flujo de anulación por PIN existente se conserva sin cambios.
3. **strict_tdd**: las acciones nuevas arrancan RED con tests de store puros (`npm run test`).

## Requirements

### Requirement: Add/remove dinámico en el borrador `[dynamic-add-remove]`

`useWaiterStore` MUST exponer `increaseQty`, `decreaseQty` y `removeItem` sobre `orderDraft` (además del `addToDraft` existente). `increaseQty(productId, course)` MUST incrementar en 1 la línea existente (o crearla si no existe). `decreaseQty(productId, course)` MUST decrementar en 1 y MUST remover la línea si la cantidad llega a 0. `removeItem(productId, course)` MUST eliminar la línea completa.

#### Scenario: Incremento acumula en línea existente

- GIVEN `orderDraft` con la línea {productId: 'm1', course: 'entrada', qty: 1}
- WHEN se invoca `increaseQty('m1', 'entrada')`
- THEN la línea queda con qty 2 Y no se crea una segunda línea

#### Scenario: Decremento a 0 remueve la línea

- GIVEN la línea {productId: 'm1', course: 'entrada', qty: 1}
- WHEN se invoca `decreaseQty('m1', 'entrada')`
- THEN la línea se elimina de `orderDraft`

#### Scenario: removeItem elimina la línea completa

- GIVEN la línea {productId: 'm2', course: 'principal', qty: 3}
- WHEN se invoca `removeItem('m2', 'principal')`
- THEN `orderDraft` ya no contiene esa línea

### Requirement: Controles de qty en OrderPad `[qty-controls]`

`OrderPad` MUST renderizar por cada línea del borrador controles −/qty/+ y un botón de quitar línea. `+` MUST invocar `increaseQty`, `−` MUST invocar `decreaseQty` y el botón de quitar MUST invocar `removeItem`. Los controles MUST seguir el patrón visual del carrito del cliente (`SharedCartDrawer`).

#### Scenario: Más incrementa la cantidad visible

- GIVEN una línea con qty 1 en `OrderPad`
- WHEN el garzón presiona `+`
- THEN la cantidad visible es 2 Y `orderDraft` refleja el cambio

#### Scenario: Menos decrementa y remueve en 0

- GIVEN una línea con qty 1 en `OrderPad`
- WHEN el garzón presiona `−`
- THEN la línea desaparece del listado Y `orderDraft` no la contiene

#### Scenario: Botón quitar elimina la línea

- GIVEN una línea con qty 3 en `OrderPad`
- WHEN el garzón presiona el botón de quitar (✕)
- THEN la línea desaparece sin importar su cantidad

### Requirement: Semántica de agregación productId + course `[aggregation-semantics]`

Las acciones de qty MUST mantener la agregación por `productId` + `course`: el mismo producto en distintos `course` MUST tratarse como líneas separadas; el mismo `productId` + `course` MUST ser una única línea.

#### Scenario: Mismo producto en courses distintos son líneas separadas

- GIVEN `addToDraft('m1', 'entrada')` y `addToDraft('m1', 'postre')` previos
- WHEN se inspecciona `orderDraft`
- THEN existen 2 líneas con `productId` 'm1' y courses 'entrada' y 'postre'

#### Scenario: Mismo producto y course agrega a la misma línea

- GIVEN la línea {productId: 'm1', course: 'entrada', qty: 1}
- WHEN se invoca `increaseQty('m1', 'entrada')`
- THEN la línea es única con qty 2

### Requirement: Consistencia con el carrito del cliente `[client-cart-consistency]`

La interacción de qty SHOULD ser consistente con `SharedCartDrawer` del cliente (mismos controles −/qty/+ y mismo comportamiento de remoción en 0), de modo que el garzón encuentre la misma UX del cliente.

#### Scenario: Comportamiento equivalente al cliente

- GIVEN el mismo borrador en `OrderPad` y el mismo carrito en el cliente
- WHEN se ejecutan las mismas acciones (+/−) en ambos
- THEN las cantidades resultantes coinciden (misma semántica de remoción en 0)
