# Spec: floor-map-table-intent — Plano de piso e intención efímera de mesa

## Purpose

Da al cliente un plano de piso de la sucursal (posición x/y, zona, capacidad y estado de mesa) reusando el layout de `src/mocks/tables.json`. Elegir una mesa libre es una INTENCIÓN EFÍMERA ("por ocupar"): expira por timeout y NO abre sesión ni crea recursos. La asociación real persona↔mesa ocurre SOLO al escanear el `qr_token` de la mesa, que abre una DINE_SESSION.

## Requirements

### Requirement: Plano fiel al layout [CLI-MAP-001]

El plano cliente MUST renderizar las mesas de la sucursal con posición (x/y), zona, capacidad y estado, alineado al contrato DINE_TABLE (status: available, occupied, reserved, cleaning).

#### Scenario: Mesas renderizadas con su estado

- GIVEN tables.json con mesas en zonas y posiciones distintas
- WHEN se abre el plano de la sucursal
- THEN cada mesa se dibuja en su posición/zona con su estado visible

### Requirement: Elección = intención efímera [CLI-MAP-002]

Elegir una mesa disponible MUST marcarla como "por ocupar" (intención). MUST NOT crear DINE_SESSION, ORDER ni ningún recurso persistente en ese momento.

#### Scenario: Elegir no abre sesión

- GIVEN una mesa disponible
- WHEN el cliente la elige
- THEN la mesa pasa a "elegida/por ocupar"
- AND no se crea ninguna DINE_SESSION (assert de ausencia)

### Requirement: Expiración de la intención [CLI-MAP-003]

La intención MUST expirar por timeout (duración configurable, default 2 minutos) y revertir la mesa a available; también MUST revertir al salir de la vista o cancelar la elección.

#### Scenario: Timeout revierte con reloj ficticio

- GIVEN una mesa "por ocupar"
- WHEN transcurre el timeout (fake timers)
- THEN la mesa vuelve a available

#### Scenario: Cancelación explícita

- GIVEN una mesa "por ocupar"
- WHEN el cliente cancela o sale de la vista
- THEN la intención se descarta

### Requirement: Intención no persistente [CLI-MAP-004]

El estado "por ocupar" MUST NOT persistirse (ni localStorage ni persist del store): al recargar, el plano muestra el estado real.

#### Scenario: Recarga limpia la intención

- GIVEN una mesa "por ocupar"
- WHEN se recarga la página
- THEN la mesa se muestra con su estado real (available)

### Requirement: Asociación real solo por QR [CLI-MAP-005]

Solo el escaneo del qr_token único de una mesa (DINE_TABLE.qr_token) MUST asociar al cliente con la mesa y abrir DINE_SESSION con status open.

#### Scenario: QR abre sesión

- GIVEN una mesa con qr_token válido
- WHEN el cliente escanea el QR desde el plano
- THEN se abre DINE_SESSION (status open) para esa mesa
- AND el cliente queda asociado a la mesa

### Requirement: Mesa no disponible no elegible [CLI-MAP-006]

Una mesa con status occupied, reserved o cleaning MUST NOT permitir elección; se muestra como no disponible.

#### Scenario: Mesa ocupada no elegible

- GIVEN una mesa occupied
- WHEN el cliente intenta elegirla
- THEN la acción se rechaza y se muestra como ocupada

#### Scenario: Ocupada durante la intención

- GIVEN una mesa "por ocupar"
- WHEN la mesa pasa a occupied antes de expirar
- THEN la intención se revierte
- AND el plano muestra el estado real (ocupada)

### Requirement: Reingreso sin duplicar sesión [CLI-MAP-007]

Si el cliente escanea el qr de una mesa con la que ya tiene DINE_SESSION abierta, el sistema SHOULD retomar esa sesión en lugar de crear otra.

#### Scenario: Reescaneo retoma sesión

- GIVEN una DINE_SESSION open del cliente en la mesa
- WHEN reescanea el mismo qr_token
- THEN retoma la sesión existente
- AND no crea una segunda sesión

## Comment

- ER v2: DINE_TABLE (status, qr_token, position_x/y, zone, shape, capacity) y DINE_SESSION (dine_table_id, branch_id, status open, opened_by). DINE_FLOOR.layout y MAP_ZONE modelan zonas en backend.
- tables.json usa status propios (free, billing, occupied, cleaning): este slice los mapea al contrato y añade branch_id y qr_token por mesa (afecta `src/mocks/tables.json` y `tableContext.js`, cuyo `code` se alinea a qr_token).
- La intención vive en un store cliente NO persistente; estados visuales distintos ("por ocupar" vs "ocupada") mitigan el riesgo de confundir intención con ocupación real.