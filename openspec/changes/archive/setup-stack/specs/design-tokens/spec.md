# design-tokens Specification

## Purpose

Codify the documented visual system: the brand scale and semantic colors mapped into Tailwind CSS, plus the shared constants and base UI components every view reuses, so all features render from one token source instead of hardcoded hex values.

## Requirements

### Requirement: Brand palette in Tailwind config

The Tailwind config MUST extend the color theme with the `brand` scale from docs/04: `50 #E6F6FF`, `100 #CDECFE`, `500 #04A0FB`, `800 #024064`, `900 #012032`, `950 #011623`.

#### Scenario: Brand token available

- GIVEN the Tailwind config is loaded
- WHEN a component uses `bg-brand-500`
- THEN it resolves to `#04A0FB`
- AND `text-brand-950` resolves to `#011623`

#### Scenario: Scale matches the documented palette

- GIVEN the config file
- WHEN its `brand` entries are read
- THEN every documented step maps to its documented hex exactly

### Requirement: Semantic color tokens

The Tailwind config MUST define semantic colors: `success #10B981`, `urgent #FB923C` and `danger #EF4444`, plus `warning #F59E0B` for mid-level warnings.

#### Scenario: Success and danger resolve

- GIVEN the config is loaded
- WHEN a component uses `bg-success` and `text-danger`
- THEN success resolves to `#10B981` and danger to `#EF4444`

### Requirement: Red reserved for health and safety

`danger` (#EF4444) MUST NOT be used for ordinary operational urgency; those cases MUST use `urgent` (#FB923C). All UI code MUST follow this rule.

#### Scenario: Urgency uses orange, not red

- GIVEN a ticket exceeding its wait-time budget
- WHEN its header is rendered
- THEN the header uses the `urgent` token for its warning state

#### Scenario: Allergy alert uses red

- GIVEN a ticket item with a declared allergy
- WHEN its shield is rendered
- THEN the shield uses the `danger` token

### Requirement: Shared constants module

The project MUST provide `src/shared/constants/` exporting the color tokens and UI status enums shared across features.

#### Scenario: Tokens are importable

- GIVEN the demo app source tree
- WHEN a feature imports the constants module
- THEN token and status values are exported without duplication of hex literals

### Requirement: Base UI components

The project MUST provide `src/shared/ui/` with base components: `Button`, `Modal`, `Badge` and `Toast`, styled exclusively with the token palette.

#### Scenario: Button renders with brand CTA style

- GIVEN a Button rendered with its primary variant
- WHEN inspected
- THEN it uses the brand-500 token for its CTA background
- AND its label is readable text

#### Scenario: Toast shows success and danger variants

- GIVEN a Toast rendered in success state
- THEN it uses the success token
- WHEN rendered in danger state
- THEN it uses the danger token

### Requirement: Inter font family

The Tailwind config MUST set `fontFamily.sans` to Inter with system-ui fallbacks.

#### Scenario: Default font is Inter

- GIVEN a view rendering body text
- WHEN the computed font family is inspected
- THEN it lists Inter first, then system fallbacks