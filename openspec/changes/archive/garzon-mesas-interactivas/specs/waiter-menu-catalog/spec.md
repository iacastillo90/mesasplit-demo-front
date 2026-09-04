# Spec: waiter-menu-catalog — Carta del mozo desde menu.json con fotos y filtros

## Purpose

Reemplaza el `MENU_CATALOG` inline de `OrderPad` (5 ítems divergentes de `menu.json`) por la carta real de `src/mocks/menu.json` (28 ítems, 7 categorías) servida por `waiterService.getMenu()` → `mockFetch('/api/menu')`, con foto por ítem, cards compactas (thumbnail + nombre + precio) y filtros idénticos a la vista del cliente (`MenuFilterPills` con `DIET_FILTERS`). Es una capability NUEVA: no modifica requirements spec-level existentes.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **Fuente única de carta**: `menu.json` (con campo `image`) es la única fuente; el `MENU_CATALOG` inline de `OrderPad` se elimina. El cambio a `menu.json` es aditivo (solo agrega `image`); ClientView ya renderiza foto condicionalmente con `item.image &&`.
2. **Assets de fotos**: se reutilizan las 4 fotos existentes (`dish_lomo_lo_ovalle.png` → m1, `dish_volcan_chocolate.png` → m15, `dish_pisco_sour.png` → m19, `dish_ceviche_mixto.png` → m26); los ~24 ítems restantes tienen `image` con URL remota (Unsplash, ya commiteada por la otra agente en `7430479`) o asset local. El render usa `onError` → `/images/dish_placeholder.png` si la imagen falla (p.ej. sin red).
3. **Reuso de filtros**: no se modifica `MenuFilterPills` ni la lógica de filtrado del cliente; se reutilizan tal cual.

## Requirements

### Requirement: Carta real desde menu.json `[real-menu-source]`

`OrderPad` MUST consumir la carta vía `waiterService.getMenu()` (→ `mockFetch('/api/menu')` → `menu.json`) y MUST mostrar los 28 ítems agrupados en sus 7 categorías. MUST NOT mantener el `MENU_CATALOG` inline con precios/categorías divergentes.

#### Scenario: Los 28 ítems se renderizan

- GIVEN `menu.json` con 28 ítems y 7 categorías
- WHEN `OrderPad` carga la carta vía `getMenu()`
- THEN se muestran los 28 ítems con nombre y precio reales (p.ej. m2 "Hamburguesa Clásica Brioche" a 8900)

#### Scenario: Fixtures de tests actualizados en el mismo cambio

- GIVEN tests existentes que dependen del `MENU_CATALOG` inline
- WHEN se reemplaza la fuente por `menu.json`
- THEN los fixtures se actualizan en el mismo cambio Y `npm run test` queda verde

### Requirement: Foto por ítem `[item-photo]`

Cada ítem MUST tener foto visible: m1, m15, m19 y m26 MUST reutilizar las 4 fotos existentes y los ~24 restantes MUST mostrar su `image` (URL remota Unsplash ya presente en `menu.json` o asset local). Si la imagen falla al cargar (p.ej. sin red), el render MUST mostrar `/images/dish_placeholder.png` como fallback Y la card MUST NOT romperse.

#### Scenario: Fotos existentes reutilizadas

- GIVEN `menu.json` con `image` en los 28 ítems
- WHEN `OrderPad` renderiza m1, m15, m19 y m26
- THEN muestran `dish_lomo_lo_ovalle.png`, `dish_volcan_chocolate.png`, `dish_pisco_sour.png` y `dish_ceviche_mixto.png` respectivamente

#### Scenario: Asset faltante cae a placeholder

- GIVEN un ítem cuya imagen falla al cargar (red ausente o URL rota)
- WHEN `OrderPad` renderiza la card
- THEN se muestra `/images/dish_placeholder.png` como fallback Y la card no se rompe

### Requirement: Cards compactas `[compact-cards]`

Cada ítem MUST renderizarse como card compacta con thumbnail pequeño, nombre y precio, reduciendo el scroll vertical frente al layout anterior.

#### Scenario: Card compacta con datos visibles

- GIVEN la carta cargada
- WHEN se renderiza un ítem
- THEN la card muestra thumbnail pequeño, nombre y precio en una fila compacta

### Requirement: Filtros idénticos al cliente `[client-identical-filters]`

`OrderPad` MUST usar `MenuFilterPills` con los `DIET_FILTERS` del cliente y MUST aplicar la misma lógica de filtrado por categoría/dieta que `ClientPage`. Los resultados filtrados MUST coincidir con los del cliente ante el mismo filtro.

#### Scenario: Filtro vegano aplicado igual que el cliente

- GIVEN el filtro "vegano" activo en `OrderPad`
- WHEN se filtra la carta
- THEN se muestran exactamente los ítems que `ClientPage` mostraría con el mismo filtro

#### Scenario: Filtro por categoría

- GIVEN la categoría "Postres" seleccionada
- WHEN se filtra la carta
- THEN solo se muestran ítems de esa categoría

#### Scenario: Sin filtro muestra todo

- GIVEN el filtro "Todos" activo
- WHEN se renderiza la carta
- THEN se muestran los 28 ítems completos

## Resumen (ADDED)

Todas las requirements anteriores son ADDED para la capability `waiter-menu-catalog`: `real-menu-source`, `item-photo`, `compact-cards`, `client-identical-filters`. No hay requirements MODIFIED ni REMOVED.
