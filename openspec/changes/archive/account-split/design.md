# Design: account-split — Bill Splitting for the Client View

## Technical Approach

All bill-split arithmetic lives in a pure, dependency-free `splitService.js` (Approach 3 from exploration/proposal): deterministic largest-remainder CLP rounding, the conservation invariant `sum(per-guest totals) === cart total`, and fractional-allocation validation. A thin `useSplitStore` (Zustand, matching the existing `useClientStore` pattern) holds only mode/guests/allocations/status and derives totals on every render by calling the service — totals can never drift from the cart. `useClientStore.cart` is consumed read-only (shape untouched). `BillSplitterModal` is a bottom-sheet over the shared `Modal`; simulated payment flips guest status and publishes `payment.split` over `useRealtimeBus` (new `TOPICS.PAYMENT_SPLIT`). Follows spec requirements (all 9) and FSD slice layout in `docs/03`.

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Arithmetic location | Pure service (unit-testable under `strict_tdd`, zero DOM) vs logic in store actions (untestable without plumbing). | **Pure `splitService.js`** |
| D2 | Rounding policy | Largest-remainder (deterministic, spec scenario: 3,334/3,333/3,333) vs first-guest-gets-peso (non-deterministic per order). | **Largest-remainder** |
| D3 | Guest identity | Numbered `Comensal 1..N` derived from `TABLE_CONTEXT.guests` (spec MUST, zero registration) vs registration flow. | **`buildGuests(count)`** |
| D4 | Cart ownership | Snapshot at split start (read-only, no `useClientStore` rewrite) vs mutating cart lines. | **Snapshot + `syncWithCart`** |
| D5 | Event emission | Publish `payment.split` from `ClientPage` via bus (spec) vs reuse `order.status.change`. | **New `TOPICS.PAYMENT_SPLIT`** |
| D6 | Totals storage | Derived per render (spec: "store MUST NOT cache") vs cached. | **Derived selectors** |
| D7 | Fractions | Fractional qty allocations with per-line sum validation + conservation. | **`assignFraction` guarded** |

## Data Flow

```
SharedCartDrawer ──"Dividir cuenta"──► ClientPage
        │                                  │ openSplit(cartSnapshot)
        ▼                                  ▼
useClientStore.cart (read-only) ◄── useSplitStore (mode, guests, allocations, status)
        │                                  │ selectors → splitService
        └── snapshot at open ◄─────────────┘        │
                                             splitByMode → per-guest totals (derived)
        BillSplitterModal ◄── totals + unassigned   │
             │ markPaid(guestId)                    │
             ▼                                      │
        applyPayment → guest paid, publish ──► useRealtimeBus (payment.split) ──► other tabs
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/shared/constants/statusEnums.js` | Modify | Add `SPLIT_TYPE` (full/equal/by_item/item_fraction) + `GUEST_PAYMENT_STATUS` (pending/paid), mirroring `Payment.splitType` |
| `src/shared/constants/index.js` | Modify | Re-export the two new enums |
| `src/features/ClientView/services/splitService.js` | Create | Pure arithmetic: `buildGuests`, `splitByMode`, `calculateEqualShares`, `calculateByItem`, `calculateFractions`, `applyLargestRemainder`, `checkConservation`, `applyPayment` |
| `src/features/ClientView/store/useSplitStore.js` | Create | Thin Zustand shell: mode, guests, allocations, payments, `open`; derived totals via service |
| `src/features/ClientView/components/BillSplitterModal.jsx` | Create | Bottom-sheet: mode picker, guest allocation steps, totals, payment confirm |
| `src/features/ClientView/components/SharedCartDrawer.jsx` | Modify | Add "Dividir cuenta" button (disabled when cart empty) |
| `src/features/ClientView/pages/ClientPage.jsx` | Modify | Wire modal open/close, `openSplit` snapshot, publish `payment.split` |
| `src/hooks/useRealtimeBus.js` | Modify | Add `PAYMENT_SPLIT: 'payment.split'` to `TOPICS` |
| `src/features/ClientView/services/splitService.test.js` | Create | RED unit tests: invariant, rounding, fractions, edge cases |
| `src/features/ClientView/store/useSplitStore.test.js` | Create | RED store tests: actions, derived totals, syncWithCart |
| `src/features/ClientView/components/BillSplitterModal.test.jsx` | Create | RED RTL: open, modes, block unassigned, mark paid publishes |
| `openspec/docs/architecture/02-modelo-datos.md` | Modify | Document local `Guest` entity (`{id, label, status}`) |

## Interfaces / Contracts

```js
// JSDoc typedefs
/** @typedef {{id:string, name:string, price:number, qty:number}} CartLine */
/** @typedef {{id:string, label:string, status:GUEST_PAYMENT_STATUS}} Guest */
/** @typedef {Record<string, number>} GuestTotals   // guestId -> CLP */

// splitService.js — ALL PURE, no store/UI imports
export function buildGuests(count, guests = []) {}            // -> Guest[]
export function splitByMode(mode, cart, allocations = {}) {}  // -> {totals: GuestTotals, total, unassigned: CartLine[]}
export function calculateEqualShares(total, guestCount) {}    // -> number[]
export function calculateByItem(cart, allocations) {}         // -> GuestTotals
export function calculateFractions(cart, allocations) {}      // -> GuestTotals
export function applyLargestRemainder(shares, total) {}       // -> number[] (floors + distribute remainder)
export function checkConservation(totals, cartTotal) {}       // -> boolean
export function applyPayment(guest, amount) {}                // -> Guest (status='paid', amountPaid=amount)
```

**Largest-remainder algorithm** (used by `equal`, `by_item`, `item_fraction`):
1. Compute exact shares `s_i = value_i / divisor` (or allocated `price × qty` per guest).
2. Floor each: `f_i = Math.floor(s_i)`; remainder `R = total − Σf_i`.
3. Sort guests by fractional part `s_i − f_i` **descending**; ties broken by guest id (deterministic).
4. Add 1 CLP to the first `R` guests in that order. Result sums to `total` exactly.
5. Fractions: allocations per cart line are `{guestId: qty}` (qty MAY be 0.5); per line `Σqty === line.qty` else the line is in `unassigned`; any allocation `> line.qty` is rejected.

```js
// useSplitStore.js — Zustand create((set,get)=>...)
state:  { open, mode=SPLIT_TYPE.FULL, guests=[], allocations={}, payments={}, cartSnapshot=[] }
actions: setMode(mode) | openSplit(cart)  // buildGuests + snapshot, reset allocations
        | assignItem(guestId, lineId) | assignFraction(guestId, lineId, qty)
        | markPaid(guestId) → applyPayment + publish | closeSplit() | syncWithCart(cart)
selectors: selectGuestTotals(state) | selectUnassigned(state) | selectCanConfirm(state)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (service) | Invariant `Σtotals === cartTotal` for all 4 modes; largest-remainder 10,000/3 → 3,334/3,333/3,333; fractions 0.5+0.5 valid; 0.5 unassigned blocks; 1.5 rejected; empty cart; single guest | Vitest, pure functions, RED first |
| Unit (store) | setMode default full; openSplit derives Comensal 1..N; markPaid only flips one guest (partial payment); totals re-derive on allocation change; syncWithCart resets on cart change | Vitest + Zustand `create` |
| RTL (modal) | Opens bottom-sheet over drawer; mode picker; unassigned blocks confirm; mark paid publishes `payment.split` | Testing Library + jsdom, bus factory with injected adapter |

## Threat Matrix

`N/A` — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary in this change.

## Migration / Rollout

No migration. Chained PRs (exploration forecast): PR1 enums + service + store + unit tests; PR2 modal + RTL; PR3 drawer/page wiring + bus topic + doc. `useClientStore` untouched → rollback = delete new files + revert small edits.

## Open Questions

- [ ] `payment.split` payload shape: `{tableId, guestId, amount, mode}` — confirm with caja/radar consumers before apply (proposal D5).
