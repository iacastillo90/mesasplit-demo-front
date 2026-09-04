# Informe de Verificación — demo-fase1-gaps

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:be849828592b781c6a28df16fec12bb216dd9c0e9871d50358d809b312ea2757
verdict: fail
blockers: 1
critical_findings: 3
requirements: 1/5
scenarios: 11/17
test_command: npm run test
test_exit_code: 0
test_output_hash: sha256:be849828592b781c6a28df16fec12bb216dd9c0e9871d50358d809b312ea2757
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:5d550411645b7939edfc543fabc5ad771275cc69dd44440a777a74845872cd88
```

## Informe de Verificación

**Cambio**: demo-fase1-gaps
**Versión**: spec delta (5 requisitos ADDED, 17 escenarios)
**Modo**: Strict TDD (config `strict_tdd: true`; runner Vitest 3 disponible)
**Alcance**: commits `d9b41fa..ee0be51` en `main` (5 slices + 1 chore), artefactos `openspec/changes/demo-fase1-gaps/`
**Fecha**: 2026-08-17

### Completitud

| Métrica | Valor |
|---------|-------|
| Tasks totales | 25 |
| Tasks completas | 25 |
| Tasks incompletas | 0 |
| Requisitos ADDED (spec) | 5 |
| Escenarios (spec) | 17 |
| Archivos cambiados | 20 (`1077` adiciones / `149` eliminaciones = 1226 líneas) |

### Ejecución de Build y Tests

**Build**: ✅ Pasó — `npm run build` → exit 0 (`✓ built in 4.91s`), hash `5d550411…2cd88`.

**Tests**: ✅ 89/89 en la corrida final registrada (20/20 archivos) — exit 0.
⚠️ **Nondeterminista**: la suite completa falló 2 de 3 corridas consecutivas en el árbol actual (mismo test: `RadarView/FocusMode.test.jsx > filtra el plano topológico…`). Verificado en worktree temporal del commit padre `c76a427`: el mismo test falla intermitentemente ANTES del cambio (1 de 4 corridas) → **flake pre-existente, ajeno a demo-fase1-gaps** (ver WARNING-5).

**Coverage**: ➖ No disponible — `testing.coverage: false` en `openspec/config.yaml`; `changed-file coverage` omitido.

**Lint**: ✅ `npm run lint` → exit 0, 0 errores/0 advertencias, hash `e566c58c…815272`.

### Matriz de Cumplimiento de Spec (17 escenarios)

| Req | Escenario | Test que lo cubre | Resultado |
|-----|-----------|-------------------|-----------|
| client-onboarding | S1 Primera visita muestra la guía | `WelcomeModal.test.jsx:19` + runtime navegador | ✅ COMPLIANT |
| client-onboarding | S2 Descarte persistido y no reaparece | `WelcomeModal.test.jsx:27` + runtime reload | ✅ COMPLIANT |
| client-onboarding | S3 La guía no bloquea pedidos | `WelcomeModal.test.jsx:40` (inefectivo) | ❌ FAILING (runtime) |
| cash-shift | S1 Apertura de turno | `CashShift.test.jsx:19` | ✅ COMPLIANT |
| cash-shift | S2 Cierre de turno con resumen | `CashShift.test.jsx:32` | ✅ COMPLIANT |
| cash-shift | S3 Persistencia del turno (reload) | (ninguno) | ❌ UNTESTED |
| cash-shift | S4 Sin duplicación del arqueo | `CashShift.test.jsx:45` (espía en instancia ajena) | ⚠️ PARTIAL |
| kds-offline | S1 Indicador visible offline | `KdsOffline.test.jsx:21` | ✅ COMPLIANT |
| kds-offline | S2 Encolado local offline | `KdsOffline.test.jsx:33` | ✅ COMPLIANT |
| kds-offline | S3 Auto-flush al reconectar | `KdsOffline.test.jsx:56` | ✅ COMPLIANT |
| kds-offline | S4 Sin canal realtime no crashea | (sin test dedicado; indirecto: renders de `KdsPage` en jsdom + `useRealtimeBus.test.js:135`) | ⚠️ PARTIAL |
| costo-primario | S1 Cálculo de la métrica | `CostoPrimarioCard.test.jsx:21` | ✅ COMPLIANT |
| costo-primario | S2 Panel read-only | `CostoPrimarioCard.test.jsx:36` | ✅ COMPLIANT |
| costo-primario | S3 Sin datos de costo | `CostoPrimarioCard.test.jsx:59` | ✅ COMPLIANT |
| compliance-sii | S1 Los tres checks en OK | `ComplianceSiiPanel.test.jsx:25` (solo selectores, 2/3) | ⚠️ PARTIAL |
| compliance-sii | S2 Quiebre de folios detectado | `ComplianceSiiPanel.test.jsx:39` (solo selector, sin UI) | ⚠️ PARTIAL |
| compliance-sii | S3 Panel read-only | `ComplianceSiiPanel.test.jsx:53` | ✅ COMPLIANT |

**Resumen de cumplimiento**: 11/17 estrictamente COMPLIANT, 4 ⚠️ PARTIAL, 1 ❌ FAILING-en-runtime, 1 ❌ UNTESTED.
Por requisito: `costo-primario` ✅ COMPLETO; `client-onboarding`, `cash-shift`, `kds-offline`, `compliance-sii` ⚠️ PARCIALES.

### Correctitud (Evidencia Estática, file:line)

| Requisito | Estado | Notas |
|-----------|--------|-------|
| client-onboarding | ⚠️ Parcial | `WelcomeModal.jsx:15` persiste `mesasplit-onboarding=true`; `ClientPage.jsx:59-65` inicializa `welcomeOpen` solo sin clave; `ClientPage.jsx:257-260` montaje. S3 violado por overlay de `Modal.jsx:12-15` (`fixed inset-0 z-50`). |
| cash-shift | ⚠️ Parcial | `usePosStore.js:109-120` `openCashShift` (timestamp + fondo inicial); `:123-133` `closeCashShift` (closedAt + summary, **sin** `bus.publish` ni `blindCloseOpen`); `:159-170` `submitBlindClose` único publicador de `shift.closed`; `:196-199` persist `mesasplit-cash-shift` con `partialize` SOLO `cashShift` (no persiste bills/pagos transitorios ✅). |
| kds-offline | ⚠️ Parcial | `connectivityService.js:7-36` adaptador inyectable (default `navigator.onLine` + `online`/`offline`); `useKdsStore.js:40-51` `publishOrEnqueue` FIFO; `:69-90` `setOnlineState` auto-flush en orden y vacía; `OfflineBanner.jsx:7-24`; `KdsPage.jsx:71-76` wiring del adaptador; tolerancia NoopAdapter (`useRealtimeBus.js:83-91` resuelve a Noop sin BroadcastChannel; try/catch extra en `:43-47` y `:83-87`). |
| costo-primario | ✅ Completo | `corporateService.js:14-17` y `useCorporateStore.js:18-21` `foodCost` por sucursal; `:52-56` propagación por `loadCorporateData`; `:114-125` `selectCostoPrimario` con guard Σ=0 (sin NaN) y 1 decimal; `CostoPrimarioCard.jsx:36-37,53-55` % + desglose + fórmula; `SuperAdminPage.jsx:105` montaje. |
| compliance-sii | ⚠️ Parcial | `useCorporateStore.js:26` `dteFolio` en `INITIAL_EVENTS`; `:75-87` listener `payment.completed` registra `dteFolio`; `:128-131` `selectHasDteBoleta`; `:134-148` `selectFoliosConsecutivos` (Δ=1 cronológico; 0-1 → OK); **`:151` `selectCierreCiegoOk = () => true` hardcodeado**, no referencia `usePosStore`; `ComplianceSiiPanel.jsx:20-22` usa los tres selectores; `SuperAdminPage.jsx:131` montaje. |

### Coherencia (Decisiones del spec)

| Decisión del spec | ¿Respetada? | Notas |
|-------------------|-------------|-------|
| Adaptador de conectividad inyectable (kds-offline) | ✅ Sí | `createConnectivityAdapter` existe y KdsPage lo cablea; pero los tests no lo ejercitan directamente (no inyectan fake). |
| Fuente de costo en fixture corporativo | ✅ Sí | `foodCost` en `corporateService.js` + `INITIAL_BRANCHES`; `costPrice` de `Product` fuera de alcance, correcto. |
| cash-shift vs BlindClose sin duplicación | ✅ Sí | `closeCashShift` no publica `shift.closed`; `submitBlindClose` único publicador. |
| Reuso de tolerancia NoopAdapter | ✅ Sí | Sin transporte nuevo; bus cae a Noop sin lanzar. |
| Guía de primera visita que no bloquea | ❌ No | Se eligió modal con overlay a pantalla completa; contradice el MUST de no-bloqueo de la spec (ver CRITICAL-1). |

### TDD Compliance (Strict TDD activo)

| Check | Resultado | Detalles |
|-------|-----------|----------|
| Evidencia TDD reportada | ❌ | `apply-progress.md` NO contiene tabla "TDD Cycle Evidence" (RED/GREEN/TRIANGULATE/SAFETY NET). |
| Todos los tasks tienen tests | ✅ | 5 suites nuevas (15 tests) existen y pasan; 0 tasks sin test de su slice. |
| RED confirmado (archivos existen) | ✅ | 5/5 archivos de test existen (`WelcomeModal`, `CashShift`, `KdsOffline`, `CostoPrimarioCard`, `ComplianceSiiPanel`). |
| GREEN confirmado (pasan al ejecutar) | ✅ | 15/15 tests del cambio pasan en la ejecución registrada. |
| Triangulación adecuada | ⚠️ | cash-shift S3 y kds-offline S4 sin test; compliance S1/S2 solo nivel selector. |
| Safety Net archivos modificados | ✅ | Archivos nuevos (N/A); `useRadarStore.js` (chore) no requería safety net de este cambio. |

**TDD Compliance**: 4/6 checks aprobados — falta la tabla de evidencia en apply-progress (protocolo) y triangulación completa.

### Distribución por Capa de Test

| Capa | Tests | Archivos | Herramientas |
|------|-------|----------|--------------|
| Unit (stores/selectores) | 8 | 3 (`CashShift`, `KdsOffline` parcial, `CostoPrimarioCard` parcial, `ComplianceSiiPanel` parcial) | Vitest |
| Integration (render + interacción) | 7 | 5 (Testing Library) | Vitest + @testing-library/react |
| E2E | 0 | 0 | No disponible (config `e2e: false`) |
| **Total** | **15** | **5** | |

### Cobertura de Archivos Cambiados

➖ Coverage no disponible (no configurado). Se omiten porcentajes; la cobertura por archivo no se pudo medir.

### Calidad de Aserciones (Strict TDD 5f)

| Archivo | Línea | Aserción | Problema | Severidad |
|---------|-------|----------|----------|-----------|
| `WelcomeModal.test.jsx` | 53 | `expect(screen.getByText('Ver carrito')).toBeInTheDocument()` | No-op: "Ver carrito" se renderiza SIEMPRE (CTA fijo, `ClientPage.jsx:269-271`); no verifica que el ítem se agregó (el badge de conteo queda sin afirmar). El test pasa aunque el click no agregue nada. | CRITICAL (test de S3) |
| `CashShift.test.jsx` | 46 | `createRealtimeBus('mesasplit')` + `vi.spyOn(bus,'publish')` | El espía apunta a una instancia NUEVA del bus, no a la del store (`usePosStore.js:17` crea la suya en scope de módulo); no podría detectar una regresión donde `closeCashShift` publicara en el bus real. | WARNING |
| `ComplianceSiiPanel.test.jsx` | 25/39 | Solo aserciones de selectores puros | Los escenarios "los tres checks muestran OK" / "el check de folios muestra riesgo" exigen aserciones de UI (`✅ OK` / `🚨 Riesgo`); el panel nunca se renderiza en S1/S2, y `selectCierreCiegoOk` ni se importa. | WARNING |
| `ComplianceSiiPanel.test.jsx` | 66-70 | Solo heading del panel + inmutabilidad | S3 no afirma el estado visual de los checks (solo que existen los títulos). | WARNING |

**Calidad de aserciones**: 1 CRITICAL, 3 WARNING (sin tautologías `expect(true).toBe(true)` ni ghost loops).

### Métricas de Calidad

**Linter**: ✅ 0 errores / 0 advertencias (`npm run lint`, exit 0).
**Type Checker**: ➖ No disponible (proyecto JS puro).

## Issues Encontrados

### CRITICAL

1. **[client-onboarding] S3 — La guía SÍ bloquea la orden en runtime (violación de MUST de spec).**
   Evidencia runtime (chrome-devtools, `http://localhost:5199/cliente`, primera visita): la guía se muestra sobre el menú (overlay `fixed inset-0 z-50`, `src/shared/ui/Modal.jsx:12-15`). Click real sobre "Agregar" (Hamburguesa Clásica) → el click cae en el overlay y CIERRA la guía; el carrito queda en `$0` y el ítem NO se agrega. LocalStorage quedó `mesasplit-onboarding=true` y tras reload la guía no reaparece (S2 OK), pero el escenario S3 ("el ítem se agrega al carrito… sin requerir cerrar la guía") FALLA en navegador real. El test `WelcomeModal.test.jsx:40-54` pasa solo porque `fireEvent` despacha directo al botón (sortea el hit-testing del overlay) y su última aserción verifica un elemento permanente. La spec es explícita: "agregar al carrito, abrir el carrito y S.O.S. MUST seguir operativos con la guía visible". → **Bloqueante para archive.**

2. **[cash-shift] S3 — Persistencia del turno: escenario UNTESTED.**
   El spec tiene 4 escenarios; la suite `CashShift.test.jsx` tiene 3 tests (S1:19, S2:32, S4:45) y NINGUNO verifica rehidratación desde `localStorage['mesasplit-cash-shift']`. El código es correcto (`usePosStore.js:196-199`, `partialize` limitado a `cashShift`) pero no hay prueba runtime que lo demuestre; el task 2.1 prometía "S3 persistencia reload" que no existe en el archivo. Escenario sin covering test → CRITICAL UNTESTED (protocolo).

3. **[Proceso] apply-progress sin tabla "TDD Cycle Evidence" (Strict TDD).**
   `apply-progress.md` no reporta RED/GREEN/TRIANGULATE/SAFETY NET por task, requisito del módulo strict-tdd-verify cuando `strict_tdd: true`. La implementación SÍ tiene los 15 tests y pasan (RED/GREEN verificables por archivo), pero el protocolo de reporte no se siguió.

### WARNING

1. **[kds-offline] S4 sin test dedicado** — No existe test para "sin canal realtime no crashea" ni para el adaptador (`createConnectivityAdapter` nunca se inyecta/fakea; los tests usan `setState` directo, `KdsOffline.test.jsx:23,37,60`). Cobertura indirecta: la suite completa renderiza `KdsPage` en jsdom (sin `BroadcastChannel` → NoopAdapter, `useRealtimeBus.js:83-91`) sin crashear, y `useRealtimeBus.test.js:135` cubre el bus sin BroadcastChannel. Comportamiento verificado de forma indirecta, escenario sin prueba propia.
2. **[compliance-sii] `selectCierreCiegoOk` hardcodeado** — `useCorporateStore.js:151` (`() => true`) NO referencia las capacidades de `usePosStore` (`blindCloseOpen` + `submitBlindClose`) como exige el spec ("los checks MUST referenciar las capacidades existentes… uso read-only cross-slice de usePosStore"). Hoy el output coincide (las capacidades existen), pero el check no deriva de estado real y `ComplianceSiiPanel.jsx` nunca importa `usePosStore`.
3. **[compliance-sii] S1/S2 a nivel selector, sin afirmar UI** — Los escenarios exigen que el PANEL muestre `✅ OK` / `🚨 Riesgo`; los tests solo evalúan selectores puros, y S1 ni siquiera evalúa `selectCierreCiegoOk` (2 de 3 checks).
4. **[cash-shift] S4 test protector ineficaz** — Espía sobre instancia ajena del bus (ver tabla de aserciones); el código estático es correcto, pero el test no podría detectar una regresión. Mejor: espiar la instancia exportada del store o inyectar el bus.
5. **[Flake pre-existente, fuera del cambio]** — `npm run test` es nondeterminista: falla 2/3 corridas (árbol actual) y 1/4 en el padre `c76a427` (verificado en worktree temporal), siempre el mismo test `FocusMode.test.jsx` (RadarView, ajeno a este cambio). El chore `ee0be51` tocó `useRadarStore.js` pero NO originó el flake (ya existía). Impide fijar `test_exit_code` estable como evidencia; requiere fix aparte (el loadRadarData con guard + aserción `getByText(/Mesa 3/i)` son candidatos).
6. **[Informacional] Presupuesto de review** — 1226 líneas totales de diff (1077+/149-) superan el guard de 400 líneas; el forecast de `tasks.md` era High y recomendaba PRs encadenados, pero la entrega se hizo en 5 commits directos a `main`. Decisión ya tomada en apply; se registra para el récord.

### SUGGESTION

1. **[client-onboarding] S3 — hacer la guía no bloqueante o corregir el test** — Opciones: overlay con `pointer-events-none` (clicks atraviesan) o variante tip-strip; y reforzar el test afirmando el conteo del badge del carrito (p. ej. `Ver carrito` con chip `1`) en vez de un texto permanente.
2. **[cash-shift] S3 — test de persistencia** — Abrir turno, leer `localStorage['mesasplit-cash-shift']`, verificar que el JSON persistido contiene `cashShift.status='open'` y NO contiene `openBills`/`blindCloseOpen` (garantiza el `partialize`).
3. **[kds-offline] test del adaptador** — Un test que inyecte un fake de `createConnectivityAdapter` (o que dispare `window.dispatchEvent(new Event('offline'))`) y verifique `isOnline`/auto-flush, cerrando la brecha del diseño #1 de la spec.

## Discrepancias con apply-progress

- **Rutas**: la discrepancia anticipada NO existe — `WelcomeModal.jsx` está correctamente en `src/features/ClientView/components/` y la suite en `src/features/ClientView/WelcomeModal.test.jsx` (ruta exacta reportada). Todas las rutas del reporte de Antigravity coinciden con el árbol real.
- **Cobertura de escenarios**: "3 escenarios GREEN por suite" es exacto en cantidad de tests, pero SOLO cubre 11/17 escenarios de spec: cash-shift S3 y kds-offline S4 no tienen test (el task 6.1 afirmaba "17 escenarios cubiertos"), y compliance S1/S2 están a nivel selector; client-onboarding S3 pasa por un test que no detecta el bloqueo real (ver CRITICAL-1).
- **"89/89 tests en verde"**: exacto en las corridas que pasan, pero no se reportó la flakiness de `FocusMode.test.jsx`.
- **Build y lint**: confirmados ✅ (exit 0, 0 warnings).

## Veredicto

**FAIL** — La implementación de los 5 slices es sólida y mayormente fiel al spec (11/17 escenarios COMPLIANT, build/lint verdes, sin duplicación de arqueo, `partialize` correcto), pero hay 1 MUST de spec violado en runtime (guía de onboarding bloquea la orden), 1 escenario UNTESTED (persistencia de turno) y 1 brecha de protocolo TDD (sin tabla de evidencia en apply-progress). No procede archive hasta corregir los CRITICAL.

**Siguiente paso recomendado**: `fix` (remediación de CRITICAL-1 y CRITICAL-2, y reporte TDD; WARNING-5 es candidato a issue aparte por ser pre-existente).

---

# Re-verify tras fix `dd8f20c` (2026-08-17)

```yaml
schema: gentle-ai.verify-result/v1
revision: re-verify-1
evidence_revision: sha256:08e7707c519401af
verdict: pass
critical_findings_resolved: 3/3
warning_findings_resolved: 3/3 (WARNING-2/3/4)
requirements: 5/5
scenarios: 16/17 COMPLIANT + 1/17 PARTIAL (kds-offline S4, fuera de alcance del fix)
test_command: npm run test
test_exit_code: 0
test_output_hash: sha256:08e7707c519401af
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:48f04644bbd18e9f
lint_command: npm run lint
lint_exit_code: 0
fix_commit: dd8f20c3217fadad2493456c4896615095239e21
```

## Resumen ejecutivo

El commit `dd8f20c` (6 archivos, +128/−75) cierra genuinamente los 3 CRITICAL y los 3 WARNING reclamados. Se verificó por inspección de código, ejecución de suite (2 corridas locales, 90/90 en ambas, exit 0) y **reproducción en navegador real** del escenario que antes fallaba (CRITICAL-1): con la guía visible, el click en "Agregar" agregó la Hamburguesa Clásica al carrito (`Ver carrito 1 $8.900`), el banner permaneció montado y el drawer del carrito abrió. La persistencia del turno ahora tiene test que deserializa el JSON real de `mesasplit-cash-shift` y confirma el `partialize` (CRITICAL-2). La tabla "TDD Cycle Evidence" existe en `apply-progress.md` (CRITICAL-3). No se detectó ningún CRITICAL nuevo; el flake pre-existente `FocusMode.test.jsx` (WARNING-5) no apareció en ninguna de las 2 corridas locales.

## Evidencia de ejecución (re-verify)

| Comando | Exit | Evidencia |
|---------|------|-----------|
| `npm run test` | 0 | 20 archivos / 90 tests, 2 corridas locales consecutivas (02:22:08 y 02:26:42) — ambas 90/90; hash salida `08e7707c…01af` |
| `npm run build` | 0 | `✓ built in 10.51s`; hash salida `48f04644…8e9f` |
| `npm run lint` | 0 | 0 errores / 0 advertencias |
| Runtime navegador (CRITICAL-1) | ✅ | `http://localhost:5173/cliente`, contexto aislado (localStorage limpio): banner visible sin overlay; click "Agregar" (Hamburguesa Clásica) → carrito `$0` → `Ver carrito 1 $8.900` con banner **aún montado**; click "Ver carrito" → drawer abre mostrando el ítem; botón S.O.S. presente y operable |

## Tabla de cierre de hallazgos

| Hallazgo | Estado | Evidencia |
|----------|--------|-----------|
| CRITICAL-1 [client-onboarding] S3 bloquea la orden | ✅ **RESOLVED** | (a) `WelcomeModal.jsx:21-25` — banner `fixed top-4 left-1/2 -translate-x-1/2 z-30`, sin overlay `inset-0`/backdrop (grep en `ClientView`: único `inset-x-0` es el CTA inferior del carrito `ClientPage.jsx:267`, `bottom-6 z-40`, que no cubre el catálogo); ya no importa `Modal`. (b) `WelcomeModal.test.jsx:43-62` — aserción REAL del store: `useClientStore.getState().cart.length` 0 → >0 (:50, :59) + banner aún visible (:47, :61); no es no-op. Runtime navegador confirma el incremento del carrito con la guía montada (ver tabla de ejecución). |
| CRITICAL-2 [cash-shift] S3 escenario UNTESTED | ✅ **RESOLVED** | `CashShift.test.jsx:43-59` — deserializa `localStorage['mesasplit-cash-shift']` y aserta sobre JSON parseado: `parsed.state.cashShift.status === 'open'` (:53), `initialAmount === 75000` (:54), `openBills`/`activeBill` undefined (:57-58). `usePosStore.js:197-200` — `name: 'mesasplit-cash-shift'`, `partialize: (state) => ({ cashShift: state.cashShift })` persiste SOLO `cashShift`. |
| CRITICAL-3 [proceso] tabla TDD Cycle Evidence | ✅ **RESOLVED** | `apply-progress.md:33-41` — tabla con 5 filas (una por slice), columnas Slice / Test RED File / Resultado RED / GREEN & Wiring, con rutas y resultados concretos (PASS con nº de tests y tipo de aserción). |
| WARNING-2 [compliance-sii] `selectCierreCiegoOk` hardcodeado | ✅ **RESOLVED** | `useCorporateStore.js:152-159` — consulta dinámica `usePosStore.getState()` y evalúa `typeof posState?.submitBlindClose === 'function' && posState?.blindCloseOpen !== undefined`; capacidades reales existen en `usePosStore.js:51` (`blindCloseOpen: false`) y `:160-171` (`submitBlindClose` que publica `shift.closed`). No es `() => true` (el try/catch solo es fallback defensivo ante errores de import). |
| WARNING-3 [compliance-sii] S1/S2 sin aserciones de UI | ✅ **RESOLVED** | `ComplianceSiiPanel.test.jsx:42-43` — `screen.findAllByText(/✅ OK/i)` exige 3 badges OK en S1; `:63` — `findByText(/🚨 Riesgo/i)` en S2. El panel renderiza literalmente `'✅ OK'` (`ComplianceSiiPanel.jsx:47,64,81`) y `'🚨 Riesgo'` (:64). |
| WARNING-4 [cash-shift] spy sobre instancia ajena | ✅ **RESOLVED** | `usePosStore.js:17-18` — `export const posBus = createRealtimeBus('mesasplit'); const bus = posBus;` (el store usa la MISMA instancia exportada); `CashShift.test.jsx:63` — `vi.spyOn(posBus, 'publish')` sobre la instancia real (con `mockRestore()` en :79). |
| WARNING-5 [flake FocusMode, fuera de alcance] | ➖ N/A (no gate) | No apareció en ninguna de las 2 corridas locales; consistente con la validación 3/3 del orquestador. Se mantiene como issue aparte. |

## Matriz de cumplimiento actualizada (delta sobre la corrida original)

| Req | Escenario | Antes | Ahora |
|-----|-----------|-------|-------|
| client-onboarding | S3 La guía no bloquea pedidos | ❌ FAILING (runtime) | ✅ **COMPLIANT** (test + navegador real) |
| cash-shift | S3 Persistencia del turno (reload) | ❌ UNTESTED | ✅ **COMPLIANT** (`CashShift.test.jsx:43-59`) |
| cash-shift | S4 Sin duplicación del arqueo | ⚠️ PARTIAL (spy ajeno) | ✅ **COMPLIANT** (spy sobre `posBus` real) |
| compliance-sii | S1 Los tres checks en OK | ⚠️ PARTIAL (solo selectores) | ✅ **COMPLIANT** (3 badges `✅ OK` en DOM) |
| compliance-sii | S2 Quiebre de folios detectado | ⚠️ PARTIAL (solo selector) | ✅ **COMPLIANT** (badge `🚨 Riesgo` en DOM) |
| kds-offline | S4 Sin canal realtime no crashea | ⚠️ PARTIAL (sin test dedicado) | ⚠️ PARTIAL (sin cambios; **no reclamado** por `dd8f20c`) |

**Total post-fix**: 16/17 COMPLIANT, 1/17 PARTIAL (`kds-offline` S4 — WARNING-1, no comprometido por este fix; cobertura indirecta vigente), 0 FAILING, 0 UNTESTED. Por requisito: 5/5 completos o funcionales (kds-offline queda con 3/4 estrictos + 1 parcial no bloqueante).

## Hallazgos nuevos

Ninguno. No se detectó CRITICAL nuevo en el árbol `dd8f20c`. Los hallazgos WARNING-1 (kds-offline S4) y WARNING-6 (informacional, presupuesto de review) del informe original permanecen en el registro como no bloqueantes; WARNING-5 queda fuera de alcance según la decisión del orquestador.

## Veredicto final (re-verify)

**PASS** — Los 6 hallazgos reclamados por `dd8f20c` (CRITICAL-1/2/3, WARNING-2/3/4) están genuinamente cerrados, con evidencia de código (file:line), suite verde (90/90 × 2 corridas locales) y reproducción runtime del escenario que antes fallaba. No existe CRITICAL nuevo ni escenario UNTESTED/FAILING de spec. Procede **archive**.

**Siguiente paso recomendado**: `archive` (con WARNING-5 como issue aparte y WARNING-1 como mejora futura de testing del adaptador de conectividad).