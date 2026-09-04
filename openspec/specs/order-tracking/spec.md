# Spec: order-tracking — Polling de Estado de Pedidos

## Purpose

Mantener al guest informado del estado de sus pedidos mediante polling periódico. STOMP está bloqueado para GUEST en el backend actual.

## Requirements

### Requirement: Polling periódico `[order-polling]`

La app MUST consultar `GET /sessions/{sessionId}/orders` cada 10 segundos mientras la pantalla de pedidos esté visible. MUST detener el polling al salir de la pantalla.

#### Scenario: Actualización automática

- GIVEN el usuario en OrderScreen con 1 pedido PENDING
- WHEN pasan 10 segundos
- THEN la app rellama `GET /sessions/{sessionId}/orders`
- AND si el status cambió, actualiza la UI con el nuevo estado

#### Scenario: Pedido servido

- GIVEN un pedido con 2 líneas PENDING y 1 IN_PROGRESS
- WHEN el backend retorna 2 líneas SERVED y 1 IN_PROGRESS
- THEN la UI actualiza los colores: 2 verdes, 1 azul

#### Scenario: Polling se detiene al salir

- GIVEN el polling activo en OrderScreen
- WHEN el usuario navega a otra pantalla
- THEN el Timer se cancela
- AND NO se hacen más requests

### Requirement: Indicador de carga `[loading-indicator]`

La app MUST mostrar un shimmer skeleton mientras carga los pedidos por primera vez, y un indicador sutil durante el polling.

#### Scenario: Primera carga

- GIVEN el usuario entra a OrderScreen
- WHEN los pedidos están cargando
- THEN se muestra skeleton loader

#### Scenario: Refresh silencioso

- GIVEN pedidos ya mostrados
- WHEN el polling actualiza
- THEN NO se muestra skeleton, solo se actualizan los datos
