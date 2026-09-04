# Design: kds-kitchen — Cocina / KDS (Kitchen Display System)

## Technical Approach

Implement the interactive KDS capability in `src/features/KdsView/` under `strict_tdd: true`. The implementation builds upon the scaffold created in `setup-stack`, expanding `KdsPage.jsx`, `TicketCard.jsx`, `KdsHeader.jsx`, `AllergyShieldAlert.jsx`, `StationFilterTabs.jsx`, `kdsService.js`, and `useKdsStore.js`, and adding `RecallModal.jsx` and `Lista86Modal.jsx`.

All UI components adhere to strict dark mode (`#011623`), the pure red rule (`#EF4444` reserved for health/safety allergies), time semaphores, course control, recall buffer, and real-time pub/sub via `useRealtimeBus`.

## Architecture Decisions

| # | Decision | Options (tradeoff) | Choice |
|---|----------|--------------------|--------|
| D1 | Ticket Ticker / Timers | A: Local `setInterval` inside each `TicketCard`. B: Global 10s ticker in `useKdsStore`. | **B**: Single global 10s ticker in store prevents N timer intervals running simultaneously and keeps re-renders synchronized. |
| D2 | Recall Buffer | A: Array capped at 10 items in Zustand store (`recallStack`). B: Persisted in localStorage. | **A**: In-memory `recallStack` array capped at 10 items. Fast, ephemeral during session. |
| D3 | Realtime Event Integration | A: Direct inline `useRealtimeBus` calls in components. B: Store-level event listeners subscribing on mount. | **B**: `useKdsStore` subscribes to `course.fire` and `order.item_added` events via `useRealtimeBus` to mutate store reactively. |
| D4 | Lista 86 Management | A: Modal in header + long-press on ticket items. B: Modal only. | **A**: Header button opens `Lista86Modal`, plus long-press on any ticket item opens quick-toggle confirm. |

## Data Flow

```
                                    [useRealtimeBus]
                                           │
             ┌─────────────────────────────┼─────────────────────────────┐
             ▼                             ▼                             ▼
   'course.fire' event            'order.item_added'             'kds.stock_86' (published)
             │                             │                             ▲
             ▼                             ▼                             │
    [useKdsStore: fireCourse]   [useKdsStore: addTicket]        [Lista86Modal: toggleStock]
             │                             │                             │
             └─────────────────────────────┼─────────────────────────────┘
                                           ▼
                                 [TicketCard re-renders]
                                 ├── Elapsed time semaphore (0-10m blue, 10-20m yellow, +20m orange)
                                 ├── Escudo Alergias (red #EF4444 border + banner)
                                 └── Course Control sections ("Marchar" vs "En espera")
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/features/KdsView/pages/KdsPage.jsx` | Modify | Connects real-time bus listeners, station filtering, recall & Lista 86 modals |
| `src/features/KdsView/components/KdsHeader.jsx` | Modify | Adds Recall button (w/ badge count) and Lista 86 modal trigger |
| `src/features/KdsView/components/TicketCard.jsx` | Modify | Implements time semaphores, pure red allergy shield border, item strike-through, course sections |
| `src/features/KdsView/components/AllergyShieldAlert.jsx` | Modify | Flashing pure red banner for allergy items |
| `src/features/KdsView/components/StationFilterTabs.jsx` | Modify | Station filter tabs styling |
| `src/features/KdsView/components/RecallModal.jsx` | Create | Modal to view & restore last 10 completed tickets |
| `src/features/KdsView/components/Lista86Modal.jsx` | Create | Modal to toggle menu item out-of-stock state & broadcast `kds.stock_86` |
| `src/features/KdsView/store/useKdsStore.js` | Modify | Complete Zustand slice: tickets, recallStack, station filter, stock86 list, timer ticker |
| `src/features/KdsView/services/kdsService.js` | Modify | Service fetching tickets & updating stock |
| `src/features/KdsView/KdsPage.test.jsx` | Modify | Full suite of RTL tests for all KDS specs under `strict_tdd: true` |

## Testing Strategy

All tests written RED first, asserting the Given/When/Then scenarios defined in `specs/kds-kitchen/spec.md`:
1. **Strict Dark Mode**: Verify all container elements have `bg-brand-950` / `bg-brand-800` and no light backgrounds.
2. **Time Semaphores**: Test blue (5m), amber (15m), and orange (25m) header background tokens.
3. **Escudo de Alergias**: Test item with `allergyFlags` gets `#EF4444` border and alert text `⚠️ ALERGIA: MANÍ`.
4. **Course Control**: Test item in hold course renders opacity 50% + lock icon; firing course changes opacity to 100%.
5. **One-Tap & Recall**: Click "MARCAR LISTO", verify ticket leaves grid, enters recall stack, and can be restored.
6. **Lista 86**: Open modal, toggle item to `out_of_stock`, verify `kds.stock_86` event is published via bus.

## Threat Matrix

N/A — Client-side SPA feature with mock realtime bus and fixtures.

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/kds-kitchen`.
