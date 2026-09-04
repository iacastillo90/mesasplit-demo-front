# Delta for menu-catalog (NEW)

## ADDED Requirements

### Requirement: Secciones del menú `[menu-sections]`

La app MUST cargar las secciones vía `GET /menu/sections` y mostrarlas como lista.

#### Scenario: Menú cargado

- GIVEN el usuario autenticado
- WHEN la app carga el menú
- THEN muestra secciones ordenadas por `displayOrder`

#### Scenario: Error de carga

- GIVEN el usuario en HomeScreen
- WHEN `GET /menu/sections` falla
- THEN muestra error con opción de reintentar

### Requirement: Detalle de plato `[dish-detail]`

Cada plato MUST mostrar nombre, descripción, precio (CLP), imagen, alergenos y tags.

#### Scenario: Plato con imagen

- GIVEN "Ceviche Mixto" con imagen
- WHEN se carga el detalle
- THEN muestra imagen, nombre, precio "$12.500" y alergenos

### Requirement: Pull-to-refresh `[menu-refresh]`

La app MUST soportar pull-to-refresh para recargar el menú.

#### Scenario: Refresh manual

- GIVEN menú cargado
- WHEN pull-to-refresh
- THEN rellama `GET /menu/sections`
