# Proposal: fase2-mozo-caja-radar — Fase 2: Diferenciación (Mozo · Caja · Radar · Super Admin)

## Intent

Fase 2 demo-grade, sin backend: 9 unidades independientes en Mozo (upsell asistido, unir/ceder mesa, Mi Rendimiento), Caja (nota de crédito con PIN, CFD, modo mostrador), Radar (gamificación) y Super Admin (What-If, auditoría de menú). Funciones verificadas AUSENTES; se reutilizan patrones existentes.

## Scope

### In Scope
- 9 unidades independientes, cada una con tasks y commit propios (directo a main).
- Upsell como chip explícito: agrega solo al tocarlo, NUNCA auto-add.
- Unir/ceder mesa preservando integridad de ítems (reuso de splitService).
- Nota de crédito con PIN demo (patrón PinAuthModal) sin tocar DTE/BlindClose; CFD distinto de boleta; mostrador junto al flujo de mesa.
- Paneles read-only derivados de stats existentes (badges cosméticos; simulación sin persistir).

### Out of Scope
- Backend/API, SII real, seguridad de PIN real.
- Fase 2 Cliente+Cocina (`fase2-cliente-cocina`) y Compliance sanitario.

## Capabilities

### New Capabilities
- `waiter-upsell`: sugerencia por regla al agregar plato; chip explícito.
- `waiter-table-transfer`: unir cuentas y ceder mesa a otro garzón.
- `waiter-performance`: panel pedidos, ticket promedio, mesas.
- `pos-credit-note`: nota de crédito a venta, aprobada con PIN admin.
- `pos-cfd`: comprobante CFD demo con RUT/razón social.
- `pos-counter-mode`: venta rápida sin mesa: agregar, pagar, recibo.
- `radar-gamification`: leaderboard de staff desde stats existentes.
- `corporate-what-if`: simulador de precio con proyección lineal.
- `corporate-menu-engineering`: matriz estrella/caballo/puzzle/perro (volumen×margen).

### Modified Capabilities
None (aditivo; reuso de `account-split` sin alterar su spec).

## Approach

Por unidad: tests RED-GREEN (`npm run test`, `strict_tdd: true`) + componente + selector puro. Reutilizar: PinAuthModal (PIN 9921), PaymentMethodPicker, splitService, `posBus`/`createRealtimeBus`, persist Zustand (`mesasplit-*`), selectores puros (patrón `selectCostoPrimario`). `users.json` alimenta rendimiento/gamificación; `menu.json` gana costo/margen.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/features/WaiterView/` (pages, OrderPad, 3 nvos, store, service) | Modified/New | Upsell, transfer, rendimiento |
| `src/features/PosView/` (pages, 3 nvos, store) | Modified/New | Nota crédito, CFD, mostrador |
| `src/features/RadarView/` (LeaderboardPanel nvo, store) | Modified/New | Gamificación |
| `src/features/CorporateView/` (2 nvos, service) | Modified/New | What-If, auditoría menú |
| `src/mocks/menu.json` | Modified | Costo/margen demo |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Unir/ceder rompe integridad de ítems | Med | splitService + invariante de prueba; sin acoplar a account-split |
| 9 unidades exceden 400 líneas de review | Med | Tasks planifica slicing/commits por unidad |
| Conflicto con DTE/BlindClose/cash-shift | Bajo | Unidades aisladas; sin duplicar publicadores |
| PIN demo confundido con seguridad real | Bajo | Documentar demo-grade en specs |

## Rollback Plan

Commits por unidad directo a main: falla una unidad, `git revert <commit>` de esa unidad. Unidades aisladas; cada una deja `npm run test` verde antes del siguiente commit.

## Dependencies

Ninguna externa. Internas: stores/servicios existentes, mocks (`users.json`, `menu.json`, `tables.json`), specs vigentes (`account-split`, `modo-hora-punta`, `demo-fase1-gaps`, `sos-waiter-call`).

## Success Criteria

- [ ] `npm run test` verde tras cada unidad (RED-GREEN).
- [ ] `npm run build` y `npm run lint` en 0.
- [ ] 9 capacidades navegables: chip no auto-add; integridad al unir; paneles read-only.