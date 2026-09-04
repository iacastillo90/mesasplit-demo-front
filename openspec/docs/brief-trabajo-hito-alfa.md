# Brief de Trabajo — Hito Alfa
## LabTab Backend (Java 21 + Spring Boot 3.3 + PostgreSQL 16)

> Este documento es el punto de partida para quien (persona o agente) empiece a construir el backend de Alfa. Si en algún momento entra un desarrollador nuevo al proyecto, este archivo — más el historial de Issues, PRs y commits que genere — debería bastarle para entender cómo se trabaja acá sin necesitar una explicación verbal.

---

## 0. Rol y Contexto

Vas a construir el hito **Alfa** del backend de LabTab, fecha de entrega **30 de septiembre de 2026**, siguiendo la arquitectura ya definida en los documentos técnicos del proyecto (sección 1). No estás diseñando la arquitectura — ya está resuelta — estás implementándola de forma ordenada, trazable y fácil de auditar después.

El proyecto viene de una auditoría que encontró vulnerabilidades críticas de seguridad en una versión anterior (accesos sin aislamiento por sucursal, escalación de rol, pagos sin control). Este backend se construye desde cero precisamente para no repetir esos errores — por eso el orden, la trazabilidad de cada commit, y las reglas de la sección 7 no son burocracia, son la razón de ser de este documento.

---

## 1. Fuente de Verdad — Documentos de Referencia

No inventes decisiones de arquitectura, seguridad o modelo de datos — todas ya están tomadas. Ante cualquier duda, el orden de consulta es:

| Documento | Qué resuelve |
|---|---|
| `Diagrama_V3.mmd` | Las 29 entidades, campos, tipos, PK/FK — modelo de datos completo |
| `rest-api.md` | Los 46 endpoints REST, request/response, roles autorizados, códigos de error |
| `websocket-payloads.md` | Los 11 eventos STOMP en tiempo real |
| `06-arquitectura-backend.md` | Stack, estructura de paquetes Java, `pom.xml`, `application.yml` |
| `06b-modelo-datos-y-migraciones.md` | Migraciones Flyway, mapeo de tipos Java↔PostgreSQL, constraints |
| `07-seguridad-y-roles.md` | Roles, matriz de permisos, JWT, PIN, `BranchContextHolder`, autorización STOMP |
| `08-flujos-criticos.md` | Diagramas de secuencia de los 5 flujos complejos + estrategia de testing |
| `09-infraestructura-aws.md` | Docker Compose, Nginx, despliegue |
| `00-ecosistema-maestro-sdd.md` | Reglas de negocio de producto (Escudo de Alergias, Course Control, etc.) |

Si un documento no cubre algo que necesitás decidir, no improvises: abrí un Issue con la etiqueta `pregunta-arquitectura` y dejalo bloqueado hasta resolverlo.

---

## 2. Alcance de Alfa — Qué Entra y Qué No

Alfa es **el flujo del local operado por el staff** — mozo, cocina, cobro. La interfaz del comensal por QR (que el cliente escanee y pida desde su celular) **es de MVP, no de Alfa** — en Alfa es el mozo quien crea la sesión, agrega comensales y toma el pedido.

### Entra en Alfa (20 de las 29 entidades)

| Dominio | Entidades |
|---|---|
| Identidad y Roles | `PERSON`, `PERSON_PROFILE`, `COMPANY`, `COMPANY_ROLE`, `BRANCH`, `BRANCH_ROLE` |
| Piso y Mesas | `DINING_FLOOR`, `MAP_ZONE`, `DINING_TABLE` |
| Sesión y Comensales | `DINE_SESSION`, `DINE_GUEST` |
| Menú | `MENU_SECTION`, `DISH` |
| Comanda y Cocina | `ORDER`, `ORDER_LINE`, `KITCHEN_TICKET` |
| Cuenta, Cobro y Auditoría | `BILL`, `BILL_LINE`, `PAYMENT`, `EXCEPTION_LOG` |

### No entra en Alfa (queda para MVP en adelante)

`TAX_DOCUMENT`, `SII_CAF_POOL`, `PAYMENT_METHOD`, `RESERVATION`, `SERVICE_REQUEST`, `DINE_FEEDBACK`, `FAVORITE`, `STOCK_ITEM`, `RECIPE_INGREDIENT`.

Si mientras trabajás te encontrás necesitando algo de estas 9 entidades para que Alfa funcione, es señal de que el alcance no está tan claro como parece — abrí un Issue con la etiqueta `pregunta-arquitectura` antes de improvisar un atajo.

---

## 3. Flujo de Trabajo en GitHub

### 3.1 Ramas

```
main                        # protegida — solo se llega por PR aprobado, con checks en verde
└── feature/<issue>-<slug>  # una rama por Issue, ej: feature/12-modelo-order
```

No se usa `develop` ni git-flow completo — con un equipo chico en etapa temprana, agrega fricción sin beneficio real. Cuando el equipo crezca, se reevalúa.

**Reglas:**
- Ninguna rama se llama igual que un Issue sin número — siempre `feature/<n°issue>-<slug-corto>`.
- Una rama vive lo que dura su Issue. Se borra al mergear el PR.
- `main` exige: build verde (CI), los 7 tests no negociables pasando, y al menos una revisión aprobada (aunque el revisor seas vos mismo en otro momento del día — el punto es dejar el registro, no la formalidad).

### 3.2 Issues

Un Issue = una unidad de trabajo mergeable por separado, nunca "arreglar todo el backend". Plantilla obligatoria:

```markdown
## Qué
[Qué se construye — capa + dominio. Ej: "Modelos JPA del dominio Identidad y Roles"]

## Por qué
[Qué necesidad de negocio o de arquitectura resuelve — referencia al documento fuente]

## Criterios de aceptación
- [ ] ...
- [ ] Compila sin warnings
- [ ] Sigue la convención de nombres de 06-arquitectura-backend.md

## Documento de referencia
[Ej: Diagrama_V3.mmd, sección PERSON / PERSON_PROFILE / COMPANY / COMPANY_ROLE / BRANCH / BRANCH_ROLE]

## Capa
[Model | DTO | Repository | Service | ServiceImpl | Mapper | Controller | Security | WebSocket | Audit | Config | Test]
```

Etiquetas mínimas: `capa:*` (una por cada capa de la lista de arriba), `dominio:*` (identidad, mesas, sesion, menu, comanda, cocina, cuenta), `pregunta-arquitectura`, `bloqueado`.

### 3.3 Pull Requests

Un PR = un Issue. Nunca varios Issues en un mismo PR, aunque sean chicos — la trazabilidad se rompe si se mezclan.

```markdown
## Qué cambia
[Resumen — el título del Issue no alcanza, decí qué archivos/clases se agregaron]

## Por qué esta decisión
[El "por qué" técnico, no solo el "qué" — mismo criterio que en los commits, sección 4]

## Cómo probarlo
[Comandos exactos: `mvn test -Dtest=...`, o el request curl si es un endpoint]

## Checklist
- [ ] Sigue la convención de commits de la sección 4
- [ ] No introduce una query sin filtro por `branch_id` (ver sección 7)
- [ ] Tests pasando localmente con Testcontainers
- [ ] Actualiza documentación si el comportamiento se desvía de lo ya escrito en los docs de la sección 1

Cierra #<issue>
```

### 3.4 Milestone

Crear el milestone **`Alfa — 30 sept 2026`** en GitHub y asignar cada Issue de este brief ahí. El % de avance del milestone es la métrica real de si Alfa llega a tiempo — no una sensación.

---

## 4. Convención de Commits

Cada commit explica una decisión, no solo describe un cambio. Un commit que diga `feat: agregar OrderService` no sirve — no le dice nada a quien lo lea en seis meses sobre **por qué** se hizo así y no de otra forma.

### 4.1 Formato

```
<tipo>(<capa>): <resumen corto, en español, modo imperativo>

<Cuerpo: 2-5 líneas explicando QUÉ se construyó y, sobre todo, POR QUÉ se
tomó esa decisión — qué alternativa se descartó si aplica, y qué documento
de arquitectura lo respalda>

Refs: #<issue>
```

**Tipos:** `feat` `fix` `refactor` `test` `docs` `chore` `security` `perf`
**Capas:** `model` `dto` `repository` `service` `service-impl` `mapper` `controller` `security` `websocket` `audit` `config` `test`

### 4.2 Ejemplos reales, uno por capa

```
feat(model): agregar entidad Order y OrderLine

Mapea ORDER y ORDER_LINE del Diagrama_V3.mmd. OrderLine incluye
branch_id denormalizado (no solo vía order_id) a propósito: así la
política de aislamiento por sucursal en el repository queda en una
sola columna, sin depender de un join — es la misma clase de error
que causó las vulnerabilidades de acceso en la versión anterior.

Refs: #14
```

```
feat(dto): agregar CreateOrderRequest y OrderResponse

Se separan request y response aunque casi comparten campos, porque
el request nunca debe aceptar branchId del cliente (se toma del JWT
vía BranchContextHolder) — mezclar ambos DTOs abre la puerta a que
alguien mande un branchId ajeno "por error" en el body.

Refs: #14
```

```
feat(repository): agregar OrderRepository con scope por sucursal

findAllByBranchId() es el único método de lectura expuesto por
ahora. No se agrega un findAll() genérico a propósito: si en algún
service futuro hace falta, que sea una decisión explícita y
revisada, no un método que quede ahí disponible para usarse mal.

Refs: #14
```

```
feat(service): definir contrato OrderService

Se separa la interfaz de la implementación (services/ vs
services/implement/) siguiendo 06-arquitectura-backend.md — permite
testear con mocks sin levantar el contexto de Spring completo en
los tests unitarios de lógica de negocio.

Refs: #14
```

```
feat(service-impl): implementar OrderServiceImpl.createOrder

La validación de que todos los OrderLine pertenezcan al mismo
branchId que la sesión se hace acá, no en el controller — la regla
de negocio "un pedido no puede mezclar sucursales" vive en la capa
de servicio, no en la capa HTTP, para que valga también si mañana
se llama a este método desde un job interno o un test.

Refs: #14
```

```
feat(mapper): agregar OrderMapper con MapStruct

toResponse() ignora explícitamente el campo internalNotes del
modelo — es una nota interna de cocina que no debería llegar nunca
al comensal si este mapper se reutiliza más adelante para un
endpoint de cara al cliente.

Refs: #14
```

```
feat(controller): agregar POST /orders

@PreAuthorize valida rol STAFF o superior antes de llegar al
service — es defensa en profundidad: aunque el service también
valide, el controller no debería ni intentar ejecutar la lógica si
el rol ya está descartado. Ver matriz de permisos en
07-seguridad-y-roles.md.

Refs: #14
```

```
security(audit): agregar AuditAspect para anulaciones con PIN

AOP en vez de logging manual en cada service: la lección de la
auditoría anterior fue que las anulaciones se auditaban "cuando
alguien se acordaba" de escribir el log a mano. Con @Auditable
sobre el método, es imposible olvidarlo.

Refs: #22
```

> **Nota**: este ejemplo quedó **superado** — la auditoría pasó de AOP (`@Auditable`) a llamada explícita inline (`exceptionLogService.createLog(...)` con `reason`, `amount`, `orderLineId` y `authorizedBy`). Se conserva como registro histórico.

```
test(service-impl): agregar test de aislamiento por sucursal en BillService

Testcontainers con PostgreSQL real, no H2 — H2 no replica bien el
tipo TEXT[] que usa allergies en PERSON_PROFILE, y ya nos pasó en
la versión anterior que un test pasaba en CI y fallaba en
producción por esta razón exacta.

Refs: #31
```

### 4.3 Directiva: Dominio Rico

> **Dominio Rico**: la lógica de cálculo y de cambio de estado vive en las entidades (`Bill`, `Order`, `OrderLine`), no en los servicios. Los `@Service` solo orquestan repositorios y publican eventos.

Esta directiva **supersede** el ejemplo `feat(service-impl)` de la sección 4.2, que ubicaba la regla "un pedido no puede mezclar sucursales" en la capa de servicio. El ejemplo se conserva como registro histórico, pero la regla vigente es: el cálculo y el cambio de estado se resuelven dentro de las entidades.

Métodos de dominio:
- `Bill`: `applyServiceCharge`, `recomputeTotal`, `settleBalance`, `applyPayment`, `applyDiscount`, `isFullyPaid`
- `Order`: `calculateTotals(List<OrderLine>)`
- `OrderLine`: `calculateLineTotal`, `transitionTo`, `cancel`, `markCourseAsMarching`

Los servicios (`BillServiceImpl`, `PaymentServiceImpl`, `OrderServiceImpl`) solo orquestan repositorios y publican eventos. Las colecciones se inicializan vacías (`modifiers`, `tags`, `allergens`, `cuisineTags`, `allergies` = `new ArrayList<>()`).

---

## 5. Orden de Implementación

El orden es por **capa completa**, no por dominio completo — se termina toda una capa en los 7 dominios de Alfa antes de pasar a la siguiente. Esto deja el modelo de datos 100% resuelto y validado antes de escribir una sola línea de lógica de negocio, y evita tener que volver atrás a media implementación.

> **Un ajuste sobre lo que charlamos:** invertí el orden de `Repository` y `Service` respecto a como lo mencionaste — va Repository antes que Service/ServiceImpl, no después. Es lo único que no es una preferencia de estilo: `ServiceImpl` necesita inyectar el repository para compilar, así que si el repository no existe todavía, ese commit no compila. El resto del orden queda exactamente como lo planteaste.

```
Fase 1 — Model         (7 issues, uno por dominio de la tabla de la sección 2)
Fase 2 — DTO            (7 issues)
Fase 3 — Repository     (7 issues)
Fase 4 — Service        (7 issues — solo interfaces/contratos)
Fase 5 — Service Impl   (7 issues — lógica de negocio real)
Fase 6 — Mapper         (7 issues)
Fase 7 — Controller     (7 issues — acá recién se exponen los 46 endpoints)
Fase 8 — Transversales  (security/, websocket/, audit/, configurations/, common/, exception/)
Fase 9 — Test           (los 7 tests no negociables de 08-flujos-criticos.md + cobertura de aislamiento por sucursal)
```

Los 7 dominios, en cada fase, van en este orden (de menor a mayor dependencia):

1. Identidad y Roles
2. Piso y Mesas
3. Sesión y Comensales
4. Menú
5. Comanda y Cocina
6. Cuenta, Cobro y Auditoría

*(6 dominios, no 7 — Comanda y Cocina se cuentan juntos porque `KITCHEN_TICKET` depende directamente de `ORDER`. Ajustá la tabla de Issues de la sección 3.4 con estos 6.)*

---

## 6. Definition of Done

**Por Issue:**
- [ ] Compila sin warnings
- [ ] Sigue la convención de commits de la sección 4 — cada commit tiene su "por qué"
- [ ] PR mergeado a `main` con al menos una revisión
- [ ] Si la capa es `service-impl` o `controller`: tiene al menos un test

**Por el hito Alfa completo:**
- [ ] Los 46 endpoints de Alfa responden según `rest-api.md`
- [ ] Las 3 vulnerabilidades críticas de la auditoría anterior, verificablemente cerradas (no "creemos que están cerradas" — con el mismo tipo de prueba que las detectó originalmente)
- [ ] Los 7 tests no negociables pasando en CI con Testcontainers
- [ ] Ningún endpoint accesible sin pasar por `BranchContextHolder`
- [ ] Demo funcional de punta a punta: mozo abre sesión → toma pedido → cocina lo ve → mozo cobra y divide la cuenta

---

## 7. Reglas No Negociables

Estas reglas existen porque romperlas es exactamente lo que causó las vulnerabilidades críticas de la versión anterior. No son preferencia de estilo:

1. **Ninguna query de una tabla con `branch_id` se escribe sin filtrar por `branch_id`.** Ni "por ahora", ni "lo agrego después".
2. **El rol de un `PERSON` nunca se lee de un campo suelto** — siempre desde `COMPANY_ROLE`/`BRANCH_ROLE`, nunca de `PERSON_PROFILE.role` (ver pendiente en la sección 8).
3. **Toda anulación o descuento pasa por validación de PIN + auditoría persistente en `EXCEPTION_LOG` (con motivo, monto y autorizador).** Sin excepción para "casos simples".
4. **La suscripción a un topic STOMP se valida en el `SUBSCRIBE`, no solo en el `CONNECT`.**
5. **Los tests de integración corren contra PostgreSQL real (Testcontainers), nunca H2.**
6. **Nada de `branchId` llega desde el body de un request** — siempre desde el JWT vía `BranchContextHolder`.

---

## 8. Pendientes Heredados a Resolver Temprano

Antes de escribir el modelo de `PERSON_PROFILE`, resolvé esto (está detallado en el cierre técnico de la auditoría):

- ~~`PERSON_PROFILE.role` queda redundante frente a `COMPANY_ROLE`/`BRANCH_ROLE` — se recomienda eliminarlo del modelo antes de generar la entidad JPA, no dejarlo "por si acaso".~~ **RESUELTO**: el campo `role` se eliminó de `PERSON_PROFILE`; el rol se deriva siempre de `COMPANY_ROLE`/`BRANCH_ROLE`.
- ~~El rol `OWNER` necesita ver todas las sucursales de su `company_id`, pero el JWT hoy solo lleva `branchId`. Definir si se agrega `companyId` como claim, o si `OWNER` resuelve sus sucursales con una query adicional contra `COMPANY_ROLE`.~~ **RESUELTO**: `POST /auth/switch-branch` (body `{ "branchId": "uuid" }`) emite un nuevo JWT para la sucursal elegida, validando un rol de sucursal ACTIVO; `AuthResponse` ahora incluye `availableBranches` (`{branchId, branchName, role}`) para que el OWNER elija.
- ~~Nombres de clase: usar `DiningFloor`/`DiningTable` (no `DineFloor`/`DineTable`) — así queda consistente con `Diagrama_V3.mmd`, que es la fuente de verdad.~~ **RESUELTO**: las clases se llaman `DiningFloor`/`DiningTable`.

---

## 9. Primeros Pasos

1. Crear el milestone `Alfa — 30 sept 2026` en GitHub.
2. Crear los 6 Issues de Fase 1 (Model), uno por dominio de la sección 5.
3. Resolver los 3 pendientes de la sección 8 **antes** de abrir el primer PR de `PERSON_PROFILE` — si no, hay que deshacer trabajo después.
4. Empezar por el dominio **Identidad y Roles** — todo lo demás depende de `PERSON` y `BRANCH_ROLE`.

---

*Brief vivo — si durante Alfa aparece una decisión que no está en los documentos de la sección 1, se resuelve, se documenta ahí, y recién después se continúa.*
