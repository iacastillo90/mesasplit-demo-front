# Archive Report: demo-fase1-gaps

```yaml
schema: gentle-ai.archive-report/v1
change: demo-fase1-gaps
date: 2026-08-17
mode: openspec
archive_target: openspec/changes/archive/demo-fase1-gaps/
verdict: pass
impl_commits:
  - d9b41fa — feat: onboarding de Mesa Virtual (client-onboarding)
  - 480ee91 — feat: turno de caja cash-shift (cash-shift)
  - 885dedf — feat: KDS offline con cola local (kds-offline)
  - 737db5f — feat: indicador de costo primario (costo-primario)
  - 6b1d95c — feat: panel de compliance SII (compliance-sii)
  - ee0be51 — chore: limpieza final de linter y prevencion de sobrescritura en useRadarStore
  - dd8f20c — fix(demo-fase1-gaps): resolver hallazgos de verify (non-blocking onboarding, persistencia shift y compliance cross-slice)
```

## Resumen

Se archiva el change `demo-fase1-gaps` (cierre de las cinco brechas del MVP Fase 1:
onboarding de Mesa Virtual, turno de caja operativo, KDS offline con cola, costo
primario y compliance SII read-only) completando el ciclo SDD. El delta spec se
sincronizó a los specs principales como capability nueva
(`openspec/specs/demo-fase1-gaps/spec.md`), el folder del change se movió a
`openspec/changes/archive/` siguiendo la convención del repo (nombre plano, sin
prefijo de fecha, igual que los 11 archivados previos) y este reporte queda como
audit trail en el filesystem (modo `openspec`).

## Task Completion Gate

| Ítem | Estado |
|------|--------|
| Tasks totales | 25 |
| Tasks completas `[x]` | 25 |
| Tasks sin marcar | 0 |

Gate APROBADO: `tasks.md` no tiene tareas de implementación sin marcar (Phases 1–6,
todas `[x]`, consistentes con `apply-progress.md`).

## CRITICAL Gate — verify y re-verify

El verify original (`verify-report.md` en este folder) emitió verdict FAIL con 3
CRITICAL (guía de onboarding bloqueaba ordenar en runtime, escenario de persistencia
de turno sin test, y falta de tabla TDD Cycle Evidence). El fix `dd8f20c` (6 archivos,
+128/−75) más la remediación documentada cerró los hallazgos, y el **re-verify**
(sección "Re-verify tras fix `dd8f20c`") emitió **verdict PASS**:

- **CRITICAL 1 (onboarding S3 bloquea la orden)**: RESUELTO — `WelcomeModal` pasó de
  modal overlay (`fixed inset-0 z-50`, que interceptaba el catálogo) a banner/tip
  strip flotante no bloqueante (`fixed top-4 z-30`, sin overlay); test con aserción
  real del store (`cart.length` 0 → >0 con banner montado) y **reproducción en
  navegador real**: click "Agregar" → `Ver carrito 1 $8.900` con banner aún visible.
- **CRITICAL 2 (cash-shift S3 UNTESTED)**: RESUELTO — `CashShift.test.jsx:43-59`
  deserializa `localStorage['mesasplit-cash-shift']` y aserta `status='open'`,
  `initialAmount`, y ausencia de `openBills`/`activeBill` (garantiza `partialize`
  limitado a `cashShift`, `usePosStore.js:197-200`).
- **CRITICAL 3 (proceso, tabla TDD)**: RESUELTO — `apply-progress.md:33-41` incluye la
  tabla "TDD Cycle Evidence" (RED/GREEN/Wiring por slice).

**Motivo del archive con verdict `pass`**: no queda ningún CRITICAL ni hallazgo
FAILING/UNTESTED. La re-verify registra 16/17 escenarios COMPLIANT + 1/17 PARTIAL
(`kds-offline` S4, WARNING-1, fuera del alcance del fix, cobertura indirecta vigente).
Los WARNING remanentes son no bloqueantes y quedan trazados en "Deuda remanente".

## Sync de Delta Spec a Main Specs

| Domain | Acción | Detalle |
|--------|--------|---------|
| demo-fase1-gaps | Created | No existía `openspec/specs/demo-fase1-gaps/`; el delta spec (5 requirements ADDED, 17 escenarios) se transformó a spec canónico de capability: header `# Spec: demo-fase1-gaps — Cierre de brechas Fase 1 (MVP)`, `## Purpose`, sección "Decisiones de alcance" y `## Requirements` con los 5 bloques `### Requirement:` (nombres, bodies y escenarios preservados verbatim). Única normalización: renombre del wrapper `## ADDED Requirements` → `## Requirements` y del encabezado `## Propósito` → `## Purpose`, siguiendo el patrón de `openspec/specs/account-split/spec.md` (capability por folder `openspec/specs/{domain}/spec.md`) y de los specs canónicos previos (`sos-waiter-call`, `modo-hora-punta`). |

## Archivo (folder move)

- Origen: `openspec/changes/demo-fase1-gaps/`
- Destino: `openspec/changes/archive/demo-fase1-gaps/` — **sin prefijo de fecha**.
  El SKILL genérico (sdd-archive v2) prescribe `YYYY-MM-DD-{change-name}`, pero la
  convención establecida del repo (11 archivados previos: setup-stack, kds-kitchen,
  account-split, waiter-pwa, local-admin-radar, pos-cashier, super-admin-corporate,
  interactive-table-reservation, customer-survey-ratings, sos-waiter-call,
  modo-hora-punta) usa nombre plano. Se sigue la convención del repo y lo indicado
  por el orquestador.

## Contenido del archivo (audit trail)

- proposal.md ✅
- specs/spec.md ✅ (delta spec original; se preserva tal cual, sin normalizar)
- tasks.md ✅ (25/25, sin tareas sin marcar)
- verify-report.md ✅ (FAIL original + sección Re-verify con verdict PASS)
- apply-progress.md ✅ (evidencia TDD, tabla TDD Cycle Evidence, rutas reales)
- NOTA-opencode-a-antigravity.md ✅ (comunicación de fixes entre agentes)
- archive-report.md ✅ (este artefacto)
- design.md ❌ (no existió en el change; el design se cubrió en las "Decisiones de
  alcance" del delta spec y el approach del proposal — no bloquea archive, se
  documenta aquí siguiendo el manejo graceful de archives previos)

## Deuda remanente (no bloqueante)

- **WARNING-5 — flake pre-existente `FocusMode.test.jsx` (RadarView)**: suite completa
  nondeterminista (falló 2/3 corridas en el árbol del verify original; verificado
  pre-existente en el padre `c76a427`, 1/4 corridas). Causa raíz: singleton
  `useRadarStore` fugando `focusMode` entre test files; pertenece al change
  `modo-hora-punta`/RadarView, ajeno a demo-fase1-gaps. No apareció en las 2 corridas
  locales del re-verify. Se mantiene como **issue aparte** (decisión del orquestador).
- **WARNING-1 — kds-offline S4 sin test dedicado**: "sin canal realtime no crashea" y
  el adaptador `createConnectivityAdapter` carecen de test propio; cobertura indirecta
  (render de `KdsPage` en jsdom sin BroadcastChannel → NoopAdapter y
  `useRealtimeBus.test.js:135`). Escenario con estado PARTIAL, no comprometido por el
  fix; mejora futura de testing del adaptador.
- **WARNING-6 — presupuesto de review (informacional)**: diff total 1226 líneas
  (1077+/149-) supera el guard de 400; el forecast de `tasks.md` era High con PRs
  encadenados recomendados, pero la entrega se hizo en 7 commits directos a `main`.
  Decisión de entrega ya tomada por el usuario; se registra para el récord.

## Git state verificado (sin commits nuevos)

- HEAD de `main` = `dd8f20c` (`dd8f20c3217fadad2493456c4896615095239e21`) ✅
- Working tree limpio (`git status --porcelain` vacío) ✅
- Los 7 commits de implementación están en `main` en el orden declarado ✅
- No se commiteó nada: `openspec/`, `.atl/` y `AGENTS.md` quedan gitignored ✅

## Verificación del archivo

- [x] Main spec sincronizado: `openspec/specs/demo-fase1-gaps/spec.md` (5 requirements, 17 escenarios)
- [x] Change movido a `openspec/changes/archive/demo-fase1-gaps/`
- [x] El archivo contiene todos los artefactos del change (proposal, specs, tasks, verify, apply-progress, nota entre agentes)
- [x] `tasks.md` archivado sin tareas de implementación sin marcar (25/25)
- [x] `openspec/changes/` activo ya no contiene `demo-fase1-gaps`