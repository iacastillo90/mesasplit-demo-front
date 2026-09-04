# Proposal: account-split — Bill Splitting for the Client View

## Intent

The Mesa Virtual cart (`useClientStore.cart`) has no per-guest ownership: diners share one cart and cannot divide the bill. The demo needs the four split modes documented in `Payment.splitType` (`full | equal | by_item | item_fraction`, `docs/architecture/02-modelo-datos.md`). The genuinely hard problem is CLP arithmetic — equal parts and fractions must never drift from the cart total. This change ships a simulated split flow fully contained in `ClientView`, with zero regression on `useClientStore`.

## Scope

### In Scope
- `SPLIT_TYPE` + `GUEST_PAYMENT_STATUS` enums in `shared/constants/statusEnums.js`
- `splitService.js`: pure `buildGuests(count)`, `splitByMode(cart, mode, allocations)`, `applyPayment(...)`; deterministic largest-remainder CLP rounding; conservation invariant `sum(per-guest totals) === cart total`
- `useSplitStore.js`: thin Zustand shell — guests, allocations, mode, status; totals always derived via service
- `BillSplitterModal.jsx`: bottom-sheet (shared `Modal`) with mode picker, per-guest allocation, payment confirmation
- "Dividir cuenta" button in `SharedCartDrawer`; wiring in `ClientPage`
- Simulated payment: marks guests `paid` + publishes `payment.split` via `useRealtimeBus` (new `TOPICS.PAYMENT_SPLIT`) for caja/radar sync
- Numbered guests (Comensal 1..N) derived from `TABLE_CONTEXT.guests` — no registration
- RED-GREEN tests: service unit (invariant), store unit, modal RTL

### Out of Scope
- KdsView (`kds-kitchen` active on Antigravity) — no KDS touches
- Real payment/gateway, backend, POS/Caja view, Super Admin
- Any rewrite of `useClientStore` (read-only input, shape intact)

## Capabilities

> Contract between proposal and sdd-spec. `openspec/specs/` is EMPTY (setup-stack archived without merging) — all capabilities are new.

### New Capabilities
- `account-split`: per-guest bill splitting in ClientView — numbered guests, four split modes aligned to `Payment.splitType`, deterministic CLP rounding with conservation invariant, simulated payment, `payment.split` bus event.

### Modified Capabilities
- None — no spec-level behavior of existing capabilities changes.

## Approach

Approach 3 from exploration: all arithmetic lives in pure `splitService.js` (testable under `strict_tdd: true`); `useSplitStore` is a state shell deriving totals per render; `BillSplitterModal` is a bottom-sheet over the drawer; simulated payment flips UI state and publishes `payment.split` over the existing bus. `useClientStore.cart` is consumed read-only.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/constants/statusEnums.js` | Modified | Add `SPLIT_TYPE`, `GUEST_PAYMENT_STATUS` |
| `src/features/ClientView/services/splitService.js` | New | Pure arithmetic, rounding, invariant |
| `src/features/ClientView/store/useSplitStore.js` | New | Thin state shell |
| `src/features/ClientView/components/BillSplitterModal.jsx` | New | Bottom-sheet splitter UI |
| `src/features/ClientView/components/SharedCartDrawer.jsx` | Modified | "Dividir cuenta" action button |
| `src/features/ClientView/pages/ClientPage.jsx` | Modified | Wire modal state + `payment.split` publish |
| `src/hooks/useRealtimeBus.js` | Modified | Add `PAYMENT_SPLIT: 'payment.split'` topic |
| `src/mocks/tableContext.js` | Modified | `guests` count consumed by `buildGuests` |
| `src/features/ClientView/**/*.test.*` | New | Service/store unit + modal RTL (RED-GREEN) |
| `openspec/docs/architecture/02-modelo-datos.md` | Modified | Document local `Guest` entity |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CLP rounding drift (cents in per-guest totals) | Med | Largest-remainder policy + invariant test |
| Fractional allocations ≠ line qty | Med | Service validates/blocked; "unassigned" surfaced |
| Cart↔split desync while session open | Med | Cart snapshot at split start; allocations reset on cart change |
| Collision with Antigravity's KDS | Med | Scope locked to ClientView + enums/mocks |
| Review size ~600–900 lines | Med | sdd-tasks forecasts chained PRs (service/store → UI → wiring) |

## Rollback Plan

Revert the slice: delete `splitService.js`, `useSplitStore.js`, `BillSplitterModal.jsx` and their tests; undo drawer/page/`useRealtimeBus` edits; remove the enums. `useClientStore` shape untouched → no regression surface; the 6 existing green suites prove safety.

## Dependencies

- Existing `useRealtimeBus` (same-device BroadcastChannel), shared `Modal` bottom-sheet, `formatCurrency`
- Alignment with `Payment.splitType` from `02-modelo-datos.md` (no new packages)

## Success Criteria

- [ ] `splitService` suite green: invariant `sum(parciales) === total` holds for all 4 modes (largest-remainder)
- [ ] `payment.split` published on simulated payment; second tab/view receives it via bus
- [ ] `npm run test` green (new RED-GREEN + existing 6 suites); `npm run build` passes
- [ ] `useClientStore` file shape unchanged in the diff
- [ ] "Dividir cuenta" opens bottom-sheet; numbered guests with zero registration