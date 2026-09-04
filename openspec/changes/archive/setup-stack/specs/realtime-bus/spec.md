# realtime-bus Specification

## Purpose

Provide the demo's same-device realtime layer: a publish/subscribe bus over BroadcastChannel (Scenario A), a persistent Zustand root store, and seed fixtures with simulated latency — with no external services or accounts.

## Requirements

### Requirement: useRealtimeBus pub/sub API

The project MUST provide `src/hooks/useRealtimeBus.js` exposing a publish/subscribe interface with subscribe, publish and unsubscribe operations.

#### Scenario: Component subscribes and receives events

- GIVEN a component subscribes to a topic
- WHEN another component publishes an event on that topic
- THEN the listener receives the published payload

#### Scenario: Unsubscribe stops delivery

- GIVEN a listener has unsubscribed
- WHEN an event is published on its topic
- THEN the listener does not receive the event

#### Scenario: Publish to a topic with no listeners

- GIVEN a topic with no active subscribers
- WHEN an event is published on it
- THEN no error is thrown
- AND the event is dropped

### Requirement: BroadcastChannel adapter (Scenario A)

In `VITE_DEMO_MODE=same-device` the bus MUST use a BroadcastChannel adapter allowing cross-tab communication on the same origin. No Firebase or external sync is required for this mode.

#### Scenario: Events cross same-origin tabs

- GIVEN two tabs on the same origin sharing the demo
- WHEN one tab publishes an event
- THEN the other tab's subscriber receives it

#### Scenario: Same-device works offline

- GIVEN `VITE_DEMO_MODE=same-device` and no network
- WHEN two tabs publish and subscribe
- THEN events flow between them without external calls

### Requirement: useDemoStore with persistence

The project MUST provide `src/store/useDemoStore.js` as a Zustand root store using the persist middleware over localStorage, seeding demo state from the mocks.

#### Scenario: State survives reload

- GIVEN the store has mutated state
- WHEN the page reloads
- THEN persisted state is restored from localStorage

#### Scenario: Fresh session seeds from mocks

- GIVEN localStorage has no persisted state
- WHEN the store initializes
- THEN it seeds tables, menu and users from the mock fixtures

### Requirement: Mock fixtures with simulated delay

The project MUST provide `src/mocks/` fixtures (tables, menu, users) and a mockFetch-like helper simulating network latency on service calls.

#### Scenario: Service resolves fixtures after delay

- GIVEN a view service calls the mock layer
- WHEN the call resolves
- THEN it returns data from the fixtures
- AND the delay is perceivable for a realistic UI feel

#### Scenario: Fixtures match documented shapes

- GIVEN the mock files
- WHEN their records are validated against the documented data model
- THEN each record carries the expected fields for its entity