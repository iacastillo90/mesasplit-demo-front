# Spec: menu-catalog — Visualización del Menú

## Purpose

Mostrar el menú del restaurante agrupado por secciones, con precio, alergenos y disponibilidad de cada plato.

## Requirements

### Requirement: Secciones del menú `[menu-sections]`

La app MUST cargar las secciones vía `GET /menu/sections` y mostrarlas como lista expandible. Cada sección tiene `id`, `name`, `description`, `displayOrder` y `dishes[]`.

#### Scenario: Menú cargado

- GIVEN el usuario autenticado en HomeScreen
- WHEN la app carga el menú
- THEN muestra secciones ordenadas por `displayOrder`
- AND cada sección muestra su nombre y lista de platos

#### Scenario: Error de carga

- GIVEN el usuario en HomeScreen
- WHEN `GET /menu/sections` falla
- THEN muestra mensaje de error con opción de reintentar
- AND NO muestra datos stale (excepto cache de 5 min)

### Requirement: Detalle de plato `[dish-detail]`

Cada plato MUST mostrar nombre, descripción, precio (CLP, sin decimales), imagen (si disponible), lista de alergenos y tags.

#### Scenario: Plato con imagen

- GIVEN el usuario en DishDetailScreen para "Ceviche Mixto"
- WHEN se carga el detalle
- THEN muestra imagen, nombre, descripción, precio "$12.500" y alergenos ["Mariscos", "Cítricos"]

#### Scenario: Plato sin imagen

- GIVEN un plato sin `imageUrl`
- WHEN se muestra el detalle
- THEN se muestra placeholder de imagen

### Requirement: Pull-to-refresh `[menu-refresh]`

La app MUST soportar pull-to-refresh para recargar el menú.

#### Scenario: Refresh manual

- GIVEN el usuario en HomeScreen con menú cargado
- WHEN realiza pull-to-refresh
- THEN la app rellama `GET /menu/sections`
- AND actualiza la lista
