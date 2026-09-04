# Estado Alfa — Tracker de Avance

> Este archivo es el tablero de control del hito Alfa. Se actualiza **al terminar cada Issue**.
> Leyenda de estado: `⬜` pendiente · `🟦` en progreso · `✅` completado · `⛔` bloqueado

**Última actualización:** 2026-09-03 — Hito Alfa cerrado (backend completo: 20 entidades, 26 tests en verde, evidencia 45/45, CI verde)

---

## Resumen global

| Fase | Capa | Estado | Issues completados |
|:--|:--|:--|:--|
| Fase 1 — Model | `model` | ✅ | 6 / 6 (PRs #8–#13 cerrados) |
| Fase 2 — DTO | `dto` | ✅ | 6 / 6 (PRs #20–#25 cerrados) |
| Fase 3 — Repository | `repository` | ✅ | 6 / 6 (PRs #32–#37 cerrados) |
| Fase 4 — Service (contratos) | `service` | ✅ | 6 / 6 (PRs #44–#49 cerrados) |
| Fase 5 — Service Impl | `service-impl` | ✅ | 6 / 6 (PRs #56–#61 cerrados) |
| Fase 6 — Mapper | `mapper` | ✅ | 6 / 6 (PRs #68–#73 cerrados) |
| Fase 7 — Controller | `controller` | ✅ | 6 / 6 (PRs #80–#85 cerrados) |
| Fase 8 — Transversales | `security/websocket/audit/config/common/exception` | ✅ | 5 PRs (#91–#95 cerrados) |
| Fase 9 — Test | `test` | ✅ | 7 / 7 (8/8 en verde — PR #97) |

**Reglas No Negociables:** ver `Hito_Alfa.md` sección 4 (las 6).

---

## Pendientes Heredados (Sección 8 del brief) — deben resolverse antes del primer PR de `PERSON_PROFILE`

| # | Pendiente | Decisión | Estado |
|:--|:--|:--|:--|
| 1 | `PERSON_PROFILE.role` redundante | Eliminado del modelo (el campo ya no existe) | ✅ |
| 2 | OWNER multi-sucursal (JWT solo lleva `branchId`) | Resuelto vía `POST /auth/switch-branch` (JWT por sucursal elegida) | ✅ |
| 3 | Naming `DiningFloor`/`DiningTable` | Confirmado (clases `DiningFloor`/`DiningTable` aplicadas) | ✅ |

---

## Cambios recientes / Deuda resuelta

### Dominio Rico (refactor: modelo anémico → modelo rico)

La lógica de cálculo y de cambio de estado se movió de los servicios a las entidades:

- `Bill`: `applyServiceCharge`, `recomputeTotal`, `settleBalance`, `applyPayment`, `applyDiscount`, `isFullyPaid`
- `Order`: `calculateTotals(List<OrderLine>)`
- `OrderLine`: `calculateLineTotal`, `transitionTo`, `markReady`, `cancel`, `markCourseAsMarching`

Los servicios (`BillServiceImpl`, `PaymentServiceImpl`, `OrderServiceImpl`) ahora solo orquestan repositorios y publican eventos. Las colecciones se inicializan vacías (`modifiers`, `tags`, `allergens`, `cuisineTags`, `allergies` = `new ArrayList<>()`).

### OWNER multi-sucursal resuelto

`POST /auth/switch-branch` (body `{ "branchId": "uuid" }`) emite un nuevo JWT para la sucursal elegida, validando un rol de sucursal ACTIVO. `AuthResponse` ahora incluye `availableBranches` (lista de `{branchId, branchName, role}`) para que el OWNER elija. Resuelve el pendiente #2 de la tabla de arriba.

### Enums creados (prep MVP)

`ChannelEnum` (QR/STAFF/POS), `SiiStatusEnum` (ISSUED/PENDING/CONTINGENCY), `ReservationStatusEnum`, `ServiceRequestStatusEnum` (OPEN/ACCEPTED/RESOLVED), `ServiceRequestTypeEnum` (WAITER/BILL/WATER/OTHER), `TaxDocumentTypeEnum` (BOLETA/FACTURA).

### Contratos MVP especificados (rest-api.md)

`GET/DELETE /payment-methods` y `GET/POST/DELETE /favorites` documentados en el contrato `rest-api.md`.

---

## Fase 1 — Model (`cl.labtab.api.models`)

| # | Issue | Dominio | Entidades | Rama | Estado | Commits |
|:--|:--|:--|:--|:--|:--|:--|
| 1 | [#2](https://github.com/iacastillo90/mesasplit-demo-front/issues/2) | Identidad y Roles | `PERSON`, `PERSON_PROFILE`, `COMPANY`, `COMPANY_ROLE`, `BRANCH`, `BRANCH_ROLE` | `feature/2-model-identidad` | ✅ | `8b23eec` |
| 2 | [#3](https://github.com/iacastillo90/mesasplit-demo-front/issues/3) | Piso y Mesas | `DINING_FLOOR`, `MAP_ZONE`, `DINING_TABLE` | `feature/3-model-piso-mesas` | ✅ | `f14d75b` |
| 3 | [#4](https://github.com/iacastillo90/mesasplit-demo-front/issues/4) | Sesión y Comensales | `DINE_SESSION`, `DINE_GUEST` | `feature/4-model-sesion` | ✅ | `4e7e9e1` |
| 4 | [#5](https://github.com/iacastillo90/mesasplit-demo-front/issues/5) | Menú | `MENU_SECTION`, `DISH` | `feature/5-model-menu` | ✅ | `f17b96a` |
| 5 | [#6](https://github.com/iacastillo90/mesasplit-demo-front/issues/6) | Comanda y Cocina | `ORDER`, `ORDER_LINE`, `KITCHEN_TICKET` | `feature/6-model-comanda-cocina` | ✅ | `a89ca53` |
| 6 | [#7](https://github.com/iacastillo90/mesasplit-demo-front/issues/7) | Cuenta, Cobro y Auditoría | `BILL`, `BILL_LINE`, `PAYMENT`, `EXCEPTION_LOG` | `feature/7-model-cuenta` | ✅ | `3b5f7e0` |

## Fase 2 — DTO (`cl.labtab.api.dtos`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#14](https://github.com/iacastillo90/mesasplit-demo-front/issues/14) | Identidad y Roles (auth) | ✅ | `a6e2c08` |
| 2 | [#15](https://github.com/iacastillo90/mesasplit-demo-front/issues/15) | Piso y Mesas | ✅ | `c04e9f4` |
| 3 | [#16](https://github.com/iacastillo90/mesasplit-demo-front/issues/16) | Sesión y Comensales | ✅ | `0c08803` |
| 4 | [#17](https://github.com/iacastillo90/mesasplit-demo-front/issues/17) | Menú | ✅ | `5390756` |
| 5 | [#18](https://github.com/iacastillo90/mesasplit-demo-front/issues/18) | Comanda y Cocina | ✅ | `5489749` |
| 6 | [#19](https://github.com/iacastillo90/mesasplit-demo-front/issues/19) | Cuenta, Cobro y Auditoría | ✅ | `a977f7e` |

## Fase 3 — Repository (`cl.labtab.api.repositories`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#26](https://github.com/iacastillo90/mesasplit-demo-front/issues/26) | Identidad y Roles | ✅ | `9db206f` |
| 2 | [#27](https://github.com/iacastillo90/mesasplit-demo-front/issues/27) | Piso y Mesas | ✅ | `f4751ff` |
| 3 | [#28](https://github.com/iacastillo90/mesasplit-demo-front/issues/28) | Sesión y Comensales | ✅ | `4df3016` |
| 4 | [#29](https://github.com/iacastillo90/mesasplit-demo-front/issues/29) | Menú | ✅ | `9f764e6` |
| 5 | [#30](https://github.com/iacastillo90/mesasplit-demo-front/issues/30) | Comanda y Cocina | ✅ | `9d64b8f` |
| 6 | [#31](https://github.com/iacastillo90/mesasplit-demo-front/issues/31) | Cuenta, Cobro y Auditoría | ✅ | `eadf5b7` |

## Fase 4 — Service (contratos) (`cl.labtab.api.services`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#38](https://github.com/iacastillo90/mesasplit-demo-front/issues/38) | Identidad y Roles (AuthService) | ✅ | `328ae0b` |
| 2 | [#39](https://github.com/iacastillo90/mesasplit-demo-front/issues/39) | Piso y Mesas (BranchService) | ✅ | `94d6ce7` |
| 3 | [#40](https://github.com/iacastillo90/mesasplit-demo-front/issues/40) | Sesión y Comensales (SessionService) | ✅ | `e019515` |
| 4 | [#41](https://github.com/iacastillo90/mesasplit-demo-front/issues/41) | Menú (MenuService) | ✅ | `1e35d29` |
| 5 | [#42](https://github.com/iacastillo90/mesasplit-demo-front/issues/42) | Comanda y Cocina (OrderService + KitchenService) | ✅ | `2b600f6` |
| 6 | [#43](https://github.com/iacastillo90/mesasplit-demo-front/issues/43) | Cuenta, Cobro y Auditoría (Bill/Payment/ExceptionLog) | ✅ | `c7adab8` |

## Fase 5 — Service Impl (`cl.labtab.api.services.implement`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#50](https://github.com/iacastillo90/mesasplit-demo-front/issues/50) | Identidad y Roles (AuthServiceImpl + infra) | ✅ | `30b9a9c` |
| 2 | [#51](https://github.com/iacastillo90/mesasplit-demo-front/issues/51) | Piso y Mesas (BranchServiceImpl) | ✅ | `092daf2` |
| 3 | [#52](https://github.com/iacastillo90/mesasplit-demo-front/issues/52) | Sesión y Comensales (SessionServiceImpl) | ✅ | `ab7c5b6` |
| 4 | [#53](https://github.com/iacastillo90/mesasplit-demo-front/issues/53) | Menú (MenuServiceImpl) | ✅ | `f8802cf` |
| 5 | [#54](https://github.com/iacastillo90/mesasplit-demo-front/issues/54) | Comanda y Cocina (OrderServiceImpl + KitchenServiceImpl) | ✅ | `3835f2a` |
| 6 | [#55](https://github.com/iacastillo90/mesasplit-demo-front/issues/55) | Cuenta, Cobro y Auditoría (Bill/Payment/ExceptionLog) | ✅ | `78aeee9` |

## Fase 6 — Mapper (`cl.labtab.api.mappers`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#62](https://github.com/iacastillo90/mesasplit-demo-front/issues/62) | Identidad y Roles (GuestMapper) | ✅ | `d7fb981` |
| 2 | [#63](https://github.com/iacastillo90/mesasplit-demo-front/issues/63) | Piso y Mesas (Branch/MapZone/DiningTable) | ✅ | `ae5adc9` |
| 3 | [#64](https://github.com/iacastillo90/mesasplit-demo-front/issues/64) | Sesión y Comensales (DineSession/DineGuest) | ✅ | `6501fd9` |
| 4 | [#65](https://github.com/iacastillo90/mesasplit-demo-front/issues/65) | Menú (MenuSection/Dish) | ✅ | `ae7bc11` |
| 5 | [#66](https://github.com/iacastillo90/mesasplit-demo-front/issues/66) | Comanda y Cocina (Order/OrderLine/KitchenTicket) | ✅ | `4ed8a6c` |
| 6 | [#67](https://github.com/iacastillo90/mesasplit-demo-front/issues/67) | Cuenta, Cobro y Auditoría (Bill/BillLine/Payment/ExceptionLog) | ✅ | `a333296` |

## Fase 7 — Controller (`cl.labtab.api.controllers`)

| # | Issue | Dominio | Estado | Commits |
|:--|:--|:--|:--|:--|
| 1 | [#74](https://github.com/iacastillo90/mesasplit-demo-front/issues/74) | Identidad y Roles (AuthController + ApiResponse) | ✅ | `1839a47` |
| 2 | [#75](https://github.com/iacastillo90/mesasplit-demo-front/issues/75) | Piso y Mesas (BranchController) | ✅ | `248e9b4` |
| 3 | [#76](https://github.com/iacastillo90/mesasplit-demo-front/issues/76) | Sesión y Comensales (SessionController) | ✅ | `4fe38ea` |
| 4 | [#77](https://github.com/iacastillo90/mesasplit-demo-front/issues/77) | Menú (MenuController) | ✅ | `fbecc1c` |
| 5 | [#78](https://github.com/iacastillo90/mesasplit-demo-front/issues/78) | Comanda y Cocina (OrderController + KitchenController) | ✅ | `ac6157d` |
| 6 | [#79](https://github.com/iacastillo90/mesasplit-demo-front/issues/79) | Cuenta, Cobro y Auditoría (Bill/Payment/ExceptionLog) | ✅ | `e6325f8` |

## Fase 8 — Transversales

| Componente | Artefactos | Estado | Commits |
|:--|:--|:--|:--|
| `security/` | `SecurityConfiguration`, `JwtAuthFilter`, `JwtService`, `UserDetailsServiceImpl`, `BranchContextHolder` | ✅ | `0117f54` |
| `websocket/` | `WebSocketConfiguration`, `StompAuthInterceptor`, publicadores (Order, Kitchen, Payment, Alert, Table) | ✅ | `35f57ed` |
| `audit/` | `ExceptionLogService` (auditoría inline con contexto; `AuditAspect`/`@Auditable` eliminados por quedar sin uso) | ✅ | `36df285` |
| `exception/` | `GlobalExceptionHandler`, excepciones custom (NotFound, BusinessRule, Conflict, UnauthorizedPin) | ✅ | `70fa3d7` |
| `configurations/` | `CorsConfiguration`, `OpenApiConfiguration`, `JacksonConfiguration` (VirtualThreads por yml) | ✅ | `74604e8` |
| `common/` | enums (`BranchRoleEnum`, `OrderStatusEnum`, `BillStatusEnum`, `PaymentMethodEnum`, `PaymentStatusEnum`, `TableStatusEnum`, `DineSessionStatusEnum`, `KitchenTicketStatusEnum`, `ExceptionEventTypeEnum`, `VoidReasonEnum`), `DateUtils` | ✅ | — |

## Fase 9 — Test (7 tests no negociables de `08-flujos-criticos.md`)

| # | Test | Tipo | Clase | Estado | Commits |
|:--|:--|:--|:--|:--|:--|
| 1 | Aislamiento por `branchId` | Integración | `BranchIsolationIntegrationTest` | ✅ | `9104c57` |
| 2 | Idempotencia de pagos (webhook duplicado) | Integración | `PaymentIntegrationTest` | ✅ | `9104c57` |
| 3 | Validación de PIN correcto/incorrecto | Unitario | `PinValidationServiceTest` | ✅ | `9104c57` |
| 4 | Lock optimista en BILL (QR + POS → 409) | Integración | `BillConcurrencyIntegrationTest` | ✅ | `9104c57` |
| 5 | Construcción de BILL_LINE por DINE_GUEST | Unitario | `BillServiceTest` | ✅ | `9104c57` |
| 6 | Autorización STOMP por `branchId` | Integración | `StompAuthIntegrationTest` | ✅ | `9104c57` |
| 7 | Emisión automática de `EXCEPTION_LOG` en anulación | Integración | `ApplyDiscountAuditIntegrationTest` | ✅ | `9104c57` |

---

## Bitácora de decisiones / bloqueos

_(Se registra aquí cualquier Issue `pregunta-arquitectura`, desvío documentado o decisión nueva.)_

| Fecha | Tema | Decisión / Estado |
|:--|:--|:--|
| 2026-08-30 | Stack de build | **Resuelto**: Gradle 9.7.x + Spring Boot 3.5.16 + PostgreSQL 16 + paquete `cl.labtab.api`. H2 descartado (ni en tests). Spring Boot 4.1.1 evaluado y descartado (elimina `spring-boot-starter-aop` y sin Hypersistence para Hibernate 7). Registrado en `06-arquitectura-backend.md`. |
| 2026-08-30 | Sección 8 | 3 pendientes resueltos en `Hito_Alfa.md` (rol desde COMPANY_ROLE/BRANCH_ROLE, `companyId` como claim JWT, naming DiningFloor/DiningTable). |
| 2026-08-31 | Config Spring Boot 3.5 (Fase 9) | **Resuelto**: `SpringPhysicalNamingStrategy` no existe en Spring Boot 3.5 (el Doc 06b lo daba por válido) → se quita el naming del yml (Hibernate 6 usa `CamelCaseToUnderscoresNamingStrategy` por defecto + `@Column` explícitos). `ddl-auto: validate` rompe con Hypersistence TEXT[]/JSONB (`_text` vs `text[]`) → pasa a `none`; Flyway sigue gestionando el schema. |
| 2026-08-31 | Cierre de hito | **Mergeado a `main`** (fast-forward, 50 commits de backend). 48 issues cerradas (solo #1 queda abierta: flake frontend ajeno). 48 PRs cerrados. Seed V13 (demo) + Dockerfile + docker-compose.yml + .env.example creados para `docker compose up`. |
| 2026-08-31 | Plan de cierre Alfa | **CI**: `.github/workflows/ci.yml` (build + test Testcontainers). **WebSocket**: 5 publishers cableados a los services (eventos real-time). **GUEST own-session**: `SessionContextHolder` + `enforceGuestSession` en endpoints 📌 (404 sin revelar existencia). **Webhook**: declarado **MVP** (POST /payments/webhook/{provider} es flujo QR/cliente, no Alfa; la firma HMAC es integración del doc 10). **Tests**: `MenuControllerTest` (@WebMvcTest) + `MenuCrudIntegrationTest` → 13 tests en verde. |
