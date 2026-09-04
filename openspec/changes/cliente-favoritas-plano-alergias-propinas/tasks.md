# Tasks: Dominio Cliente — Favoritas, Plano de Piso, Escudo de Alergias y Propinas

Cambio: `cliente-favoritas-plano-alergias-propinas` · Modo: `openspec` · Delivery: `auto-chain` (5 slices ≤600 líneas, Feature Branch Chain con tracker) · Strict TDD: TRUE (RED primero)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~1400–2100 (front fijo ~1400; +~700 si entra scaffold backend) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 branch-identity → PR 2 client-favorites → PR 3 floor-map-table-intent → PR 4 allergy-shield → PR 5 tip-history |
| Chain strategy | stacked-to-main ( cada PR mergea a main en orden; iteración rápida; fixes sobre la marcha) |
| Delivery strategy | auto-chain (5 slices decididos en design §7) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

> **Decisión pendiente (T1.1, bloquea apply)**: incluir scaffold backend Java + MySQL en Slice 1. Recomendado: **Sí** — elimina el riesgo CRITICAL "stack sin runner" y valida D1 con Testcontainers RED-GREEN. Si se decide NO, se omiten las tareas marcadas `[backend]`.

### Suggested Work Units (slices = chained PRs)

| Unit | Goal | Likely PR (base) | Focused test command | Runtime harness | Rollback boundary |
|------|------|------------------|----------------------|-----------------|-------------------|
| 1 | branch-identity: canon branch_id + fixtures + [backend] scaffold MySQL | PR 1 (tracker `feat/cliente-favoritas-plano-alergias-propinas`) | `npx vitest run src/shared/constants/branches.test.js` · backend: `./mvnw test` | `npm run dev`: catálogo/referencias sin ids legados · backend: `./mvnw spring-boot:run` + `curl /api/branches` | revertir `branches.js` + fixtures migrados (mapa biyectivo vuelve a legados); quitar módulo `mesasplit-api` si se retira scaffold |
| 2 | client-favorites: store persistente + toggle + `/api/me/favorites` | PR 2 (base PR 1) | `npx vitest run src/features/ClientView/store/useFavoritesStore.test.js` | `npm run dev`: toggle estrella persiste tras recarga (localStorage) | quitar `useFavoritesStore` + su clave `persist`; sin impacto en otros slices |
| 3 | floor-map-table-intent: plano + intención efímera + QR/resume | PR 3 (base PR 2) | `npx vitest run src/features/ClientView/store/tableIntent.test.js` | `npm run dev`: elegir mesa → "por ocupar" expira; escanear QR abre/retoma sesión | quitar store de intención (no persistente) + vista plano; sin migración |
| 4 | allergy-shield: enum + perfil persistido + alerta + KDS acotado | PR 4 (base PR 3) | `npx vitest run src/shared/constants/allergens.test.js` | `npm run dev`: perfil guarda alergias tras recarga; checkout muestra alerta y finaliza | revertir display a vocabulario viejo (labels); en KDS revertir solo `normalizeAllergen` en OrderPad/AllergyShieldAlert |
| 5 | tip-history: read-model PAYMENT + reemplazo hardcode | PR 5 (base PR 4) | `npx vitest run src/features/ClientView/utils/computeTipHistory.test.js` | `npm run dev`: perfil muestra propinas con % desde `/api/payments` | restaurar bloque hardcode `ClientProfilePage.jsx:521-593`; quitar seed `/api/payments` de `RESOURCES` |

Restricciones transversales (AGENTS.md): cada línea comentada en español; commits convencionales por unidad lógica; `openspec/` NO se commitea. Stack backend ajustado: Spring Boot 3.3 + Java 21 + Spring Data JPA + Flyway (dialecto MySQL) + MySQL 8 + JUnit 5/Testcontainers (MySQL 8).

---

## Slice 1 — branch-identity (CLI-BRN-001..005) — PR 1

| Id | Título | Capability (CLI) | Descripción operativa / Archivos | Done (RED-GREEN) | Líneas |
|----|--------|------------------|-----------------------------------|-------------------|--------|
| T1.1 | Decidir inclusión de scaffold backend en este change | CLI-BRN-005 (P1 design) | Cerrar P1: ¿el scaffold Java + MySQL entra en Slice 1? Recomendado Sí (elimina riesgo CRITICAL stack sin runner); registrar decisión en `state.yaml`/design | Decisión registrada; tasks `[backend]` activadas o eliminadas | — |
| T1.2 | Canon branch_id + mapa legado biyectivo | CLI-BRN-001/002/005 | Crear `src/shared/constants/branches.js`: `BRANCH_IDS` (slug→UUID v5), `LEGACY_BRANCH_MAP` (6 legados, biyectivo), `resolveBranchId` (throw en desconocido), `branchIdToLegacy` | RED: `branches.test.js` — unicidad (2 ids→misma sucursal falla), mapa cubre todos los legados, traducción e inversa, id desconocido → throw | 90–110 |
| T1.3 | Migrar fixtures al canon | CLI-BRN-001/003 | `useReservationStore.js`, `WhatsAppReservationChatModal.jsx`, `FranchiseComparisonWidget.jsx`, display "Locales Registrados" de `ClientProfilePage.jsx` → UUIDs; actualizar sus tests (POS `b-1..3` intactos) | Suite de unicidad sobre el inventario completo; tests migrados verdes | 120–150 |
| T1.4 | branch_id + qr_token por mesa; code→qr_token | CLI-BRN-004 | `src/mocks/tables.json` (branch_id, qr_token único por mesa), `tableContext.js` Mesa 12 `code:'4F2K'`→qr_token, códigos de `ClientQrScanPage.jsx` alineados | RED: `tables.test.js`/context — qr_token único, mismo branch_id que catálogo | 70–90 |
| T1.5 | [backend] Scaffold mesasplit-api + seed sucursales | CLI-BRN-005, D1, D2 | Módulo Maven `mesasplit-api` (Spring Boot 3.3, Java 21, Spring Data JPA, Flyway MySQL); `V1__schema.sql` (entidades ER v2), `V2__seed_branches.sql` (4 sucursales UUID v5); Testcontainers MySQL 8 | RED: `BranchRepositoryIT` — seed cuenta 4, `findById` resuelve UUID v5 contra MySQL real | 200–240 |
| T1.6 | mockFetch registra `/api/branches` | CLI-BRN-003/005 | Registrar catálogo en `RESOURCES` con forma JSON del contrato Java (id UUID, isFavorite slot vacío para Slice 2); fixture migrado a canon | `branches.service.test.js` — catálogo expone branch_id canónico | 30–40 |

## Slice 2 — client-favorites (CLI-FAV-001..006) — PR 2

| Id | Título | Capability (CLI) | Descripción operativa / Archivos | Done (RED-GREEN) | Líneas |
|----|--------|------------------|-----------------------------------|-------------------|--------|
| T2.1 | RED tests store + catálogo | CLI-FAV-001..006 | `useFavoritesStore.test.js` + tests catálogo: duplicado rechazado, toggle agrega/quita, quit-inexistente no-op, orden DESC, isFavorite por sucursal, anónimo bloqueado, sobrevive recarga | Tests RED pasan solo tras T2.2–T2.3 | 100–110 |
| T2.2 | useFavoritesStore persistente | CLI-FAV-001/002/003/005/006 | Store Zustand con `persist` (clave `mesasplit-favorites`, `partialize`): add/remove/toggle, `isFavoriteBranch`, bloqueo si `user` null | Verdes de T2.1: unicidad, orden DESC, persistencia | 80–100 |
| T2.3 | Toggle estrella en catálogo | CLI-FAV-002/004/005 | `ClientPage.jsx`: render estrella activa/inactiva por sucursal, toggle, anónimo → bloqueo + solicitud de identificación | Verdes T2.1: toggle e isFavorite; anónimo no crea FAVORITE | 60–80 |
| T2.4 | mockFetch `/api/me/favorites` + catálogo isFavorite | CLI-FAV-001/003/004 | Registrar GET/PUT/DELETE `/api/me/favorites` y `/api/branches` con `isFavorite` del usuario autenticado (`X-Person-Id`), sin query param | Verdes T2.1: isFavorite en catálogo, no-op delete | 50–60 |
| T2.5 | [backend] FAVORITE + endpoints `/api/me/favorites` | CLI-FAV-001/003/005 | `FavoriteEntity` con `@UniqueConstraint(person_id, branch_id)`, `findByPersonIdOrderByCreatedAtDesc`, GET/PUT/DELETE `/api/me/favorites` | RED: Testcontainers MySQL — idempotencia PUT, no-op DELETE, 401 anónimo, orden DESC | 120–150 |

## Slice 3 — floor-map-table-intent (CLI-MAP-001..007) — PR 3

| Id | Título | Capability (CLI) | Descripción operativa / Archivos | Done (RED-GREEN) | Líneas |
|----|--------|------------------|-----------------------------------|-------------------|--------|
| T3.1 | RED tests intención de mesa | CLI-MAP-002..007 | `tableIntent.test.js`: elegir no crea DINE_SESSION (assert ausencia), timeout fake timers revierte, cancelar/unmount revierte, recarga limpia, occupied/reserved/cleaning NO elegibles, ocupada-durante-intención revierte, QR abre, reescaneo retoma | Tests RED pasan solo tras T3.2–T3.5 | 110–120 |
| T3.2 | Mapping status legado→contrato con `reserved` | CLI-MAP-001/006 | Mapper en constants/store: `free→available`, `billing/occupied/waiting_food/bill_requested→occupied`, `cleaning→cleaning`, `reserved→reserved` (NO elegible, render distinto) | Verdes T3.1: reserved no elegible; plano refleja estado real | 30–40 |
| T3.3 | Vista plano de piso cliente | CLI-MAP-001 | Vista en ClientView reusando x/y/zone/capacidad/status de `tables.json`; estados visuales "por ocupar"/"ocupada"/"reservada" | Verdes T3.1 + snapshot: mesas en posición/zona con estado | 120–150 |
| T3.4 | Store intención NO persistente | CLI-MAP-002/003/004 | Store efímero `tableIntent`: choose (solo available), revert, timeout configurable (default 2 min), cleanup de unmount, cancelación | Verdes T3.1: timeout, cancelar, recarga limpia | 80–100 |
| T3.5 | mockFetch `/api/tables`, resolve y sessions/open | CLI-MAP-005/007, CLI-BRN-004 | Registrar `/api/tables` (branch_id, qr_token, reserved), `/api/tables/{qr}/resolve`; `POST /api/sessions/open` con retoma vía DINE_GUEST (person_id→dine_guest→dine_session_id open) y anónimo → retoma imposible (nuevo escaneo) | Verdes T3.1: QR abre sesión, reescaneo retoma sin duplicar | 60–80 |
| T3.6 | [backend] DINE_TABLE + DINE_SESSION/DINE_GUEST | CLI-MAP-005/007, CLI-BRN-004 | `DiningTableEntity` (qr_token único indexado); `POST /api/sessions/open` con lookup DINE_GUEST (no crea segunda sesión; anónimo no retoma) | RED: Testcontainers MySQL — retoma no duplica, anónimo crea nueva | 120–150 |

## Slice 4 — allergy-shield (CLI-ALG-001..005) — PR 4

| Id | Título | Capability (CLI) | Descripción operativa / Archivos | Done (RED-GREEN) | Líneas |
|----|--------|------------------|-----------------------------------|-------------------|--------|
| T4.1 | RED tests normalize + cruce + perfil | CLI-ALG-001..005 | `normalizeAllergen.test.js` (6 valores, mapeos legado, "lácteos"→LACTEOS), `findAllergenConflicts.test.js` (coincide/no coincide/perfil vacío/detalle), perfil guarda+recarga | Tests RED pasan solo tras T4.2–T4.5 | 110–120 |
| T4.2 | Enum ALLERGEN + normalizeAllergen | CLI-ALG-001/002 | `src/shared/constants/allergens.js`: 6 valores canónicos, `LABELS`, `normalizeAllergen(raw)` (glutenFree→GLUTEN, lactoseFree→LACTEOS, nutAllergy/maní→FRUTOS_SECOS, strings con tilde) | Verdes T4.1: solo 6 valores, mapeos, tildes | 60–80 |
| T4.3 | Perfil de alergias persistido | CLI-ALG-003 | `ClientProfilePage.jsx` reemplaza useState muerto (88-102, 908-979) por slice persist; GET/PUT `/api/profile/{personId}/allergies` | Verdes T4.1: guardar y recargar conserva GLUTEN | 80–100 |
| T4.4 | Cruce perfil∩plato | CLI-ALG-004/005 | `findAllergenConflicts(profileAllergies, cartDishes)` pura, solo `DISH.allergens` (sin escandallo) | Verdes T4.1: coincide/detalle; plato sin allergen no alerta | 40–50 |
| T4.5 | Alerta NO bloqueante en checkout | CLI-ALG-005 | `ClientCartPage.jsx`/`BillSplitterModal.jsx` al confirmar: alerta lista platos+alérgenos; pedido finaliza igual | Verdes T4.1: alerta visible y no bloquea | 60–80 |
| T4.6 | KDS acotado: "maní" → normalizeAllergen | CLI-ALG-002 (excepción) | `OrderPad.jsx` y `AllergyShieldAlert.jsx`: literal "maní" pasa por `normalizeAllergen` (FRUTOS_SECOS) a nivel dato; SIN UI/estado/flujo KDS; sin tocar otros archivos/tests KDS | normalizeAllergen("maní") → FRUTOS_SECOS; KDS UI tests intactos | 20–30 |
| T4.7 | [backend] PERSON_PROFILE/DISH allergens JSON | CLI-ALG-001/003/004 | `PersonProfileEntity.allergies` y `DishEntity.allergens` como JSON (string canónico enum); endpoints perfil/dishes | RED: Testcontainers MySQL — persiste y lee GLUTEN canónico | 100–130 |

## Slice 5 — tip-history (CLI-TIP-001..007) — PR 5

| Id | Título | Capability (CLI) | Descripción operativa / Archivos | Done (RED-GREEN) | Líneas |
|----|--------|------------------|-----------------------------------|-------------------|--------|
| T5.1 | RED tests computeTipHistory | CLI-TIP-001..007 | `computeTipHistory.test.js`: solo completed+tip>0, multi-pago una entrada c/u, anónimo invisible, campos completos, orden DESC, exclusiones (refunded/tip=0), redondeo 6.98 %, total 0→0 % sin error, refleja cambios en lectura | Tests RED pasan solo tras T5.2–T5.3 | 100–110 |
| T5.2 | Seed demo `/api/payments` | CLI-TIP-001/002/005 | Registrar recurso en `RESOURCES`: 3 completed con tip de Constanza (2000/20000→10 %, 1500/21500→6.98 %, 1 con tip=0 excluido), 1 refunded con tip, 1 completed anónimo con tip | Verdes T5.1: exclusions y anónimo invisible | 50–60 |
| T5.3 | computeTipHistory puro | CLI-TIP-001..007 | Función pura (filtro+orden DESC+% 2 decimales, `Math.round(x*100)/100`, total 0→0 %) | Verdes T5.1 completos | 40–50 |
| T5.4 | Reemplazo hardcode ClientProfilePage | CLI-TIP-003/004 | Tabla de propinas de `ClientProfilePage.jsx` (521-593, ids ficticios b-101..) → read-model; `DteTicketModal` sigue con `ticketData` | Verdes T5.1 en UI + entrada muestra fecha/método/tip/%,boleta | 80–100 |
| T5.5 | [backend] Query derivado PAYMENT | CLI-TIP-001/007 | `GET /api/payments?personId=` → solo completed+tip>0, ORDER BY paid_at DESC (sin tabla nueva) | RED: Testcontainers MySQL — refleja cambio pending→completed sin migración | 80–100 |

---

## Orden de implementación

1 es base de 2-5 (branch_id canónico); 3 depende de 1 (qr_token); 4 y 5 independientes entre sí. Dentro de cada slice: RED (tests) → GREEN (producción) → actualizar docs/seed del slice. `[backend]` tasks solo si T1.1 = Sí. Cada slice termina con suite completa verde (`npm run test`; backend `./mvnw test`) antes de abrir su PR.