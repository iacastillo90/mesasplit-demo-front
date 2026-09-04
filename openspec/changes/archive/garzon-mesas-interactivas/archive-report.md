# Archive Report: garzon-mesas-interactivas

```yaml
schema: gentle-ai.archive-report/v1
change: garzon-mesas-interactivas
date: 2026-08-18
mode: openspec
archive_target: openspec/changes/archive/garzon-mesas-interactivas/
verdict: pass_with_warnings
requirements: 14/14
scenarios: 25/28 (3 PARTIAL)
tests: 295/295
build: ok
blockers: 0
critical_findings: 0
impl_commits:
  - b86ce4f — fix: corregir badge de comensales (seats) y status mapping de billing/cleaning en TableGrid
  - ab3f84d — feat: ampliar fixture de mesas a 12 con mix de estados y comandas (aditivo)
  - 445e805 — feat: agregar soporte de fotos a la carta del mozo con placeholder de fallback
  - (absorbido en 2edfa42, Antigravity) — feat: carta real del mozo desde menu.json con cards compactas
  - 194f557 — feat: filtros de carta idénticos al cliente (helper compartido + MenuFilterPills)
  - ce5db7d — feat: acciones de qty en useWaiterStore (increaseQty/decreaseQty/removeItem)
  - f2f9712 — feat: controles de cantidad −/qty/+/✕ en OrderPad
  - 8998d63 — feat: modal read-only de consumo al clickear mesa ocupada
```

## Resumen

Se archiva el change `garzon-mesas-interactivas` (rediseño interactivo de la vista del
Garzón: grid de 12 mesas con badge `seats` corregido y status mapping completo, modal
de consumo en mesa ocupada, carta real del mozo desde `menu.json` con fotos y filtros
idénticos al cliente, y add/remove dinámico del borrador de comanda) completando el
ciclo SDD. Los 3 delta specs se sincronizaron a los specs principales como capabilities
nuevas (`openspec/specs/{waiter-interactive-tables, waiter-menu-catalog,
waiter-order-draft-cart}/spec.md`), el folder del change se movió a
`openspec/changes/archive/` siguiendo la convención del repo (nombre plano, sin
prefijo de fecha, igual que los 12 archivados previos) y este reporte queda como audit
trail en el filesystem (modo `openspec`).

## Task Completion Gate

| Ítem | Estado |
|------|--------|
| Tasks totales | 29 |
| Tasks completas `[x]` | 29 |
| Tasks sin marcar | 0 |

Gate APROBADO: `tasks.md` no tiene tareas de implementación sin marcar (Fases 1–9,
todas `[x]`, con evidencia TDD inline "Hecho: RED …/GREEN …" por tarea).

## CRITICAL Gate — verify

El `verify-report.md` (en este folder) emitió **verdict PASS WITH WARNINGS**:

- **Requirements**: 14/14 implementados (6 `waiter-interactive-tables` + 4
  `waiter-menu-catalog` + 4 `waiter-order-draft-cart`), evidencia estática + runtime.
- **Escenarios**: 25/28 COMPLIANT, 3/28 PARTIAL, 0 UNTESTED, 0 FAILING.
- **Tests**: 295/295 (`npx vitest run --testTimeout=60000`, exit 0; 91 archivos).
- **Build**: `npm run build` exit 0 (`✓ built in 18.41s`; WaiterPage 40.49 kB │ gzip
  10.52 kB).
- **Lint**: `npx eslint .` exit 0, sin errores ni warnings.
- **CRITICAL**: 0. **Blockers**: 0.

Los 3 PARTIAL no violan spec (el código cumple; evidencia estática sólida) — son rigor
de covering test incompleto: (a) `tables-grid-12` sc.1 sin aserción de "12 cards" ni de
la cadena de clases del grid; (b) `item-photo` sc.2 sin test que dispare un `onError`
real; (c) `compact-cards` sc.1 sin aserción del thumbnail/img. El reporte de verify
habilita archive explícitamente.

## Sync de Delta Spec a Main Specs

| Domain | Acción | Detalle |
|--------|--------|---------|
| waiter-interactive-tables | Created | No existía `openspec/specs/waiter-interactive-tables/`; delta spec (6 requirements ADDED, 11 escenarios) copiado a spec canónico de capability `openspec/specs/waiter-interactive-tables/spec.md`: header `# Spec: waiter-interactive-tables — Grid de 12 mesas interactivas del garzón`, `## Purpose`, `## Decisiones de alcance` y `## Requirements` con los 6 bloques `### Requirement:` (nombres, bodies y escenarios preservados verbatim). Única normalización: se omitió el trailer `## Resumen (ADDED)` del delta, siguiendo el patrón de `openspec/specs/demo-fase1-gaps/spec.md` (capability por folder `openspec/specs/{domain}/spec.md`) y de los specs canónicos previos (`sos-waiter-call`, `modo-hora-punta`, `account-split`). |
| waiter-menu-catalog | Created | No existía `openspec/specs/waiter-menu-catalog/`; delta spec (4 requirements ADDED, 8 escenarios) copiado a `openspec/specs/waiter-menu-catalog/spec.md` con la misma normalización (sin `## Resumen (ADDED)`). |
| waiter-order-draft-cart | Created | No existía `openspec/specs/waiter-order-draft-cart/`; delta spec (4 requirements ADDED, 9 escenarios) copiado a `openspec/specs/waiter-order-draft-cart/spec.md` con la misma normalización (sin `## Resumen (ADDED)`). |

## Archivo (folder move)

- Origen: `openspec/changes/garzon-mesas-interactivas/`
- Destino: `openspec/changes/archive/garzon-mesas-interactivas/` — **sin prefijo de
  fecha**. El SKILL genérico (sdd-archive v2) prescribe `YYYY-MM-DD-{change-name}`,
  pero la convención establecida del repo (12 archivados previos: setup-stack,
  kds-kitchen, account-split, waiter-pwa, local-admin-radar, pos-cashier,
  super-admin-corporate, interactive-table-reservation, customer-survey-ratings,
  sos-waiter-call, modo-hora-punta, demo-fase1-gaps) usa nombre plano. Se sigue la
  convención del repo y lo indicado por el orquestador.

## Contenido del archivo (audit trail)

- proposal.md ✅
- specs/waiter-interactive-tables/spec.md ✅ (delta spec original; se preserva tal cual)
- specs/waiter-menu-catalog/spec.md ✅ (delta spec original; se preserva tal cual)
- specs/waiter-order-draft-cart/spec.md ✅ (delta spec original; se preserva tal cual)
- design.md ✅
- tasks.md ✅ (29/29, sin tareas sin marcar)
- verify-report.md ✅ (verdict PASS WITH WARNINGS, evidencia de hashes)
- archive-report.md ✅ (este artefacto)
- apply-progress.md ❌ (no existió en el change; la evidencia TDD es inline en
  `tasks.md` — "Hecho: RED …/GREEN …" por tarea, convención del proyecto, validada en
  verify — no bloquea archive, se documenta aquí)
- exploration.md / state.yaml ❌ (no existieron; no requeridos por la convención previa)

## Files changed (8 unidades lógicas)

Los 8 commits por unidad lógica planificados en `tasks.md` (directo a `main`, un solo
PR pre-aprobado por el usuario):

1. `b86ce4f` — fix badge seats + status mapping → `TableGrid.jsx`, `TableGrid.test.jsx`
2. `ab3f84d` — 12 mesas aditivo → `tables.json`, `tables.test.js`
3. `445e805` — fotos/placeholder → `menu.test.js` (asset `dish_placeholder.png` landeó
   en `8d819da`, Antigravity)
4. (absorbido en `2edfa42`, Antigravity) — carta real → `OrderPad.jsx`,
   `waiterService.js`, `useWaiterStore.js`, `WaiterPage.jsx`, fixtures de tests
5. `194f557` — filtros idénticos al cliente → `OrderPad.jsx`, `menuFilters.js` (+test),
   `shared/utils/index.js`
6. `ce5db7d` — qty store → `useWaiterStore.js`, `useWaiterStore.qty.test.js`
7. `f2f9712` — qty controles → `OrderPad.jsx`, `OrderPad.qty.test.jsx`, `WaiterPage.jsx`,
   `WaiterPage.test.jsx`
8. `8998d63` — modal consumo → `TableConsumptionModal.jsx` (+test), `WaiterPage.jsx`,
   `WaiterPage.test.jsx`

Fuentes finales del change: `src/features/WaiterView/{components/TableGrid.jsx,
components/TableConsumptionModal.jsx, components/OrderPad.jsx, pages/WaiterPage.jsx,
store/useWaiterStore.js, services/waiterService.js}`, `src/shared/utils/menuFilters.js`,
`src/mocks/{tables.json, menu.json (campo image, commit 7430479)}`,
`public/images/dish_placeholder.png` + 9 suites de test.

## Deuda remanente (no bloqueante)

- **3 escenarios PARTIAL (WARNING 1 de verify)**: `tables-grid-12` sc.1 (sin aserción
  de "12 cards" ni cadena de clases del grid), `item-photo` sc.2 (sin test que dispare
  `onError`), `compact-cards` sc.1 (thumbnail/img no aseverado). El código cumple el
  spec; es covering test incompleto. Mejora futura sugerida por verify: aserción de la
  cadena `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, conteo de 12 cards y un test de
  imagen que dispare `onError`.
- **Flakiness preexistente RadarView (WARNING 2/3 de verify)**: timeouts de 15000ms
  intratest en `FocusMode.test.jsx`/`RadarPage.test.jsx` bajo carga — preexistente del
  área Antigravity (el diff del change no toca RadarView); Antigravity la estabilizó
  durante la verificación (`14bd681` testTimeout global, `7abf3ff`/`38fc585`/`49b33c1`
  cleanup de timers). Monitorear si reaparece en CI.
- **Contenido absorbido en commits de Antigravity (WARNING 3 de verify)**: el commit 4
  del plan (carta real) y partes de las fases 1/3 (`TableGrid.test.jsx` → `8285288`,
  placeholder → `8d819da`, carta real/getMenu/seed → `2edfa42`) no tienen hash propio
  del change por barrido del working tree multi-agente. **Contenido verificado idéntico**
  (documentado en tasks 4.3 y re-verificado en verify con suites verdes en HEAD); riesgo
  de auditoría solo si se revisa por `git log -- <file>`.
- **Barrel `shared/utils/index.js` (WARNING 2 de verify)**: `c8fc37d` (POS, Antigravity,
  posterior al último commit del change) reemplazó el re-export `filterMenuByDiet` por
  `exportToCsv`. No rompe nada (OrderPad importa el helper directo desde
  `menuFilters.js`); solapamiento multi-agente registrado.
- **Brief vs specs (SUGGESTION 3 de verify)**: el brief del orchestrator citaba 30
  escenarios; el conteo real de los specs es 28 (11 + 8 + 9). Este reporte y el verify
  usan el conteo real.

## Git state verificado (sin commits nuevos)

- Working tree limpio (`git status --porcelain` vacío) ✅
- Branch `main`, HEAD posterior a la verificación (Antigravity aterrizó `7abf3ff`,
  `38fc585`, `49b33c1` — cleanup de timers RadarView, no alteran la conformidad) ✅
- Los commits de implementación del change están en `main` en el orden declarado
  (7 hashables + 1 absorbido, ver "Files changed") ✅
- No se commiteó nada: `openspec/`, `.atl/` y `AGENTS.md` quedan gitignored ✅

## Verificación del archivo

- [x] Main specs sincronizados: `openspec/specs/waiter-interactive-tables/spec.md`
  (6 requirements, 11 escenarios), `openspec/specs/waiter-menu-catalog/spec.md`
  (4 requirements, 8 escenarios), `openspec/specs/waiter-order-draft-cart/spec.md`
  (4 requirements, 9 escenarios) — 14 requirements / 28 escenarios en total
- [x] Change movido a `openspec/changes/archive/garzon-mesas-interactivas/`
- [x] El archivo contiene todos los artefactos del change (proposal, 3 specs, design,
  tasks, verify-report)
- [x] `tasks.md` archivado sin tareas de implementación sin marcar (29/29)
- [x] `openspec/changes/` activo ya no contiene `garzon-mesas-interactivas`

## Next Steps

- Ninguno bloqueante: el change está cerrado y el ciclo SDD completo. Opcional futuro:
  agregar los 3 covering tests que cubrirían los PARTIAL actuales y aplicar el
  SUGGESTION 1 de verify (`apply-progress.md` con tabla "TDD Cycle Evidence" para
  changes futuros).
