# account-split Specification

## Purpose

Bill splitting for the Mesa Virtual: divide the shared cart among numbered guests in four modes aligned with `Payment.splitType`, with deterministic CLP rounding that never drifts from the cart total and simulated payment synced over the bus.

## Requirements

### Requirement: Split modes

The system MUST provide four split modes mapping 1:1 to `Payment.splitType` (`full`, `equal`, `by_item`, `item_fraction`); exactly one MUST be active; the default is `full`.

#### Scenario: Default mode

- GIVEN a table with an open cart
- WHEN the splitter opens
- THEN the mode is `full`

### Requirement: Conservation invariant

The sum of per-guest totals MUST equal the cart total exactly in every mode, rounding included, with no unassigned amount.

#### Scenario: Equal conservation

- GIVEN a 10,000 CLP cart and 3 guests in `equal` mode
- WHEN totals are computed
- THEN partials are 3,334 / 3,333 / 3,333 (sum 10,000)

### Requirement: CLP rounding

Non-integer amounts MUST round by largest-remainder: shares are floored, remaining pesos go to the largest fractional remainders. No money MUST be dropped or invented.

#### Scenario: Largest remainder

- GIVEN 10,000 CLP split among 3 guests
- WHEN rounding is applied
- THEN one guest receives an extra peso
- AND shares sum to 10,000

### Requirement: Fractional allocations

In `item_fraction` mode a guest MAY allocate a fraction of an item; allocations per line MUST sum to the line quantity, else confirmation MUST block and signal the unassigned amount. An allocation MUST NOT exceed the line quantity.

#### Scenario: Fractions valid

- GIVEN a qty-1 line and two guests
- WHEN each allocates 0.5
- THEN the split is valid
- AND the line is fully assigned

#### Scenario: Unassigned

- GIVEN a qty-1 line with one guest allocating 0.5
- WHEN the split is checked
- THEN 0.5 is signaled unassigned
- AND confirmation is blocked

#### Scenario: Over quantity

- GIVEN a line with qty 1
- WHEN a guest allocates 1.5
- THEN the allocation is rejected

### Requirement: Numbered guests

The system MUST derive one guest per table guest count, labeled `Comensal 1..N`, with zero registration.

#### Scenario: Guests derived

- GIVEN a table with 4 guests
- WHEN the splitter opens
- THEN guests Comensal 1 to 4 exist
- AND no registration step

### Requirement: Payment status

Each guest MUST hold status `pending` or `paid`; marking a guest paid MUST transition only that guest, so partial payment is valid.

#### Scenario: Partial payment

- GIVEN 4 guests
- WHEN guest 1 is marked paid
- THEN guest 1 shows `paid`
- AND guests 2-4 stay `pending`

### Requirement: Simulated event

Marking a guest paid MUST publish a `payment.split` event on the realtime bus with the guest, amount, and mode (caja/radar sync).

#### Scenario: Event published

- GIVEN a guest is paid
- WHEN payment is confirmed
- THEN `payment.split` is published
- AND carries guest, amount, mode

### Requirement: Derived totals

Totals MUST derive from the service from the current cart, mode, and allocations; the store MUST NOT cache them, so every change re-derives totals.

#### Scenario: Totals refresh

- GIVEN an open split
- WHEN allocations change
- THEN totals update immediately
- AND no stale total

### Requirement: Edge robustness

The system MUST handle an empty cart, a single guest, and cart changes mid-session. The cart MUST be snapshotted and, if it changes, allocations SHOULD reset and re-derive.

#### Scenario: Empty cart

- GIVEN an empty cart
- WHEN totals are computed
- THEN every guest total is 0
- AND the invariant holds

#### Scenario: Single guest

- GIVEN 1 guest and any cart
- WHEN the split is computed
- THEN the guest's total equals the cart total

#### Scenario: Cart changes

- GIVEN an active split session
- WHEN an item is added or removed
- THEN allocations reset
- AND totals re-derive