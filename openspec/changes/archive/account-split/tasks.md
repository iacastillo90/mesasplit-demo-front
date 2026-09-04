# Tasks: account-split — Bill Splitting for the Client View

Scope: `ClientView` + enums + bus topic + doc. NOT touched: KdsView/RadarView/PosView; `useClientStore` read-only.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | feature-branch-chain |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

Test paths below are relative to `src/features/ClientView/`.

### Suggested Work Units

| Unit | Goal | Likely PR | PR base | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|---------|----------------------|-----------------|-------------------|
| 1 | Enums + splitService + useSplitStore + unit tests (RED-GREEN) | PR 1 | `feature/account-split` | `npm run test -- services/splitService.test.js store/useSplitStore.test.js` | `npm run dev` → `/cliente` | Delete service/store/enums + tests |
| 2 | BillSplitterModal + RTL | PR 2 | PR 1 branch | `npm run test -- components/BillSplitterModal.test.jsx` | `npm run dev` → open modal | Delete modal + test |
| 3 | Wiring (drawer button, ClientPage, bus topic) + doc | PR 3 | PR 2 branch | `npm run test && npm run build` | 2 tabs; pay → other tab gets `payment.split` | Revert drawer/page/bus/doc edits |

## Phase 1: RED — Service + Store unit tests (strict_tdd)

- [x] 1.1 `services/splitService.test.js` RED: invariant `Σtotals === cartTotal` in 4 modes; equal 10,000/3 → 3,334/3,333/3,333 (spec: Equal conservation, Largest remainder).
- [x] 1.2 RED fractions: 0.5+0.5 valid; 0.5 alone → unassigned + blocked; 1.5 on qty 1 rejected (spec: Fractions valid/Unassigned/Over quantity).
- [x] 1.3 RED: empty cart → all 0; single guest → total === cart; `applyPayment` flips only that guest (spec: Empty cart, Single guest, Partial payment).
- [x] 1.4 `store/useSplitStore.test.js` RED: default mode `full`; `openSplit` derives Comensal 1..N (spec: Default mode, Guests derived).
- [x] 1.5 RED store: totals re-derive, never cached (spec: Totals refresh); `syncWithCart` resets (spec: Cart changes).
- [x] 1.6 Run `npm run test` → new suites fail RED.

## Phase 2: GREEN — Service + Store

- [x] 2.1 `src/shared/constants/statusEnums.js`: add `SPLIT_TYPE` + `GUEST_PAYMENT_STATUS`; re-export in `constants/index.js`.
- [x] 2.2 `services/splitService.js`: pure `buildGuests`, `splitByMode`, `calculateEqualShares`, `calculateByItem`, `calculateFractions`, `applyLargestRemainder` (tie-break by guest id), `checkConservation`, `applyPayment`.
- [x] 2.3 `store/useSplitStore.js`: thin Zustand shell (open/mode/guests/allocations/payments/cartSnapshot) + derived selectors via service.
- [x] 2.4 Run `npm run test` GREEN; Spanish conventional commit (PR 1).

## Phase 3: Modal + RTL (RED-GREEN)

- [x] 3.1 `components/BillSplitterModal.test.jsx` RED: bottom-sheet over drawer; mode defaults `full` (spec: Default mode).
- [x] 3.2 RED RTL: unassigned blocks confirm (spec: Unassigned); markPaid publishes `payment.split` with guest/amount/mode (spec: Event published; injected bus adapter).
- [x] 3.3 `components/BillSplitterModal.jsx`: mode picker, per-guest allocation steps, totals, payment confirm.
- [x] 3.4 Run `npm run test` GREEN; commit (PR 2).

## Phase 4: Wiring + Bus + Doc

- [x] 4.1 `src/hooks/useRealtimeBus.js`: add `PAYMENT_SPLIT: 'payment.split'` to `TOPICS`.
- [x] 4.2 `components/SharedCartDrawer.jsx`: "Dividir cuenta" button (disabled when cart empty).
- [x] 4.3 `pages/ClientPage.jsx`: wire modal + `openSplit(cartSnapshot)` + publish `payment.split` on confirm.
- [x] 4.4 `openspec/docs/architecture/02-modelo-datos.md`: document local `Guest {id,label,status}`.
- [x] 4.5 Commit (PR 3).

## Phase 5: Clean Run

- [x] 5.1 `npm run build` + `test` + `lint` + `format` clean; `useClientStore` unchanged.
- [x] 5.2 2-tab run: pay in tab A → tab B receives `payment.split`; invariant Σpartials === total.
- [x] 5.3 Mark tasks [x]; final commit.