# Spec: allergy-shield — Escudo de alergias normalizado y alerta no bloqueante

## Purpose

Normaliza el vocabulario de alergias (hoy divergente: `glutenFree/lactoseFree/nutAllergy` en ClientProfilePage vs `"gluten"`/`"lácteos"` en menu.json) en un enum ALLERGEN compartido de seis valores, persiste `PERSON_PROFILE.allergies` y alerta en checkout cuando el perfil del cliente intersecta con los allergens del plato, sin bloquear el pedido. Sin escandallo (RECIPE_INGREDIENT fuera de alcance).

## Requirements

### Requirement: Enum ALLERGEN único [CLI-ALG-001]

El sistema MUST usar un enum ALLERGEN compartido con exactamente seis valores canónicos: GLUTEN, LACTEOS, FRUTOS_SECOS, HUEVO, PESCADO, SESAMO. Todo dato de alergia (perfil y carta) MUST referenciar este enum, sin vocabulario paralelo.

#### Scenario: Valores restringidos al enum

- GIVEN un valor de alergia de cualquier fuente
- WHEN se valida contra el enum
- THEN solo los seis valores canónicos son admitidos

### Requirement: Mapeo de legado [CLI-ALG-002]

El sistema MUST traducir valores legados al enum: `glutenFree`→GLUTEN, `lactoseFree`→LACTEOS, `nutAllergy`/`maní`→FRUTOS_SECOS, y las cadenas de menu.json (`"gluten"`, `"lácteos"`) normalizadas sin tilde ni mayúsculas (`"Lácteos"`→LACTEOS).

#### Scenario: Perfil legado migrado

- GIVEN un perfil guardado con glutenFree=true (formato viejo)
- WHEN se migra/normaliza
- THEN la alergia queda como GLUTEN en el enum

#### Scenario: Normalización de acentos y mayúsculas

- GIVEN menu.json con `"lácteos"` (con tilde)
- WHEN se normaliza
- THEN se resuelve a LACTEOS sin ambigüedad

### Requirement: Persistencia de alergias del perfil [CLI-ALG-003]

`PERSON_PROFILE.allergies` MUST persistirse: el cliente puede guardar y editar sus alergias y estas MUST sobrevivir a la recarga (reemplaza el useState muerto de ClientProfilePage).

#### Scenario: Guardar y recargar

- GIVEN un cliente que marca GLUTEN en su perfil
- WHEN guarda y recarga la página
- THEN el perfil conserva GLUTEN

### Requirement: Carta con allergens del enum [CLI-ALG-004]

Los platos (DISH.allergens) MUST usar el mismo enum ALLERGEN para que el cruce sea posible.

#### Scenario: Plato con allergens declarados

- GIVEN un plato con allergens [GLUTEN]
- WHEN se consulta su ficha
- THEN expone GLUTEN según el enum

### Requirement: Alerta no bloqueante en checkout [CLI-ALG-005]

En el checkout, si la intersección perfil∩plato es distinta de vacío, el sistema MUST mostrar una ALERTA NO BLOQUEANTE: visible, pero MUST NOT impedir finalizar el pedido. La detección MUST usar solo los allergens declarados del plato (sin RECIPE_INGREDIENT/escandallo).

#### Scenario: Coincidencia alerta y no bloquea

- GIVEN perfil con GLUTEN y un plato con GLUTEN en el carrito
- WHEN se confirma el pedido
- THEN se muestra la alerta de alergia
- AND el pedido puede finalizar igualmente

#### Scenario: Sin coincidencia

- GIVEN perfil con GLUTEN y plato con LACTEOS
- WHEN se confirma el pedido
- THEN no se muestra alerta

#### Scenario: Perfil sin alergias

- GIVEN un perfil con allergies vacío
- WHEN se confirma cualquier pedido
- THEN no se muestra alerta

#### Scenario: Alerta detalla la coincidencia

- GIVEN varios platos con GLUTEN en el carrito
- WHEN se muestra la alerta
- THEN se listan los platos y el alérgeno coincidente

## Comment

- ER v2: `PERSON_PROFILE.allergies` string[] y `DISH.allergens` string[] referencian el mismo dominio de valores (Escudo de Alergias).
- El cruce perfil∩plato es una función pura testeable en front (vitest) — RED primero bajo strict TDD.
- Existe vocabulario "maní" hardcodeado en OrderPad/KDS (AllergyShieldAlert): este change lo unifica por el mapeo, sin tocar KDS salvo lo necesario.
- Backend Java sin stack: persistencia de `PERSON_PROFILE.allergies` como requisito de testabilidad pendiente.
- Sin escandallo: la alerta no usa RECIPE_INGREDIENT.