# Tasks: customer-survey-ratings — Encuesta de Experiencia y Propina Digital Post-Pago

## Phase 1: RED Test Suite (Strict TDD)

- [x] 1.1 Create `src/features/ClientView/CustomerSurveyModal.test.jsx` with RED tests for:
  - Rendering 5-star rating buttons, NPS scale, and tip buttons (10%, 15%, 20%)
  - Calculating 10% tip on bill amount ($20.000 bill ➔ $2.000 tip)
  - Publishing `feedback.submitted` event on submission
- [x] 1.2 Run `npm run test` to confirm new tests fail RED.

## Phase 2: Implementation

- [x] 2.1 Create `src/features/ClientView/components/CustomerSurveyModal.jsx`.
- [x] 2.2 Update `src/features/ClientView/pages/ClientPage.jsx` to mount `CustomerSurveyModal`.

## Phase 3: GREEN Verification

- [x] 3.1 Run `npm run test` to verify GREEN state.
- [x] 3.2 Run `npm run build` and `npm run lint`.
- [x] 3.3 Commit changes with Spanish conventional commit explaining the WHY.
