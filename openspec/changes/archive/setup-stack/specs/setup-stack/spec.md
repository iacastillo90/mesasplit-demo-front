# setup-stack Specification

## Purpose

Bootstrap the MesaSplit demo frontend toolchain from zero code: a reproducible Vite + React environment with pinned versions, standard scripts, lint/format and test infrastructure, and an environment contract — so later changes build features on a verified foundation and `strict_tdd` can be enabled.

## Requirements

### Requirement: Pinned toolchain versions

The scaffold MUST pin the documented stack: Vite 6, React 18.3 (JS/JSX), Tailwind CSS 3.4, React Router v6, Zustand v5, Vitest 3, ESLint 9 (flat config) and Prettier. Exact versions MUST be locked in `package.json` so `create-vite` defaults (React 19 / Tailwind 4) cannot slip in.

#### Scenario: Versions resolve to the documented stack

- GIVEN a fresh `npm install` on the scaffold
- WHEN the installed versions are inspected
- THEN React resolves to 18.3.x, Tailwind to 3.4.x, Vite to 6.x and Vitest to 3.x
- AND no dependency resolves to a major version newer than the documented one

#### Scenario: Locked lockfile

- GIVEN the committed `package-lock.json`
- WHEN `npm ci` runs in a clean checkout
- THEN install succeeds using the exact locked versions
- AND the app builds without version drift

### Requirement: Standard npm scripts

The project MUST provide `dev`, `build`, `preview`, `test`, `lint` and `format` scripts wired in `package.json`.

#### Scenario: Build and test are runnable

- GIVEN the scaffold installed
- WHEN `npm run build` executes
- THEN it exits 0 and emits production assets
- AND `npm run test` runs the Vitest suite to completion

#### Scenario: Lint and format clean

- GIVEN the source tree
- WHEN `npm run lint` and `npm run format` execute
- THEN lint reports 0 errors
- AND format reports no pending rewrites

### Requirement: Environment contract

The project MUST ship `.env.example` declaring `VITE_DEMO_MODE` with `same-device` as the documented default.

#### Scenario: Default demo mode is same-device

- GIVEN no local `.env` file
- WHEN the app starts
- THEN `VITE_DEMO_MODE` defaults to `same-device`

#### Scenario: Missing variable does not crash

- GIVEN `.env.example` is the only env source
- WHEN the module reading `VITE_DEMO_MODE` loads
- THEN it falls back to `same-device` without throwing

### Requirement: Test infrastructure

The scaffold MUST configure Vitest with jsdom and Testing Library, including `src/test/setup.js` for jest-dom matchers.

#### Scenario: Smoke test passes

- GIVEN a minimal rendering test using Testing Library
- WHEN `npm run test` runs
- THEN the test passes against jsdom

#### Scenario: Red test fails the run

- GIVEN a test asserting a condition that is false
- WHEN `npm run test` runs
- THEN the suite exits non-zero
- AND reports the failing assertion

### Requirement: strict_tdd reactivation

The scaffold SHOULD flip `strict_tdd: true` in `openspec/config.yaml` only after a green Vitest run, alongside setting `test_command` and `build_command`.

#### Scenario: Flip after green run

- GIVEN `npm run test` passes on the scaffold
- WHEN the config is updated
- THEN `strict_tdd`, `test_command` and `build_command` are set in `openspec/config.yaml`

#### Scenario: No flip before green run

- GIVEN the first test run is still red or not yet executed
- WHEN config is inspected
- THEN `strict_tdd` remains `false`