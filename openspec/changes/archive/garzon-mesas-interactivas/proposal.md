# Proposal: garzon-mesas-interactivas — Rediseño Interactivo de la Vista del Garzón (12 Mesas, Consumo, Carta con Fotos y Add/Remove Dinámico)

## Intención

La vista del Garzón hoy es estática y divergente del cliente: solo 8 mesas en grid de hasta 3 columnas; el badge de comensales está roto (renderiza `table.guests`, campo que no existe en `tables.json` — solo `seats`); el mapping de estados no cubre `billing` ni `cleaning` (caen al fallback incorrecto); la carta del mozo es un `MENU_CATALOG` inline de 5 ítems con precios/categorías que DIVERGEN de `menu.json` (p.ej. `m2` "Hamburguesa Clásica Brioche" cuesta 8900, no 12500), sin fotos ni filtros; y el borrador de comanda solo suma (`addToDraft`), sin poder quitar/decrementar salvo anulación por PIN. El cliente ya tiene la referencia deseada: carta real de 28 ítems con foto y filtros, y carrito dinámico con −/+/✕. Este change rediseña `WaiterPage` para que sea interactiva y consistente con el cliente: 12 mesas, click en mesa ocupada → ver consumo (comanda), carta real con foto por ítem, cards compactas con menos scroll, filtros idénticos al cliente y add/remove dinámico. El usuario eligió explícitamente la opción "Foto para los 28 ítems": reutilizar las 4 fotos existentes y generar asset por ítem restante.

## Alcance

### In Scope

- `src/mocks/tables.json`: 8 → 12 mesas con mix de statuses (`occupied`, `billing`, `free`, `cleaning`, `waiting_food`, `bill_requested`) y `order` en suficientes mesas ocupadas para que el demo de consumo funcione. Verificación: Radar usa `seats ?? 4` y `routing.test` espera ≥1 Ocupada — ambas invariantes se mantienen con 12 (solo se agregan filas; no se renombran campos). Riesgo multi-agente: archivo compartido con Radar/Pos.
- Fix del bug `table.guests` en `TableGrid.jsx`: renderizar `seats` (o derivar `guests`) y corregir el status mapping para incluir `billing` y `cleaning`.
- `OrderPad.jsx`: reemplazar `MENU_CATALOG` inline por la carta real (28 ítems, 7 categorías) vía `getMenu()` en `waiterService` (→ `mockFetch('/api/menu')` → `menu.json`; reutiliza la ruta de `clientService.getMenu()`).
- Fotos: usar el campo `image` ya presente en los 28 ítems de `src/mocks/menu.json` (commiteado por la otra agente en `7430479`): 4 fotos locales (`dish_lomo_lo_ovalle.png` → m1, `dish_volcan_chocolate.png` → m15, `dish_pisco_sour.png` → m19, `dish_ceviche_mixto.png` → m26) + 24 URLs Unsplash remotas. Se agrega `public/images/dish_placeholder.png` como fallback `onError` si una imagen falla (p.ej. sin red). NO se regeneran 24 assets IA (decisión D2: preservar el trabajo de la otra agente).
- Cards compactas: thumbnail de foto pequeño + nombre + precio en `OrderPad` para reducir scroll.
- Filtros: reutilizar `MenuFilterPills` de ClientView (`DIET_FILTERS`) en `OrderPad` — misma carta y mismos filtros que el cliente.
- Click en mesa ocupada → modal de consumo (comanda) con las líneas de `table.order`, reutilizando el render de líneas existente.
- Add/remove dinámico: acciones nuevas en `useWaiterStore` sobre `orderDraft` (`increaseQty`, `decreaseQty` con remoción en 0, `removeItem`) y controles −/qty/+ por línea en `OrderPad`, consistente con `SharedCartDrawer` del cliente.
- Grid de 12 mesas: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4` con cards compactas (hoy 2/3).
- Tests RED-GREEN (`strict_tdd: true`): store (acciones qty), OrderPad (carta real, filtros, qty), TableGrid (badge seats, status mapping, 12 mesas), modal de consumo; actualizar fixtures de tests existentes que dependen de `MENU_CATALOG`/8 mesas (`OrderPad.upsell.test.jsx`, etc.).
- Entrega: un solo PR (pre-aprobado por el usuario). El change superará el presupuesto de 400 líneas de revisión; `sdd-tasks` evaluará encadenado/`size:exception` según `delivery_strategy` del orquestador.

### Out of Scope

- Backend, envío real, transporte realtime nuevo — todo simulado (demo).
- No tocar `routes/index.jsx`, `routes/views.jsx` ni `ClientProfilePage.jsx` (coordinación multi-agente con Antigravity).
- No modificar la vista del cliente ni su carrito (solo REUTILIZAR `MenuFilterPills` y el patrón de qty de `SharedCartDrawer`).
- No rediseñar KDS/Radar; no cambiar el flujo de PIN/anulación existente; no editar comandas desde el modal (solo visualización).

## Capacidades

> Contrato entre proposal y sdd-spec.

### Nuevas Capacidades

- `waiter-interactive-tables`: grid de 12 mesas interactivas, badge correcto de comensales (`seats`), status mapping completo (`occupied`, `waiting_food`, `bill_requested`, `free`, `billing`, `cleaning`) y click en mesa ocupada → modal de consumo (comanda de `table.order`).
- `waiter-menu-catalog`: carta del mozo desde `menu.json` (28 ítems, 7 categorías) con foto por ítem, cards compactas y filtros `MenuFilterPills` idénticos a la vista del cliente.
- `waiter-order-draft-cart`: add/remove dinámico del borrador de comanda — `increaseQty`, `decreaseQty` (remueve en 0) y `removeItem` sobre `orderDraft`, consistente con el carrito del cliente.

### Capacidades Modificadas

- None — ningún requirement spec-level de las capabilities existentes cambia (no existe spec de la vista del Garzón hoy). Restricción de implementación: el requirement "Waiter Receives Notification Badge" de `sos-waiter-call` MUST seguir cumpliéndose (el rediseño de `WaiterPage` conserva el banner/subscripción a `call.waiter`).

## Enfoque

Reutilizar patrones ya probados en ClientView: `getMenu()` vía `mockFetch('/api/menu')` (fuente única `menu.json` + campo `image`), `MenuFilterPills` como barra de filtros, y el patrón de qty controls de `SharedCartDrawer`. `useWaiterStore` crece con acciones de qty sobre `orderDraft`; el modal de consumo se apoya en la `order` ya presente en `tables.json`; `TableGrid` consume la carta/estados corregidos. `strict_tdd: true` — comportamiento nuevo arranca RED. Entrega por commits por unidad lógica directo a `main`.

## Áreas Afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/mocks/menu.json` | Modificado | Campo `image` en los 28 ítems (fuente única de carta) |
| `src/mocks/tables.json` | Modificado | 8 → 12 mesas, mix de statuses y orders de demo |
| `public/images/dish_placeholder.png` | Nuevo | Placeholder de fallback `onError` (1 asset compartido) |
| `src/features/WaiterView/components/TableGrid.jsx` | Modificado | Fix `guests`→`seats`, status mapping, grid 4 cols, click → modal |
| `src/features/WaiterView/components/TableConsumptionModal.jsx` | Nuevo | Modal de consumo de mesa ocupada |
| `src/features/WaiterView/components/OrderPad.jsx` | Modificado | Carta real con fotos, cards compactas, filtros, controles qty |
| `src/features/WaiterView/store/useWaiterStore.js` | Modificado | `increaseQty`/`decreaseQty`/`removeItem` sobre `orderDraft` |
| `src/features/WaiterView/services/waiterService.js` | Modificado | `getMenu()` → `/api/menu` |
| `src/features/WaiterView/pages/WaiterPage.jsx` | Modificado | Integración modal + layout 12 mesas |
| Tests WaiterView (nuevos/modificados) | Nuevo/Modificado | RED-GREEN: store qty, OrderPad, TableGrid, modal |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| `tables.json` compartido con Radar/Pos (multi-agente) | Media | Cambio aditivo (solo agregar filas); validar invariantes (`seats ?? 4`, ≥1 Ocupada) y coordinar scope en openspec/ |
| Tests existentes dependen de `MENU_CATALOG`/8 mesas | Media | Actualizar fixtures en el mismo commit que cambia la fuente |
| Change supera presupuesto de 400 líneas | Alta | Pre-aprobado "un solo PR" por el usuario; `sdd-tasks` decide encadenado/`size:exception` según `delivery_strategy` |
| Fotos remotas Unsplash en `menu.json` (commiteado por otra agente) | Media | Aceptadas tal cual (D2); fallback `onError` → placeholder; sin regeneración de assets |
| Regresión en badge SOS (`sos-waiter-call`) | Baja | `WaiterPage` conserva banner/subscripción; test existente de `SosAlertToast` cubre |

## Plan de Reversión

Commits por unidad lógica directo a `main`; revert por commit (`git revert`). Los fixes de bug (badge `seats`, status mapping) y los cambios aditivos (tablas, `image`, modal, acciones qty, assets) son reversibles individualmente. `menu.json` solo agrega el campo `image` — no rompe consumidores (ClientView ya renderiza foto condicionalmente con `item.image &&`).

## Dependencias

- Ninguna externa. Vitest 3 + Testing Library activos; `npm run test` (`strict_tdd: true`).
- Assets de fotos (generación AI/stock) resueltos como tarea de assets dentro del change.

## Criterios de Éxito

- [ ] `npm run test` verde incluyendo los tests RED-GREEN nuevos (store qty, OrderPad carta/filtros/qty, TableGrid badge/status/12 mesas, modal consumo).
- [ ] `WaiterPage` muestra 12 mesas; badge muestra `seats` correctos; `billing`/`cleaning`/`waiting_food`/`bill_requested` con label correcto.
- [ ] Click en mesa ocupada abre el modal con las líneas de consumo de su `order`; mesas sin `order` no abren modal (o muestran estado vacío).
- [ ] `OrderPad` muestra los 28 ítems de `menu.json` con foto, cards compactas y filtros idénticos a ClientView.
- [ ] Add/remove dinámico: `+` incrementa, `−` decrementa y remueve en 0, botón de quitar línea; consistente con el carrito del cliente.
- [ ] `npm run build` verde; sin regresión en `sos-waiter-call` (badge SOS sigue operativo).
