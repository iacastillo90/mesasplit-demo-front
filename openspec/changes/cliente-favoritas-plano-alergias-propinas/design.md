# Design: Dominio Cliente — Favoritas, Plano de Piso, Escudo de Alergias y Propinas

Cambio: `cliente-favoritas-plano-alergias-propinas`
Specs: `branch-identity`, `client-favorites`, `floor-map-table-intent`, `allergy-shield`, `tip-history`
Contrato ER: `openspec/docs/Diagrama_V2.mmd`
Modo: `openspec` · Delivery: `auto-forecast` (5 chained PRs ≤ 600 líneas) · Strict TDD: TRUE

---

## 1. Contexto

El dominio Cliente hoy es 100 % frontend (React + Vite + Tailwind + Zustand + Vitest) sobre fixtures en `src/mocks`. El backend Java es el objetivo final y solo existe como ER v2. Hallazgos verificados en el codebase:

- **Identidad de sucursal dividida**: `lo-ovalle/providencia/vitacura` (`WhatsAppReservationChatModal.jsx:11,21,31`) vs `b-1/b-2/b-3` (`useReservationStore.js:16,27,38`, `FranchiseComparisonWidget.jsx:13,23,33`). Advertencia de spec: `b-1/b-2/b-3` en `usePosStore.js`/`posService.js` son **mesas POS** (tableNumber), NO sucursales: no se migran.
- **Disputa de identidad real**: el universo cliente tiene **3 sucursales** (Lo Ovalle/San Miguel, Providencia, Vitacura); el universo reservas/corporativo usa Providencia, **Santiago Centro**, Vitacura con direcciones distintas (Providencia 1234 vs 2150). Son mundos que NO coinciden 1:1; la normalización debe declarar equivalencias y no colapsar sucursales distintas por nombre aproximado.
- **Alergias**: perfil con flags booleanos (`glutenFree/lactoseFree/nutAllergy` en `ClientProfilePage.jsx:96-98`, useState muerto) vs menú con strings en español (`menu.json`: `gluten`, `lácteos`, `frutos secos`, `huevo`, `pescado`, `sésamo` — exactamente 6 valores que ya cubren el enum). `glutenFree:true` en el menú es **filtro dietético** (`menuFilters.js:13`), NO alergia: no debe migrar al enum. KDS hardcodea `maní` (`OrderPad.jsx:344`, `AllergyShieldAlert`).
- **Historial de pagos**: hardcodeado en `ClientProfilePage.jsx:521-593` (ids ficticios `b-101..b-103`, sin tip_amount). `DteTicketModal` consume `ticketData` y se reutiliza.
- **Patrón de datos**: `FeaturePage → services → mockFetch('/api/<recurso>') → mocks/*.json` (`mockFetch.js`). Stores Zustand con `persist` (`useClientStore`, clave `mesasplit-client`, `partialize`). `mockFetch` rechaza recursos desconocidos (404) — los nuevos recursos se registran en `RESOURCES`.
- **Mesa virtual demo**: Mesa 12 de Restô Lo Ovalle; `tableContext.js` usa `code: '4F2K'` (a alinear a `qr_token`); `ClientQrScanPage` usa códigos `M12-A9F`/`M05-B12`.

Estrategia general: el front es el consumidor/contrato de hoy y se implementa completo (5 slices); el backend Java se define aquí con stack decidido (sección 3), entidades y contratos (sección 4) y runner de tests (sección 6). El alcance de *construir* el backend (vs. solo contrato) queda como decisión de entrega (sección 10, pregunta 1); la recomendación es arrancar su scaffold en el Slice 1 porque elimina el riesgo HIGH de la proposal.

---

## 2. Decisiones de Arquitectura

### D1 — Stack backend Java

| Opción | Tradeoff | Decisión |
|---|---|---|
| **Spring Boot 3.3 + Java 21 LTS** | Madurez enterprise, ecosistema gigante, Spring Security, testing maduro; cold start mayor (irrelevante en REST de sucursal) | **Elegido** |
| Quarkus / Micronaut | Mejor cold start/serverless; ecosistema y contratación más chica para gastronomía | Rechazado: el dominio no es serverless y la madurez pesa más |
| Javalin/Spark minimalista | Liviano; reinventa auth, validación y testing | Rechazado |
| **Spring Data JPA (Hibernate 6)** | Mapea FKs/relaciones del ER v2 con menos código; soporta CHECK/JSON de MySQL vía converter | **Elegido** |
| jOOQ | Control SQL total; boilerplate alto para CRUD estándar de catálogo | Rechazado para este dominio |
| MyBatis | SQL explícito; más mantenimiento en entidades de catálogo | Rechazado |
| **Flyway** | Versionado SQL declarativo, integración nativa con Spring Boot | **Elegido** |
| Liquibase | Más features; XML/YAML verboso | Rechazado |
| **JUnit 5 + Testcontainers (MySQL 8 real)** | Mismo motor que producción; elimina falsos verdes por diferencias H2/MySQL (JSON, CHECK) | **Elegido** |
| H2 en modo MySQL | Veloz; divergencias silenciosas con el motor real | Rechazado para integración |

DB: **MySQL 8** (JSON de MySQL para `opening_hours`/layout/`allergies`/`allergens`, `decimal` y CHECK soportado desde 8.0.16; dialecto MySQL en Flyway y Testcontainers).

Consecuencias: contrato de implementación Java = `com.mesasplit` con paquetes por capability (`branch`, `favorite`, `floor`, `profile`, `payment`), un módulo Maven (`mesasplit-api`), migraciones Flyway `V1__schema.sql`… ; costo por pieza en sección 3.

### D2 — Identidad de sucursal canónica (branch_id UUID)

| Decisión | Justificación |
|---|---|
| `branch_id` = **UUID v5 determinístico** (namespace DNS estándar + slug) | Estable entre builds y tests; reproducible; sin generador manual en fixtures |
| Canon del demo = **4 sucursales** | Evidencia: universo cliente (Lo Ovalle, Providencia, Vitacura) + universo corporativo (Santiago Centro) son reales y distintos; no se colapsan por nombre |
| Equivalencias **declaradas** (no inferidas): `providencia≡b-1`, `vitacura≡b-3` | Cumple biyectividad a nivel de *sucursal real*; la suite de unicidad la verifica |
| Mapa de legado en `src/shared/constants/branches.js` con throw en id desconocido | CLI-BRN-002 escenario "id legado desconocido" → error explícito, sin default silencioso |
| `b-1/b-2/b-3` de POS quedan intactos | Son mesas POS (spec comment) |

UUIDs canónicos (v5, verificables en tests):

| Sucursal | IDs legados | branch_id |
|---|---|---|
| Restô Lo Ovalle | `lo-ovalle` | `9bd8aff1-cdef-550b-8517-82041c7cdf21` |
| Restô Providencia | `providencia`, `b-1` | `4dcbae2f-68a5-550b-a4dd-e739b02be2f9` |
| Restô Vitacura | `vitacura`, `b-3` | `c2947df9-82c0-5651-a690-350b84fdc108` |
| Santiago Centro (Salón Histórico) | `b-2` | `b039aa0f-c6ef-57b6-b559-a647502de1de` |

Persona demo (pagador del historial): Constanza Silva `4984f52f-2b6f-5b0d-8332-30f025776475`.

### D3 — Enum ALLERGEN compartido

| Decisión | Justificación |
|---|---|
| Backend: `enum Allergen { GLUTEN, LACTEOS, FRUTOS_SECOS, HUEVO, PESCADO, SESAMO }` persistido como **string canónico** (nombre del enum) en `PERSON_PROFILE.allergies` y `DISH.allergens` (columnas JSON en MySQL 8) | Un solo vocabulario serializado; Jackson expone el nombre canónico |
| Front: `src/shared/constants/allergens.js` con el mismo código + `LABELS` de display + `normalizeAllergen(raw)` | El contrato front-backend comparte string canónico; el display localiza en español |
| Mapeo legado: `glutenFree→GLUTEN`, `lactoseFree→LACTEOS`, `nutAllergy`/`maní→FRUTOS_SECOS`, strings normalizados (`"lácteos"→LACTEOS`) | Cumple CLI-ALG-002 |
| `glutenFree` del **menú** NO migra al enum (queda filtro dietético); el cruce usa `allergens` | Evita falsear alergia donde el plato declara "libre de" |
| Valor fuera del enum → error de validación | CLI-ALG-001 |

### D4 — Intención efímera de mesa

| Decisión | Justificación |
|---|---|
| Estado transitorio `tableIntent` en store Zustand **NO persistente** (sin `persist`, sin localStorage) | CLI-MAP-004: recarga limpia la intención |
| Elección SOLO si `DINE_TABLE.status === 'available'`; mapeo de status: `free→available`, `billing/occupied/waiting_food/bill_requested→occupied`, `cleaning→cleaning`, `reserved→reserved` (mesa con reserva previa; NO elegible porque guarded `status !== 'available'`; render explícito como color/estado distinto en el plano) | CLI-MAP-006/001; el `status` del plano SIEMPRE refleja el estado real |
| Timeout configurable (default 2 min) con `fake timers` en test; revierte también al salir de la vista (cleanup de unmount) y por cancelación | CLI-MAP-003 |
| Overlay visual **distinto** para "elegida/por ocupar" vs "ocupada" | Mitiga confusión intención↔ocupación (riesgo de proposal) |
| Asociación real SOLO por `qr_token`: resuelve `branch_id` + mesa y abre `DINE_SESSION`; reescaneo retoma sesión existente | CLI-MAP-005/007 |
| Concurrencia (dos clientes eligen la misma mesa): la intención es local-first; si el estado real pasa a `occupied` antes de expirar, la intención se revierte (el plano refresca el estado real por polling ligero del store) | CLI-MAP-006 escenario "ocupada durante la intención"; el contrato backend con TTL server-side queda como extensión (sección 10, pregunta 2) |

### D5 — Read-model tip-history derivado

| Decisión | Justificación |
|---|---|
| **Sin tabla nueva**: query en lectura `PAYMENT WHERE person_id=? AND status='completed' AND tip_amount>0 ORDER BY paid_at DESC` | CLI-TIP-001/007; refleja cambios del pago sin migración |
| Entrada: `paid_at`, `method`, `tip_amount`, `% = tip_amount/total_amount` (redondeo 2 decimales, `Math.round(x*100)/100`), `bill_id` | CLI-TIP-003/006; `total_amount=0 → 0%` sin error |
| Front: función pura `computeTipHistory(payments, personId)` (filtra+ordena+calcula) | Testeable vitest RED primero; el servicio mock `/api/payments` expone el seed demo |
| Seed demo con `tip_amount` (completed con tip, refunded excluido, anónimo excluido, completed tip=0 excluido) | Mitiga el riesgo "fixtures sin tip_amount → historial vacío" |
| `BILL.tip_total` NO se usa (es agregado de cuenta, no por persona) | Spec comment |

### D6 — Contrato front-backend y persistencia

| Decisión | Justificación |
|---|---|
| `mockFetch` es el **stand-in del backend**: se registran `/api/branches` (cada sucursal expone `isFavorite` del usuario autenticado), `/api/me/favorites`, `/api/tables`, `/api/payments`, `/api/profile`; la forma de cada fixture = forma del JSON del contrato Java (mismos nombres de campo que ER v2) | Cuando exista el backend, front solo cambia la capa de servicios, no stores/UI |
| Identidad del cliente demo: `person_id` canónico en `useClientStore.user` (`X-Person-Id` en contrato HTTP) | CLI-FAV-005: anónimo (user null) → toggle bloqueado + solicitud de identificación |
| Favoritas: store Zustand **persistente** (nuevo `useFavoritesStore` o slice con `partialize`) | CLI-FAV-006: sobreviven a la recarga |
| Perfil de alergias: `PERSON_PROFILE.allergies` persistido (slice en `useClientStore` o perfil propio con `persist`) | CLI-ALG-003: guardar y recargar |

---

## 3. Stack propuesto (justificación y costo)

| Pieza | Elección | Por qué / costo de implementación |
|---|---|---|
| Idioma/runtime | Java 21 (LTS) | Soporte largo, records/pattern matching reducen boilerplate de DTOs |
| Framework | Spring Boot 3.3 | Auto-config, starters, community; costo: scaffold ~1 evento |
| Persistencia | Spring Data JPA + Hibernate 6 | Relaciones ER v2 (FKs) directas; converters para JSON de MySQL (opening_hours/layout, allergens/allergies) |
| Migraciones | Flyway | `V1__schema.sql` (26 entidades), `V2__seed_branches.sql` (4 sucursales con UUID v5), `V3__seed_demo.sql` (menú/platos/mesas con qr_token, PAYMENTs con tip, perfil con allergies) |
| DB | MySQL 8 | JSON + CHECK (8.0.16+) + decimal del ER v2 |
| Tests | JUnit 5 + Testcontainers (MySQL 8) + MockMvc/RestAssured | RED-GREEN de repositorios y endpoints contra motor real; costo: arranque de contenedor en CI |
| Seguridad (mínima) | Spring Security, header `X-Person-Id` en modo demo | Auth completa queda fuera de scope; suficiente para CLI-FAV-005 |

Costo estimado de implementación backend (si el orquestador lo incluye): scaffold + migraciones ≈ 1 día; FAVORITE + branch ≈ 0.5; plano/intención + DINE_SESSION ≈ 1; perfil/alergias ≈ 0.5; read-model PAYMENT ≈ 0.5 (días-hombre demo).

---

## 4. Diseño por capability

> Entidades ER v2 tocadas: `BRANCH`, `FAVORITE`, `DINE_TABLE`, `DINE_FLOOR`/`MAP_ZONE` (referencia de zonas), `DINE_SESSION`, `PERSON_PROFILE`, `DISH`, `PAYMENT`, `BILL` (ref.), `PERSON`.

### 4.1 branch-identity (CLI-BRN-001..005)

- **Front**: `src/shared/constants/branches.js` → `BRANCH_IDS` (slug→UUID), `LEGACY_BRANCH_MAP` (id-viejo→UUID, biyectivo a nivel de sucursal), `resolveBranchId(id)` (throw en desconocido), `branchIdToLegacy(uuid)` (inverso al id primario). Fixtures migrados al UUID: `INITIAL_BRANCHES`, `INITIAL_STORE_RESERVATIONS.branchId` (`useReservationStore.js`), `BRANCHES_DATA` (`WhatsAppReservationChatModal.jsx`), `FRANCHISE_BRANCH_METRICS` (`FranchiseComparisonWidget.jsx`), bloque "Locales Registrados" de `ClientProfilePage` (display). `tables.json` gana `branch_id` y `qr_token` por mesa (necesario para CLI-BRN-004); `tableContext.js` alinea `code`→`qr_token` de la Mesa 12.
- **API (contrato Java)**:
  ```
  GET /api/branches          → [{ id, name, district, city, address, phone, service_charge_pct, timezone, opening_hours, table_grid_rows, table_grid_cols }]
  GET /api/branches/{branchId}/tables → [{ id, name, zone, capacity, status, qr_token, position_x, position_y, shape }]
  ```
- **Backend JPA**: `BranchEntity` (id = `@Id` UUID), `DiningTableEntity` (FK `branch_id`, `qr_token` único indexado).

### 4.2 client-favorites (CLI-FAV-001..006)

- **API**:
  ```
  GET    /api/me/favorites  (auth)           → [{ branch_id, created_at }]  (favoritas del usuario autenticado; ORDER BY created_at DESC)
  PUT    /api/me/favorites/{branchId} (auth) → crea FAVORITE (idempotente: unique(person_id,branch_id))
  DELETE /api/me/favorites/{branchId} (auth) → no-op si no existe
  GET    /api/branches (auth vía X-Person-Id) → catálogo donde cada sucursal expone isFavorite del usuario autenticado (sin query param con personId arbitrario)
  ```
- **Backend**: `FavoriteEntity` con `@UniqueConstraint(columnNames={"person_id","branch_id"})`; repositorio `findByPersonIdOrderByCreatedAtDesc`.
- **Front**: `useFavoritesStore` (persist), toggle estrella en catálogo (`ClientPage`), `isFavorite` por sucursal; usuario null → bloqueo + solicitud de identificación.

### 4.3 floor-map-table-intent (CLI-MAP-001..007)

- **Flujo** (diagrama de secuencia):

  ```
  Cliente            Plano (store efímero)        mockFetch /api/tables        DINE_SESSION (contrato)
    │  elige mesa disponible                            │                              │
    │ ───────────────► tableIntent = { t12 }           │                              │
    │  (timeout 2min / unmount / cancelar ──► revert)  │                              │
    │  escanea qr_token (o code manual)                │                              │
    │ ─────────────────────────────────────────────────► resolveTable(qr_token)       │
    │                                                   │ ── openOrResumeSession() ──►│
    │  reusa DINE_SESSION existente (CLI-MAP-007)       │ ◄── { sessionId, status } ──│
  ```

- **API**:
  ```
  GET  /api/tables/{qr_token}/resolve → { branch_id, dine_table_id, table_name, available, dine_session_id|null }
  POST /api/sessions/open { qr_token, person_id } → { id, table_id, branch_id, status: 'open' }
    - Retoma (CLI-MAP-007): lookup de la DINE_SESSION del cliente vía DINE_GUEST (person_id → dine_guest → dine_session_id con status 'open'); si existe abierta, devuelve esa sesión sin crear otra.
    - person_id ANÓNIMO: retoma IMPOSIBLE — no hay identidad para localizar el guest; siempre requiere nuevo escaneo del qr_token (crea sesión nueva).
  ```
- **Front**: vista plano (reusa layout x/y/zone de `tables.json`), store de intención NO persistente, timeout configurable, estados visuales "por ocupar"/"ocupada", mapping de status legado→contrato.

### 4.4 allergy-shield (CLI-ALG-001..005)

- **API**:
  ```
  GET  /api/profile/{personId} → { ...person_profile, allergies: Allergen[] }
  PUT  /api/profile/{personId}/allergies { allergies: Allergen[] }
  GET  /api/dishes → [{ id, name, allergens: Allergen[], glutenFree (filtro), ... }]
  ```
- **Front**: `allergens.js` (código canónico + labels + `normalizeAllergen`); perfil persistido en `ClientProfilePage` (reemplaza useState muerto, líneas 88-102 y 908-979); cruce **función pura** `findAllergenConflicts(profileAllergies, cartDishes) → [{dish, allergen}]`; alerta NO bloqueante en checkout (`ClientCartPage`/`BillSplitterModal` al confirmar) listando platos y alérgenos (CLI-ALG-005 escenario "alerta detalla").
- **KDS (excepción acotada, autorizada por CLI-ALG-002)**: SOLO el mapeo/normalización de alérgeno en `OrderPad.jsx` y `AllergyShieldAlert.jsx` (literal "maní" → `normalizeAllergen` → FRUTOS_SECOS, a nivel dato). SIN cambios de UI, estado ni flujo KDS; ningún otro archivo o test de KDS se toca.

### 4.5 tip-history (CLI-TIP-001..007)

- **API**: `GET /api/payments?personId={personId}` → lista `[{ id, bill_id, branch_id, person_id, amount, tip_amount, total_amount, method, status, paid_at }]` (contrato crudo; el front deriva).
- **Front**: `computeTipHistory(payments, personId)` puro (filtro completed+tip>0, excluye anónimos, orden paid_at DESC, % 2 decimales, total=0→0%); tabla de `ClientProfilePage` (521-593) reemplazada por el read-model; `DteTicketModal` sigue consumiendo `ticketData` desde la entrada seleccionada (mantiene el modal DTE existente).
- **Seed demo** en `/api/payments`: 3 PAYMENTs completed con tip de Constanza (2000/20000 → 10 %; 1500/21500 → 6.98 %; 1 con tip=0 excluido), 1 refunded con tip (excluido), 1 completed anónimo con tip (excluido).

---

## 5. Manejo de legado / migración

1. **Sucursales**: mapa `LEGACY_BRANCH_MAP` en `branches.js` (front) y `V2__seed_branches.sql` (backend) con las equivalencias de la sección D2. Migración de fixtures por slice: cada slice que toque sucursales migra sus ids y actualiza sus propios tests (suite de unicidad cubre el inventario completo). Rollback: inverso UUID→legado; si un fixture depende de un id viejo, se revierte solo ese archivo.
2. **Alergias**: `normalizeAllergen` cubre flags booleanos de perfil, strings de menú y `maní` de KDS. El perfil guardado en formato viejo se normaliza al leer (CLI-ALG-002 escenario "perfil legado migrado").
3. **Mesa/QR**: `tableContext.code` y códigos de `ClientQrScanPage` se alinean a `qr_token`; `tables.json` añade `branch_id`+`qr_token` sin romper consumidores existentes (grep previo: `tables.json` lo consumen waiter/radar vía `/api/tables` — los campos nuevos son aditivos).
4. **Historial DTE**: hardcode de `ClientProfilePage` se elimina en el Slice 5; rollback = restaurar el bloque (está versionado).

---

## 6. Testabilidad — RED-GREEN por capability

Runner front: `npm run test` (Vitest 3 + Testing Library, jsdom, mockFetch a 0 ms en test). Runner backend (cuando se implemente): `./mvnw test` (JUnit 5 + Testcontainers). Contrato RED: el test de integración falla si la tabla/endpoint no existe.

| Capability | RED primero (front vitest) | Verdes esperados |
|---|---|---|
| branch-identity | `branches.test.js`: unicidad (dos ids→misma sucursal falla), mapa cubre todos los legados, traducción e inversa, id desconocido → throw | suite de unicidad + migración de fixtures |
| client-favorites | `useFavoritesStore.test.js` + catálogo: duplicado rechazado, toggle agrega/quita, quit-inexistente no-op, orden DESC, anónimo bloqueado, sobrevive recarga (persist) | 6+ tests |
| floor-map-table-intent | `tableIntent.test.js`: elegir no crea DINE_SESSION (assert ausencia), timeout con fake timers revierte, cancelar/unmount revierte, recarga limpia, ocupada no elegible, ocupada-durante-intención revierte, QR abre sesión, reescaneo retoma | 8+ tests |
| allergy-shield | `normalizeAllergen.test.js` + `findAllergenConflicts.test.js` + perfil: solo 6 valores, mapeos legado, normalización tildes, alerta no bloqueante (coincide/no coincide/perfil vacío/detalle), persistencia recarga | 9+ tests |
| tip-history | `computeTipHistory.test.js`: filtro completed+tip, multi-pago una entrada c/u, anónimo invisible, campos completos, orden DESC, exclusiones, redondeo 6.98 %, total 0 → 0 % | 8+ tests |

Convención obligatoria (AGENTS.md): **cada línea de código comentada en español**, commits convencionales por unidad lógica, sin commitear `openspec/`.

---

## 7. Partición en slices (chained PRs, ≤ 600 líneas c/u)

Feature Branch Chain con tracker; PR n apunta al PR n-1 (diff limpio).

| Slice | Capability | Entregables | Tests |
|---|---|---|---|
| 1 | branch-identity | `branches.js` (canon+mapa), migración fixtures (reservation/WhatsApp/Franchise/Profile display), `tables.json`+`tableContext` (branch_id, qr_token, code→qr_token), servicio `/api/branches` | unicidad, mapa, traducción |
| 2 | client-favorites | `useFavoritesStore`, toggle estrella + isFavorite en catálogo, servicio `/api/me/favorites` (persist) | store + catálogo |
| 3 | floor-map-table-intent | vista plano, intención efímera (timeout/unmount/cancelar), mapping status, QR abre/retoma sesión, `/api/tables`+`/api/sessions` | intención + QR |
| 4 | allergy-shield | `allergens.js`+normalize, perfil persistido, cruce checkout + alerta no bloqueante, KDS mínimo | normalize + cruce + perfil |
| 5 | tip-history | `/api/payments` seed demo, `computeTipHistory`, reemplazo hardcode `ClientProfilePage` | compute + UI payments |

Orden: 1 es base de 2-5 (branch_id canónico); 3 depende de 1 (qr_token); 4 y 5 son independientes entre sí.

---

## 8. Riesgos y mitigaciones

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Backend Java sin stack (proposal HIGH) | HIGH | **Resuelto en D1**: stack decidido (Spring Boot 3 + JPA + Flyway + MySQL 8 + Testcontainers); implementación diferida o en Slice 1 (sección 10, P1) |
| Migrar ids rompe fixtures/tests existentes | MED | Mapa biyectivo + suite de unicidad; tests actualizados dentro del slice que migra; POS (`b-1..3` mesas) excluido explícitamente |
| Colapsar sucursales equivocadas (Santiago Centro vs Lo Ovalle) | MED | Canon de 4 sucursales con equivalencias **declaradas**; sin renaming forzado (protege `FranchiseComparisonWidget.test.js` y `ClientReservationAssistant.test.js`) |
| Normalización de alergias rompe filtro `gluten_free` | MED | `glutenFree` del menú sigue siendo filtro dietético; el enum aplica solo a `allergens` y perfil |
| PAYMENT sin tip_amount → historial vacío | MED | Seed demo con tip en Slice 5 (CLI-TIP) |
| Intención confundida con ocupación real | LOW | Overlay visual distinto + expiración + polling del estado real |
| Budget 600 líneas/slice excedido | MED | Slices por capability autónoma; si un slice crece, se divide en commits encadenados sin romper la dependencia |

---

## 9. Plan de rollback

- **Por slice**: revertir el merge de un PR sin tocar los demás (slices autónomos).
- **branch-identity**: `LEGACY_BRANCH_MAP` permite volver a ids legados (inverso biyectivo); si un fixture depende, revertir solo ese archivo. No hay migración destructiva de datos.
- **favoritas**: eliminar `useFavoritesStore` y su clave de persistencia; sin impacto en otros slices.
- **intención de mesa**: desactivar por flag del store (estado no persistente → sin migración).
- **alergias**: mantener perfil normalizado; revertir display al vocabulario viejo es local (labels).
- **propinas**: restaurar el bloque hardcodeado de `ClientProfilePage` (versionado); el seed de `/api/payments` se quita del registro de `mockFetch`.

---

## 10. Open Questions

- [ ] **P1 (bloquea tasks)**: ¿el change construye el scaffold backend Java (Slice 1: proyecto Maven + Flyway `V1/V2/V3` + contrato JPA + test Testcontainers) o el backend queda 100 % diferido a un change posterior? La proposal dice "limitar a diseño/contrato"; el stack ya está decidido así que el costo de incluirlo es el scaffold. **Recomendación**: incluir scaffold mínimo en Slice 1 (elimina el riesgo HIGH y valida D1 con Testcontainers RED-GREEN).
- [ ] **P2**: ¿el contrato backend de intención de mesa incluye TTL server-side (`PUT /tables/{id}/intent` con expiración) o la intención queda local-first hasta que exista multi-dispositivo? **Recomendación**: local-first en este change; TTL declarado como extensión.
- [ ] P3: confirmar con el equipo si la sucursal activa de la Mesa Virtual (Lo Ovalle) debe seguir siendo fija o seleccionable desde el catálogo con el canon (afecta solo enrutamiento demo).