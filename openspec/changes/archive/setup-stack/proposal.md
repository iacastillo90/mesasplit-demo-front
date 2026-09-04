# Proposal: setup-stack — MesaSplit Frontend Demo Scaffold

## Intent

Bootstrap MesaSplit's demo frontend from zero code: a runnable Vite + React app with the documented FSD tree, Tailwind tokens, routing, base UI, mock fixtures and a same-device realtime bus, so later changes build features on a verified foundation and `strict_tdd` can be enabled.

## Scope

### In Scope
- Scaffold (explore stack A): Vite 6 + React 18.3 (JS/JSX), Tailwind 3.4, React Router v6, Zustand v5, Vitest 3 + Testing Library, ESLint 9 flat + Prettier; scripts + version pins.
- **Portal hub at `/`** (mandatory) launching every view; full route table per docs/03.
- Design tokens per docs/04: `brand.{50..950}` + semantic colors + Inter; `shared/ui` (Button, Modal, Badge, Toast).
- FSD slices: Portal, ClientView, WaiterView, KdsView, **Local Admin Radar** (`/admin/radar`); Super Admin = empty placeholder (`/admin/super`).
- `useRealtimeBus.js` (BroadcastChannel adapter, Scenario A) + Zustand root store (persist) + `mocks/` + mockFetch delay.
- Vitest smoke suite; config.yaml rows + `strict_tdd` flip after green run.

### Out of Scope
- Cross-device bridge (socket.io / Firebase) — deferred; same-device only, `VITE_DEMO_MODE=same-device`.
- Functional POS / Super Admin dashboards (placeholders only).
- Real backend, auth, DTE, doc rewrites (01/03/04/05).

## Capabilities

> Contract for sdd-spec. `openspec/specs/` is empty — all capabilities are new.

### New Capabilities
- `setup-stack`: toolchain config, version pins, scripts, lint/format, test setup, `.env.example`.
- `app-routing`: `RouterProvider` + `createBrowserRouter` 7-route table + hub navigation.
- `design-tokens`: Tailwind config, brand/semantic tokens, `shared/constants`, `shared/ui`.
- `feature-views`: FSD slices for 5 demo views + Super Admin placeholder.
- `realtime-bus`: `useRealtimeBus` pub/sub + BroadcastChannel adapter + `useDemoStore` persist + fixtures.

### Modified Capabilities
- None.

## Approach

Single-agent scaffold (opencode) using explore's pinned commands; apply groups tasks by feature; **Antigravity stays out of `src/` for this change** (multi-agent rule). Work on `feature/setup-stack`, committed in reviewable units.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json`, `vite.config.js`, `index.html`, `.env.example` | New | Scaffold, pins, scripts, `VITE_DEMO_MODE=same-device` |
| `tailwind.config.js`, `postcss.config.js` | New | Brand palette + semantic colors (docs/04) |
| `src/app/`, `src/routes/index.jsx` | New | `RouterProvider` + 7-route table |
| `src/features/{Portal,ClientView,WaiterView,KdsView,RadarView,CorporateView}/` | New | FSD slices; Super Admin placeholder |
| `src/shared/{ui,constants,utils}/` | New | Base UI + tokens + formatters |
| `src/hooks/useRealtimeBus.js`, `src/store/useDemoStore.js`, `src/mocks/` | New | Bus + store + fixtures |
| `src/**/*.test.jsx`, `src/test/setup.js` | New | Vitest + RTL |
| `openspec/config.yaml` | Modified | Test/build/lint rows; `strict_tdd` after green run |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Collision on ~60 scaffold files (2 agents) | Med | Apply single-agent; Antigravity excluded from `src/` |
| `create-vite` defaults to React 19 / Tailwind 4 | High | Explicit version pins in `package.json` (design task) |
| `strict_tdd` enabled too early | Low | Flip only after green Vitest run |
| Hub cross-tab views fail (same-origin) | Low | BroadcastChannel is same-origin; verify in demo checklist |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/setup-stack`. `openspec/` is gitignored, so SDD artifacts survive; if history must be kept, revert deps via `npm uninstall`. External-free: no accounts or secrets to revoke.

## Dependencies

- Node 18+ / npm. None external (AGENTS.md: no secrets/accounts).

## Success Criteria

- [ ] `npm run build` exits 0.
- [ ] `npm run test` green: 7 routes render, hub navigation, bus ping (smoke).
- [ ] `npm run lint` 0 errors; `npm run format` clean.
- [ ] `npm run dev`: `/` hub launches each view; Radar renders dark map shell.
- [ ] `openspec/config.yaml`: `test_command`/`build_command`/linter set; `strict_tdd: true`.
- [ ] Docs 01/03/04/05 untouched (zero doc drift).