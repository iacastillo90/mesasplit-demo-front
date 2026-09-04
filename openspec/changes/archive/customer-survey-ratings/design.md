# Design: customer-survey-ratings — Encuesta de Experiencia y Propina Digital Post-Pago

## Architecture Decisions

| # | Decision | Choice |
|---|----------|--------|
| D1 | Survey Trigger | Triggered post-payment in `BillSplitterModal` or via explicit CTA in `ClientPage`. |
| D2 | Realtime Bus Event | Published over `createRealtimeBus('mesasplit')` under topic `feedback.submitted`. |

## Affected Files

| File | Action | Description |
|------|--------|-------------|
| `src/features/ClientView/components/CustomerSurveyModal.jsx` | Create | Feedback modal with star ratings, tip calculator, and submit button |
| `src/features/ClientView/CustomerSurveyModal.test.jsx` | Create | RTL test suite verifying rating selection, tip calculation, and event emission |
| `src/features/ClientView/pages/ClientPage.jsx` | Modify | Adds survey trigger button and handles payment completion modal popup |
