# Proposal: waiter-pwa — PWA del Mozo / Garzón

## Intent

Implement the complete interactive PWA for waiters (`WaiterView`), designed for single-hand mobile operation in dark mode (`#011623`). The PWA covers employee clock-in/out (Ley 40 Horas compliance), table management ("Mis Mesas" grid with time semaphores), single-hand order entry with tap-to-add counter badges, Lista 86 quiebre warnings ("Quedan 2"), Escudo de Alergias (pure red `#EF4444` item borders for medical allergies), Course Control (`course.fire` emission for "Marchar Fondo"), PIN-authorized cancellation for kitchen-sent items, and table status updates (`table.status_changed`).

## Scope

### In Scope
- **Clock-In / Turno**: PIN/employee lock screen and "Iniciar Turno" action triggering `shift.clock_in`.
- **"Mis Mesas" Grid**: Assigned table grid with visual status semaphores (green = seated, yellow = waiting food, orange = bill requested).
- **Single-Hand Order Entry**: Tap-to-add menu cards with circular counter badges (`3x`), sticky category bar, and real-time total updates.
- **Lista 86 Availability**: Disabled out-of-stock items (50% opacity, strike-through) and diagonal amber banner ("Quedan 2") for low stock.
- **Escudo de Alergias**: Pure red (`#EF4444`) item borders and allergy chips when allergies (e.g., `[Alergia Maní]`) are declared.
- **Course Control Selector**: `[Entrada – Enviar Ahora]` vs `[Fondo – Marchar]` emitting `course.fire` over `useRealtimeBus`.
- **PIN-Protected Cancellation**: Free swipe-to-delete before kitchen dispatch; requires Local Admin PIN + reason selection after kitchen dispatch.
- **Table Release**: "Cerrar y Liberar Mesa" action resetting table status to free and emitting `table.status_changed`.
- **Strict TDD & Tests**: Unit & RTL tests written RED-GREEN under `strict_tdd: true`.

### Out of Scope
- Biometric hardware sensors (PIN keypad fallback used).

## Capabilities

### New Capabilities
- `waiter-pwa`: Interactive Waiter PWA with clock-in, table grid, single-hand order pad, allergy shield, course control firing, PIN voiding, and table release.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Work on branch `feature/waiter-pwa`. Writes RED tests first in `src/features/WaiterView/WaiterPage.test.jsx`, then implements code in `src/features/WaiterView/` to pass tests GREEN. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/WaiterView/pages/WaiterPage.jsx` | Modified | Waiter PWA layout, shift lock screen, table grid & order pad |
| `src/features/WaiterView/components/TableGrid.jsx` | Modified | Assigned tables grid with status semaphores |
| `src/features/WaiterView/components/OrderPad.jsx` | Modified | Single-hand catalog, category bar, order summary, course control |
| `src/features/WaiterView/components/CourseControlPicker.jsx` | New | Course control selector (`[Entrada]`, `[Fondo – Marchar]`) |
| `src/features/WaiterView/components/PinAuthModal.jsx` | New | PIN authorization modal for item cancellations |
| `src/features/WaiterView/services/waiterService.js` | Modified | Data service for assigned tables and shift clock-in |
| `src/features/WaiterView/store/useWaiterStore.js` | Modified | Zustand slice for waiter state, active table, shift, order draft, PIN validation |
| `src/features/WaiterView/WaiterPage.test.jsx` | Modified | Full suite of RTL tests for all waiter scenarios |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overlap with `account-split` change (opencode) | Low | Antigravity strictly isolated to `src/features/WaiterView/`; opencode works on Client checkout / POS |
| PIN authorization bypass | Low | Require PIN verification in `useWaiterStore.js` before removing sent items |

## Rollback Plan

Branch-based: `git checkout main && git branch -D feature/waiter-pwa`.

## Success Criteria

- [ ] All tests in `src/features/WaiterView/WaiterPage.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
- [ ] Waiter PWA renders in dark mode (`#011623`) with clock-in, table grid, single-hand order pad, allergy shield, course control firing, and PIN cancellation.
