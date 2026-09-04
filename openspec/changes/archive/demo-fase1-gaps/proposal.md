# Propuesta: demo-fase1-gaps — Cierre de brechas Fase 1 (MVP)

## Intent

Cerrar las brechas del MVP para una demo 100% entregable: onboarding cliente, turno de caja, KDS offline y dos indicadores Super Admin. Nivel demo, sin backend.

## Scope

### In Scope
5 unidades (una por brecha):

1. **Onboarding (Mesa Virtual)**: guía de primera visita descartable con dismiss persistido; no bloquea pedidos.
2. **Caja (PosView)**: estado `cashShift`; apertura (timestamp + monto inicial opcional) y cierre (timestamp + resumen); persistencia localStorage.
3. **KDS offline**: indicador `navigator.onLine`; cola local con auto-flush al reconectar; no falla sin canal realtime.
4. **Costo Primario (Super Admin)**: card read-only (costo alimentos / ventas) desde stores existentes y fórmula explicada.
5. **Compliance SII (Super Admin)**: panel read-only con checks (DTE boleta, folios consecutivos, Cierre Ciego) contra DteModal/folios/BlindCloseModal.

### Out of Scope
Fase 2/3; backend/SII real; PWA offline completo (solo modo degradado + cola).

## Capabilities

### New Capabilities
- `client-onboarding`: guía de primera visita descartable y persistida.
- `cash-shift`: apertura/cierre de turno de caja con timestamps y resumen.
- `kds-offline`: modo degradado de KDS con indicador, cola y auto-flush.
- `costo-primario`: card read-only derivada de stores existentes.
- `compliance-sii`: panel read-only contra capacidades existentes.

### Modified Capabilities
None: las specs principales no cambian; las capabilities de vista viven en archive y se extienden con specs nuevas.

## Approach

Una unidad por slice con store y tests RED-GREEN. Reusar `persist` de Zustand, bus con adaptador Noop y fixtures; Super Admin solo lee estado.

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `src/features/ClientView/` (ClientPage, useClientStore, nuevo WelcomeModal) | Modificado/Nuevo | Onboarding descartable persistido |
| `src/features/PosView/` (PosPage, usePosStore, nuevo CashShiftModal) | Modificado/Nuevo | Turno complementario al Cierre Ciego |
| `src/features/KdsView/` (KdsPage, useKdsStore, nuevo OfflineBanner) | Modificado/Nuevo | Indicador offline + cola + auto-flush |
| `src/features/CorporateView/` (SuperAdminPage, nuevos CostoPrimarioCard, ComplianceSiiPanel) | Modificado/Nuevo | Paneles read-only |
| Suites `.test.jsx` de cada slice | Modificado | Tests RED-GREEN por unidad |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Costo Primario sin fuente de costos en stores | Med | Fijar fuente en spec (fixtures + `costPrice` del modelo), read-only |
| `navigator.onLine` y localStorage no controlables en jsdom | Med | Lógica testeable con estado inyectable y mocks |
| Solapamiento `cash-shift` con BlindCloseModal (`shift.closed`) | Baja | El flujo nuevo complementa, no duplica |

## Rollback Plan

Commits por unidad lógica; revertir la unidad no afecta al resto (aislada en su slice).

## Dependencies

Sin dependencias nuevas; contrato en `openspec/`.

## Success Criteria

- [ ] `npm run test` verde (tests RED-GREEN por unidad).
- [ ] `npm run build` y `npm run lint` sin errores.
- [ ] Demo: onboarding solo en 1ª visita; turno persiste; KDS offline con auto-flush; Super Admin muestra métricas desde stores.