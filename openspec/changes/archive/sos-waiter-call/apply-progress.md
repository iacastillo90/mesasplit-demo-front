# Apply Progress — sos-waiter-call (apply correctivo post-verify)

> Artefacto de evidencia TDD del apply. **CRITICAL 3 del verify** exigía este artefacto
> (no existía ni en `openspec/changes/sos-waiter-call/` ni en Engram
> `sdd/sos-waiter-call/apply-progress`). Se crea ahora con la evidencia del ciclo
> RED → GREEN → REFACTOR de la pasada correctiva.
>
> Modo: **Strict TDD** (`strict_tdd: true` en `openspec/config.yaml`, runner Vitest 3 + RTL/jsdom).
> Naturaleza: apply correctivo acotado para cerrar CRITICAL 2 y 3 del verify
> (commit del change: `63a8cbf`). La implementación base está sana; NO se reescribió lógica.

## TDD Cycle Evidence (pasar correctiva)

| Requerimiento | Test File | Layer | Safety Net | RED | GREEN | TRIANGULATE | REFACTOR |
|---|---|---|---|---|---|---|---|
| REQ-02 payload `call.waiter` (`{ tableId, reason, customerName, timestamp }`) | `src/features/ClientView/SosModal.test.jsx` | Integration | ✅ 2/2 (baseline) | ✅ Escrito y ejecutado: 2 tests fallan — `fakeBus.publish` nunca invocado (producción ignoraba prop `bus`) | ✅ Tras inyectar `bus` en `SosModal.jsx`: 3/3 verdes | ✅ 2 casos: motivo seleccionado ("Falta cubierto") + motivo por defecto ("Limpiar mesa") — distinto camino de código | ➖ None needed (cambio mínimo de DI, sin refactor) |
| REQ-03 badge del mozo (`call.waiter` → banner) | `src/features/WaiterView/WaiterPage.test.jsx` | Integration | ✅ 5/5 (baseline) | ✅ Escrito y ejecutado: 2 tests fallan — `handlers['call.waiter'] is not a function` (producción ignoraba prop `bus`) | ✅ Tras inyectar `bus` en `WaiterPage.jsx`: 7/7 verdes | ✅ 2 casos: banner muestra mesa+motivo (table-05/Falta cubierto) + descarte con "Atendido" y segunda llamada (table-09/Ayuda general) | ➖ None needed (cambio mínimo de DI, sin refactor) |

Detalle RED→GREEN (evidencia de ejecución):

```text
# RED — npx vitest run SosModal.test.jsx WaiterPage.test.jsx
Test Files  2 failed (2)      Tests  4 failed | 6 passed (10)
  × emite el evento call.waiter con el payload exacto del motivo seleccionado al confirmar
    → expected "spy" to be called with arguments: [ 'call.waiter', …(1) ]
  × emite el motivo por defecto "Limpiar mesa" si el comensal no cambia la selección
    → expected "spy" to be called with arguments: [ 'call.waiter', …(1) ]
  × Badge REQ-03 > muestra el banner de alerta con mesa y motivo al recibir el evento call.waiter
    → TypeError: handlers.call.waiter is not a function
  × Badge REQ-03 > descarta el banner al presionar "Atendido" tras recibir una nueva llamada
    → TypeError: handlers.call.waiter is not a function

# GREEN — mismo comando (producción con prop `bus` inyectable)
Test Files  2 passed (2)      Tests  10 passed (10)
```

## Work Unit Evidence (Hard Gate)

| Evidence | Valor |
|---|---|
| Comando de test enfocado y resultado exacto | `npx vitest run src/features/ClientView/SosModal.test.jsx src/features/WaiterView/WaiterPage.test.jsx` → **10/10 pass**; suite de features (`src/features/ClientView src/features/WaiterView`) → **34/34 pass**; `npm run build` → exit 0; `eslint` (4 archivos del scope) → 0 errores |
| Runtime harness / escenario | N/A con justificación: el bucle cross-view real depende de `BroadcastChannel` entre DOS pestañas de navegador (demo same-device); en jsdom no existe BroadcastChannel, por lo que se verifica el contrato del bus con inyección de dependencia (bus falso que captura `subscribe`/`publish`), no con harness de browser |
| Rollback boundary | `git revert` del commit del apply restaura los 4 archivos del scope; las props `bus` son aditivas/opcionales → sin cambio de comportamiento en browser ni dependencia de otros archivos |

## Cambios (solo scope autorizado)

| File | Action | Qué y por qué |
|---|---|---|
| `src/features/ClientView/SosModal.test.jsx` | Modified | Asserts del payload emitido (`{ tableId, reason, customerName, timestamp }`) con bus falso inyectado por prop; + triangulación con motivo por defecto. Cierra la WARNING del verify (assert de payload faltante) y el escenario REQ-02 "Falta cubierto" |
| `src/features/ClientView/components/SosModal.jsx` | Modified | Prop opcional `bus` (inyección de dependencia) con fallback a la instancia del módulo. Mínimo cambio de testeabilidad, cero cambio de comportamiento |
| `src/features/WaiterView/WaiterPage.test.jsx` | Modified | Test de runtime REQ-03: al recibir `call.waiter` se renderiza el banner (`data-testid="sos-alert-banner"`) con mesa + motivo; + test de descarte "Atendido" (triangulación) |
| `src/features/WaiterView/pages/WaiterPage.jsx` | Modified | Prop opcional `bus` usada en el efecto de suscripción a `call.waiter` (dep `[busProp]`), con fallback al bus del módulo. Mínimo cambio, mismo comportamiento en browser |

## Deviations

- La emisión sigue usando `createRealtimeBus('mesasplit')` de módulo (no `useRealtimeBus` singleton), tal como estaba en `63a8cbf`. La deviación de diseño ya documentada en el verify (WARNING 3, entrega cross-tab vía BroadcastChannel) queda FUERA de este apply correctivo — no se reescribe lógica de bus.
- No se toca el campo de nombre del cliente (WARNING 1, no bloqueante) ni el tintado rojo del botón (WARNING 4, no bloqueante).

## Issues remanentes (ajenos al change)

- **Flake RadarView** (CRITICAL 1 del verify, fuera de scope): `FocusMode.test.jsx:36` falla intermitente en suite completa por el singleton `useRadarStore` que fuga `focusMode: true` entre test files del mismo worker. Lo arregla el agente de RadarView/Antigravity. Este apply NO corrió la suite completa como gate (instructivo), por lo que el flake no se re-produjo acá.
- `splitService.js` fuera de scope en `63a8cbf` (hygiene de commit, WARNING 5) — no se toca.

## Status

Correctivo completo: CRITICAL 2 (REQ-03 runtime proof) y CRITICAL 3 (evidencia TDD) cerrados; WARNING 2 (payload assert) cerrado. Restan para archive: resolver flake de RadarView (agente ajeno) y warnings no bloqueantes.
