# LabTab Mobile - Documentación Hito MVP

> App del **comensal** (app nativa APK/iOS en el MVP, probada con instalación manual; publicación en tiendas en *Producto terminado*, dic 2026).
> Escanea el QR de la mesa, se une a la sesión, ve el menú, pide, ve su subtotal y paga lo suyo.

## Índice de Documentos

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Visión y Alcance](01-vision-y-alcance.md) | Qué es LabTab Mobile, para quién, y qué cubre el hito MVP |
| 02 | [Requisitos Funcionales](02-requisitos-funcionales.md) | Requisitos FR-*, user stories, criterios de aceptación |
| 03 | [Requisitos No Funcionales](03-requisitos-no-funcionales.md) | NFR-*, performance, seguridad, disponibilidad |
| 04 | [Arquitectura Mobile](04-arquitectura-mobile.md) | Stack técnico, decisiones justificadas, diagrama de capas |
| 05 | [Modelo de Datos](05-modelo-datos.md) | DTOs de la app (envelope `{data, meta}`), JSON, mapeo con backend |
| 06 | [Flujos de Negocio](06-flujos-de-negocio.md) | Algoritmos, lógica de negocio, diagramas de flujo |
| 07 | [Pantallas y Navegación](07-pantallas-y-navegacion.md) | Wireframes, árbol de navegación, pantallas MVP |
| 08 | [Integración Backend](08-integracion-backend.md) | Endpoints reales, WebSocket, contratos API |
| 09 | [Estrategia de Test](09-estrategia-test.md) | Unit, widget, integration, E2E testing |
| 10 | [Plan de Implementación](10-plan-implementacion.md) | Fases, hitos, cronograma, criterios de cierre |
| 11 | [Spec Endpoints](11-spec-endpoints.md) | Spec técnica detallada por feature/pantalla |
| 12 | [Dependencias y Config](12-dependencias-y-config.md) | Paquetes, variables de entorno, configuración |

## Diagrama de Navegación General

```
QR Scan --> Onboarding (unirse a sesión OPEN) --> Home (Mesa)
                                                   |
                                    +--------------+--------------+
                                    |              |              |
                                  Menú          Pedidos        Cuenta
                                    |              |              |
                              Detalle Plato   Estado (poll/WS)  Ver subtotal / Split
                                    |                             |
                             [S.O.S. botón]                        |
                                                          Pago (MP/Webpay)
                                                               |
                                                       Feedback Modal (1-5)
```

## Stack Técnico (Resumen)

- **Framework**: Flutter 3.x + Dart (decisión cerrada — ver `brief-trabajo-hito-MVP-mobile.md`)
- **Estado**: Riverpod 2.x
- **Navegación**: go_router
- **Networking**: dio + retrofit (deserializa el envelope `ApiResponse<T>`)
- **WebSocket**: stomp_dart_client (sujeto al gap GUEST — ver 08)
- **Storage**: flutter_secure_storage + shared_preferences
- **Testing**: flutter_test + mockito + patrol

## Fuente de Verdad del Contrato

Los endpoints y DTOs que consume esta app están definidos en el **código real del backend**:

- `LabTab-Back/src/main/java/cl/labtab/api/controllers/` — endpoints exactos
- `LabTab-Back/src/main/java/cl/labtab/api/dtos/` — request/response exactos
- `openspec/docs/back/api-contracts/rest-api.md` y `websocket-payloads.md` — contratos en prosa

## Convenciones

- Todos los precios en **CLP** (enteros, sin decimales)
- Moneda del backend: `BigDecimal` → la app lo maneja como `int` (centavos no aplica en CLP)
- UUIDs como `String` en JSON
- Fechas ISO 8601; hora local `America/Santiago`
- **Toda respuesta exitosa llega envuelta en `{ "data": ..., "meta": { ... } }`**
- Multi-idioma: MVP solo **es-CL**
