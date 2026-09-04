# Design: super-admin-corporate — Panel Corporativo Multi-Local

## Technical Approach

Implement the interactive Corporate Super Admin Dashboard in `src/features/CorporateView/` under `strict_tdd: true`. The implementation updates `SuperAdminPage.jsx`, `SuperAdminPage.test.jsx`, creates `corporateService.js`, `useCorporateStore.js`, `BranchHealthCard.jsx`, `GlobalConfigToggles.jsx`, and `FranchiseEventStream.jsx`.

The Corporate Dashboard provides multi-branch revenue analytics (Las Condes, Providencia, Vitacura, Santiago Centro), operational health status cards, global feature toggles, and cross-branch realtime event log auditing (`payment.completed`, `alert.fraud`, `alert.panic`).

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Multi-Branch Data Model | A: Flat single-branch fixture. B: Structured multi-branch object with local KPIs and status semaphores. | **B**: Structured multi-branch array in `useCorporateStore.js`. |
| D2 | Realtime Cross-Branch Bus | A: Polling REST API. B: Global subscription to `createRealtimeBus('mesasplit')` topics (`payment.completed`, `alert.fraud`, `alert.panic`). | **B**: Store-level subscription to bus topics. |
| D3 | Global Config Toggles | A: Hardcoded boolean flags. B: Interactive Zustand store state emitting `config.updated`. | **B**: Interactive toggles in `useCorporateStore.js` emitting `config.updated`. |

## Data Flow

```
[Realtime Bus / Corporate User]
     │
     ├── payment.completed ────► useCorporateStore.onPaymentCompleted() ──► Append to event stream & update total sales
     │
     ├── alert.fraud ──────────► useCorporateStore.onFraudAlert() ───────► Append to corporate stream with red warning
     │
     ├── alert.panic ──────────► useCorporateStore.onPanicAlert() ───────► Trigger corporate emergency alert banner
     │
     └── Toggle Feature Switch ─► useCorporateStore.toggleFeature(key) ──► publishBusEvent('config.updated')
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/CorporateView/pages/SuperAdminPage.jsx` | Modify | Corporate Super Admin layout, KPI summary banner, branch grid, stream |
| `src/features/CorporateView/components/BranchHealthCard.jsx` | Create | Branch status card (Las Condes, Providencia, Vitacura, Santiago Centro) |
| `src/features/CorporateView/components/GlobalConfigToggles.jsx` | Create | Master franchise feature switches (Ley 40h, Allergy Shield, DTE Auto) |
| `src/features/CorporateView/components/FranchiseEventStream.jsx` | Create | Real-time cross-branch audit event stream |
| `src/features/CorporateView/services/corporateService.js` | Create | Service supplying multi-branch metrics and transaction streams |
| `src/features/CorporateView/store/useCorporateStore.js` | Create | Zustand store for multi-branch state, global KPIs, feature toggles, event stream |
| `src/features/CorporateView/SuperAdminPage.test.jsx` | Create | RTL test suite verifying multi-branch KPIs, health cards, feature toggles, and event log |

## Testing Strategy

All tests written RED first in `src/features/CorporateView/SuperAdminPage.test.jsx`:
1. **Multi-Branch KPIs**: Verify aggregated total revenue (`$1.250.000+`) and active customer count render.
2. **Branch Health Cards**: Verify cards render for Las Condes, Providencia, Vitacura, and Santiago Centro with status semaphores.
3. **Global Config Toggles**: Toggle master "Control Ley 40 Horas" switch and verify state updates.
4. **Cross-Branch Realtime Stream**: Emit `alert.fraud` event and verify entry appears in corporate audit log.

## Threat Matrix

N/A — Client-side SPA feature with mock realtime bus and fixtures.

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/super-admin-corporate`.
