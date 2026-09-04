# Proposal: super-admin-corporate — Panel Corporativo Multi-Local

## Intent

Implement the full interactive Corporate Super Admin Dashboard (`SuperAdminPage` in `CorporateView`). The module provides franchise executives with real-time multi-branch revenue analytics (Las Condes, Providencia, Vitacura, Santiago Centro), operational health status cards, global feature toggles (Ley 40h enforcement, Allergy Shield, DTE auto-emission), real-time transaction ticker, and global franchise event stream.

## Scope

### In Scope
- **Multi-Branch Global KPI Summary**: Combined franchise revenue (CLP), active tables, average ticket size, and customer volume across 4 locations.
- **Franchise Branch Health Cards**: Live status semaphores and operational indicators (Las Condes, Providencia, Vitacura, Santiago Centro).
- **Global Franchise Configuration**: Master feature toggles across branches (Ley 40 Horas, Allergy Shield, Delivery Auto-Accept, Auto DTE).
- **Realtime Franchise Event Stream**: Global event stream listening to `payment.completed`, `alert.fraud`, and `alert.panic` across branches over `useRealtimeBus`.
- **Strict TDD & Tests**: Unit & RTL tests written RED-GREEN under `strict_tdd: true` in `src/features/CorporateView/SuperAdminPage.test.jsx`.

### Out of Scope
- Backend database replication across multiple cloud regions (simulated via client-side multi-branch store).

## Capabilities

### New Capabilities
- `super-admin-corporate`: Interactive Super Admin Corporate Dashboard with multi-branch analytics, franchise health cards, global feature toggles, and cross-branch realtime event log.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Work executed in `src/features/CorporateView/`. Writes RED tests first in `src/features/CorporateView/SuperAdminPage.test.jsx`, then updates components in `src/features/CorporateView/` to pass tests GREEN. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/CorporateView/pages/SuperAdminPage.jsx` | Modified | Main Corporate Dashboard layout, KPI cards, branch status grid, feature toggles |
| `src/features/CorporateView/components/BranchHealthCard.jsx` | New | Branch operational health card with revenue, occupancy, and status semaphore |
| `src/features/CorporateView/components/GlobalConfigToggles.jsx` | New | Master franchise feature switches (Ley 40h, Allergy Shield, DTE Auto) |
| `src/features/CorporateView/components/FranchiseEventStream.jsx` | New | Live cross-branch audit stream listening to realtime bus topics |
| `src/features/CorporateView/services/corporateService.js` | New | Service supplying multi-branch metrics and transaction streams |
| `src/features/CorporateView/store/useCorporateStore.js` | New | Zustand slice: branches, globalKpis, featureToggles, franchiseEvents |
| `src/features/CorporateView/SuperAdminPage.test.jsx` | New | RTL test suite verifying multi-branch KPIs, branch health cards, feature toggles, and event log |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Routing test assertion expects "No implementado" badge | High | Update `routing.test.jsx` to assert Corporate Dashboard title instead of placeholder badge |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/super-admin-corporate`.

## Success Criteria

- [ ] All tests in `src/features/CorporateView/SuperAdminPage.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
- [ ] Corporate Super Admin page displays multi-branch KPIs, branch health cards, global feature toggles, and realtime event log.
