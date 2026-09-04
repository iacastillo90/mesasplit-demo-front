# Exploration: setup-stack — MesaSplit Frontend Demo Stack

**Change**: setup-stack
**Project**: mesasplit
**Mode**: HYBRID (openspec source of truth + Engram local)
**Date**: 2026-08-16
**Phase**: explore (sdd-explore executor)

## Purpose

Decide the concrete frontend stack AND the test runner for the MesaSplit
frontend demo (pre-code project), so the change can proceed through
proposal → spec → design → apply, and so `strict_tdd` can be enabled in
`openspec/config.yaml` once a runner exists.

## Current State

- **No source code.** The repo only contains `MesaSplit.md` (visual brief),
  `README.md` (stack recommendation), `AGENTS.md`, and `openspec/` (docs + config).
  No `package.json`, `go.mod`, `pyproject.toml`, or CI. One init commit.
- `openspec/config.yaml`: `strict_tdd: false`, runner `none`, quality
  `linter/type_checker/formatter: false`.
- Design docs already document the intended architecture:
  - `docs/architecture/03-estructura-carpetas-frontend.md` — React + Vite, Zustand,
    React Router v6 (`createBrowserRouter`), Feature-Sliced Design tree
    (`src/{app,routes,features,shared,hooks,mocks,store}`), 7-route table.
  - `docs/architecture/04-sistema-diseno-y-ui.md` — Tailwind config mapping the blue
    monochrome palette (`brand.{50,100,500,800,900,950}` + semantic
    success/warning/urgent/danger) inside `tailwind.config.js` (`module.exports`,
    Tailwind v3 style); fixed dark backgrounds per view (no Tailwind `darkMode` strategy).
  - `docs/architecture/05-vista-cocina-kds.md` — KDS dark-view spec (`#011623`,
    `#024064`, `#EF4444` allergy shield, red reserved for health/safety only).
  - `docs/api-contracts/websocket-payloads.md` — 11 realtime event contracts.
  - `docs/00-ecosistema-maestro-sdd.md` §13 — demo plan: `useRealtimeBus.js`
    (publish/subscribe) with interchangeable BroadcastChannel / Firebase-socket.io
    implementations selected by `VITE_DEMO_MODE` (`same-device` | `cross-device`);
    Zustand slices + persist; JSON fixtures with simulated delay; "Reiniciar Demo"
    button; service-adapter pattern (`services/` per feature).
  - `docs/01-guia-demo-y-ejecucion.md` — two demo scenarios (split-screen same device,
    QR on phone + notebook) and the 4 "wow" moments (allergy shield, hybrid QR sync,
    Lista 86, blind close + fraud feed).

## Scope Confirmation (4 demo views)

Per `config.yaml`/`AGENTS.md` the demo scope is **Admin, Waiter (Garzón), Customer,
Kitchen KDS (dark)**. Docs 03/00 describe the full 6-view ecosystem + Portal hub
(7 routes). This change scaffolds the 4 demo views (Portal hub, Client, Waiter, KDS)
as real FSD features; POS / Radar / Corporate remain documented placeholders outside
this change.

→ **Proposal must confirm**: what "Admin" means in the 4-view scope — the Portal demo
hub (route `/`) and/or Local Admin Radar (`/admin/radar`).

## Affected Areas

- `package.json`, `vite.config.js`, `index.html` — Vite + React scaffold; test/lint/build scripts.
- `tailwind.config.js`, `postcss.config.js` — brand palette tokens (docs/04).
- `src/app/App.jsx`, `src/main.jsx`, `src/routes/index.jsx` — `RouterProvider` + `createBrowserRouter` route table.
- `src/features/{Portal,ClientView,WaiterView,KdsView}/...` — FSD slices (pages/components/services/store) for the 4 demo views.
- `src/shared/ui/` (Button/Modal/Badge/Toast), `src/shared/constants/` (tokens, status enums).
- `src/hooks/useRealtimeBus.js` — publish/subscribe realtime bus (BroadcastChannel adapter first).
- `src/store/useDemoStore.js` + feature slices — Zustand root store + persist middleware.
- `src/mocks/*.json` (menu/tables/users) + `mockFetch` delay helper.
- `src/**/*.test.jsx`, `src/test/setup.js` — Vitest + Testing Library.
- `realtime-bridge/server.js` (optional) — ~30-line Express + socket.io relay for cross-device demo.
- `.env.example` — `VITE_DEMO_MODE=same-device|cross-device`.
- `openspec/config.yaml` — flip `strict_tdd`, runner, linter rows after apply.
- Docs (03/04/05, README, MesaSplit.md) — only touched if the stack deviates from the documented versions.

## Approaches

### Stack options

1. **A — Doc-compliant: JS + React 18 + Vite + Tailwind 3 + React Router v6 + Zustand** (RECOMMENDED)
   - Pros: matches every design doc as written (`.jsx`, `tailwind.config.js`
     `module.exports`, `createBrowserRouter`, `VITE_DEMO_MODE`); zero doc churn;
     stable, battle-tested versions; minimal friction for two agents; fastest path to a working demo.
   - Cons: one generation behind 2026 scaffold defaults; needs explicit version pinning.
   - Effort: Low

2. **B — Modern: JS + React 19 + Vite 7 + Tailwind 4 + React Router v7**
   - Pros: current-generation tooling.
   - Cons: breaks documented configs (`tailwind.config.js` → CSS `@theme`;
     RR v7 import surface); forces rewriting 4+ doc files inside a setup change;
     no demo-critical benefit; more unknown friction for agents.
   - Effort: Medium

3. **C — TypeScript variant (React 18 or 19)**
   - Pros: type safety; `02-modelo-datos.md` already documents shapes as TS interfaces.
   - Cons: every doc shows `.jsx`/JS; slows demo iteration; agents must maintain
     types across 6 features for zero demo payoff; JSDoc typedefs on the shared
     models cover the same need.
   - Effort: Medium–High

### Test runner options

4. **A — Vitest 3 + Testing Library** (RECOMMENDED)
   - Pros: native Vite integration (same config, no extra bundler); `jsdom`/`happy-dom`;
     `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`;
     built-in coverage (v8); fast watch; ESM-native.
   - Cons: none material for this project.
   - Effort: Low

5. **B — Jest 29**
   - Pros: classic, huge ecosystem.
   - Cons: needs babel transform config + `jest-environment-jsdom`; slower cold start;
     redundant with Vite. No advantage here.
   - Effort: Medium

6. **C — Playwright (E2E only)**
   - Pros: would prove multi-view realtime flows (allergy shield) in a real browser.
   - Cons: not required to enable `strict_tdd`; heavy for the first scaffold.
     Defer to a future e2e slice.
   - Effort: High (deferred)

### Realtime transport options

7. **A — BroadcastChannel as the shipped adapter** (RECOMMENDED default)
   - Pros: native, zero deps, no internet, covers split-screen demo (Scenario A).
   - Cons: same-browser/origin only.
   - Effort: Low

8. **B — socket.io LAN bridge (cross-device)**
   - Pros: self-contained (~30-line Express + socket.io relay in
     `realtime-bridge/server.js`); works on LAN without internet (demo
     WiFi-failure resilience); one dep in the app (`socket.io-client`);
     no accounts/secrets (honors AGENTS.md rule).
   - Cons: second process during demo; needs LAN IP (`npm run dev -- --host`).
   - Effort: Medium — include as an explicit small optional task in this change,
     activated via `VITE_DEMO_MODE=cross-device`.

9. **C — Firebase Realtime DB (cross-device)** — suggested by docs 01-guia/00-ecosistema
   - Pros: zero server maintenance; native realtime.
   - Cons: requires account + API keys; internet required; conflicts with the demo's
     offline-resilience goal. Available as an alternative if cloud sync is preferred.
   - Effort: Medium (not chosen)

## Recommendation

**Stack**: JavaScript (JSX), **React 18.3.x**, **Vite 6**, **Tailwind CSS 3.4**
(`tailwind.config.js` with the `brand` palette from docs/04), **React Router v6**
(`createBrowserRouter`), **Zustand v5** (persist middleware, one slice per feature),
**BroadcastChannel** via `useRealtimeBus.js` (publish/subscribe), plus the
**socket.io-client adapter + `realtime-bridge/` server as an optional cross-device task**.

**Quality/Test runner**: **Vitest 3** + `@testing-library/react` +
`@testing-library/jest-dom` + `@testing-library/user-event` + `jsdom`
(`src/test/setup.js`), **ESLint 9 (flat config)** + **Prettier**.
Scripts: `test` (vitest run) / `test:watch` / `lint` / `format` / `build` / `preview`.

Commands the design phase would generate (scaffold):

```bash
npm create vite@latest . -- --template react          # JS template
npm i react-router-dom@6 zustand                      # routing + state
npm i -D tailwindcss@3 postcss autoprefixer           # styling (doc-compliant config)
npx tailwindcss init -p                               # tailwind.config.js + postcss.config.js
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm i -D eslint @eslint/js eslint-plugin-react eslint-plugin-react-hooks prettier
# optional cross-device: npm i socket.io-client       # + realtime-bridge/server.js (express, socket.io)
```

Files the design phase would produce: the FSD tree from docs/03 scoped to 4 demo
features + `shared/ui` + `shared/constants` + `hooks/useRealtimeBus.js` + `mocks/` +
`store/`, the documented route table, `.env.example`
(`VITE_DEMO_MODE=same-device` default), Vitest config inside `vite.config.js`, and
`src/test/setup.js`. Config.yaml updates during apply: `test_command: "npm run test"`,
`build_command: "npm run build"`, enable linter/type_checker (ESLint)/formatter rows.

**Deviation note**: README/docs suggest Firebase for cross-device; this explore
recommends the socket.io LAN bridge instead (no accounts/secrets, offline-resilient).
If the user prefers cloud sync, Firebase remains viable — decision for the proposal.

## Risks

- **Doc drift**: choosing B or C forces rewriting docs 03/04/05 + README + MesaSplit.md;
  staying on A keeps the change small.
- **Scaffolder defaults**: `create-vite` latest may scaffold React 19 / Tailwind 4;
  design must pin documented versions (`react@18.3`, `tailwindcss@3`) explicitly.
- **Multi-agent collisions**: scaffolding touches ~60 files; apply must be single-agent
  (opencode) with tasks grouped by feature; Antigravity must not touch `src/` during
  this change (AGENTS.md rule).
- **Cross-device scope creep**: the socket.io bridge is optional — if it grows, split
  it into its own task/slice; the BroadcastChannel default must remain shippable alone.
- **strict_tdd activation**: do not flip `strict_tdd: true` until a passing Vitest run
  exists; set `test_command`/`build_command` in config.yaml during apply.
- **Demo WiFi failure**: same-device BroadcastChannel demo always works; cross-device
  needs hotspot fallback (docs/01-guia checklist).

## Ready for Proposal

**Yes.** The stack + test runner are decidable. The proposal must confirm two points
with the user: (1) the exact meaning of the "Admin" view in the 4-view demo scope
(Portal hub vs Local Admin Radar), and (2) whether the optional cross-device
socket.io bridge ships in this change or is deferred.