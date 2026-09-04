# Archive Report: sos-waiter-call

```yaml
schema: gentle-ai.archive-report/v1
change: sos-waiter-call
date: 2026-08-17
mode: hybrid
archive_target: openspec/changes/archive/sos-waiter-call/
verdict: intentional-with-warnings
impl_commits:
  - 63a8cbf — feat: modulo S.O.S. de llamada al mozo desde la Mesa Virtual
  - 893e0cc — test: cerrar vacios de cobertura (badge del mozo y payload call.waiter)
```

## Resumen

Se archiva el change `sos-waiter-call` (S.O.S. de Mesa: llamada urgente al mozo desde la
Mesa Virtual) completando el ciclo SDD. El spec delta se sincronizó a los specs principales
como capability nueva, el folder del change se movió a `openspec/changes/archive/`
siguiendo la convención del repo (nombre plano, sin prefijo de fecha, igual que los 9
archivados previos) y el reporte de archivo se persiste en el filesystem y en Engram.

## Task Completion Gate

| Ítem | Estado |
|------|--------|
| Tasks totales | 8 |
| Tasks completas `[x]` | 8 |
| Tasks sin marcar | 0 |

Gate APROBADO: `tasks.md` no tiene tareas de implementación sin marcar.

## CRITICAL Gate — scoping explícito

El verify-report original (verdict FAIL, 3 CRITICALs, `verify-report.md` en este folder)
fue remediado así:

- **CRITICAL 2 (REQ-03 badge del mozo sin prueba de runtime)**: CERRADO por `893e0cc`.
  `WaiterPage.test.jsx` inyecta el bus como prop (`DI`) y prueba el banner
  (`sos-alert-banner`) con mesa + motivo y el descarte "Atendido" (7/7 tests verdes;
  evidencia RED→GREEN en `apply-progress.md`).
- **CRITICAL 3 (sin evidencia TDD del apply)**: CERRADO con el artefacto
  `apply-progress.md` (tabla TDD Cycle Evidence con RED/GREEN/TRIANGULATE por
  requerimiento, REQ-02 y REQ-03).
- **CRITICAL 1 (flake `FocusMode.test.jsx` — RadarView)**: NO atribuible a este change.
  `63a8cbf` y `893e0cc` no tocan ningún archivo de RadarView. El flake lo causa el
  singleton `useRadarStore` (`src/features/RadarView/store/useRadarStore.js`) que fuga
  `focusMode: true` entre test files del mismo worker; el test vive en el change
  `Modo Hora Punta` (`bc66691`, agente Antigravity), documentado como ajeno en el propio
  verify y en `apply-progress.md`. Se archiva con `intentional-with-warnings` por
  instrucción explícita del orquestador: deuda remanente trazada, fuera del scope.

**Motivo del archive con warnings**: el único CRITICAL remanente es un defecto de otro
change (RadarView/Modo Hora Punta), no de `sos-waiter-call`. Las features propias del
change pasan 34/34 tests en `src/features/ClientView` + `src/features/WaiterView`,
build exit 0 y lint 0 errores (evidencia en `apply-progress.md`).

## Sync de Delta Spec a Main Specs

| Domain | Acción | Detalle |
|--------|--------|---------|
| sos-waiter-call | Created | No existía `openspec/specs/sos-waiter-call/`; el delta spec ES un spec completo (sin secciones ADDED/MODIFIED/REMOVED) → copiado directo a `openspec/specs/sos-waiter-call/spec.md` (1.4 KB, 3 requirements, 1 scenario) |

Convención verificada contra `openspec/specs/account-split/spec.md`: capability por
folder (`openspec/specs/{domain}/spec.md`).

## Archivo (folder move)

- Origen: `openspec/changes/sos-waiter-call/`
- Destino: `openspec/changes/archive/sos-waiter-call/` — **sin prefijo de fecha**.
  El SKILL genérico (sdd-archive v2) prescribe `YYYY-MM-DD-{change-name}`, pero la
  convención establecida del repo (9 archivados previos: setup-stack, kds-kitchen,
  account-split, waiter-pwa, local-admin-radar, pos-cashier, super-admin-corporate,
  interactive-table-reservation, customer-survey-ratings) usa nombre plano. Se sigue la
  convención del repo y lo indicado por el orquestador.

## Contenido del archivo (audit trail)

- proposal.md ✅
- specs/spec.md ✅ (delta spec; se preserva tal cual, sin normalizar a subfolder de domain)
- tasks.md ✅ (8/8)
- verify-report.md ✅ (reproduce el FAIL original + remediación)
- apply-progress.md ✅ (evidencia TDD + cierre CRITICAL 2/3)
- archive-report.md ✅ (este artefacto)
- design.md ❌ (no existió en el change; el verify lo registró como missing y siguió
  con manejo graceful — no bloquea archive, se documenta aquí)

## Deuda remanente

- **Flake RadarView** (`FocusMode.test.jsx:36`, suite completa intermitente): root cause
  `useRadarStore` singleton fugando estado entre test files. Le pertenece al change
  `Modo Hora Punta` (`bc66691`, Antigravity) → cambio `focus-mode-radar`. No se corrió la
  suite completa como gate en el apply correctivo (instructivo).
- **Hygiene de commit** (`63a8cbf`): `src/features/ClientView/services/splitService.js`
  (+135 líneas de account-split re-introducidas tras el revert dance) quedó fuera del
  scope de sos-waiter-call. WARNING 5 del verify, no bloqueante, no se tocó.
- Warnings no bloqueantes sin resolver: campo de nombre del cliente ausente
  (hardcoded `'Cliente'`), botón S.O.S. con fill tintado (`semantic-danger/10`, no
  `#EF4444` puro), emisión vía `createRealtimeBus` directo en vez del singleton
  `useRealtimeBus` (deviación de diseño documentada, entrega cross-tab OK vía
  BroadcastChannel).

## Trazabilidad Engram

- Observation ID del archive-report en Engram: registrado en la fase de persistencia
  (topic_key `sdd/sos-waiter-call/archive-report`, type `architecture`,
  project `mesasplit-demo-front`).

## Verificación del archivo

- [x] Main spec sincronizado: `openspec/specs/sos-waiter-call/spec.md`
- [x] Change movido a `openspec/changes/archive/sos-waiter-call/`
- [x] El archivo contiene todos los artefactos del change
- [x] `tasks.md` archivado sin tareas de implementación sin marcar
- [x] `openspec/changes/` activo ya no contiene `sos-waiter-call`