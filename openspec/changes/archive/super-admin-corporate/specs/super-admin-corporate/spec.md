# super-admin-corporate Specification

## Purpose

Define the capability requirements for the Corporate Super Admin Dashboard (`SuperAdminPage` in `CorporateView`). The dashboard provides multi-branch revenue analytics across franchise locations (Las Condes, Providencia, Vitacura, Santiago Centro), operational health indicators, global feature toggles, and cross-branch realtime event log auditing (`payment.completed`, `alert.fraud`, `alert.panic`).

## Requirements

### Requirement: Multi-Branch Franchise KPI Analytics

The Corporate Dashboard MUST aggregate real-time revenue and operational KPIs across all 4 franchise branches:
- Combined revenue in CLP (`$1.250.000+`).
- Total active tables and customer count across locations.
- Average ticket size per branch.

#### Scenario: Dashboard displays aggregated franchise metrics

- GIVEN a franchise executive opening `/admin/super`
- WHEN the Corporate Dashboard loads
- THEN the header KPI banner displays total franchise revenue, active tables, and customer count across branches

---

### Requirement: Franchise Branch Health Cards

The Dashboard MUST render health cards for each franchise location:
- **Las Condes**: Flagship location.
- **Providencia**: High-volume terrace branch.
- **Vitacura**: Premium lounge branch.
- **Santiago Centro**: Express takeout branch.
- Displays live status semaphore (Óptimo, Hora Punta, Incidencia), current shift sales, and active table count.

#### Scenario: Executive inspects branch health status

- GIVEN the Corporate Dashboard loaded
- WHEN inspecting the branch health grid
- THEN cards render for Las Condes, Providencia, Vitacura, and Santiago Centro with their respective status semaphores and sales figures

---

### Requirement: Global Franchise Configuration Toggles

The Dashboard MUST provide master feature switches controlling operational rules across all franchise branches:
- **Control Ley 40 Horas**: Master PIN shift clock-in enforcement.
- **Escudo de Alergias**: Mandatory allergy tags on all menu items.
- **Auto-Emisión DTE**: Automatic Chilean SII DTE Boleta emission upon payment completion.
- Toggling a master switch updates global franchise config state in real time.

#### Scenario: Executive toggles master Ley 40 Horas rule

- GIVEN the global config panel
- WHEN the executive toggles "Control Ley 40 Horas" OFF
- THEN the master feature state updates and emits a `config.updated` event over `useRealtimeBus`

---

### Requirement: Cross-Branch Realtime Event Stream

The Dashboard MUST listen to global cross-branch events published over `useRealtimeBus`:
- `payment.completed`: Logs DTE payment transactions with branch label.
- `alert.fraud`: Logs unauthorized PIN void attempts across locations.
- `alert.panic`: Displays emergency red alert banner across branches.

#### Scenario: Fraud alert from branch appears in corporate stream

- GIVEN an active Corporate Event Stream
- WHEN an `alert.fraud` event arrives from the Vitacura branch
- THEN a red audit entry is appended to the corporate stream with timestamp, branch name, and reason
