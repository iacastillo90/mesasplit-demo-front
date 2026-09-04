# app-routing Specification

## Purpose

Define the SPA route table for the MesaSplit demo and its navigation hub. The router must expose every documented view at a stable URL, launch them from a mandatory Portal Hub at `/`, and fail gracefully on unknown paths.

## Requirements

### Requirement: Browser router bootstrap

The app MUST use React Router v6 `createBrowserRouter` mounted via `RouterProvider` in `src/app/`.

#### Scenario: App mounts a router

- GIVEN the app entry point renders `RouterProvider`
- WHEN the router is created with the route table
- THEN the provider renders the matched route's view

### Requirement: Route table with confirmed paths

The route table MUST define the following concrete routes:

| Path | View |
| --- | --- |
| `/` | Portal Hub |
| `/cliente` | Mesa Virtual (Cliente) |
| `/garzon` | Waiter (Garzón) |
| `/cocina` | KDS Cocina (dark) |
| `/admin` | Local Admin Radar de turno |
| `/admin/super` | Super Admin placeholder |

#### Scenario: Every documented view is reachable

- GIVEN the router is mounted
- WHEN navigating to `/cliente`, `/garzon`, `/cocina`, `/admin` or `/admin/super`
- THEN each URL renders its corresponding view component

#### Scenario: Root renders the Portal Hub

- GIVEN no prior navigation
- WHEN the app loads at `/`
- THEN the Portal Hub is rendered as the landing view

### Requirement: Portal Hub navigation

The Portal Hub at `/` MUST launch every other view as a navigation destination with a visible label per view.

#### Scenario: Hub lists all views

- GIVEN the Portal Hub is rendered
- WHEN the hub content is inspected
- THEN it shows launchers for Cliente, Garzón, Cocina, Local Admin and Super Admin

#### Scenario: Launcher navigates to its view

- GIVEN a hub launcher for Cocina
- WHEN the user activates it
- THEN the URL changes to `/cocina`
- AND the KDS view renders

### Requirement: 404 fallback

The route table MUST include a fallback route rendering a not-found view for any unmatched path.

#### Scenario: Unknown path shows fallback

- GIVEN a URL not in the route table, e.g. `/no-existe`
- WHEN the router resolves it
- THEN a not-found view renders
- AND the app does not crash

#### Scenario: Fallback offers a way back

- GIVEN the not-found view is rendered
- WHEN the user inspects it
- THEN it offers a link back to `/`

### Requirement: Admin slot structure

The `/admin` route MUST be an index route resolving to the Local Admin Radar, with `/admin/super` as a nested child for the Super Admin placeholder.

#### Scenario: Admin parent/child resolution

- GIVEN navigation to `/admin`
- THEN the index route renders the Radar view
- GIVEN navigation to `/admin/super`
- THEN the nested Super Admin placeholder renders
- AND the Radar view is not mounted for the child route