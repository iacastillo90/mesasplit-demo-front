# Brief de Trabajo — Hito MVP (Backend)
## LabTab Backend (Java 21 + Spring Boot 3.5.16 + PostgreSQL 16) — continuación del Hito Alfa

> Este documento es el punto de partida para quien (persona o agente) empiece a construir el backend del MVP. Si entra un desarrollador nuevo al proyecto, este archivo — más el historial de Issues, PRs y commits que genere — debería bastarle para entender cómo se trabaja acá sin necesitar una explicación verbal. Es la **continuación de `brief-trabajo-hito-alfa.md`** y el **espejo backend de `brief-trabajo-hito-MVP-mobile.md`** (app del comensal).

---

## 0. Rol y Contexto

Vas a construir el backend del hito **MVP**, fecha de entrega **31 de octubre de 2026**, continuando el backend de **Alfa** (ya implementado, en verde y cerrado). Alfa entregó el flujo operado por el staff (mozo/cocina/cobro) sobre 20 de las 29 entidades. El MVP habilita **dos frentes**:

1. **La app del comensal por QR** (Flutter nativo — APK/iOS, espejo `brief-trabajo-hito-MVP-mobile.md`) — que consume la API *guest* del backend. El comensal escanea, se une a una mesa, pide, ve su subtotal y paga lo suyo.
2. **El lado del local** — pagos reales (Mercado Pago + Transbank) y arqueo/cierre de caja con doble jornada.

Qué es el MVP según la propuesta de colaboración (ya mapeado en `Plan_MVP.docx`):

> "Arqueo y cierre de caja con doble jornada y varios turnos, modificadores y adicionales, manejo de errores y devoluciones. Y entra la interfaz del comensal, la web app por QR: escanea, se une a la mesa, pide, ve su subtotal y paga lo suyo. También los pagos reales, con Mercado Pago para partir y Transbank cuando escalemos."

La app **descargable** (App Store / Google Play) **no es de este hito**: es de *Producto terminado* (31 de diciembre), y es trabajo de `app-mobile`, no del backend.

---

## 1. Fuente de Verdad — Documentos de Referencia

No inventes decisiones de alcance, contratos o modelo de datos — todas ya están tomadas o tienen dueño claro. Ante cualquier duda, el orden de consulta es:

| Documento | Qué resuelve |
|---|---|
| `Plan_MVP.docx` | Alcance del MVP (31 oct), mapeo propuesta→capacidades, riesgos y gaps |
| `Entidades.docx` | Las 29 entidades, sus campos, enums y la arquitectura de capas |
| `Avances.docx` | Lo ya construido en Alfa: 20 entidades, endpoints, reglas no negociables, cierre |
| `brief-trabajo-hito-alfa.md` | El brief del hito anterior (convenciones, reglas, flujo de trabajo) |
| `brief-trabajo-hito-MVP-mobile.md` | Qué consume la app del comensal y qué gaps del backend detectó |
| `app-mobile/*.md` | Documentación de la app del comensal (espejo de este brief) |
| `back/api-contracts/rest-api.md` | Contratos REST: envelope `{data, meta}`, códigos de error, roles |
| `back/api-contracts/websocket-payloads.md` | Eventos STOMP y sus payloads |
| `back/07-seguridad-y-roles.md` | Roles, matriz de permisos, JWT, autorización STOMP |
| `back/10-integraciones-externas.md` | SII, Transbank, Mercado Pago, delivery (integración de gateways) |
| `LabTab-Back/src/main/java/cl/labtab/api/` | **Código real** — fuente de verdad final de DTOs, enums y endpoints |

Si un documento no cubre algo que necesitás decidir, no improvises: abrí un Issue con la etiqueta `pregunta-arquitectura` y dejalo bloqueado hasta resolverlo.

---

## 2. Alcance del MVP — Qué Entra y Qué No

### 2.1 Entra en el MVP (backend)

| Frente | Qué se construye | Prioridad |
|---|---|---|
| **Pagos reales** | Integración Mercado Pago (QR dinámico) + Transbank Webpay Plus, con patrón `PaymentGatewayStrategy`, webhook `POST /payments/webhook/{provider}` con firma HMAC, e idempotencia por `externalTransactionId` | P0 |
| **Comensal QR (gaps de API)** | Cerrar los huecos que la app del comensal necesita y que Alfa no dejó: estado de pago accesible para `GUEST` y canal de tiempo real del comensal (ver sección 8) | P0 |
| **Arqueo / cierre de caja** | Modelar `CASH_DRAWER` + `SHIFT` (doble jornada, varios turnos, arqueo de apertura/cierre), del lado del local | P0 |
| **Modificadores/adicionales** | Ya existen en Alfa (`ORDER_LINE.modifiers`, JSONB). Solo robustecer si el flujo del comensal lo exige | P1 |

### 2.2 NO entra en el MVP (queda post-MVP)

- **App descargable** (App Store / Google Play) → *Producto terminado*, 31 dic, trabajo de `app-mobile`.
- **Capacidades "extra" del modelo** (post-MVP): Reservas (`RESERVATION`), S.O.S. (`SERVICE_REQUEST`), Feedback (`DINE_FEEDBACK`), Favoritos (`FAVORITE`), DTE/SII (`TAX_DOCUMENT`, `SII_CAF_POOL`), inventario (`STOCK_ITEM`, `RECIPE_INGREDIENT` — va en 1ra versión, 30 nov), RRHH/Ley 40 horas, What-if.
- **Multi-idioma / dark mode** → fases posteriores.

Si mientras trabajás te encontrás necesitando algo de esta lista para que el MVP funcione, abrí un Issue `pregunta-arquitectura` antes de improvisar un atajo.

---

## 3. Flujo de Trabajo en GitHub

Idéntico al de Alfa (ver `brief-trabajo-hito-alfa.md` sección 3):

- Ramas: `main` (protegida) + `feature/<issue>-<slug>`; una rama por Issue, se borra al mergear.
- Un Issue = una unidad de trabajo mergeable por separado. Etiquetas `capa:*`, `dominio:*` (pago, caja, comensal), `pregunta-arquitectura`, `bloqueado`.
- Un PR = un Issue. `main` exige build verde (CI) + tests + al menos una revisión.
- Milestone: **`MVP — 31 oct 2026`** en GitHub.

---

## 4. Convención de Commits

Igual que Alfa (sección 4 de `brief-trabajo-hito-alfa.md`): `<tipo>(<capa>): <resumen en español, imperativo>` con cuerpo que explique el PORQUÉ, y `Refs: #<issue>`. Tipos: `feat` `fix` `refactor` `test` `docs` `chore` `security` `perf`. Capas: `model` `dto` `repository` `service` `service-impl` `mapper` `controller` `security` `websocket` `audit` `config` `test`.

### 4.1 Directiva: Zero-Trust (dinero solo en el backend)

> **Zero-Trust**: el backend es la **única fuente de verdad de dinero**. Precio, subtotal, split, saldo, propina y total se calculan siempre en el backend. Los clientes (app del comensal, front del local) solo **muestran** lo que el backend devuelve. Nunca se confía en un `unitPrice` o `totalAmount` que llegue en el body de un request.

Esta directiva ya se cumple en Alfa (`createOrder` snapshotea el precio desde `DISH`); el MVP la extiende a pagos y arqueo.

---

## 5. Orden de Implementación

Orden por **capa completa** (Model → DTO → Repository → Service → ServiceImpl → Mapper → Controller → Transversales → Test), igual que Alfa, pero con los dominios MVP ordenados por dependencia:

```
Fase 0 — Decisiones            (1 issue: resolver sección 8 — canal GUEST, modelo de arqueo/caja, estado de pago)
Fase 1 — Pagos reales          (gateway strategy + Mercado Pago + Transbank + webhook HMAC + idempotencia)
Fase 2 — Arqueo / caja         (CASH_DRAWER + SHIFT: model, DTO, repository, service, controller, tests)
Fase 3 — Comensal QR (gaps)    (estado de pago para GUEST + canal de tiempo real)
Fase 4 — Test y polish         (integración de gateways en sandbox, tests de arqueo y de flujo comensal)
```

- **Fase 0** es bloqueante: sin resolver el canal GUEST y el modelo de arqueo, las fases 2 y 3 no pueden planificarse con precisión.
- **Fase 1** (pagos reales) es el cuello crítico: tanto el comensal (paga) como el local (recibe) dependen de él.
- **Fases 1 y 2** son independientes entre sí y pueden avanzar en paralelo.

---

## 6. Definition of Done

**Por Issue:**
- [ ] Compila sin warnings
- [ ] Sigue la convención de commits de la sección 4
- [ ] PR mergeado a `main` con al menos una revisión
- [ ] Si la capa es `service-impl` o `controller`: tiene al menos un test

**Por el hito MVP (backend) completo:**
- [ ] Comensal: escanea QR → se une → ve menú → pide → ve subtotal → paga lo suyo (demo punta a punta contra el backend real)
- [ ] Pagos reales en sandbox (Mercado Pago; Transbank al escalar), con idempotencia verificada (409 ante duplicado)
- [ ] Webhook de pagos con firma HMAC verificada
- [ ] Arqueo/cierre de caja funcional con doble jornada y turnos
- [ ] El canal de tiempo real del comensal resuelto (polling o STOMP por sesión) y documentado
- [ ] Zero-trust verificado: ningún total se calcula en el cliente
- [ ] Tests de integración contra PostgreSQL real (Testcontainers), nunca H2

---

## 7. Reglas No Negociables

Se heredan las 6 de Alfa (ver `brief-trabajo-hito-alfa.md` sección 7), y se suman:

1. **Ninguna query de tabla con `branch_id` sin filtrar por `branch_id`.**
2. **El rol nunca se lee de un campo suelto** — siempre de `COMPANY_ROLE`/`BRANCH_ROLE`.
3. **Toda anulación, descuento, reembolso o arqueo pasa por validación de PIN + auditoría persistente en `EXCEPTION_LOG` (con motivo, monto y autorizador).**
4. **La suscripción STOMP se valida en `SUBSCRIBE`**, no solo en `CONNECT`.
5. **Tests de integración contra PostgreSQL real (Testcontainers), nunca H2.**
6. **Nada de `branchId` llega desde el body** — siempre del JWT vía `BranchContextHolder`.
7. **Zero-Trust**: el dinero (precio, subtotal, split, saldo, total) lo calcula solo el backend; el cliente nunca es fuente de verdad.
8. **El comensal nunca crea una sesión**: `guest-session` solo une a una sesión `OPEN` existente (409 `SESSION_NOT_OPEN` si no hay).
9. **Todo pago real es idempotente**: `externalTransactionId` único + `@Version` en `BILL`; un duplicado devuelve 409, nunca doble cobro.
10. **El webhook de pagos verifica la firma HMAC del gateway**; nunca se confía en un `permitAll` sin firma.

---

## 8. Pendientes Heredados a Resolver Temprano

Antes de planificar las fases 2 y 3, resolvé esto (verificado contra el código del back y señalado por `brief-trabajo-hito-MVP-mobile.md`):

- **Canal de tiempo real del GUEST (gap crítico).** El backend publica en `/topic/branch/{branchId}/kitchen|radar|pos|alerts`, y `StompAuthInterceptor` bloquea a `GUEST` en `/topic/branch/*`. **No existe un topic por sesión para el comensal.** Opciones (vía `pregunta-arquitectura`): (a) agregar `/topic/session/{sessionId}/client` + autorización `GUEST` en el interceptor, o (b) arrancar con polling (`GET /sessions/{sessionId}/orders`) y sumar STOMP después. **No inventar** el topic en el contrato hasta que exista en el back.

- **Estado de pago para `GUEST` (gap).** `GET /payments/{paymentId}` es `STAFF+`, no `GUEST`; pero la app del comensal lo necesita para verificar `COMPLETED` tras el checkout. Hay que hacer accesible el estado de pago al `GUEST` (restringido a su propio pago/bill, con `enforceGuestSession`), o exponer un endpoint de estado específico.

- **Arqueo/caja (`CASH_DRAWER`/`SHIFT`).** La propuesta lo pide en el MVP, pero **no existe entidad** en el modelo de 29 ni en el back. Es gap de arquitectura: hay que modelar `CASH_DRAWER` (apertura/cierre, arqueo) + `SHIFT` (turno/doble jornada) antes de implementar.

- **Webhook de pagos.** `POST /payments/webhook/{provider}` quedó declarado MVP (el `permitAll` se eliminó). El flujo real (Mercado Pago con `externalTransactionId` + idempotencia 409, Transbank commit) debe confirmarse contra `10-integraciones-externas.md`. No asumir endpoints que no existen.

---

## 9. Primeros Pasos

1. Crear el milestone `MVP — 31 oct 2026` en GitHub.
2. Resolver los 4 pendientes de la sección 8 con el dueño del producto/back **antes** de planificar las fases 2 y 3.
3. Crear el Issue de Fase 0 (decisiones) y de Fase 1 (pagos reales).
4. Empezar por **pagos reales** (Fase 1): es el cuello crítico del que dependen el comensal y el local.

---

*Brief vivo — si durante el MVP aparece una decisión que no está en los documentos de la sección 1, se resuelve, se documenta ahí, y recién después se continúa.*
