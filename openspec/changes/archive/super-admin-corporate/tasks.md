# Tasks: super-admin-corporate — Panel Corporativo Multi-Local

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/CorporateView/SuperAdminPage.test.jsx` with RED tests for:
  - Multi-branch global KPI analytics summary (revenue, active tables, customer count)
  - Branch health cards rendering for Las Condes, Providencia, Vitacura, and Santiago Centro
  - Global feature config switches (Ley 40 Horas, Allergy Shield, DTE Auto)
  - Cross-branch realtime event log stream (`alert.fraud`, `payment.completed`)
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Store & Services Implementation

- [x] 2.1 Create `src/features/CorporateView/store/useCorporateStore.js`:
  - Add `branches` list (Las Condes, Providencia, Vitacura, Santiago Centro)
  - Add `globalKpis` aggregated summary
  - Add `featureToggles` object and `toggleFeature(key)` action emitting `config.updated`
  - Add `franchiseEvents` array and realtime listeners for `payment.completed`, `alert.fraud`, `alert.panic`
- [x] 2.2 Create `src/features/CorporateView/services/corporateService.js` supplying branch metrics and transaction streams.

## Phase 3: Components & UI Implementation

- [x] 3.1 Create `src/features/CorporateView/components/BranchHealthCard.jsx` (Operational health card with status semaphores).
- [x] 3.2 Create `src/features/CorporateView/components/GlobalConfigToggles.jsx` (Master franchise feature switches).
- [x] 3.3 Create `src/features/CorporateView/components/FranchiseEventStream.jsx` (Cross-branch realtime audit stream).
- [x] 3.4 Update `src/features/CorporateView/pages/SuperAdminPage.jsx` with Corporate Dashboard layout, KPI banner, branch grid, and stream.

## Phase 4: GREEN Verification & Code Quality

- [x] 4.1 Update `src/routes/__tests__/routing.test.jsx` to match new Corporate Super Admin page heading.
- [x] 4.2 Run `npm run test` to verify all tests pass GREEN.
- [x] 4.3 Run `npm run build` to verify clean production compilation.
- [x] 4.4 Run `npm run lint` and `npm run format` to ensure 0 lint errors and clean formatting.
- [x] 4.5 Commit changes in reviewable logical units with Spanish conventional commits explaining the WHY.
