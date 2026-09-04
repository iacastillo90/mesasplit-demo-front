# customer-survey-ratings Specification

## Purpose

Define requirements for the post-payment customer feedback modal, tip selection, and real-time CSAT feed integration across MesaSplit.

## Requirements

### Requirement: Post-Payment Feedback & Rating Selection

When a guest settles their bill or split share in the Virtual Table (`ClientView`), the application MUST present an interactive experience modal:
- 5-Star overall rating selector.
- NPS scale (1–10 recommendation rating).
- Service aspect sliders/stars (Platos, Velocidad, Atención).
- Digital Tip selector (10%, 15%, 20%, Custom CLP).

#### Scenario: Customer completes payment and rates service

- GIVEN a guest who completed payment in `ClientPage`
- WHEN the `CustomerSurveyModal` opens
- THEN the guest can select a 5-star rating, choose a 10% tip, and submit feedback

---

### Requirement: Realtime Feedback & Tip Event Broadcast

Upon feedback submission, the modal MUST emit a `feedback.submitted` event over `useRealtimeBus` carrying:
- `tableId`, `rating` (1-5), `nps` (1-10), `tipAmount` (CLP), `comments`, `timestamp`.

#### Scenario: Feedback event broadcast to Radar and Corporate

- GIVEN an open survey modal
- WHEN the user submits 5 stars and $2.000 tip
- THEN `feedback.submitted` is published over the bus and received by Local Admin and Corporate stores
