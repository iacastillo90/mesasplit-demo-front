# Tasks: setup-stack — MesaSplit Frontend Demo Scaffold

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,800 (58 new / 2 modified) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Work Units

| Unit | Goal | Likely PR | PR base | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|---------|----------------------|-----------------|-------------------|
| 1 | Toolchain + root configs | PR 1 | `feature/setup-stack` | `npm ci && npm run build` | `npm run dev` → `/` | Revert root files |
| 2 | Router + tokens/UI | PR 2 | PR 1 branch | `npm run test -- routes` | `npm run dev` → `/no-existe` | Revert app/routes/shared |
| 3 | 6 FSD slices | PR 3 | PR 2 branch | `npm run test -- KdsPage RadarPage` | `npm run dev` → `/cocina`, `/admin` | Revert src/features |
| 4 | Realtime + tests + flip | PR 4 | PR 3 branch | `npm run test && npm run build` | 2 tabs `npm run dev`, cross-tab | Revert mocks/hooks/store + config.yaml |

## Phase 1: Foundation / Infra

- [x] 1.1 `package.json` exact pins (React 18.3, Vite 6, TW 3.4, RR 6, Zustand 5, Vitest 3, ESLint 9, Prettier) + scripts; lockfile committed for `npm ci`.
- [x] 1.2 `vite.config.js` (Vitest jsdom + setup + `VITE_DEMO_MODE` fallback), `tailwind.config.js` (brand/semantic/Inter/shadows), `postcss.config.js`.
- [x] 1.3 `eslint.config.js` flat + `.prettierrc.json`, `.env.example` (`same-device`), `index.html`, `.gitignore` adds, `src/index.css` (@tailwind), `src/test/setup.js` (jest-dom).

## Phase 2: Core (FSD slices + routes)

- [x] 2.1 `src/app/`: `main.jsx`, `App.jsx` (RouterProvider), `NotFoundPage.jsx` (404 + back link).
- [x] 2.2 `src/routes/index.jsx`: 7-route table (`/`, `/cliente`, `/garzon`, `/cocina`, `/admin` index→Radar, `/admin/super` nested, `*`→404).
- [x] 2.3 `src/shared/`: constants (colors, statusEnums), utils (formatCurrency, validateRut), ui (Button, Modal, Badge, Toast — token-only).
- [x] 2.4 Portal slice: `PortalPage.jsx` + `ViewLauncherCard.jsx` (hub launchers).
- [x] 2.5 ClientView slice: page (banner/menu/cart), `SharedCartDrawer.jsx`, service, store.
- [x] 2.6 WaiterView slice: page, `TableGrid.jsx`, `OrderPad.jsx`, service, store.
- [x] 2.7 KdsView slice (dark): page, header, TicketCard (urgent/danger), allergy shield (danger red), station tabs, service, store.
- [x] 2.8 RadarView slice (page, `TopologicalMap.jsx`, feed, store) + CorporateView `SuperAdminPage.jsx` placeholder.

## Phase 3: Real-time (bus + store + mocks)

- [x] 3.1 `src/mocks/`: tables/menu/users fixtures + `mockFetch.js` (~300ms).
- [x] 3.2 `src/hooks/useRealtimeBus.js`: pub/sub + BroadcastChannel adapter (`VITE_DEMO_MODE`).
- [x] 3.3 `src/store/useDemoStore.js`: Zustand persist (localStorage), seed/reset/setTableStatus.

## Phase 4: Testing (RED per scenario)

- [x] 4.1 `src/routes/__tests__/routing.test.jsx` RED: 7 views, hub nav, 404 + back link, `/admin/super` unmounts Radar (app-routing: 404).
- [x] 4.2 `src/hooks/useRealtimeBus.test.js` RED: subscribe→receive, unsubscribe, no-listeners, cross-tab stub (realtime-bus: pub/sub).
- [x] 4.3 `src/store/useDemoStore.test.js` RED: restore on reload; seed from mocks (realtime-bus: persist).
- [x] 4.4 `src/features/Portal/PortalPage.test.jsx` RED: launcher navigates (app-routing: launcher).
- [x] 4.5 `src/features/KdsView/KdsPage.test.jsx` RED: dark surfaces, no light leakage (feature-views: KDS dark).
- [x] 4.6 `src/features/RadarView/RadarPage.test.jsx` RED: map count == fixture (feature-views: map).
- [x] 4.7 Prove RED (false assert fails run), then GREEN: test/build/lint/format pass (setup-stack: red/green).

## Phase 5: Cleanup / Wiring

- [x] 5.1 Clean run (`npm ci`, build, test, lint, format) all pass (setup-stack: runnable), then `openspec/config.yaml`: `test_command`/`build_command`/linter rows + `strict_tdd: true` only after green (setup-stack: flip).