# Verify Report: sos-waiter-call

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:96fa0a572d52a875a22a27ab99f51f0f784bc22d1e0b16ddafaf1235823678e2
verdict: fail
blockers: 3
critical_findings: 3
requirements: 1/3
scenarios: 0/1
test_command: npx vitest run src/features/ClientView/SosModal.test.jsx && npx vitest run
test_exit_code: 1 (first full run: 1 failed / second full run: exit 0 — flaky)
test_output_hash: sha256:96fa0a572d52a875a22a27ab99f51f0f784bc22d1e0b16ddafaf1235823678e2
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:2f47ff3db7fc502c78eb660a6ce7d651ee6498a2615e44d8c781f63ffef27ffe
```

## Verification Report

**Change**: sos-waiter-call
**Version**: N/A (spec has no explicit version)
**Mode**: Strict TDD (strict_tdd: true per openspec/config.yaml)

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 8 |
| Tasks complete | 8 |
| Tasks incomplete | 0 |

All tasks checked `[x]`. Full verification was run (proposal + specs + tasks present; **design.md is MISSING** — design coherence skipped and recorded at the end).

### Build & Tests Execution

**Build**: ✅ Passed
```text
$ npm run build
vite v6.4.3 building for production... ✓ 95 modules transformed. ✓ built in 10.09s
exit code: 0
```

**Lint**: ✅ Passed
```text
$ npm run lint
eslint . — no errors, no warnings. exit code: 0
```

**Tests (focused)**: ✅ 2/2 passed
```text
$ npx vitest run src/features/ClientView/SosModal.test.jsx
✓ src/features/ClientView/SosModal.test.jsx (2 tests)
Test Files  1 passed (1)      Tests  2 passed (2)
exit code: 0
```

**Tests (full suite)**: ⚠️ FLAKY — 71 tests total
```text
Run #1 (07:09 UTC):  Test Files 1 failed | 14 passed (15)   Tests 1 failed | 70 passed (71)  exit code: 1
  FAIL  src/features/RadarView/FocusMode.test.jsx > "conmuta focusMode y renderiza el indicador
  gigante de MODO HORA PUNTA en la cabecera" — TestingLibraryElementError: Found multiple elements
  with the text: /MODO HORA PUNTA/i (header badge AND summary banner both rendered)
Run #2 (09:10 UTC):  Test Files 15 passed (15)   Tests 71 passed (71)  exit code: 0
```

Root cause: `useRadarStore` (module-level Zustand singleton, `src/features/RadarView/store/useRadarStore.js:43,120`) leaks `focusMode: true` across test files sharing a worker. `FocusMode.test.jsx:36` uses `getByText(/MODO HORA PUNTA/i)` which becomes ambiguous when RadarPage.test.jsx sets focusMode in the same worker. The test passes in isolation (3/3) and fails intermittently in the full suite. **Commit 63a8cbf touches zero RadarView files — the flake is NOT attributable to sos-waiter-call**, but it violates the proposal success criterion "All tests pass in GREEN (npm run test)".

**Coverage**: ➖ Not available — `testing.coverage: false` in config, no coverage tool detected.

### Spec Compliance Matrix

Spec requirements retrieved: **3** (REQ-01 S.O.S. button, REQ-02 SOS modal, REQ-03 waiter badge). Scenarios: **1** (under REQ-02).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| REQ-01 S.O.S. button in Mesa Virtual | (none defined) | (none found — no ClientPage test file exists) | ❌ UNTESTED (static only) |
| REQ-02 SOS modal — heading + 3 reasons | (none defined) | `SosModal.test.jsx > renderiza el encabezado "Llamar al Mozo" y los 3 motivos` | ✅ COMPLIANT |
| REQ-02 SOS modal — emit call.waiter | Customer sends S.O.S. call (reason "Falta cubierto") | `SosModal.test.jsx > emite el evento call.waiter con el motivo seleccionado al confirmar la llamada` | ⚠️ PARTIAL — test asserts "Mozo en camino" feedback, NOT the emitted payload/reason |
| REQ-03 Waiter receives notification badge | (none defined) | (none found — WaiterPage.test.jsx has no call.waiter test; proposal planned one that was not added) | ❌ UNTESTED (static only) |

**Compliance summary**: 1/4 requirement/scenario rows fully covered by a passing test.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| REQ-01: S.O.S. button always visible | ✅ Implemented | `ClientPage.jsx:118-125` — rendered in the header, outside the cart drawer; opens modal via `setSosOpen(true)` (L121) wired to `SosModal open={sosOpen}` (L240-244) |
| REQ-01: pulsing red #EF4444 animation | ⚠️ Partial | `animate-pulse` present (L122) and token `semantic-danger` = `#EF4444` (tailwind.config.js:28), but background is tinted `bg-semantic-danger/10` — not the pure #EF4444 fill the spec names |
| REQ-02: heading "🆘 Llamar al Mozo" | ✅ Implemented | `SosModal.jsx:52` → `Modal.jsx:27` renders `<h2>` |
| REQ-02: 3 reason options | ✅ Implemented | `SosModal.jsx:18-22` — "Limpiar mesa", "Falta cubierto", "Ayuda general" (exact contract labels) |
| REQ-02: payload `{ tableId, reason, customerName, timestamp }` | ⚠️ Partial | `SosModal.jsx:34-39` — keys match contract; emitted via `createRealtimeBus` directly (L12,15), NOT via the `useRealtimeBus` hook as the proposal/spec state |
| REQ-02: customer name field (optional, defaults "Cliente") | ❌ Not implemented | No name `<input>` in `SosModal.jsx`; `customerName` hardcoded `'Cliente'` (L37). Default works, typing capability is missing |
| REQ-03: subscribe to call.waiter on mount | ✅ Implemented | `WaiterPage.jsx:62-73` — `bus.subscribe('call.waiter', handleSos)` + cleanup |
| REQ-03: badge showing table + reason | ✅ Implemented | `WaiterPage.jsx:148-174` — banner (data-testid `sos-alert-banner`) shows `sosAlert.tableId` and `sosAlert.reason`, with "Atendido" dismiss |

### Coherence (Design)

No `design.md` exists in `openspec/changes/sos-waiter-call/`. Artifact set is proposal + specs + tasks only. **Design coherence dimension skipped** (recorded per graceful artifact handling).

| Decision (from proposal/approach) | Followed? | Notes |
|----------|-----------|-------|
| Emission "via useRealtimeBus" | ⚠️ No | `SosModal.jsx:15` and `WaiterPage.jsx:22` instantiate `createRealtimeBus('mesasplit')` at module scope — separate bus instances, NOT the `useRealtimeBus` singleton (registry in `useRealtimeBus.js:171-185`). Same-tab cross-view delivery still works in the real browser via BroadcastChannel, but local dispatch is per-instance and the WaiterPage badge becomes untestable without the singleton or adapter injection |
| Strict TDD: RED tests first | ⚠️ Unprovable | `SosModal.test.jsx` exists (RED artifact present) but the apply phase left no apply-progress/TDD-evidence artifact to corroborate the RED→GREEN sequence (task 1.2 "confirm RED failure" has no recorded output) |

### TDD Compliance

| Check | Result | Details |
|-------|--------|---------|
| TDD Evidence reported (apply-progress) | ❌ | No apply-progress artifact in `openspec/changes/sos-waiter-call/` and no Engram observation for `sdd/sos-waiter-call/apply-progress` |
| All tasks have tests | ⚠️ | 1/3 spec requirements covered by tests (REQ-02 modal). REQ-01 (button) and REQ-03 (badge) have NO test files/cases despite tasks 2.2/2.3 implementing them |
| RED confirmed (tests exist) | ✅ | `SosModal.test.jsx` exists with 2 tests (server-side RED artifact) |
| GREEN confirmed (tests pass) | ✅ | SosModal 2/2 pass; WaiterPage 5/5 pass on execution |
| Triangulation adequate | ⚠️ | Only 2 test cases for the modal behaviors; no variance on payload assertions; 2 requirement behaviors untested |
| Safety Net for modified files | ➖ | WaiterPage.test.jsx pre-existed and passes (implicit safety net OK); ClientPage.jsx has no test file at all |

**TDD Compliance**: 2/6 checks passed

### Test Layer Distribution

| Layer | Tests | Files | Tools |
|-------|-------|-------|-------|
| Unit | 26 | 3 | vitest (splitService 18, useRealtimeBus 5, useDemoStore 3) |
| Integration | 45 | 12 | vitest + @testing-library/react (jsdom) — includes SosModal (2), WaiterPage (5) |
| E2E | 0 | 0 | not installed (config e2e: false) |
| **Total** | **71** | **15** | |

### Changed File Coverage

**Coverage analysis skipped** — `testing.coverage: false` in `openspec/config.yaml`; no coverage tool configured.

### Assertion Quality

| File | Line | Assertion | Issue | Severity |
|------|------|-----------|-------|----------|
| `SosModal.test.jsx` | 33-42 | test titled "emite el evento call.waiter con el motivo seleccionado" asserts only `findByText(/Mozo en camino/i)` | Payload assertion missing — `createRealtimeBus` is NOT mocked, publish is unobservable, `reason: "Falta cubierto"` is never verified; spec scenario only partially covered | WARNING |
| `SosModal.test.jsx` | 26-30 | `findByRole('heading'...)` + 3 `getByRole('button'...)` | ✅ Real behavioral assertions (heading + 3 reasons present) | — |

**Assertion quality**: 0 CRITICAL, 1 WARNING

### Quality Metrics

**Linter**: ✅ No errors (eslint ., exit 0)
**Type Checker**: ➖ Not available (`testing.quality.type_checker: false`)

### Issues Found

**CRITICAL**:
1. **Full suite is not reliably green (flaky).** First full run: 70/71 passed, exit 1 — `RadarView/FocusMode.test.jsx:36` fails with "Found multiple elements" because `useRadarStore` leaks `focusMode: true` across test files in the same worker. Second full run: 71/71, exit 0. The orchestrator's "suite completa verde" claim is NOT reproducible. Out of scope for this change (no RadarView file in 63a8cbf) but it blocks the proposal's success criterion "All tests pass in GREEN".
2. **REQ-03 (waiter badge) has no covering test** — `WaiterPage.test.jsx` was NOT extended with a call.waiter badge test as the proposal planned; static implementation only. Spec requirement without runtime proof = UNTESTED (hard rule).
3. **No TDD evidence artifact from apply phase** — Strict TDD was active, but no apply-progress with a TDD Cycle Evidence table exists (file or Engram). The RED→GREEN sequence cannot be corroborated; task 1.2's "confirm RED failure" has no recorded output.

**WARNING**:
1. **Customer name field missing** (`SosModal.jsx`) — spec REQ-02 says "Allow customer to type their name (optional, defaults to 'Cliente')"; there is no name input, `customerName` is hardcoded.
2. **REQ-02 emission test is PARTIAL** — no assertion on the emitted payload or reason; publish unobservable (bus not mocked); spec scenario "reason: 'Falta cubierto'" is not verified at runtime.
3. **Bus instantiation deviation** — spec/proposal say "via useRealtimeBus"; code uses module-scope `createRealtimeBus` directly in both files, giving each module a private listener registry (works in-browser via BroadcastChannel, but diverges from design and makes WaiterPage badge untestable).
4. **S.O.S. button red is tinted** — `bg-semantic-danger/10` + `text-semantic-danger` with `animate-pulse`; pulse exists but the red fill is not pure #EF4444 as the spec states.
5. **Commit scope hygiene** — commit 63a8cbf also carries `src/features/ClientView/services/splitService.js` (+135 lines, account-split code re-introduced after the revert dance), outside sos-waiter-call scope; violates AGENTS.md "commit por unidad lógica".

**SUGGESTION**:
1. Extend `WaiterPage.test.jsx` with a badge test by injecting an adapter into the bus (or using the `useRealtimeBus` singleton + an exported test hook) so REQ-03 gets runtime proof.
2. Mock/spy on `bus.publish` in `SosModal.test.jsx` and assert the exact payload `{ tableId, reason: 'Falta cubierto', customerName, timestamp }`.
3. Fix the RadarView flake (reset `useRadarStore` in `FocusMode.test.jsx` beforeEach or scope the `getByText` query) as a separate change/commit before archiving anything.

### Verdict

**FAIL** — with scoping: sos-waiter-call's own test files pass, build and lint are green, and the modal + badge implementation matches the spec statically. But the archive gate requires: a reliably green full suite (flaky red once), runtime proof for REQ-03 (untested) and the REQ-02 payload scenario (partial), and TDD evidence — none of which hold. Do NOT proceed to archive until the three CRITICAL items are resolved.