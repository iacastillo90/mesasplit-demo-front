# Exploration: account-split — Bill Splitting for the Client View

**Change**: account-split — **Project**: mesasplit — **Mode**: HYBRID — **Date**: 2026-08-16 — **Phase**: explore
**Status**: ready for proposal

## Purpose

Design the bill-splitting flow for the Mesa Virtual (ClientView): divide a table's shared cart among guests using the four documented modes — pay all together (`full`), equal parts (`equal`), by item (`by_item`), item fractions (`item_fraction`) — matching `Payment.splitType` from `docs/architecture/02-modelo-datos.md`. No code is modified; this exploration only analyzes and recommends.

## Current State

- **Stack (live)**: React 18.3 + Vite 6 + Tailwind 3.4 + React Router v6 + Zustand v5 (persist) + Vitest 3 / Testing Library. `strict_tdd: true` in `openspec/config.yaml` — every new behavior starts RED.
- **ClientView slice** (`src/features/ClientView/`): `useClientStore` (Zustand, no persist) holds `menu`, `tableContext`, `cart: [{id, name, price, qty}]`, `loading`, `cartOpen` with actions `loadMenu/addToCart/increaseQty/decreaseQty/removeItem/setCartOpen/resetDemo` and pure selectors `selectCartCount/selectCartTotal`. `clientService.js` exposes `getMenu()` and `getTableContext()` over `mockFetch` (~300ms latency). `ClientPage.jsx` renders the table banner, grouped menu and the shared-cart CTA + `SharedCartDrawer` (bottom-sheet via shared `Modal`).
- **The cart has no per-guest ownership**: lines are `{id, name, price, qty}` and the drawer only edits quantities. There is no split state, no guest entities, no per-guest totals, no payment status.
- **Fixtures** (`src/mocks/`): `tableContext.js` → `{number: 12, guests: 4, code: '4F2K'}` — guests is just a COUNT, no identity. `menu.json` (6 items), `tables.json` (inline `order.items`), `users.json` (staff roles only, no diners), `tickets.json`, `mockFetch.js` resource registry (`menu|tables|users|tickets|table-context`).
- **Enums** (`src/shared/constants/statusEnums.js`): `TABLE_STATUS`, `TICKET_STATUS`, `ORDER_STATUS` (open/closed/cancelled). There is NO `splitType`, NO `GUEST_PAYMENT_STATUS`, NO guest entity.
- **Data model** (`docs/architecture/02-modelo-datos.md`): `Payment` already defines `splitType: 'full' | 'equal' | 'by_item' | 'item_fraction'`, `status: 'completed' | 'failed' | 'contingency'`, `amountPaid`, `tipPaid`, `paymentMethod`. `OrderItem` has optional `orderedByCustomerId/orderedByCustomerName` — but NO `Guest` entity exists anywhere; a guest is only `guests: number`.
- **Realtime bus** (`src/hooks/useRealtimeBus.js`): topics `order.created`, `order.status.change`, `course.fire`, `allergy.alert`. No payment/split topic yet.
- **Base UI** (`src/shared/ui/`): `Button` (primary/secondary/danger/ghost), `Badge`, `Modal` (bottom-sheet), `Toast`. `formatCurrency` is CLP with 0 decimals (cents are dropped in display).
- **Test suites**: 6 green suites (routing, Kds, Radar, Portal, demoStore, realtimeBus). No ClientView tests yet.
- **Archived specs** (`openspec/changes/archive/setup-stack/specs/feature-views/spec.md`): ClientView contract is only base UI (banner + menu + visible cart affordance). Splitting has NO prior contract — this change defines it from scratch.

## What the Split Needs

1. **Guest model on the table**: today only `guests: 4`. Splitting `by_item`/`item_fraction` needs guest entities (`id`, optional `name`, payment status). Multiple same-device tabs each act as a diner via the shared cart.
2. **Item distribution**: per-cart-line allocations `{cartLineId, guestId, qty}` where `qty` MAY be fractional (0.5 pizza). The sum of allocations per line MUST equal the line `qty` (conservation invariant).
3. **Rules**:
   - `full`: one payment of the cart total.
   - `equal`: total ÷ guest count; CLP rounding policy REQUIRED (sum of per-guest totals must equal cart total — pick a remainder policy, e.g. largest-remainder or first-guest-gets-the-peso).
   - `by_item`: each guest pays exactly their allocated items.
   - `item_fraction`: shared items with fractional allocations; per-guest totals rounded with the same invariant.
   - Per-guest state: `pending | paid` (extendable to `failed`), aligned with `Payment.status`.
4. **Coexistence with the existing store**: `useClientStore.cart` remains the single source of truth for what was ordered. The split layer reads it (read-only) and never mutates it.

## Affected Areas

- `src/features/ClientView/services/splitService.js` — NEW: pure calculation layer (build guests, compute per-guest totals per mode, rounding, invariant enforcement). Ideal for strict-TDD unit tests.
- `src/features/ClientView/store/useSplitStore.js` — NEW: thin Zustand store holding guests, allocations, mode, and paid status; computes totals via the service (never stores derived totals).
- `src/features/ClientView/components/BillSplitterModal.jsx` — NEW (already anticipated in `docs/architecture/03-estructura-carpetas-frontend.md`): mode picker + step flows (guest assign / per-guest summary / payment confirmation).
- `src/features/ClientView/components/ClientSplitSteps.jsx` (or equivalent sub-components) — NEW: guest list editor and per-guest line assignment UI.
- `src/features/ClientView/components/SharedCartDrawer.jsx` — minor: add a "Dividir cuenta" action button that opens the splitter.
- `src/features/ClientView/pages/ClientPage.jsx` — wire the splitter modal state and pass store selectors.
- `src/features/ClientView/store/useClientStore.js` — read-only input for the split store; only additive changes (e.g. exposing `cart` unchanged). Prefer NOT to modify its shape.
- `src/mocks/tableContext.js` (or a new `guests.json`) — extend the table context with guest identity so `by_item`/`item_fraction` demos have real assignable guests.
- `src/mocks/mockFetch.js` — register any new resource (e.g. `/api/guests`) or extend `table-context`.
- `src/shared/constants/statusEnums.js` — NEW enums: `SPLIT_TYPE` (full/equal/by_item/item_fraction, mirroring `Payment.splitType`) and `GUEST_PAYMENT_STATUS` (pending/paid).
- `src/features/ClientView/*.test.*` — NEW test suites: pure service (unit), store (unit/integration over jsdom), page/drawer flow (RTL).
- `openspec/docs/architecture/02-modelo-datos.md` — document the `Guest` entity (local to the client slice for the demo; the doc already anticipates `orderedByCustomerId`).
- OPTIONAL: `src/hooks/useRealtimeBus.js` + `docs/api-contracts/websocket-payloads.md` — publish a split/payment event (e.g. reuse `order.status.change` or add `payment.split`) so the demo shows cross-view visibility (POS/cashier later). Do NOT add if out of scope.

**DO NOT TOUCH**: `src/features/KdsView/**` (owned by Antigravity's active change `kds-kitchen`), and by extension `WaiterView/RadarView/Portal/CorporateView` are untouched in this change.

## Approaches

1. **Dedicated split store (state in a new store, read-only cart)** — `useSplitStore` owns guests/allocations/mode/status; each mutation recomputes totals through a pure service; `cart` is read from `useClientStore`.
   - Pros: clean responsibility split (cart = what was ordered, split = how it's paid); `useClientStore` and its tests stay untouched; FSD-aligned (per-slice store); realtime/other agents unaffected; strong fits the existing `service + store` pattern.
   - Cons: two stores to keep consistent — when the cart changes (add/remove item) existing allocations can become stale/orphaned; needs a reconciliation policy (e.g. unassigned lines are simply not split).
   - Effort: **Medium**.

2. **Extend the existing cart with per-item guest assignments** — mutate `cart` lines to carry `{..., allocatedTo: [{guestId, qty}]}`; store everything in `useClientStore`.
   - Pros: single state tree, no cross-store sync; invariants live next to the lines.
   - Cons: mixes two domain concerns in one store; `addToCart/increaseQty/decreaseQty/removeItem` and `SharedCartDrawer` semantics must be reworked (what happens to assignments when qty changes?); breaks the "shared cart" mental model the spec hardened; higher regression risk on already-shipped behavior; worst fit for TDD (logic embedded in store actions).
   - Effort: **Low-Medium** (fewer new files, more coupling).

3. **Pure calculation service + thin UI store** — `splitService.js` exports 100% pure functions (`buildGuests(count)`, `splitByMode(cart, mode, allocations)`, `applyPayment(...)`); a minimal `useSplitStore` holds only state (guests, allocation drafts, mode, paid flags) and derives totals on every render via the service.
   - Pros: the riskiest logic (rounding, fractions, conservation invariant) is pure and trivially testable under strict TDD; store stays a thin state shell; totals can NEVER drift from the cart because they are always derived; smallest cognitive surface for reviewers.
   - Cons: still needs the store (no UI without state); two new files in the slice — but that's exactly the existing `clientService + clientStore` pattern.
   - Effort: **Low-Medium**.

## Recommendation

**Approach 3 — pure calculation service + thin dedicated store** (which is Approach 1 refined: the store is deliberately kept as a state shell, and ALL arithmetic lives in `splitService.js`).

Reasons:
- **strict_tdd is on**: pure functions give RED-GREEN without DOM plumbing; the conservation invariant (`sum(per-guest totals) === cart total`, exact to the peso) becomes a hard unit test instead of a UI accident.
- **CLP rounding and fractions are the only genuinely hard problems here**; isolating them in a service forces the policy (largest-remainder / who-gets-the-peso) to be explicit and reviewable.
- **`useClientStore` remains untouched** — no regression on shipped tests (routing, KDS, Radar, Portal, demoStore, bus), no collision with Antigravity's `kds-kitchen`.
- The doc `03-estructura-carpetas-frontend.md` already anticipates `BillSplitterModal.jsx` in the slice; this approach places it exactly there, with `splitService.js` beside `clientService.js`.

Suggested slice shape: `services/splitService.js` (pure), `store/useSplitStore.js` (thin), `components/BillSplitterModal.jsx` (+ small step components), entry from `SharedCartDrawer` or the floating CTA in `ClientPage`.

## Risks

- **CLP rounding drift**: `formatCurrency` shows 0 decimals; fractional allocations + equal parts can produce per-guest cents. REQUIRED policy: per-guest totals rounded, remainder assigned deterministically, invariant enforced by test. Without this, the demo shows totals that don't add up.
- **Fractional allocation consistency**: users can assign 0.5 pizza but the cart line has qty 1 (or 2 people take 0.5 each). Allocations whose sum ≠ line qty must be blocked or surfaced ("queda sin repartir").
- **Cart↔split desync**: adding/removing items while a split session is open can orphan allocations. Policy to define in proposal/spec: reset/reconcile allocations on cart change (simple: snapshot cart at split start, re-derive on close).
- **No Guest entity in the data model**: `guests: 4` is only a count. The guest model must be added (slice-local for the demo) and reflected in `02-modelo-datos.md` so the DTE/Payment story stays coherent.
- **Parallel agent**: Antigravity is actively working `kds-kitchen` on `src/features/KdsView/**`. This change MUST stay inside `ClientView` (+ enums/mocks) — no KDS touches.
- **Review budget**: estimated ~600–900 changed lines (service ~80, store ~90, modal/steps ~300, drawer/page edits ~80, enums/mocks ~60, tests ~200). Likely exceeds the 400-line guard → `sdd-tasks` should forecast chained PRs (e.g. PR1: enums + service + store + unit tests; PR2: modal/UI + RTL tests; PR3: wiring in Page/Drawer + fixtures).

## Open Questions for Proposal

1. Scope of "payment": simulated only (mark guest `paid`, publish a bus event) or just the calculation/split UI without a payment step?
2. Do guests get names (nice for demo) or stay numbered (Guest 1..4)?
3. Does the splitter live in the shared `Modal` bottom-sheet or a new step-based dialog? (Doc 04 tokens allow either.)
4. Which event (if any) fires on completion — reuse `order.status.change` or add a `payment.split` topic?

## Ready for Proposal

**Yes.** The exploration converged on a recommended approach (pure service + thin store), the four split modes map 1:1 to the existing `Payment.splitType` enum in the data model, and the change is fully contained in `ClientView` without touching Antigravity's KDS work. Proposal should answer the 4 open questions above and include a rollback plan (nothing ships that touches `useClientStore`'s shape).