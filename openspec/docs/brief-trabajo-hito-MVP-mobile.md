# Brief de Trabajo — Hito MVP (App del Comensal)
## LabTab Mobile (Flutter 3.x + Dart) — interfaz del comensal por QR

> Este documento es el punto de partida para quien (persona o agente) empiece a construir la app del comensal del MVP. Si entra un desarrollador nuevo al proyecto, este archivo — más el historial de Issues, PRs y commits que genere — debería bastarle para entender cómo se trabaja acá sin necesitar una explicación verbal. Es el espejo mobile del `brief-trabajo-hito-alfa.md` (backend).

---

## 0. Rol y Contexto

Vas a construir la **interfaz del comensal** del hito **MVP** de LabTab, fecha de entrega **31 de octubre de 2026**, contra el backend de Alfa (ya implementado y en verde). No estás diseñando el backend ni la arquitectura de datos — ambas ya están resueltas en `openspec/docs/back/` y en el código de `LabTab-Back/` — estás implementando la capa de cara al comensal de forma ordenada, trazable y auditable.

Qué es el comensal en el MVP, según la propuesta de colaboración:

> "Entra la interfaz del comensal, la web app por QR: escanea, se une a la mesa, pide, ve su subtotal y paga lo suyo. También los pagos reales, con Mercado Pago para partir y Transbank cuando escalemos."

La **publicación en tiendas** (App Store / Google Play) **no es de este hito**: es de *Producto terminado* (31 de diciembre). En el MVP la app del comensal se entrega como **app nativa** (Flutter compilado a **Android APK** e iOS), probada mediante **APK instalado manualmente** en dispositivo — no como web app. El stack queda **Flutter + Dart** (decisión cerrada — ver sección 2.1), superando la hipótesis React Native/Expo de la propuesta.

---

## 1. Fuente de Verdad — Documentos de Referencia

No inventes decisiones de alcance, contratos o modelo de datos — todas ya están tomadas. Ante cualquier duda, el orden de consulta es:

| Documento | Qué resuelve |
|---|---|
| `Propuesta_Labtab_Ivan_Castillo.pdf` | Qué es el MVP (comensal QR + pagos reales), qué es *Producto terminado* (app descargable, dic) |
| `Plan_MVP.docx` | Alcance del MVP (31 oct), mapeo propuesta→capacidades, riesgos y gaps |
| `Entidades.docx` | Las 29 entidades, sus campos, enums y la arquitectura de capas del back |
| `Avances.docx` | Lo ya construido en Alfa: 20 entidades, endpoints, reglas no negociables, cierre |
| `back/api-contracts/rest-api.md` | Contratos REST exactos: envelope `{data, meta}`, códigos de error, roles |
| `back/api-contracts/websocket-payloads.md` | Los eventos STOMP y sus payloads |
| `back/07-seguridad-y-roles.md` | Roles, matriz de permisos, JWT, autorización STOMP |
| `app-mobile/*.md` | Documentación de la app del comensal (este brief es la puerta de entrada) |
| `LabTab-Back/src/main/java/cl/labtab/api/` | **Código real del backend** — fuente de verdad final de DTOs, enums y endpoints |

Si un documento no cubre algo que necesitás decidir, no improvises: abrí un Issue con la etiqueta `pregunta-arquitectura` y dejalo bloqueado hasta resolverlo.

### 1.1 El código del backend manda

Los docs de `back/api-contracts/` pueden quedar desactualizados respecto del código. Antes de consumir un endpoint, **leé el controller y el DTO en `LabTab-Back/src/main/java/cl/labtab/api/`**. La fuente de verdad final es el código, no la prosa.

---

## 2. Alcance del MVP — Qué Entra y Qué No

### 2.1 Stack (decisión cerrada)

**Flutter 3.x + Dart**, con `Riverpod` (estado), `go_router` (navegación), `dio` + `retrofit` (networking), `stomp_dart_client` (WebSocket), `flutter_secure_storage` (tokens).

La propuesta proponía "unificar todo en JavaScript/TypeScript con React Native y Expo" como *hipótesis, no imposición* ("eso lo fundamentas tú"). La decisión del proyecto es **mantener Flutter/Dart**: la consistencia visual dual-platform, el rendimiento compilado y la experiencia previa del equipo con Dart lo justifican. Queda documentado como decisión de arquitectura; no reabrir salvo cambio de rumbo explícito.

### 2.2 Entra en el MVP (comensal por QR)

| Feature | Descripción | Prioridad |
|---|---|---|
| QR Onboarding | Escanear QR, **unirse** a una sesión ya abierta (no la crea) | P0 |
| Ver Menú | Secciones, platos, precios, alérgenos, disponibilidad (Lista 86) | P0 |
| Hacer Pedido | Agregar platos con modificadores/adicionales, enviar a cocina | P0 |
| Seguir Estado | Estados PLACED → … → SERVED (ver sección 8, gap de tiempo real) | P0 |
| Ver Cuenta | Subtotal, servicio, propina, total, saldo | P0 |
| Pagar lo suyo | Split por comensal (summary-by-guest) + pago parcial | P0 |
| Pagos reales | Mercado Pago (partir) y Transbank/Webpay (al escalar) | P0 |
| S.O.S. (Llamar al mesero) | Botón para pedir mesero/cuenta/agua desde la mesa | P0 |
| Feedback Post-Pago | Modal de calificación 1-5 al momento de pagar | P1 |
| Manejo de errores/devoluciones | Reintento, estados de error, reembolso vía staff | P1 |
| Login/Perfil | Email + password, perfil y alérgenos | P1 |

> S.O.S. y Feedback **dependen de endpoints del backend que aún no están implementados** (solo spec en `rest-api.md` + enums). Se incluyen en el alcance con esa condición — ver sección 8.

### 2.3 NO entra en el MVP (queda post-MVP)

- **Publicación en tiendas** (App Store / Google Play) → *Producto terminado*, 31 dic. El build nativo (APK/iOS) ya se entrega en el MVP para testing manual.
- **Arqueo y cierre de caja / doble jornada / turnos** → es del lado del **local**, no del comensal; además requiere una entidad nueva en el back (gap `CASH_DRAWER`/`SHIFT`, ver sección 8). Aunque figura en el alcance MVP de la propuesta, no es trabajo de la app del comensal.
- **Capacidades "extra" del modelo** (post-MVP): Reservas (`RESERVATION`), Favoritos (`FAVORITE`), DTE/SII (`TAX_DOCUMENT`, `SII_CAF_POOL`), inventario (`STOCK_ITEM`, `RECIPE_INGREDIENT` — va en 1ra versión), RRHH/Ley 40 horas, What-if.
- **Multi-idioma / dark mode** → fases posteriores (MVP solo `es-CL`, light).

Si mientras trabajás te encontrás necesitando algo de esta lista para que el MVP del comensal funcione, abrí un Issue `pregunta-arquitectura` antes de improvisar un atajo.

---

## 3. Flujo de Trabajo en GitHub

### 3.1 Ramas

```
main                        # protegida — solo por PR aprobado, con checks en verde
└── feature/<issue>-<slug>  # una rama por Issue, ej: feature/41-menu-screen
```

Mismas reglas que el backend: una rama por Issue, `feature/<n°issue>-<slug-corto>`, se borra al mergear, `main` exige build verde + tests + al menos una revisión.

### 3.2 Issues

Un Issue = una unidad de trabajo mergeable por separado, nunca "terminar la app". Plantilla obligatoria:

```markdown
## Qué
[Qué se construye — capa + feature. Ej: "MenuScreen + MenuProvider con cache"]

## Por qué
[Qué necesidad de negocio o de contrato resuelve — referencia al documento fuente]

## Criterios de aceptación
- [ ] ...
- [ ] Sin warnings de `flutter analyze`
- [ ] Sigue la convención de nombres de 04-arquitectura-mobile.md

## Documento de referencia
[Ej: back/api-contracts/rest-api.md, GET /menu/sections + DishResponse]

## Capa
[Screen | Widget | Provider | Model | Repository | Datasource | Usecase | Service | Config | Test]
```

Etiquetas mínimas: `capa:*` (una por capa), `dominio:*` (onboarding, menu, orden, cuenta, pago, perfil), `pregunta-arquitectura`, `bloqueado`.

### 3.3 Pull Requests

Un PR = un Issue. Nunca mezclar Issues.

```markdown
## Qué cambia
[Resumen — archivos/screens/providers agregados]

## Por qué esta decisión
[El "por qué" técnico, mismo criterio que los commits, sección 4]

## Cómo probarlo
[Comandos exactos: `flutter test`, `flutter run`, o el curl contra el back]

## Checklist
- [ ] Sigue la convención de commits de la sección 4
- [ ] Respeta el envelope `{data, meta}` en los mapeos (sección 7)
- [ ] No reproduce datos del cliente en logs (sección 7)
- [ ] Tests pasando localmente
- [ ] Actualiza documentación si el comportamiento se desvía de `app-mobile/`

Cierra #<issue>
```

### 3.4 Milestone

Crear el milestone **`MVP Mobile — 31 oct 2026`** en GitHub y asignar cada Issue de este brief ahí. El % de avance del milestone es la métrica real.

---

## 4. Convención de Commits

Cada commit explica una decisión, no solo describe un cambio. `feat: agregar MenuScreen` no sirve — no dice **por qué**.

### 4.1 Formato

```
<tipo>(<capa>): <resumen corto, en español, modo imperativo>

<Cuerpo: 2-5 líneas explicando QUÉ se construyó y POR QUÉ se tomó esa
decisión — qué alternativa se descartó si aplica, y qué documento/contrato
lo respalda>

Refs: #<issue>
```

**Tipos:** `feat` `fix` `refactor` `test` `docs` `chore` `security` `perf`
**Capas:** `screen` `widget` `provider` `model` `repository` `datasource` `usecase` `service` `config` `test`

### 4.2 Ejemplos reales

```
feat(datasource): agregar MenuApi con retrofit

Genera el cliente tipado para GET /menu/sections y GET /menu/dishes/{id}.
Se deserializa el envelope ApiResponse<T> (data + meta): el mapper NO
lee la respuesta plana, sino response.data, porque el backend envuelve
todo en {data, meta}. Leer la raíz plana rompería el parseo en runtime.

Refs: #42
```

```
feat(repository): agregar GuestRepository.guestOnboarding

POST /auth/guest-session solo UNE al comensal a una sesión OPEN ya
existente: si la mesa no tiene sesión abierta, el back responde 409
SESSION_NOT_OPEN. El repository traduce ese 409 a un error de dominio
"la mesa aún no está habilitada por el staff", no intenta crear sesión
desde la app — eso es responsabilidad del mozo (hito Alfa).

Refs: #41
```

```
fix(provider): separar estado de cuenta por comensal

summary-by-guest lo calcula el backend (zero-trust). La app solo muestra
lo que el back devuelve; el cálculo local de división se eliminó porque
duplicaba una regla de negocio que ya vive en BillService y podía
desincronizarse del redondeo CLP real.

Refs: #46
```

```
chore(config): fijar base URL y envelope en el cliente dio

El interceptor de errores mapea {error:{code,message}} a excepciones
tipadas. 409 = ConflictException (lock optimista / idempotencia), 422 =
BusinessRuleException. El refresh se intenta solo ante 401.

Refs: #40
```

### 4.3 Directiva: Zero-Trust en la App

> **Zero-Trust**: la app **muestra** precios y cálculos, pero **nunca es fuente de verdad** de dinero. El precio, el subtotal, el split y el saldo los calcula siempre el backend. La app solo reenvía `dishId` + `quantity` + modificadores y confía en el `unitPrice` que devuelve el back. Ningún total se calcula localmente para cobrar.

---

## 5. Orden de Implementación

Orden por **capa completa**, no por pantalla completa. Primero el contrato (model + datasource), después la lógica (repository + provider), después la UI (screen + widget). Así el mapeo del envelope queda 100% validado antes de pintar una sola pantalla.

```
Fase 1 — Setup          (1 issue: proyecto Flutter, tema, rutas, cliente dio + envelope, secure storage)
Fase 2 — Auth/Onboarding (1 issue: guest-session + login + refresh + logout)
Fase 3 — Menú            (1 issue: datasource + repository + provider + MenuScreen)
Fase 4 — Pedido          (1 issue: carrito + createOrder + OrderScreen)
Fase 5 — Cuenta y Split  (1 issue: bill + summary-by-guest + BillScreen/SplitScreen)
Fase 6 — Pago            (1 issue: payment + MercadoPago + Webpay + estado de pago)
Fase 7 — Tiempo real     (1 issue: WebSocket/STOMP o polling — sujeto a sección 8)
Fase 8 — S.O.S. y Feedback (1 issue, condicional: bloqueado hasta que el back exponga los endpoints — ver sección 8)
Fase 9 — Test y polish   (1 issue: unit + widget + integration + perf)
```

Cada fase = un Issue con criterios de aceptación propios. El orden es de menor a mayor dependencia de negocio. Las fases 7 y 8 dependen de decisiones/implementaciones del backend (gap GUEST y endpoints de S.O.S./Feedback), no solo de la app.

---

## 6. Definition of Done

**Por Issue:**
- [ ] `flutter analyze` sin warnings
- [ ] Sigue la convención de commits de la sección 4
- [ ] PR mergeado a `main` con al menos una revisión
- [ ] Si toca `datasource` o `repository`: tiene al menos un test del mapeo (envelope incluido)

**Por el hito MVP Mobile completo:**
- [ ] Comensal escanea QR → se une → ve menú → pide → ve su subtotal → paga lo suyo (demo punta a punta)
- [ ] Pagos reales en sandbox (Mercado Pago; Transbank al escalar)
- [ ] La app nunca cobra con un total calculado localmente (zero-trust verificado)
- [ ] El envelope `{data, meta}` y los códigos de error se respetan en todos los mapeos
- [ ] Ningún token ni dato sensible en logs

---

## 7. Reglas No Negociables

1. **Todo mapeo de respuesta deserializa el envelope `ApiResponse<T>`** (`data` + `meta`), nunca la raíz plana.
2. **La app nunca calcula dinero para cobrar**: precio, subtotal, split, saldo y total vienen del backend.
3. **Ningún `branchId` ni `dineSessionId` se inventa en la app**: se toman del JWT (guest) o de la respuesta de `guest-session`.
4. **Los tokens viven en `flutter_secure_storage`** (Keystore/Keychain), nunca en `SharedPreferences`.
5. **No se loguean passwords, PINs, tokens ni datos de tarjeta.** Los `externalTransactionId` los genera el gateway/back, no la app.
6. **El comensal nunca crea una sesión**: `guest-session` solo une a una sesión OPEN existente (409 si no hay).
7. **Tests de integración contra backend real** (o mock server con contratos fijos), nunca mocks de payloads inventados.

---

## 8. Pendientes Heredados a Resolver Temprano

Antes de escribir la primera pantalla, resolvé esto (está verificado contra el código del back):

- **Canal de tiempo real del GUEST (gap crítico)**. Hoy el backend publica todo en `/topic/branch/{branchId}/kitchen|radar|pos|alerts`, pero `StompAuthInterceptor` bloquea a `GUEST` en cualquier destino que empiece por `/topic/branch/` (`GUEST` solo puede suscribirse a destinos que **no** empiecen por `/topic/branch/`). **No existe un topic de sesión para el comensal.** El flujo de "seguir estado en tiempo real" del MVP depende de esta decisión. Opciones a resolver vía `pregunta-arquitectura`: (a) agregar un topic por sesión (`/topic/session/{sessionId}/client`) + autorización GUEST en el interceptor, o (b) arrancar con polling (`GET /sessions/{sessionId}/orders`) y sumar STOMP cuando el back lo habilite. **No inventar** el topic `/topic/session/{sessionId}/client` en el contrato mobile hasta que exista en el back.

- **Arqueo/caja (`CASH_DRAWER`/`SHIFT`)**. La propuesta lo pide en el MVP, pero no existe entidad en el modelo de 29 ni en el back. Es gap de arquitectura y **es del lado del local**, no del comensal. No bloquea la app del comensal, pero hay que dejarlo señalado para el front del local.

- **Webhook de pagos**. `POST /payments/webhook/{provider}` quedó declarado MVP (el `permitAll` se eliminó). El flujo de pago real del comensal debe confirmarse contra el back (Mercado Pago con `externalTransactionId` + idempotencia 409). No asumir un endpoint `/payments/confirm` que no existe.

- **S.O.S. (`SERVICE_REQUEST`) y Feedback (`DINE_FEEDBACK`) — dependencia de backend**. Están en el modelo de 29 entidades y con enums preparados (`ServiceRequestStatusEnum`, `ServiceRequestTypeEnum`), pero **no hay** entidad JPA, repositorio ni controller en `LabTab-Back` (solo contrato en `rest-api.md`). Los endpoints `POST /service-requests` y `POST /feedback` hay que implementarlos en el back o acordar su postergación **antes** de construir esas pantallas. La app puede ir contra la spec, pero queda bloqueada en runtime hasta que existan.

---

## 9. Primeros Pasos

1. Crear el milestone `MVP Mobile — 31 oct 2026` en GitHub.
2. Resolver el **gap del canal GUEST (sección 8)** con el dueño del back **antes** de planificar la Fase 7 — define si el MVP arranca con polling o con un topic nuevo.
3. Crear el Issue de Fase 1 (Setup) y de Fase 2 (Auth/Onboarding).
4. Empezar por **Auth/Onboarding**: `guest-session` + `login` + `refresh`, porque todo lo demás cuelga del JWT (guest o persona).

---

*Brief vivo — si durante el MVP aparece una decisión que no está en los documentos de la sección 1, se resuelve, se documenta ahí, y recién después se continúa.*
