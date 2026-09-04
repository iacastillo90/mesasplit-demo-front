# Spec: waiter-interactive-tables — Grid de 12 mesas interactivas del garzón

## Purpose

Rediseña la interacción del garzón con las mesas: `TableGrid` pasa de 8 mesas en grid de 2/3 columnas a 12 mesas interactivas en `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` con cards compactas, badge de comensales correcto (campo `seats`, no el inexistente `guests`), status mapping completo (incluye `billing` y `cleaning`) y click en mesa ocupada → modal de consumo con las líneas de `table.order`. Es una capability NUEVA: no modifica requirements spec-level existentes; conserva la restricción del requirement "Waiter Receives Notification Badge" de `sos-waiter-call`.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **`tables.json` aditivo**: el cambio 8 → 12 mesas solo agrega filas; no renombra campos. Se mantienen las invariantes de consumidores compartidos (Radar `seats ?? 4` y `routing.test` con ≥1 mesa `occupied`).
2. **Modal read-only**: el modal de consumo solo visualiza líneas de `table.order`; no edita comandas (out of scope del change).
3. **Regresión SOS**: `WaiterPage` conserva banner y suscripción a `call.waiter`; el rediseño del grid no altera ese flujo.

## Requirements

### Requirement: Grid de 12 mesas interactivas `[tables-grid-12]`

La vista del garzón (`WaiterPage`) MUST renderizar 12 mesas desde `src/mocks/tables.json` en un grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` con cards compactas. Cada card MUST mostrar número de mesa, badge de comensales, estado y zona cuando existan. El grid MUST NOT romper la interacción de selección existente (`onSelectTable(table.id)`).

#### Scenario: Las 12 mesas se renderizan en el grid

- GIVEN `tables.json` con 12 mesas
- WHEN `WaiterPage` renderiza el grid
- THEN se muestran 12 cards Y el grid usa `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`

#### Scenario: Invariantes de datos aditivos preservadas

- GIVEN las 12 mesas de `tables.json` con campos `seats` y `status` intactos
- WHEN se consumen desde Radar y routing
- THEN `seats ?? 4` sigue siendo válido Y existe al menos 1 mesa con `status: "occupied"`

### Requirement: Badge de comensales correcto `[guest-badge-seats]`

El badge de comensales de cada card MUST usar el campo `seats` de `tables.json` (o derivarlo de la comanda) y MUST NOT leer `table.guests` (campo inexistente que hoy renderiza badge incorrecto).

#### Scenario: Badge muestra seats correctos

- GIVEN una mesa con `seats: 4` y sin campo `guests`
- WHEN `TableGrid` renderiza la card
- THEN el badge muestra 4 comensales (no `undefined` ni valor fallback)

#### Scenario: Mesa sin campo guests no crashea

- GIVEN una mesa cuyo objeto no define `guests`
- WHEN `TableGrid` renderiza la card
- THEN no se lanza error Y el badge muestra el valor de `seats`

### Requirement: Status mapping completo `[table-status-mapping]`

El mapping de estados de `TableGrid` MUST cubrir `occupied`, `waiting_food`, `bill_requested`, `free`, `billing` y `cleaning`, cada uno con su label y estilo correcto. MUST NOT caer en el fallback incorrecto para `billing` ni `cleaning`.

#### Scenario: Billing mapeado correctamente

- GIVEN una mesa con `status: "billing"` (mesa t2 del fixture)
- WHEN `TableGrid` renderiza la card
- THEN el label y estilo corresponden a "en cobro" (no al fallback genérico)

#### Scenario: Cleaning mapeado correctamente

- GIVEN una mesa con `status: "cleaning"` (mesa t4 del fixture)
- WHEN `TableGrid` renderiza la card
- THEN el label y estilo corresponden a "en limpieza" (no al fallback genérico)

#### Scenario: Estados existentes sin regresión

- GIVEN mesas con `occupied`, `waiting_food`, `bill_requested` y `free`
- WHEN `TableGrid` renderiza las cards
- THEN cada una muestra su label correcto Y los tests existentes de `TableGrid` pasan

### Requirement: Modal de consumo en mesa ocupada `[consumption-modal]`

Al hacer click en una mesa con `order` no nula, la vista MUST abrir un modal de consumo (`TableConsumptionModal`) que MUST mostrar las líneas de `table.order` (producto, cantidad y precio) de forma read-only. El modal MUST cerrarse con acción explícita (botón cerrar u overlay).

#### Scenario: Click en mesa ocupada abre el consumo

- GIVEN una mesa `occupied` con `order` con 2+ líneas (t1 o t5 del fixture)
- WHEN el garzón hace click en la card
- THEN se abre el modal Y muestra cada línea de `order` (producto, cantidad, precio)

#### Scenario: Cierre del modal

- GIVEN el modal de consumo abierto
- WHEN el garzón presiona cerrar (botón u overlay)
- THEN el modal se cierra Y el grid sigue interactivo

### Requirement: Mesas sin comanda no abren modal `[no-order-no-modal]`

Las mesas sin `order` (nula o vacía) SHOULD NOT abrir el modal de consumo; la vista SHOULD mostrar un estado vacío ("mesa sin comanda") o no responder al click.

#### Scenario: Mesa sin order no muestra consumo

- GIVEN una mesa `free`, `cleaning` u `occupied` sin `order`
- WHEN el garzón hace click en la card
- THEN no se abre un modal con líneas Y se muestra estado vacío o no hay acción

### Requirement: Sin regresión en el badge SOS `[sos-badge-regression]`

El rediseño de `WaiterPage` MUST conservar la suscripción al evento `call.waiter` y el banner/indicador de notificación existente (requirement "Waiter Receives Notification Badge" de `sos-waiter-call`).

#### Scenario: El badge SOS sigue operativo

- GIVEN el garzón en `WaiterPage` con el grid rediseñado
- WHEN llega un evento `call.waiter` en el bus
- THEN el banner/indicador de notificación se muestra con mesa y motivo (sin regresión)

## Resumen (ADDED)

Todas las requirements anteriores son ADDED para la capability `waiter-interactive-tables`: `tables-grid-12`, `guest-badge-seats`, `table-status-mapping`, `consumption-modal`, `no-order-no-modal`, `sos-badge-regression`. No hay requirements MODIFIED ni REMOVED.
