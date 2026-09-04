# feature-views Specification

## Purpose

Define the Feature-Sliced Design slices for the demo views with their base UI. Each slice owns its domain code (pages, components, services, store) and renders its documented visual mode; the Local Admin Radar's table map and the KDS strict dark mode are the critical visual contracts.

## Requirements

### Requirement: FSD slice per view

Each demo view MUST live in its own slice under `src/features/<View>/` following the documented FSD tree: `pages/`, `components/`, and where applicable `services/` and `store/`.

#### Scenario: Slice folders exist

- GIVEN the scaffolded source tree
- WHEN the features directory is inspected
- THEN slices exist for Portal, ClientView, WaiterView, KdsView, RadarView and CorporateView
- AND each contains pages and components folders

### Requirement: PortalView hub

PortalView MUST render the demo hub at `/` with launcher cards to every view.

#### Scenario: Hub renders launcher cards

- GIVEN the Portal slice renders
- WHEN its page is inspected
- THEN it displays a launcher card per demo view

### Requirement: ClientView base UI

ClientView MUST render a base Mesa Virtual screen: table context banner, menu listing and a visible cart affordance, in the light mode background documented for clients.

#### Scenario: Client screen shows menu and cart

- GIVEN the Client slice renders
- THEN it shows the table context
- AND a menu list with a cart affordance visible

### Requirement: WaiterView base UI

WaiterView MUST render the table grid and order pad shells per the Waiter slice, consuming fixtures through its service abstraction.

#### Scenario: Waiter screen shows tables

- GIVEN the Waiter slice renders
- THEN it displays a table grid sourced from the service layer
- AND an order pad shell is present

### Requirement: KdsView strict dark mode

KdsView MUST render in strict dark mode: background `brand-950` (#011623), ticket cards `brand-800` (#024064), readable light text, and no light color scheme anywhere in the slice.

#### Scenario: Dark surfaces throughout

- GIVEN the KDS slice renders
- WHEN its background and ticket cards are inspected
- THEN the background is brand-950 and ticket cards are brand-800
- AND text on cards is light for readability

#### Scenario: No light-mode leakage

- GIVEN the KDS slice renders
- WHEN every styled surface in the slice is inspected
- THEN no surface uses a light-mode background token

### Requirement: RadarView table map (critical)

RadarView (Local Admin, route `/admin`) MUST render a visual map of tables as its most critical element, plus a shell for the exception feed.

#### Scenario: Radar renders table map

- GIVEN the Radar slice renders
- THEN it displays the table map with each table positioned visually
- AND an exception feed shell is present

#### Scenario: Table map reflects fixture data

- GIVEN mock tables seeded by the demo store
- WHEN the Radar renders the map
- THEN the number of rendered tables matches the fixture count

### Requirement: SuperAdminView placeholder

CorporateView MUST render an explicit empty placeholder at `/admin/super` stating the view is not implemented yet.

#### Scenario: Placeholder is explicit

- GIVEN the Super Admin route renders
- THEN it shows a placeholder message stating the view is not yet implemented
- AND no functional widget is rendered