# Proposal: customer-survey-ratings — Encuesta de Experiencia y Propina Digital Post-Pago

## Intent

Implement an interactive post-payment customer rating, NPS survey, and tip selector in the Virtual Table (`ClientView`), integrated with real-time feedback feeds in Local Admin (`RadarView`) and Corporate Super Admin (`CorporateView`).

## Scope

### In Scope
- **Post-Payment Experience Modal (`CustomerSurveyModal.jsx`)**: 5-star rating, NPS scale (1–10), service aspect ratings (Dish Quality, Speed, Waiter Attention), and digital tip selector (10%, 15%, 20%, Custom).
- **Realtime Event Emission**: Emits `feedback.submitted` over `useRealtimeBus` carrying satisfaction score, waiter tip, and customer comments.
- **Radar & Corporate Integration**: Local Admin displays live CSAT score and waiter tips; Corporate Super Admin displays franchise-wide CSAT.
- **Strict TDD & Tests**: Written RED-GREEN in `src/features/ClientView/CustomerSurveyModal.test.jsx`.

### Out of Scope
- Third-party Google Maps or TripAdvisor OAuth integration.

## Capabilities

### New Capabilities
- `customer-survey-ratings`: Interactive post-payment rating, tip selector, and real-time CSAT feed.

## Approach

Implemented by Antigravity under `strict_tdd: true`. Writes RED tests in `src/features/ClientView/CustomerSurveyModal.test.jsx`, creates components in `src/features/ClientView/`, and updates `ClientPage.jsx`, `useRadarStore.js`, and `useCorporateStore.js`. All code commented in Spanish per `AGENTS.md`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/ClientView/components/CustomerSurveyModal.jsx` | New | Interactive 5-star rating, NPS scale, and tip selector |
| `src/features/ClientView/CustomerSurveyModal.test.jsx` | New | RTL test suite verifying rating selection, tip calculation, and event emission |
| `src/features/ClientView/pages/ClientPage.jsx` | Modified | Triggers survey modal after payment completion |
| `src/features/RadarView/pages/RadarPage.jsx` | Modified | Displays live CSAT rating badge and tip total |

## Success Criteria

- [ ] All tests in `CustomerSurveyModal.test.jsx` pass (`npm run test`).
- [ ] `npm run build` exits 0 cleanly.
- [ ] `npm run lint` reports 0 errors.
