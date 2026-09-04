# Design: garzon-mesas-interactivas — Rediseño interactivo de la vista del Garzón

## Resumen técnico

La vista del Garzón se rediseña reutilizando patrones ya probados en ClientView, con el layout FSD existente (pages → components → services → store → mockFetch → mocks). `TableGrid` corrige el badge (`seats`, no `guests`), completa el status mapping (`billing`, `cleaning`, `waiting_food`, `bill_requested`), expande el grid a `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` y conserva el toggle 2D/3D de fase9. `tables.json` crece 8 → 12 solo aditivamente (invariantes Radar `seats ?? 4` y ≥1 `occupied` intactas). `OrderPad` elimina el `MENU_CATALOG` inline y consume la carta real vía `waiterService.getMenu()` → `mockFetch('/api/menu')` → `menu.json` (recurso ya registrado en `mockFetch`), con foto por ítem (4 assets locales reutilizados + 24 URLs Unsplash aceptadas de la otra agente + placeholder de fallback `onError`), cards compactas (thumbnail + nombre + precio), filtros idénticos al cliente (helper puro compartido + `MenuFilterPills` reutilizado tal cual, ClientPage NO se toca) y controles de qty −/qty/+/✕ por línea. `useWaiterStore` gana `loadMenu` y las acciones `increaseQty`/`decreaseQty`/`removeItem` sobre `orderDraft` (agregación por `productId`+`course`, mirror de `useClientStore`); el flujo de anulación por PIN se conserva. `TableConsumptionModal` (nuevo, render mínimo read-only sobre `table.order`) se monta en `WaiterPage` vía estado local; el click en mesa ocupada con comanda selecciona Y abre el modal. Entrega: un solo PR pre-aprobado (>400 líneas), dividido en 8 commits por unidad lógica directo a `main`, cada uno con `npm run test` verde.

## Decisiones de diseño

| # | Decisión | Opciones (tradeoff) | Elección |
|---|----------|--------------------|----------|
| D1 | Fuente de carta | Inline `MENU_CATALOG` (divergente, se elimina) vs `waiterService.getMenu()` → `/api/menu` (recurso verificado en `mockFetch`; `clientService.getMenu` ya lo usa). | **`menu.json` como fuente única** vía `getMenu()` nuevo en `waiterService` (misma firma que `clientService.getMenu`) |
| D2 | Estrategia de assets (~24 ítems sin foto) | Stock remoto (depende de red; ya hay URLs Unsplash en disco, fuera de spec) vs placeholder compartido (pierde la foto "real" que eligió el usuario) vs IA local. | **Aceptar las URLs Unsplash ya commiteadas** por la otra agente (`7430479`): 4 locales reutilizadas (m1/m15/m19/m26) + 24 URLs remotas en `menu.json`; `onError` → `/images/dish_placeholder.png`. NO regenerar 24 assets IA (evita colisión multi-agente y trabajo redundante) |
| D3 | Regla de slug | Manual por ítem (error-prone) vs normalización automática del `name` con excepciones explícitas para las 4 existentes. | **`dish_<slug>.png` con slug = normalize(name)**: lowercase → quitar emojis/signos → NFD sin diacríticos → no-alfanuméricos → `_`, colapsando; excepción: las 4 existentes conservan su archivo actual |
| D4 | Fallback de imagen | Div con ícono inline (estilo distinto por card) vs asset compartido. | **`onError` → `/images/dish_placeholder.png`** (asset compartido, 1 archivo) |
| D5 | Acciones de qty | Lógica inline en OrderPad (duplica semántica) vs acciones en store. | **`increaseQty(productId, course)` / `decreaseQty` (remueve en 0) / `removeItem`** en `useWaiterStore`, mirror de `useClientStore`; `removeItem` NO emite `alert.fraud` (es borrado de borrador, no anulación auditada) |
| D6 | Filtros | Replicar lógica de `ClientPage` inline (drift) vs helper puro compartido + test de paridad. | **`src/shared/utils/menuFilters.js` con `filterMenuByDiet(items, filterId)`** (lógica copiada de `ClientPage` L122-130); `MenuFilterPills` se importa desde ClientView tal cual; ClientPage NO se modifica (out of scope) y la paridad se garantiza por test con conjuntos esperados derivados de `menu.json` |
| D7 | Granularidad del modal | Reusar el render de líneas de OrderPad (forma distinta: `order.items` no trae `allergens/course/sentToKitchen/id` de línea; arrastraría controles/acciones) vs render propio mínimo. | **Render propio mínimo`TableConsumptionModal`** read-only: `{table, onClose}`; filas qty × nombre + subtotal + total + cerrar/overlay |
| D8 | Click en mesa | Modal reemplaza selección (rompe grid actual) vs selección + modal. | **Handler unificado en `WaiterPage`**: `selectTable(id)` SIEMPRE + abre modal SOLO si `table.order?.items?.length > 0`; `TableGrid` conserva `onSelectTable(table.id)` (no rompe el toggle 3D ni la selección) |
| D9 | `tables.json` 8→12 | Renombrar campos (rompe Radar/Pos) vs aditivo. | **Aditivo**: solo 4 filas nuevas `t{9..12}` con mix de status; invariantes verificadas (Radar `seats ?? 4`; `routing.test` ≥1 `occupied`) |
| D10 | Carga de carta | `useEffect` local en OrderPad (estado disperso) vs store. | **`loadMenu()` en `useWaiterStore`** con `menu` + `loading` (mirror de `useClientStore.loadMenu`); `WaiterPage` lo dispara al montar (turno activo) y pasa `menu`/`loading` por props (patrón existente del page) |
| D11 | Cards y grid | Cards grandes (scroll largo) vs compactas; grid 2/3 cols vs 4. | **Card compacta** (thumb `h-10 w-10 rounded-lg object-cover` + nombre + precio + badge `Nx`) y grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` |
| D12 | Seed del borrador | Mantener 'Hamburguesa Clásica' 12500 (diverge del menú real) vs alinear. | **Alinear el seed con `menu.json`**: `{productId:'m2', name:'Hamburguesa Clásica Brioche', price:8900}` (mismo commit que la carta real; mantiene `sentToKitchen:true` para el flujo PIN) |
| D13 | Presupuesto >400 líneas | PR encadenado (rechazado por usuario) vs un solo PR con commits por unidad. | **Un solo PR pre-aprobado**; 8 commits por unidad lógica (plan abajo); `npm run test` verde en cada commit |

**Nota de coordinación (D2)**: durante la fase de diseño, `src/mocks/menu.json` fue modificado en disco por otra agente (commit `7430479`): los 28 ítems YA tienen `image` — 4 rutas locales correctas (m1/m15/m19/m26) y 24 URLs Unsplash remotas (`?auto=format&fit=crop&w=400&q=80`). **Decisión del orquestador: aceptar estas URLs tal cual** (preservar el trabajo de la otra agente, no colisionar) y garantizar el fallback `onError` → `/images/dish_placeholder.png`. El spec `waiter-menu-catalog` fue amendo para permitir URL local o remota con placeholder de fallback.

## Flujos

**(a) Click en mesa ocupada → modal de consumo**

```
Garzón                    TableGrid              WaiterPage                        TableConsumptionModal
  │ click(card t1)          │                        │                                   │
  │───────────────────────►│ onSelectTable('t1')    │                                   │
  │                        │───────────────────────►│ selectTable('t1') (store)        │
  │                        │                        │ activeTable = tables.find(t1)     │
  │                        │                        │ order?.items?.length > 0 ?        │
  │                        │                        │ setConsumptionTable(activeTable)  │
  │                        │                        │──────────────────────────────────►│ open
  │                        │                        │  render: Mesa 1 · N líneas · total│
  │                        │                        │◄──────────────────────────────────│ onClose() → null
```

**(b) Carga de carta (getMenu → /api/menu → menu.json → render con filtros)**

```
WaiterPage                      useWaiterStore            waiterService            mockFetch            menu.json
  │ mount (clocked_in)            │                            │                      │                  │
  │── loadMenu() ────────────────►│ getMenu() ────────────────►│ /api/menu ──────────►│ ──► 28 ítems (copia)
  │◄── {menu, loading:false} ─────│◄───────────────────────────│◄─────────────────────│ (commit D2: +image)
  │── OrderPad(menu, loading)     │
  │   activeFilter='all' → MenuFilterPills
  │   filterMenuByDiet(items, filter) → agrupa por category
  │   card compacta: <img src={item.image} onError→placeholder> + nombre + precio
```

**(c) Add/remove dinámico (+/−/✕ → store → re-render)**

```
OrderPad                     useWaiterStore(orderDraft)
  │ card: onAddToCart(item) ──► addToDraft(item)                 // línea única por productId+course, qty+1
  │ línea: [+] ───────────────► increaseQty(pid, course)         // qty+1 en línea existente
  │ línea: [−] ───────────────► decreaseQty(pid, course)         // qty−1; qty===0 → .filter (remueve)
  │ línea: [✕] ───────────────► removeItem(pid, course)          // elimina línea completa
  │◄── set({orderDraft}) → re-render (badge Nx, subtotales, total)
```

## Cambios por archivo

| Archivo | Acción | Detalle |
|---------|--------|---------|
| `src/mocks/tables.json` | Modificar | 8 → 12 mesas (t9..t12): mix de `status` (`occupied` con `order`, `free`, `billing`, `cleaning`, `waiting_food`, `bill_requested`) — solo filas nuevas; invariantes intactas |
| `src/mocks/menu.json` | Modificar | Campo `image` en los 28 ítems: 4 locales reutilizadas (m1/m15/m19/m26 — ya correctos en disco) + 24 URLs Unsplash ya presentes (aceptadas, D2). Validar que el campo exista y no romper consumidores (`item.image &&`) |
| `public/images/dish_placeholder.png` | Nuevo | Placeholder de fallback (1 asset compartido, fallback `onError` de imágenes) |
| `src/features/WaiterView/components/TableGrid.jsx` | Modificar | Fix `table.guests` → `table.seats` (L99); `STATUS_VARIANTS`+`STATUS_LABELS` con `billing` ("En cobro") y `cleaning` ("En limpieza"); grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`; conserva toggle 2D/3D (fase9) y `onSelectTable(table.id)` |
| `src/features/WaiterView/components/TableConsumptionModal.jsx` | Crear | Modal read-only: props `{table, onClose}`; usa `Modal` de `shared/ui`; filas de `table.order.items` (qty × nombre + subtotal), total, botón cerrar + overlay |
| `src/features/WaiterView/components/OrderPad.jsx` | Modificar | Elimina `MENU_CATALOG` (L22-28); recibe `menu`/`loading`; cards compactas con foto y `onError`→placeholder; `MenuFilterPills` + `filterMenuByDiet`; controles −/qty/+/✕ por línea (patrón `SharedCartDrawer`); conserva upsell (sugiere desde `menu` real), allergy, CourseControl, Eliminar/Anular con PIN |
| `src/features/WaiterView/store/useWaiterStore.js` | Modificar | `loadMenu()` + estado `menu`/`loading` (D10); `increaseQty`/`decreaseQty`/`removeItem` (D5); seed de `selectTable` alineado (D12) |
| `src/features/WaiterView/services/waiterService.js` | Modificar | `getMenu()` → `mockFetch('/api/menu')` (espejo de `clientService.getMenu`) |
| `src/features/WaiterView/pages/WaiterPage.jsx` | Modificar | Estado local `consumptionTable`; handler `handleTableClick` (D8); `loadMenu()` al montar; pasa `menu`/`loading` a OrderPad; monta `TableConsumptionModal`; conserva banner/subscripción `call.waiter` (SOS) |
| `src/shared/utils/menuFilters.js` | Crear | `filterMenuByDiet(items, filterId)` puro (lógica de `ClientPage` L122-130) |
| `src/features/WaiterView/store/useWaiterStore.qty.test.js` | Crear | RED: `increaseQty` acumula línea única; `decreaseQty` remueve en 0; `removeItem` elimina; agregación `productId`+`course` |
| `src/features/WaiterView/components/TableGrid.test.jsx` | Crear | RED: 12 cards y clases de grid; badge `seats` (sin `guests` no crashea); labels `billing`/`cleaning`; `onSelectTable` con id |
| `src/features/WaiterView/components/TableConsumptionModal.test.jsx` | Crear | RED: abre con líneas de `order`; mesa sin `order` no abre (via handler); cierre botón/overlay |
| `src/shared/utils/menuFilters.test.js` | Crear | RED: paridad con el cliente — conjuntos esperados por filtro derivados de `menu.json` (vegano, gluten_free, spicy, popular, postres, bebidas, all) |
| `src/features/WaiterView/components/OrderPad.upsell.test.jsx` | Modificar | Fixtures en el mismo commit de la carta real: S1/S3 pasan a `m2` = "Hamburguesa Clásica Brioche" (8900); S4 usa `productId:'m12'` (Ensalada César con Pollo, sin regla — con menú real `m5` es Hamburguesa y SÍ dispara regla) |
| `src/features/WaiterView/WaiterPage.test.jsx` | Modificar | "Toma de Pedido" pasa a usar el control `+` de la línea sembrada (o doble click en la misma card) para verificar `2x` |
| `src/mocks/menu.test.js` | Modificar | Contrato `image`: todo ítem con `image` string; los 4 locales con rutas exactas; los locales apuntan a archivos existentes en `public/images` |
| Radar / routing / 3D | Verificar | Sin cambios: `FocusMode.test`/`IsometricTableGrid3D.test`/`routing.test` (≥1 Ocupada) siguen verdes con 12 mesas |

## Estrategia de tests (RED-GREEN)

| Unidad | RED primero | Scripts en el mismo commit |
|--------|------------|---------------------------|
| Store qty | `useWaiterStore.qty.test.js` puro (sin DOM) | — |
| TableGrid | `TableGrid.test.jsx` (badge seats/status/12 mesas) | commit fix badge+status |
| Modal | `TableConsumptionModal.test.jsx` + handler en WaiterPage | commit modal |
| Filtros | `menuFilters.test.js` (paridad) | OrderPad filtros |
| Carta real | fixtures `OrderPad.upsell` + `WaiterPage.test` + seed D12 | commit carta real (los fixtures y el cambio de fuente van JUNTOS, spec scenario S2) |
| Contrato menu | `menu.test.js` image | commit assets |

Todos los tests corren con `npm run test` (mockFetch con latencia 0 en test). Escenarios de spec cubiertos: `dynamic-add-remove`, `qty-controls`, `aggregation-semantics`, `item-photo`, `real-menu-source`, `guest-badge-seats`, `table-status-mapping`, `consumption-modal`, `no-order-no-modal`, `tables-grid-12`.

## Presupuesto de revisión (>400 líneas, un solo PR pre-aprobado)

| Área | Líneas est. (delta) |
|------|---------------------|
| TableGrid.jsx (badge/status/grid) | +30 / −10 |
| tables.json (4 mesas) | +45 |
| menu.json (campo image) | +28 |
| Assets (placeholder) | 1 archivo binario (fuera de conteo de líneas) |
| waiterService.js + useWaiterStore.js (loadMenu + qty + seed) | +65 |
| OrderPad.jsx (carta real, cards, filtros, qty) | +190 / −40 |
| TableConsumptionModal.jsx + WaiterPage.jsx | +135 |
| shared/utils/menuFilters.js | +20 |
| Tests (5 suites nuevas/modificadas + fixtures) | +330 / −30 |
| **Total** | **~850 líneas + 1 asset (placeholder)** |

## Plan de commits por unidad lógica (directo a `main`, tests verdes en cada uno)

1. `fix: corregir badge de comensales (seats) y status mapping de billing/cleaning en TableGrid` — TableGrid.jsx + `TableGrid.test.jsx`
2. `feat: ampliar fixture de mesas a 12 con mix de estados y comandas (aditivo)` — tables.json (+ verificación Radar/routing)
3. `feat: agregar soporte de fotos a la carta del mozo` — valida/usa el campo `image` ya presente en `menu.json` (4 locales + 24 Unsplash, commiteado por la otra agente) y agrega `public/images/dish_placeholder.png` como fallback `onError`; `menu.test.js` (verifica `image` presente en los 28 ítems)
4. `feat: carta real del mozo desde menu.json con cards compactas` — waiterService.getMenu, usar loadMenu, OrderPad (sin filtros/qty aún), seed D12, fixtures `OrderPad.upsell` + `WaiterPage.test`
5. `feat: filtros de carta idénticos al cliente (helper compartido + MenuFilterPills)` — menuFilters.js + OrderPad + tests paridad
6. `feat: acciones de qty en useWaiterStore (increaseQty/decreaseQty/removeItem)` — store + `useWaiterStore.qty.test.js`
7. `feat: controles de cantidad −/qty/+/✕ en OrderPad` — OrderPad + tests de escenarios `qty-controls`
8. `feat: modal de consumo de mesa ocupada (TableConsumptionModal)` — componente + WaiterPage + `TableConsumptionModal.test.jsx`

## Riesgos y mitigaciones

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| `menu.json` ya tiene 24 URLs Unsplash (commit `7430479`, otra agente) | Media | Aceptadas tal cual (D2): fallback `onError` → placeholder; el cambio es aditivo para consumidores (`item.image &&`); sin regeneración de assets |
| `tables.json` compartido con Radar/Pos (multi-agente) | Media | Aditivo; invariantes `seats ?? 4` y ≥1 `occupied` verificadas en commit 2 |
| Regresión fase9 (IsometricTableGrid3D) | Baja | Conservar toggle 2D/3D y firma `onSelectTable(table.id)`; `IsometricTableGrid3D.test` sigue verde |
| Tests existentes dependientes de `MENU_CATALOG`/8 mesas | Media | Fixtures actualizados EN el commit que cambia la fuente (lista explícita en sección de tests) |
| Assets locales pesados (~0.7-1MB los existentes) | Baja | Thumbnail pequeño con `object-cover`; opcional re-export a `w=400` como nota (no bloquea demo) |
| Red externa ausente en demo (URLs Unsplash actuales) | Media | `onError` → `/images/dish_placeholder.png` compartido; spec `item-photo` cubre el fallback |
| Change > 400 líneas sin revisión incremental | Alta | Pre-aprobado por el usuario; 8 commits por unidad lógica (plan arriba) |
| Regresión badge SOS (`sos-waiter-call`) | Baja | WaiterPage conserva banner/subscripción; `SosAlertToast.test`/suite `WaiterPage.test` cubren |

## Plan de reversión

Revert por commit con `git revert <hash>`, en orden inverso (8 → 1), cada uno independiente: 8 modal, 7 qty controls, 6 store qty, 5 filtros, 4 carta real, 3 assets+image, 2 tablas, 1 fix badge. `menu.json` solo agrega el campo `image` — revertir quita el campo sin romper consumidores (ClientView ya renderiza condicional `item.image &&`). Los assets se eliminan al revertir el commit 3 (están commiteados). No hay migración de datos ni feature flags.

## Threat Matrix

`N/A` — no routing, shell, subprocess, VCS/PR automation, executable-file classification, ni process-integration boundary en este change.

## Interfaces / Contracts

```js
// Línea de orderDraft (useWaiterStore) — forma existente, sin cambios
{ id, productId, name, price, qty, allergens: [], course, sentToKitchen }

// Acciones nuevas del store (key: productId + course)
increaseQty(productId, course)          // qty+1 en línea existente (no crea duplicados)
decreaseQty(productId, course)          // qty-1; si llega a 0 → .filter (remueve línea)
removeItem(productId, course)           // elimina línea completa (sin alert.fraud)
loadMenu()                              // getMenu() → { menu, loading:false }

// waiterService
getMenu()                               // → mockFetch('/api/menu') → menu.json (copia)

// shared/utils/menuFilters.js
filterMenuByDiet(items, filterId)       // puro; 'vegano'=>veg||vegan, 'gluten_free'=>glutenFree,
                                        // 'spicy'=>spicy, 'popular'=>popular,
                                        // 'postres'=>sweet||cat==='Postres', 'bebidas'=>alcoholic||cat==='Barra', 'all'=>true

// TableConsumptionModal
({ table, onClose })                    // table.order.items: {id, name, qty, price} (read-only)

// Slug rule: normalize(name) → lowercase, quitar emojis, NFD sin diacríticos,
// no-alfanuméricos (incl. &, /) → '_', colapsar y recortar. Ej: 'Poke Bowl Salmón & Sésamo 🌾'
// → poke_bowl_salmon_sesamo. Las 4 existentes (dish_lomo_lo_ovalle, dish_volcan_chocolate,
// dish_pisco_sour, dish_ceviche_mixto) son excepciones explícitas (mapeo fijo en menu.json).
```

## Open Questions

- [ ] Autoría de la divergencia Unsplash en `menu.json` (commit `7430479`): aceptada por el orquestador (D2) — no se regeneran assets, solo se usa el campo `image` con fallback placeholder.
- [ ] Prompt template final de generación de los 24 assets: NO APLICA — se aceptan las URLs Unsplash ya commiteadas (D2); solo se define el placeholder de fallback (revisión visual en verify, spec `item-photo`).
- [ ] Si el linter de FSD rechaza el import cruzado ClientView → WaiterView de `MenuFilterPills`, moverlo a `src/shared` como tarea explícita (hoy la propuesta exige reutilización tal cual).