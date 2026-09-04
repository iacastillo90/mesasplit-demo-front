# Spec: branch-identity — Identidad canónica de sucursal (branch_id)

## Purpose

Unifica la identidad de sucursal en el dominio Cliente: hoy conviven `lo-ovalle/providencia/vitacura` (WhatsAppReservationChatModal) con `b-1/b-2/b-3` (useReservationStore, FranchiseComparisonWidget). Un único branch_id canónico (UUID, `BRANCH.id` en ER v2) pasa a ser consumido por catálogo, plano de piso, QR y favoritas, con un mapa de legado que permite migrar fixtures y revertir (rollback).

## Requirements

### Requirement: branch_id canónico único [CLI-BRN-001]

El sistema MUST usar un único branch_id UUID canónico como identidad de cada sucursal en el código de cliente (catálogo, plano, QR, favoritas y reservas). MUST NOT existir dos identificadores distintos para la misma sucursal en fixtures o stores.

#### Scenario: Fixture migrado al ID canónico

- GIVEN `useReservationStore` con sucursales `b-1/b-2/b-3` y `WhatsAppReservationChatModal` con `lo-ovalle/providencia/vitacura`
- WHEN se migran los fixtures al branch_id canónico
- THEN toda referencia a la misma sucursal usa el mismo UUID
- AND no queda ningún id legado en los consumidores

#### Scenario: Dos IDs para la misma sucursal

- GIVEN una sucursal referenciada con dos ids distintos en fixtures
- WHEN corre la suite de unicidad
- THEN el test falla (RED) señalando la colisión

### Requirement: Mapa de legado biyectivo [CLI-BRN-002]

El change MUST proveer un mapa de traducción id-viejo→UUID que cubra `lo-ovalle`, `providencia`, `vitacura`, `b-1`, `b-2`, `b-3` (de sucursal) y cualquier referencia en fixtures; la traducción MUST ser biyectiva 1:1 y verificable por tests.

#### Scenario: Traducción de un id legado

- GIVEN el id legado `providencia`
- WHEN se traduce al canónico
- THEN se obtiene su UUID de destino
- AND la traducción inversa (UUID→legado) es consistente

#### Scenario: Id legado desconocido

- GIVEN un id que no está en el mapa
- WHEN se intenta traducir
- THEN el sistema falla de forma explícita (error)
- AND no asume un default silencioso

### Requirement: Consumidores resuelven por canónico [CLI-BRN-003]

Catálogo, plano de piso, QR de mesa y favoritas MUST resolver la sucursal por branch_id canónico; plano y favoritas MUST recibir el mismo branch_id que el catálogo para una misma sucursal.

#### Scenario: Mismo branch_id en catálogo y favoritas

- GIVEN un usuario con favorita marcada en la sucursal X
- WHEN se abre el catálogo de la sucursal X
- THEN el catálogo y la favorita referencian el mismo branch_id

### Requirement: QR de mesa ligado al canónico [CLI-BRN-004]

Cada mesa (DINE_TABLE.qr_token, único) MUST permitir resolver su branch_id canónico y su mesa; el flujo de escaneo cliente MUST usar ese branch_id para continuar.

#### Scenario: Escaneo resuelve sucursal canónica

- GIVEN un qr_token de mesa de la sucursal X
- WHEN se escanea
- THEN se resuelve el branch_id canónico de X
- AND no se introduce un id legado en el flujo

### Requirement: Testabilidad del contrato [CLI-BRN-005]

La unicidad del branch_id y el mapa de legado MUST ser verificables por tests unitarios (front: vitest, RED primero bajo strict TDD). El backend Java (sin stack definido) SHOULD exponer el contrato por API con branch_id explícito; esa verificación queda declarada como requisito de testabilidad pendiente.

#### Scenario: Suite de unicidad

- GIVEN todos los fixtures del cliente
- WHEN se recorre el inventario de branch_ids
- THEN cada sucursal real tiene exactamente un branch_id
- AND el mapa cubre todos los ids legados presentes

## Comment

- `BRANCH.id` del ER v2 es la fuente canónica; `DINE_TABLE.branch_id` ya modela la FK en mesa.
- CUIDADO: `b-1/b-2/b-3` en `usePosStore`/`posService` son IDs de MESAS de POS, no de sucursal: el mapeo no debe tocarlos.
- El mapa de legado vive en el change y habilita el rollback (volver a ids legados) sin migración destructiva.
- Este slice es base de los demás (favoritas, plano, QR): dependencia declarada en el diseño.