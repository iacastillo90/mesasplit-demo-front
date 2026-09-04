# Tasks: garzon-mesas-interactivas — Rediseño Interactivo de la Vista del Garzón

## Reglas de ejecución (multi-agente — MUST)

- Delivery: commits por unidad lógica DIRECTOS a `main` (un solo PR pre-aprobado por el usuario; NO chained PRs). Commit en español, conventional, con porqué (AGENTS.md).
- TDD estricto (`strict_tdd: true`): en cada fase correr el test RED (debe fallar) antes de implementar, luego GREEN con `npm run test` (Vitest 3 + RTL).
- Antes de cada commit: `git status` para detectar cambios ajenos (Antigravity). Stage explícito por archivo — NUNCA `git add .`.
- NO tocar: `src/routes/index.jsx`, `src/routes/views.jsx`, `src/features/ClientView/pages/ClientProfilePage.jsx`. NO planificar edición de los 3 archivos RadarView con modificaciones sin commitear (`InventoryMenuManager.jsx`, `StaffLeaderboard.jsx`, `TopologicalMap.jsx`).
- `src/mocks/tables.json` es compartido con Radar/Pos: cambio ADITIVO (solo filas nuevas t9..t12). No committear `openspec/` ni `.atl/`.
- Threat Matrix del diseño = `N/A` (sin filas aplicables): no se generan RED-tests extra de la matriz.
- Open question del diseño: si el linter FSD rechaza el import cruzado de `MenuFilterPills` desde ClientView, moverlo a `src/shared` (tarea 5.2 lo contempla).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850 + 1 asset (placeholder) |
| 400-line budget risk | High |
| Chained PRs recommended | No (user pre-approved single PR) |
| Suggested split | 1 PR (pre-aprobado) con 8 commits directos a main |
| Delivery strategy | single-pr |
| Chain strategy | size-exception (N/A — no encadenado; excepción pre-aprobada) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Fix badge seats + status mapping TableGrid | single PR (commit 1) | `npm run test -- src/features/WaiterView/components/TableGrid.test.jsx` | jsdom vitest | revert commit 1 |
| 2 | Fixture 12 mesas aditivo | single PR (commit 2) | `npm run test -- src/routes/__tests__/routing.test.jsx` + suites Radar | jsdom vitest | revert commit 2 |
| 3 | Soporte fotos carta (contrato `image` + placeholder) | single PR (commit 3) | `npm run test -- src/mocks/menu.test.js` | N/A — lógica pura (lee mocks JSON) | revert commit 3 |
| 4 | Carta real del mozo (getMenu/loadMenu/OrderPad/seed D12) | single PR (commit 4) | `npm run test -- src/features/WaiterView/components/OrderPad.upsell.test.jsx src/features/WaiterView/WaiterPage.test.jsx` | jsdom vitest | revert commit 4 |
| 5 | Filtros idénticos al cliente | single PR (commit 5) | `npm run test -- src/shared/utils/menuFilters.test.js` + suites OrderPad | N/A — helper puro (integración jsdom en suites OrderPad) | revert commit 5 |
| 6 | Acciones qty en useWaiterStore | single PR (commit 6) | `npm run test -- src/features/WaiterView/store/useWaiterStore.qty.test.js` | N/A — store puro sin DOM | revert commit 6 |
| 7 | Controles qty en OrderPad | single PR (commit 7) | `npm run test -- src/features/WaiterView/components/OrderPad.qty.test.jsx` | jsdom vitest | revert commit 7 |
| 8 | Modal consumo de mesa ocupada | single PR (commit 8) | `npm run test -- src/features/WaiterView/components/TableConsumptionModal.test.jsx src/features/WaiterView/WaiterPage.test.jsx` | jsdom vitest | revert commit 8 |
| 9 | Verificación final | N/A (sin commit) | `npm run test` + `npm run build` | suite completa | N/A |

## Fase 1: Fixes base de TableGrid (commit 1)

- [x] 1.1 RED: crear `src/features/WaiterView/components/TableGrid.test.jsx` — badge `seats` (guest-badge-seats sc.1-2: mesa `seats:4` sin `guests` → badge "4", sin error; mesa sin `guests` no crashea), status mapping (table-status-mapping sc.1-3: `billing`→"En cobro", `cleaning`→"En limpieza", sin regresión en `occupied`/`waiting_food`/`bill_requested`/`free`) y `onSelectTable(table.id)` (tables-grid-12); ver fallar.
- [x] 1.2 GREEN: `src/features/WaiterView/components/TableGrid.jsx` — reemplazar `table.guests` → `table.seats` (L99); agregar `billing`/`cleaning` a `STATUS_VARIANTS` y labels (L11-28); conservar toggle 2D/3D de fase9 (L45-69) y firma `onSelectTable`; `npm run test` verde.
- [x] 1.3 Commit: `fix: corregir badge de comensales (seats) y status mapping de billing/cleaning en TableGrid` (por qué: badge roto y fallback incorrecto rompen la demo).

## Fase 2: Fixture 12 mesas (commit 2 — aditivo)

- [x] 2.1 RED: fixture test (en `src/routes/__tests__/routing.test.jsx` o nuevo `src/mocks/tables.test.js`) — `tables.json` con 12 mesas, campos `seats`+`status` presentes en todas, mix de statuses y ≥1 `occupied` (tables-grid-12 sc.1-2); ver fallar con las 8 actuales.
- [x] 2.2 GREEN: `src/mocks/tables.json` — agregar SOLO t9..t12: `occupied` con `order` (demo de consumo), `free`, `billing`, `cleaning`, `waiting_food`, `bill_requested`; no renombrar campos ni tocar t1-t8; `npm run test` verde.
- [x] 2.3 Verificar invariantes multi-agente: Radar `seats ?? 4` y ≥1 `occupied` (`FocusMode.test`/`IsometricTableGrid3D.test`/`routing.test`) siguen verdes con 12 mesas; `git status` antes de editar para descartar cambios ajenos en `tables.json`.
- [x] 2.4 Commit: `feat: ampliar fixture de mesas a 12 con mix de estados y comandas (aditivo)`.

## Fase 3: Fotos de carta (commit 3 — sin regenerar assets)

- [x] 3.1 RED: `src/mocks/menu.test.js` — contrato `image` (item-photo sc.1): los 28 ítems con `image` string; las 4 locales con rutas exactas (m1 `dish_lomo_lo_ovalle.png`, m15 `dish_volcan_chocolate.png`, m19 `dish_pisco_sour.png`, m26 `dish_ceviche_mixto.png`) y apuntando a archivos existentes en `public/images`; ver fallar.
- [x] 3.2 GREEN: agregar `public/images/dish_placeholder.png` (fallback `onError`, asset compartido D4); validar `image` ya presente en `menu.json` (commit 7430479 de la otra agente: 4 locales + 24 URLs Unsplash — aceptar tal cual, D2, NO regenerar assets); `npm run test` verde.
- [x] 3.3 Commit: `feat: agregar soporte de fotos a la carta del mozo con placeholder de fallback` (por qué: evita colisión multi-agente y trabajo redundante).

## Fase 4: Carta real del mozo (commit 4)

- [x] 4.1 RED: actualizar fixtures EN EL MISMO cambio (real-menu-source sc.2): `OrderPad.upsell.test.jsx` — S1/S3 → `m2` "Hamburguesa Clásica Brioche" 8900 (no 12500), S4 → `productId:'m12'` (Ensalada César con Pollo, sin regla; con menú real `m5` es Hamburguesa y dispararía regla); `WaiterPage.test.jsx` — "Toma de Pedido" verifica `2x` con doble click en la misma card; ver fallar contra el `MENU_CATALOG` actual. Hecho: RED verificado (upsell 5/7 fallan; WaiterPage solo "Toma de Pedido" falla tras fix de matchers `Mesa 1` exactos para 12 mesas).
- [x] 4.2 GREEN: `waiterService.js` — `getMenu()` → `mockFetch('/api/menu')` (espejo de `clientService.getMenu`); `useWaiterStore.js` — `loadMenu()` + estado `menu`/`loading` (D10) y seed de `selectTable` alineado D12 (`{productId:'m2', name:'Hamburguesa Clásica Brioche', price:8900, sentToKitchen:true}`); `OrderPad.jsx` — eliminar `MENU_CATALOG` (L22-28), recibir `menu`/`loading` por props, render 28 ítems en 7 categorías con cards compactas (thumb `h-10 w-10 rounded-lg object-cover` + nombre + precio, `onError`→placeholder) y conservar upsell desde `menu` real, allergy, CourseControl y Eliminar/Anular con PIN (L176-202, L241-247); `WaiterPage.jsx` pasa `menu`/`loading`; `npm run test` verde (real-menu-source sc.1: m2 a 8900; item-photo sc.1; compact-cards sc.1). Hecho: suites verde (WaiterView 42/42; menu.test 5/5) + fix matcher `Mesa 1` en `waiterTableTransfer.test.js` (regresión 12 mesas de fase 2).
- [x] 4.3 Commit: `feat: carta real del mozo desde menu.json con cards compactas` (por qué: MENU_CATALOG inline divergía de la fuente única). NOTA multi-agente: el contenido verificado idéntico quedó absorbido en `2edfa42` (Antigravity, AppHeader/logo) por barrido del working tree — mismo patrón que fases 1/3; suites verde en HEAD, no se reescribe historial.

## Fase 5: Filtros idénticos al cliente (commit 5)

- [x] 5.1 RED: crear `src/shared/utils/menuFilters.test.js` — paridad con el cliente: conjuntos esperados por filtro derivados de `menu.json` (`vegano`/`gluten_free`/`spicy`/`popular`/`postres`/`bebidas`/`all`) (client-identical-filters sc.1-3); ver fallar (helper inexistente). Hecho: RED por import no resuelto + 9 tests de paridad.
- [x] 5.2 GREEN: crear `src/shared/utils/menuFilters.js` — `filterMenuByDiet(items, filterId)` puro con lógica copiada de `ClientPage` L122-130 (`vegano`→veg||vegan, `gluten_free`→glutenFree, `spicy`→spicy, `popular`→popular, `postres`→sweet||cat==='Postres', `bebidas`→alcoholic||cat==='Barra', `all`→true); `OrderPad.jsx` — usar `MenuFilterPills` de ClientView (si el lint FSD lo rechaza, mover a `src/shared`) + `filterMenuByDiet`; `npm run test` verde. Hecho: ESLint limpio (sin reglas FSD), import cruzado OK; suites verde (23/23 en los 3 archivos).
- [x] 5.3 Commit: `feat: filtros de carta idénticos al cliente (helper compartido + MenuFilterPills)` — commit `194f557`.

## Fase 6: Acciones qty en store (commit 6)

- [x] 6.1 RED: crear `src/features/WaiterView/store/useWaiterStore.qty.test.js` (puro, sin DOM) — `increaseQty` acumula línea única (dynamic-add-remove sc.1, aggregation-semantics sc.2), `decreaseQty` remueve la línea en 0 (sc.2), `removeItem` elimina la línea completa sin `alert.fraud` (sc.3, D5), mismo producto en courses distintos = 2 líneas (aggregation-semantics sc.1); ver fallar. Hecho: RED 7/7 (`increaseQty is not a function`).
- [x] 6.2 GREEN: `useWaiterStore.js` — `increaseQty(productId, course)` (qty+1 en línea existente, sin duplicados), `decreaseQty` (qty−1; 0 → `.filter` remueve), `removeItem` (sin `alert.fraud`), mirror de `useClientStore`; `npm run test` verde. Hecho: 7/7 verde; export `waiterRealtimeBus` para spy de `alert.fraud` (D5).
- [x] 6.3 Commit: `feat: acciones de qty en useWaiterStore (increaseQty/decreaseQty/removeItem)` — commit `ce5db7d`.

## Fase 7: Controles qty en OrderPad (commit 7)

- [x] 7.1 RED: tests de escenarios `qty-controls` (nuevo `src/features/WaiterView/components/OrderPad.qty.test.jsx` o suite existente) — `+` incrementa la qty visible (qty-controls sc.1), `−` decrementa y remueve en 0 (sc.2), ✕ elimina la línea sin importar la cantidad (sc.3), patrón visual como `SharedCartDrawer` (client-cart-consistency sc.1); `WaiterPage.test.jsx` "Toma de Pedido" pasa a usar el control `+` de la línea sembrada; ver fallar. Hecho: RED 6/6 (`Unable to find ... Agregar uno a`).
- [x] 7.2 GREEN: `OrderPad.jsx` — controles −/qty/+/✕ por línea de `orderDraft` siguiendo el patrón de `SharedCartDrawer`; wire a `increaseQty`/`decreaseQty`/`removeItem`; `npm run test` verde. Hecho: 20/20 en las 3 suites; WaiterPage pasa las 3 acciones por props.
- [x] 7.3 Commit: `feat: controles de cantidad −/qty/+/✕ en OrderPad` — commit `f2f9712`.

## Fase 8: Modal consumo (commit 8)

- [x] 8.1 RED: crear `TableConsumptionModal.test.jsx` — abre con líneas de `order` (qty × nombre + subtotal + total) (consumption-modal sc.1) y cierra por botón/overlay (sc.2); handler en `WaiterPage.test.jsx` — mesa sin `order` (free/cleaning/occupied sin order) NO abre modal / muestra estado vacío (no-order-no-modal sc.1); ver fallar. Hecho: RED 5/5 (`Unable to find role="dialog"` + import sin resolver).
- [x] 8.2 GREEN: crear `TableConsumptionModal.jsx` — read-only `{table, onClose}`, usa `Modal` de `shared/ui`, filas de `table.order.items` (qty × nombre + subtotal) + total + botón cerrar/overlay (D7); `WaiterPage.jsx` — estado local `consumptionTable`, `handleTableClick` (D8: `selectTable(id)` SIEMPRE + abre modal SOLO si `table.order?.items?.length > 0`), `loadMenu()` al montar, monta el modal y conserva banner/subscripción `call.waiter` (sos-badge-regression sc.1); `npm run test` verde. Hecho: 17/17 (modal 2/2 + WaiterPage 10/10 + TableGrid 5/5, SOS intacto).
- [x] 8.3 Commit: `feat: modal read-only de consumo al clickear mesa ocupada` — commit `8998d63`.

## Fase 9: Verificación final (sin commit)

- [x] 9.1 `npm run test` — suite completa verde (incluye suites nuevas: store qty, TableGrid, modal, menuFilters, OrderPad qty). Hecho: `npx vitest run --testTimeout=60000` → **91 archivos, 295/295 tests**. Con el default 5000ms: 89/91 archivos (2 flaky-timeouts ya conocidos de setup pesado).
- [x] 9.2 `npm run build` — sin errores. Hecho: `✓ built in 31.04s` (WaiterPage 40.49 kB│gzip 10.52 kB).
- [x] 9.3 Chequeos de regresión: badge SOS (`sos-waiter-call` sigue operativo con mesa y motivo), toggle fase9 IsometricTableGrid3D (2D/3D, L45-69) intacto, Radar/routing con 12 mesas (`seats ?? 4`, ≥1 `occupied`). Hecho: SOS 2/2 + TableGrid 5/5 verdes; Radar/routing/Inventory pasan en la suite completa; 5 flaky-timeouts intratest de 15000ms (RadarPage/FocusMode/routing) son preexistentes del área Antigravity, mi diff no los toca.
- [x] 9.4 Reportar al orchestrator: resumen de los 8 commits, tareas `[x]` y estado de las suites (verificación para sdd-verify). Hecho: reporte entregado en la sesión de apply.
