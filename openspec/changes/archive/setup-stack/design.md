# Design: setup-stack — MesaSplit Frontend Demo Scaffold

## Technical Approach

Bootstrap the entire documented stack from zero code on branch `feature/setup-stack`, apply single-agent (opencode), Antigravity excluded from `src/`. Two work streams: (1) toolchain — Vite 6 + React 18.3 (JS/JSX) + Tailwind 3.4 + ESLint 9 flat + Prettier + Vitest 3, all version-pinned; (2) app skeleton — FSD tree with a 7-route `createBrowserRouter` table (spec paths, no `/pos`), token-driven base UI, and a BroadcastChannel realtime bus with a persistent Zustand root store. Contract = the 5 delta specs; docs 01/03/04/05 stay untouched.

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Stack generation | A: React 18.3/Vite 6/TW 3.4/RR v6 — doc-compliant, zero doc drift, battle-tested. B: React 19/Vite 7/TW 4/RR v7 — current-gen but rewrites 4+ docs, breaks `tailwind.config.js`, no demo payoff. C: TS variant — types cost velocity across 6 features. | **A** (exploration approach A) |
| D2 | Language | JS/JSX vs TypeScript. Docs show only `.jsx`/JS; TS hardens but slows demo iteration. Compromise: **JSDoc typedefs** on shared models (`mocks/`, `shared/`) replacing TS interfaces. | **JS/JSX** |
| D3 | Test runner | Vitest 3 vs Jest 29. Vitest = native Vite config reuse, jsdom, no babel bridge, ESM-native; Jest adds `jest-environment-jsdom` + transform config, slower cold start. | **Vitest 3 + Testing Library** |
| D4 | Realtime transport | BroadcastChannel adapter vs socket.io LAN bridge vs Firebase. BroadcastChannel = zero deps, same-origin, offline, no accounts — covers the split-screen demo; adapter kept swappable via `VITE_DEMO_MODE`. socket.io/Firebase deferred to a future change. | **BroadcastChannel** (Scenario A) |
| D5 | Router API | `createBrowserRouter` + `RouterProvider` vs `<BrowserRouter><Routes>`. Data router gives a static declarative table, `index` routes for `/admin` nesting, and a catch-all `path:"*"` 404 element. Spec mandates it. | **createBrowserRouter** |
| D6 | Global state | Zustand v5 `persist` vs Redux vs Context. Zustand persist middleware = localStorage survival with ~0 boilerplate; one slice per feature (docs/03 pattern). | **Zustand v5** |
| D7 | Version pinning | Exact `=` pins for stack majors vs caret ranges vs `create-vite` defaults. `create-vite` latest scaffolds React 19 + TW 4, violating spec scenarios. Pin all 8 critical majors exactly + commit `package-lock.json` so `npm ci` reproduces. | **Exact pins + lockfile** |

## Data Flow

Realtime bus (same-device, cross-tab):

```
[View A tab 1]                  [View B tab 2]
   │ publish('course.fire',p)        ▲
   ▼                                 │ subscribe('course.fire',h)
useRealtimeBus ──► BusCore ──────────┤
                    (pub/sub registry)│ onmessage
                    └──► BroadcastChannel('mesasplit-bus') ──► BusCore(tab2) ──► listeners
```

Service layer (per feature):

```
FeaturePage ──► services/*Service ──► mockFetch(delay 300ms) ──► mocks/*.json
                                        │
                                        └──► useDemoStore (persist → localStorage)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Create | Exact pins (React 18.3.x, Vite 6.x, TW 3.4.x, RR 6.x, Zustand 5.x, Vitest 3.x, ESLint 9, Prettier); scripts `dev/build/preview/test/test:watch/lint/format` |
| `package-lock.json` | Create | Committed lockfile so `npm ci` reproduces pins |
| `vite.config.js` | Create | Vite + Vitest config (jsdom, setup file, globals) in one file; `define` fallback for `VITE_DEMO_MODE` |
| `tailwind.config.js` | Create | `brand.{50,100,500,800,900,950}` + `semantic.{success,warning,urgent,danger}` + `fontFamily.sans` Inter + `boxShadow.{soft,dark-glow,danger-glow}` (docs/04) |
| `postcss.config.js` | Create | Tailwind + autoprefixer |
| `eslint.config.js` | Create | ESLint 9 flat: `@eslint/js` + `eslint-plugin-react` + `eslint-plugin-react-hooks` |
| `.prettierrc.json` | Create | Prettier defaults |
| `.env.example` | Create | `VITE_DEMO_MODE=same-device` |
| `index.html` | Create | Vite entry, mounts `src/app/main.jsx`, Inter font link |
| `.gitignore` | Modify | Add `node_modules/`, `dist/`, `.env` (keep existing entries) |
| `src/app/main.jsx` | Create | `createRoot` + `index.css` |
| `src/app/App.jsx` | Create | Renders `RouterProvider` |
| `src/app/NotFoundPage.jsx` | Create | 404 view with `<Link to="/">` back to hub |
| `src/routes/index.jsx` | Create | 7-route table: `/`, `/cliente`, `/garzon`, `/cocina`, `/admin` (index→Radar), `/admin/super` (nested child), `path:"*"`→NotFound |
| `src/index.css` | Create | `@tailwind` base/components/utilities |
| `src/shared/constants/colors.js` | Create | Token hex exports (single source, no duped literals) |
| `src/shared/constants/statusEnums.js` | Create | UI status enums (ticket, table, order) |
| `src/shared/ui/Button.jsx` | Create | Brand-500 primary CTA, `h-14` + `active:scale-95` mobile rules |
| `src/shared/ui/Modal.jsx` | Create | Bottom-sheet modal shell |
| `src/shared/ui/Badge.jsx` | Create | Token-colored badge |
| `src/shared/ui/Toast.jsx` | Create | Success/danger variants (semantic tokens) |
| `src/shared/utils/formatCurrency.js` | Create | CLP formatter |
| `src/shared/utils/validateRut.js` | Create | Chilean RUT validator |
| `src/features/Portal/pages/PortalPage.jsx` | Create | Hub at `/` with launcher cards |
| `src/features/Portal/components/ViewLauncherCard.jsx` | Create | Nav card per view |
| `src/features/ClientView/pages/ClientPage.jsx` | Create | Mesa Virtual: table banner, menu, cart affordance (light mode) |
| `src/features/ClientView/components/SharedCartDrawer.jsx` | Create | Cart shell |
| `src/features/ClientView/services/clientService.js` | Create | `mockFetch`-backed adapter |
| `src/features/ClientView/store/useClientStore.js` | Create | Client slice |
| `src/features/WaiterView/pages/WaiterPage.jsx` | Create | Table grid + order pad shells |
| `src/features/WaiterView/components/TableGrid.jsx` | Create | Table grid from service |
| `src/features/WaiterView/components/OrderPad.jsx` | Create | Order pad shell |
| `src/features/WaiterView/services/waiterService.js` | Create | `fetchAssignedTables` w/ delay |
| `src/features/WaiterView/store/useWaiterStore.js` | Create | Waiter slice |
| `src/features/KdsView/pages/KdsPage.jsx` | Create | Strict dark Kanban (brand-950 bg) |
| `src/features/KdsView/components/KdsHeader.jsx` | Create | Dark header |
| `src/features/KdsView/components/TicketCard.jsx` | Create | brand-800 card, Timer semaphore, allergy shield (danger) |
| `src/features/KdsView/components/AllergyShieldAlert.jsx` | Create | Red-only health/safety alert |
| `src/features/KdsView/components/StationFilterTabs.jsx` | Create | Station filter shell |
| `src/features/KdsView/services/kdsService.js` | Create | Orders fixture adapter |
| `src/features/KdsView/store/useKdsStore.js` | Create | KDS slice |
| `src/features/RadarView/pages/RadarPage.jsx` | Create | Local Admin at `/admin`: table map + exception feed shell |
| `src/features/RadarView/components/TopologicalMap.jsx` | Create | Visual table map (critical element) |
| `src/features/RadarView/components/ExceptionFeedDrawer.jsx` | Create | Exceptions shell |
| `src/features/RadarView/store/useRadarStore.js` | Create | Radar slice |
| `src/features/CorporateView/pages/SuperAdminPage.jsx` | Create | Explicit "not yet implemented" placeholder |
| `src/hooks/useRealtimeBus.js` | Create | Pub/sub + BroadcastChannel adapter via `VITE_DEMO_MODE` |
| `src/store/useDemoStore.js` | Create | Zustand persist root store (localStorage) |
| `src/mocks/tables.json` / `menu.json` / `users.json` | Create | Fixtures per documented shapes |
| `src/mocks/mockFetch.js` | Create | Latency-simulating helper (~300ms) |
| `src/test/setup.js` | Create | jest-dom matchers import |
| `src/routes/__tests__/routing.test.jsx` | Create | All views render, hub nav, 404 + back link |
| `src/hooks/useRealtimeBus.test.js` | Create | subscribe/publish/unsubscribe, drop on no listeners, cross-tab |
| `src/store/useDemoStore.test.js` | Create | Persist restore, fresh-seed from mocks |
| `src/features/Portal/PortalPage.test.jsx` | Create | Hub launchers navigate |
| `src/features/KdsView/KdsPage.test.jsx` | Create | Dark surfaces, no light leakage |
| `src/features/RadarView/RadarPage.test.jsx` | Create | Map count matches fixture |
| `openspec/config.yaml` | Modify | Apply: `test_command`/`build_command`/linter rows + `strict_tdd: true` after green run (SHOULD) |

## Interfaces / Contracts

```js
// src/hooks/useRealtimeBus.js
const bus = useRealtimeBus('mesasplit')      // returns { subscribe, publish }
const off = bus.subscribe(topic, handler)    // off() stops delivery
bus.publish(topic, payload)                  // sync listeners + cross-tab via BroadcastChannel
// Adapter: VITE_DEMO_MODE === 'same-device' → BroadcastChannelAdapter (default fallback)
// Future: 'cross-device' → SocketAdapter (deferred, swappable)

// Event envelope + shipped topics (subset of docs/api-contracts/websocket-payloads.md)
{ topic: 'order.created' | 'order.status.change' | 'course.fire' | 'allergy.alert',
  payload: { orderId, tableId, items?, status? }, ts: Date.now(), fromTab: id }
```

```js
// src/store/useDemoStore.js — Zustand v5 persist(localStorage 'mesasplit-demo')
{ tables: Table[], menu: MenuItem[], users: User[], orders: Order[],
  seedFromMocks(), resetDemo(), setTableStatus(tableId, status) }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|--------------|----------|
| Setup (RED) | Runner proves red | Temporarily assert `false` → suite exits non-zero; then replace with real smoke (install/build/test green) |
| Unit | Bus: subscribe→receive, unsubscribe→no delivery, publish w/o listeners→no throw | `useRealtimeBus.test.js` with a `BroadcastChannel` stub for cross-tab assertion |
| Unit | Store: reload restores from localStorage; empty storage seeds from mocks | jsdom + `localStorage` |
| Integration | 7 routes render; hub launcher → URL + view change; 404 shows back link; `/admin/super` does not mount Radar | RTL `render` of `RouterProvider` (memory router for non-/ paths) |
| Integration | KDS dark tokens (brand-950/800, light text, no light surfaces); Radar map count == fixture count | Class-token assertions via `toHaveClass` |

`strict_tdd` flips to `true` in `openspec/config.yaml` only after the first green Vitest run (apply SHOULD).

## Threat Matrix

**N/A** — this change creates a client-side SPA (React Router only, no shell/process routing), runs no subprocess or VCS/PR automation, classifies no executable files, and orchestrates no git commands from app code. No adversarial rows apply; no security tasks invented.

## Migration / Rollout

**No migration** — greenfield project, no data to migrate. Rollout = branch `feature/setup-stack` with reviewable unit commits; rollback = `git checkout main && git branch -D feature/setup-stack` (openspec/ survives, it is gitignored). Version revert fallback: `npm uninstall` the pinned majors.

## Open Questions

- [ ] None blocking. (Radar map geometry is aesthetic detail resolved in apply, not architectural.)