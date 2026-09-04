# NOTA-opencode-a-antigravity — FIXES para demo-fase1-gaps (verify FAIL)

**Para**: Antigravity (implementador)
**De**: opencode (orquestador)
**Fecha**: 2026-08-17

## Contexto

El verify formal (`openspec/changes/demo-fase1-gaps/verify-report.md`) encontró **3 CRITICAL** y varios WARNING. Tu implementación es mayormente correcta (build/lint OK, 89/89 en corrida registrada), pero el gate no permite archive hasta cerrar estos puntos. Aplicar los fixes en commits separados a `main`, con tests RED-GREEN.

## CRITICAL — obligatorio

### CRITICAL-1 [client-onboarding S3] — la guía BLOQUEA ordenar (MUST violado)
- **Problema verificado en navegador real**: con la guía visible, click en "Agregar" cae en el overlay `fixed inset-0 z-50` (`Modal.jsx:12-15`), cierra la guía y NO agrega al carrito ($0). El spec exige "MUST NOT block ordering".
- **Por qué el test no lo atrapó**: `WelcomeModal.test.jsx:40-54` es falso positivo (fireEvent sortea el overlay; aserción en `:53` es no-op sobre elemento permanente).
- **Fix sugerido**: cambiar de modal overlay a un **tip strip / banner no bloqueante** (`pointer-events-none` en el contenedor o posición flotante que no intercepte el catálogo), o en su defecto overlay con `pointer-events-none` en la zona que tapa. Reescribir el test con aserción real: click "Agregar" → carrito incrementa y guía sigue visible/cerrable sin interferir.

### CRITICAL-2 [cash-shift S3] — escenario de persistencia UNTESTED
- `CashShift.test.jsx` cubre S1/S2/S4 pero NO S3 (reload persiste el turno). El código está bien (`usePosStore.js:196-199`, `partialize` solo cashShift) — falta la evidencia.
- **Fix**: test que verifique el JSON de `mesasplit-cash-shift` en localStorage y que NO incluya bills/pagos transitorios (persist solo cashShift).

### CRITICAL-3 [Proceso] — falta tabla TDD Cycle Evidence
- `apply-progress.md` no incluye la tabla "TDD Cycle Evidence" exigida por strict TDD (test RED → commit → GREEN, por slice).
- **Fix**: actualizar `apply-progress.md` agregando esa tabla por cada uno de los 5 commits.

## WARNING — recomendado (en-scope)

- **WARNING-2 [compliance-sii]**: `selectCierreCiegoOk` está hardcodeado `() => true` (`useCorporateStore.js:151`) — el spec exige que referencie el estado real de `usePosStore` (cross-slice read-only). Cambiarlo para que derive del estado real de cierre ciego y testearlo.
- **WARNING-3 [compliance-sii]**: S1/S2 solo a nivel selector, sin aserciones de UI (`✅ OK`/`🚨 Riesgo`). Agregar aserciones de render del panel.
- **WARNING-4 [cash-shift S4]**: `CashShift.test.jsx:46` espía una instancia ajena del bus (sin valor protector). Ajustar para espiar la instancia real del módulo.

## FUERA DE SCOPE (no tocar en este change)

- **WARNING-1 [kds-offline]**: falta test dedicado del adaptador — opcional, cobertura indirecta aceptada por ahora.
- **WARNING-5 [pre-existente]**: flake `FocusMode.test.jsx` (RadarView) — NO es de este change (verificado pre-existente en c76a427). Se maneja como issue aparte; no lo mezcles con estos fixes.
- **WARNING-6**: diff 1226 líneas vs guard de 400 — decisión de entrega ya tomada por el usuario (commits por unidad en main).

## Verificación final requerida

1. `npm run test` — suite completa 100% verde (ojo: correr mínimo 2 veces si FocusMode flakea; si flakea reportalo, no lo silencies).
2. `npm run build` + `npm run lint`.
3. Actualizar `apply-progress.md` (con tabla TDD + ruta real de WelcomeModal: `components/WelcomeModal.jsx`).

## Comunicación de retorno

Dejá `openspec/changes/demo-fase1-gaps/apply-progress.md` actualizado con los nuevos commits (SHA). opencode re-verifica y, si el gate pasa, archiva.

— opencode