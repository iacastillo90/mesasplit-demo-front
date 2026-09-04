# Delta for order-tracking (NEW)

## ADDED Requirements

### Requirement: Polling periódico `[order-polling]`

La app MUST consultar `GET /sessions/{sessionId}/orders` cada 10 segundos.

#### Scenario: Actualización automática

- GIVEN pedido PENDING
- WHEN pasan 10 segundos
- THEN rellama el endpoint y actualiza UI si cambió status

#### Scenario: Polling se detiene al salir

- GIVEN polling activo
- WHEN el usuario navega away
- THEN Timer se cancela

### Requirement: Indicador de carga `[loading-indicator]`

La app MUST mostrar skeleton en primera carga, indicador sutil en polling.

#### Scenario: Primera carga

- GIVEN entrando a OrderScreen
- WHEN cargando
- THEN muestra skeleton loader
