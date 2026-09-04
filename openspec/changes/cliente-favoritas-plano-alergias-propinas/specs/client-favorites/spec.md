# Spec: client-favorites — Favoritas por persona y sucursal

## Purpose

Permite que un cliente marque sucursales como favoritas y las recupere ordenadas por fecha (más reciente primero), siguiendo la entidad FAVORITE del ER v2 (person_id, branch_id, created_at) con unicidad (person_id, branch_id). El catálogo expone `isFavorite` por usuario para el toggle estrella.

## Requirements

### Requirement: Unicidad person+sucursal [CLI-FAV-001]

La entidad FAVORITE MUST garantizar unique(person_id, branch_id): una persona MAY tener una sola favorita por sucursal.

#### Scenario: Duplicado rechazado

- GIVEN una persona con FAVORITE de la sucursal X
- WHEN se intenta crear otra FAVORITE de la misma persona y sucursal
- THEN no se crea un duplicado
- AND permanece una sola fila

### Requirement: Toggle estrella [CLI-FAV-002]

El cliente MUST poder agregar y quitar una favorita desde el catálogo (toggle): agregar crea la fila con created_at; quitar elimina la fila de (person_id, branch_id).

#### Scenario: Toggle agrega y quita

- GIVEN un usuario en el catálogo de la sucursal X
- WHEN toca la estrella
- THEN la sucursal queda como favorita (isFavorite true)
- AND al tocar de nuevo deja de serlo (isFavorite false)

#### Scenario: Quitar una favorita inexistente

- GIVEN una sucursal sin FAVORITE del usuario
- WHEN se intenta quitar
- THEN la operación es no-op sin error

### Requirement: Listado ordenado por creación [CLI-FAV-003]

El listado de favoritas de una persona MUST ordenarse por created_at DESC (la más reciente primero).

#### Scenario: Orden más reciente primero

- GIVEN favoritas creadas en T1, luego T2 y luego T3
- WHEN se lista el historial de la persona
- THEN el orden es T3, T2, T1

### Requirement: isFavorite en catálogo [CLI-FAV-004]

El catálogo MUST exponer isFavorite por usuario para cada sucursal listada.

#### Scenario: Estado reflejado en catálogo

- GIVEN un usuario con favorita en X pero no en Y
- WHEN se renderiza el catálogo
- THEN X muestra estrella activa e Y no

### Requirement: Identidad requerida [CLI-FAV-005]

Crear o listar favoritas MUST requerir person_id autenticado; el branch_id MUST referenciar una sucursal existente. Un usuario anónimo MUST NOT poder marcar favoritas.

#### Scenario: Anónimo bloqueado

- GIVEN un visitante sin sesión
- WHEN toca la estrella
- THEN la acción se bloquea y se solicita identificación
- AND no se crea FAVORITE

### Requirement: Persistencia durable [CLI-FAV-006]

Las favoritas MUST persistir entre sesiones de navegador (a diferencia del estado efímero de mesa): sobreviven a la recarga.

#### Scenario: Favorita sobrevive a recarga

- GIVEN una favorita marcada
- WHEN se recarga la página
- THEN la favorita sigue presente
- AND el isFavorite se mantiene

## Comment

- ER v2: FAVORITE (id, person_id FK, branch_id FK, created_at). La restricción unique(person_id, branch_id) se declara en diseño; el ER no la explicita pero la proposal la establece.
- Backend Java sin stack: la constraint de unicidad y el listado DESC quedan como requisitos de testabilidad pendientes; el front (vitest) puede testear toggle, isFavorite y orden contra un mock del servicio.
- Dependencia: usa el branch_id canónico del slice branch-identity.