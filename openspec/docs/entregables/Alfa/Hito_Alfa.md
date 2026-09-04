# Hito Alfa — Plan de Implementación del Backend

> **LabTab v3** · Java 21 + Spring Boot 3.3.x + PostgreSQL 16
> Fecha objetivo: **30 de septiembre de 2026**
> Rol del documento: plan maestro de implementación. La fuente de verdad funcional son los
> documentos de `openspec/docs/` (sección 1 del brief). Este archivo refleja el *entendimiento*
> de esos documentos y el *orden* en que se ejecutarán. No introduce decisiones nuevas.

---

## 1. Contexto y Regla de Oro

El backend de Alfa se construye desde cero para cerrar, de forma verificable, las 3
vulnerabilidades críticas encontradas en la auditoría de las versiones anteriores
(V0 Node / V1 Python):

1. Accesos sin aislamiento por sucursal.
2. Escalación de rol.
3. Pagos sin control de concurrencia.

**La arquitectura ya está resuelta.** No se inventa: se implementa al pie de la letra.
Ante cualquier duda no cubierta por los documentos, se abre un Issue con etiqueta
`pregunta-arquitectura` y queda `bloqueado` hasta resolverlo. No se improvisa un atajo.

---

## 2. Fuente de Verdad (orden de consulta)

| # | Documento | Qué resuelve |
|:--|:--|:--|
| 1 | `Diagrama_V3.mmd` | 29 entidades, campos, tipos, PK/FK — modelo de datos completo |
| 2 | `rest-api.md` | 46 endpoints REST, request/response, roles, códigos de error |
| 3 | `websocket-payloads.md` | 11 eventos STOMP en tiempo real |
| 4 | `06-arquitectura-backend.md` | Stack, paquetes Java, `pom.xml`, `application.yml` |
| 5 | `06b-modelo-datos-y-migraciones.md` | Flyway, mapeo Java↔PostgreSQL, constraints, índices |
| 6 | `07-seguridad-y-roles.md` | Roles, matriz de permisos, JWT, PIN, `BranchContextHolder`, STOMP |
| 7 | `08-flujos-criticos.md` | 5 flujos complejos + estrategia de testing (7 tests no negociables) |
| 8 | `09-infraestructura-aws.md` | Docker Compose, Nginx, despliegue, backups |
| 9 | `00-ecosistema-maestro-sdd.md` | Reglas de negocio de producto (Escudo de Alergias, Course Control, etc.) |

---

## 3. Alcance de Alfa

Alfa = **flujo del local operado por el staff** (mozo, cocina, cobro). El comensal por QR es
de MVP, no de Alfa — en Alfa es el mozo quien crea la sesión y toma el pedido.

### Entran en Alfa — 20 de las 29 entidades

| Dominio | Entidades |
|:--|:--|
| Identidad y Roles | `PERSON`, `PERSON_PROFILE`, `COMPANY`, `COMPANY_ROLE`, `BRANCH`, `BRANCH_ROLE` |
| Piso y Mesas | `DINING_FLOOR`, `MAP_ZONE`, `DINING_TABLE` |
| Sesión y Comensales | `DINE_SESSION`, `DINE_GUEST` |
| Menú | `MENU_SECTION`, `DISH` |
| Comanda y Cocina | `ORDER`, `ORDER_LINE`, `KITCHEN_TICKET` |
| Cuenta, Cobro y Auditoría | `BILL`, `BILL_LINE`, `PAYMENT`, `EXCEPTION_LOG` |

### No entran en Alfa (quedan para MVP en adelante)

`TAX_DOCUMENT`, `SII_CAF_POOL`, `PAYMENT_METHOD`, `RESERVATION`, `SERVICE_REQUEST`,
`DINE_FEEDBACK`, `FAVORITE`, `STOCK_ITEM`, `RECIPE_INGREDIENT`.

> Si durante el trabajo aparece la necesidad de una de estas 9 entidades, es señal de alcance
> difuso → Issue `pregunta-arquitectura` antes de improvisar.

---

## 4. Las 6 Reglas No Negociables

Son la razón de ser del proyecto (romperlas = repetir las vulnerabilidades de la auditoría):

1. **Ninguna query sobre una tabla con `branch_id` se escribe sin filtrar por `branch_id`.**
   Ni "por ahora", ni "lo agrego después".
2. **El rol de un `PERSON` nunca se lee de un campo suelto.** Siempre desde
   `COMPANY_ROLE` / `BRANCH_ROLE`, nunca de `PERSON_PROFILE.role`.
3. **Toda anulación o descuento pasa por validación de PIN + auditoría persistente en EXCEPTION_LOG (con motivo, monto y autorizador).** Sin excepción.
4. **La suscripción a un topic STOMP se valida en el `SUBSCRIBE`, no solo en el `CONNECT`.**
5. **Los tests de integración corren contra PostgreSQL real (Testcontainers), nunca H2.**
6. **Nada de `branchId` llega desde el body de un request.** Siempre desde el JWT vía
   `BranchContextHolder`.

---

## 5. Convención de Commits

```
<tipo>(<capa>): <resumen corto, en español, modo imperativo>

<Cuerpo: 2-5 líneas — QUÉ se construyó y POR QUÉ esa decisión, qué alternativa
se descartó, y qué documento de arquitectura lo respalda>

Refs: #<issue>
```

- **Tipos:** `feat` `fix` `refactor` `test` `docs` `chore` `security` `perf`
- **Capas:** `model` `dto` `repository` `service` `service-impl` `mapper` `controller`
  `security` `websocket` `audit` `config` `test`
- Cada commit explica una **decisión**, no solo describe un cambio.

### Flujo de trabajo GitHub

- `main` protegida — solo PR aprobado con checks en verde.
- Rama por Issue: `feature/<n°issue>-<slug>` (se borra al mergear).
- **1 PR = 1 Issue** (nunca mezclar Issues, aunque sean chicos).
- Milestone: `Alfa — 30 sept 2026`.

---

## 6. Orden de Implementación — Las 9 Fases

Orden **por capa completa**, no por dominio: se cierra toda una capa en los 6 dominios antes
de pasar a la siguiente. Así el modelo de datos queda 100% resuelto y validado antes de
escribir lógica de negocio.

**Ajuste de orden registrado en el brief:** `Repository` va **antes** que `Service`/`ServiceImpl`
(no después). Motivo: `ServiceImpl` inyecta el repository para compilar; si el repository no
existe, el commit no compila.

### Los 6 dominios (orden de menor a mayor dependencia)

1. **Identidad y Roles** — `PERSON`, `PERSON_PROFILE`, `COMPANY`, `COMPANY_ROLE`, `BRANCH`, `BRANCH_ROLE`
2. **Piso y Mesas** — `DINING_FLOOR`, `MAP_ZONE`, `DINING_TABLE`
3. **Sesión y Comensales** — `DINE_SESSION`, `DINE_GUEST`
4. **Menú** — `MENU_SECTION`, `DISH`
5. **Comanda y Cocina** — `ORDER`, `ORDER_LINE`, `KITCHEN_TICKET` *(se cuentan juntos: KITCHEN_TICKET depende de ORDER)*
6. **Cuenta, Cobro y Auditoría** — `BILL`, `BILL_LINE`, `PAYMENT`, `EXCEPTION_LOG`

### Fases y entregables

| Fase | Nombre | Capa | Entregable por dominio | Nº Issues |
|:--|:--|:--|:--|:--|
| **1** | Model | `model` | Entidades JPA (`@Entity`), `BaseEntity`, mapeo de tipos (UUID, `Instant`, `BigDecimal`, `TEXT[]`, `JSONB`), enums base | 6 |
| **2** | DTO | `dto` | Records inmutables `request/` y `response/` con `@Valid` (Bean Validation) | 6 |
| **3** | Repository | `repository` | Interfaces Spring Data JPA; solo métodos de lectura filtrados por `branch_id` | 6 |
| **4** | Service (contratos) | `service` | Interfaces de servicio — separación contrato/implementación | 6 |
| **5** | Service Impl | `service-impl` | Lógica de negocio real (`@Service`); reglas de dominio en esta capa | 6 |
| **6** | Mapper | `mapper` | MapStruct `@Mapper(componentModel="spring")` — Model ↔ DTO, con ignorado explícito de campos sensibles | 6 |
| **7** | Controller | `controller` | `@RestController` + `@PreAuthorize`; recién acá se exponen los 46 endpoints | 6 |
| **8** | Transversales | `security` `websocket` `audit` `config` `common` `exception` | `SecurityConfiguration`, `JwtAuthFilter`, `JwtService`, `BranchContextHolder`, STOMP interceptor + publicadores, `GlobalExceptionHandler`, excepciones custom, configs (CORS, OpenAPI, Jackson, VirtualThreads), enums | N/A |
| **9** | Test | `test` | 7 tests no negociables de `08-flujos-criticos.md` + cobertura de aislamiento por sucursal | N/A |

---

## 7. Definition of Done

### Por Issue
- [ ] Compila sin warnings.
- [ ] Sigue la convención de commits (cada commit con su "por qué").
- [ ] PR mergeado a `main` con al menos una revisión.
- [ ] Si la capa es `service-impl` o `controller`: al menos un test.

### Por el hito Alfa completo
- [ ] Los 46 endpoints responden según `rest-api.md`.
- [ ] Las 3 vulnerabilidades críticas verificablemente cerradas (con el mismo tipo de prueba que las detectó).
- [ ] Los 7 tests no negociables en verde en CI con Testcontainers.
- [ ] Ningún endpoint accesible sin pasar por `BranchContextHolder`.
- [ ] Demo punta a punta: mozo abre sesión → toma pedido → cocina lo ve → mozo cobra y divide la cuenta.

---

## 8. Resolución de Pendientes Heredados (Sección 8 del brief)

Los 3 pendientes se resuelven **antes** del primer PR de `PERSON_PROFILE`. Detalle de la
decisión en la respuesta del agente; resumen:

1. **`PERSON_PROFILE.role` eliminado del modelo.** El rol se deriva exclusivamente de
   `COMPANY_ROLE`/`BRANCH_ROLE`; `GUEST` es dinámico (JWT), no persistido.
2. **OWNER multi-sucursal:** se agrega `companyId` como claim del JWT (opción A). Se documenta
   la excepción controlada: solo las queries de resolución de sucursales (sobre `COMPANY`/
   `COMPANY_ROLE`/`BRANCH`) filtran por `company_id`; toda query de datos operativos sigue
   filtrando por `branch_id` (Regla 1 intacta).
3. **Naming:** `DiningFloor` / `DiningTable` (nunca `DineFloor`/`DineTable`), consistente con
   `Diagrama_V3.mmd` como fuente de verdad.

---

## 9. Primeros Pasos

1. Crear milestone `Alfa — 30 sept 2026` en GitHub.
2. Crear los 6 Issues de Fase 1 (Model), uno por dominio.
3. Resolver los 3 pendientes de la sección 8 **antes** del primer PR de `PERSON_PROFILE`.
4. Empezar por **Identidad y Roles** — todo lo demás depende de `PERSON` y `BRANCH_ROLE`.

---

*Brief vivo — si durante Alfa aparece una decisión no cubierta por los documentos de la
sección 2, se resuelve, se documenta ahí, y recién después se continúa.*
