# Proposal: kds-kitchen — Cocina / KDS (Kitchen Display System)

## Intent

Implement the full interactive KDS (Kitchen Display System) for MesaSplit in strict dark mode (`#011623`), connecting it to real-time events (`useRealtimeBus`) and the global store (`useDemoStore`). The KDS displays order tickets with visual time semaphores, Course Control sections ("Marchar ahora" vs "En espera"), the mandatory Escudo de Alergias in pure red (`#EF4444`), station filtering tabs, one-tap item/order completion, and Lista 86 stock quiebre broadcasting.

## Scope

### In Scope
- **Strict Dark Mode UI**: Background `brand-950` (`#011623`), ticket cards `brand-800` (`#024064`), high-contrast light text (`brand-50`), zero light-mode leakage.
- **Timer Semaphores**: Automatic header color transitions based on elapsed order time (0-10m blue `#024064`, 10-20m amber `#F59E0B`, +20m orange flashing `#FB923C`).
- **Escudo de Alergias**: Flashing pure red (`#EF4444`) card border and header warning when any item has declared allergies.
- **Course Control**: Division of tickets into "Marchar Ahora" (active) and "En Espera" (50% opacity + lock icon), reacting to `course.fire` real-time events.
- **Interactive Actions**: One-tap item strike-through, green "MARCAR LISTO" button triggering `kds.item_ready` over `useRealtimeBus`, and Recall button (last 10 completed tickets).
- **Lista 86 Management**: 2-second press on any product to toggle out-of-stock, broadcasting `kds.stock_86` across all views.
- **Station Filtering**: Tab bar to filter tickets by station (Parrilla, Cocina Fría, Barra, Postres, or Todas).
- **Strict TDD & Tests**: Unit & RTL tests written RED-GREEN for all scenarios under `strict_tdd: true`.

### Out of Scope
- Physical bump bar hardware integration (keyboard navigation fallback only).
- Thermal printer hardware drivers.

## Capabilities

### New Capabilities
- `kds-kitchen`: Complete interactive KDS view with real-time bus integration, timers, allergy shields, station filtering, course control, and Lista 86 toggles.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Work on branch `feature/kds-kitchen`. Write RED test assertions first, then implement code in `src/features/KdsView/` to pass tests GREEN. Commit logical units with Spanish conventional commits explaining the WHY.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/KdsView/pages/KdsPage.jsx` | Modified | Main KDS view layout & real-time bus subscription |
| `src/features/KdsView/components/KdsHeader.jsx` | Modified | Header with metrics, recall modal launcher, Lista 86 manager button |
| `src/features/KdsView/components/TicketCard.jsx` | Modified | Ticket card with time semaphores, item strike-through, course control sections |
| `src/features/KdsView/components/AllergyShieldAlert.jsx` | Modified | Flashing pure red (#EF4444) allergy alert banner |
| `src/features/KdsView/components/StationFilterTabs.jsx` | Modified | Station filter tabs |
| `src/features/KdsView/components/Lista86Modal.jsx` | New | Modal to toggle stock status for any menu item |
| `src/features/KdsView/components/RecallModal.jsx` | New | Modal to restore recently completed tickets |
| `src/features/KdsView/services/kdsService.js` | Modified | Service connecting to mockFetch & store |
| `src/features/KdsView/store/useKdsStore.js` | Modified | Slice store handling ticket state, recall history, station filters |
| `src/features/KdsView/KdsPage.test.jsx` | Modified | Comprehensive RTL & unit tests for KDS scenarios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Timer re-renders causing excessive UI churn | Low | Use `useInterval` or single global 10s ticker in store |
| Realtime loop echo when broadcasting `kds.item_ready` | Med | Filter events by origin/tab ID in `useRealtimeBus` |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/kds-kitchen`.

## Success Criteria

- [ ] All tests in `src/features/KdsView/KdsPage.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
- [ ] KDS renders in strict dark mode (`#011623`) with timer semaphores, allergy shields, course control, recall, and Lista 86 broadcasting.
