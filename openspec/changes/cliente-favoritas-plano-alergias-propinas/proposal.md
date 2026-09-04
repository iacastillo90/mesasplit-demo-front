# Proposal: Dominio Cliente — Favoritas, Plano de Piso, Escudo de Alergias y Propinas

## Intent

Completar el dominio Cliente sobre el modelo ER v2 (26 entidades, contrato en `openspec/docs/Diagrama_V2.mmd`): favoritas por sucursal, plano de piso con elección de mesa como intención efímera, escudo de alergias persistido y normalizado, e historial de propinas derivado. Requisito transversal: unificar la identidad de sucursal, hoy inconsistente entre fixtures (`lo-ovalle/providencia/vitacura` en `WhatsAppReservationChatModal.jsx` vs `b-1/b-2/b-3` en `useReservationStore.js`).

## Scope

### In Scope
- **Favoritas**: entidad FAVORITE con unique(person_id, branch_id), listado created_at DESC, toggle estrella en catálogo; catálogo expone `isFavorite` del usuario.
- **Plano de piso cliente**: nueva vista reusando layout de `src/mocks/tables.json` (x/y/zone). Elegir mesa = intención EFÍMERA (estado "elegida/por ocupar", no abre sesión; expira/revierte). Asociación real SOLO por `qr_token` de mesa (hoy inexistente) → abre DINE_SESSION. Estados: por ocupar vs ocupada.
- **Escudo de Alergias**: `PERSON_PROFILE.allergies` persistido (hoy `useState` muerto en `ClientProfilePage.jsx:88-102`); enum compartido normalizado (hoy divergente: `gluten` en `menu.json` vs `glutenFree` en perfil); cruce perfil∩plato en checkout → ALERTA NO BLOQUEANTE.
- **Historial de Propinas**: derivado de PAYMENT (status=completed AND tip_amount>0) por person_id; muestra fecha, método, monto y % (tip_amount/total) + boleta. Reemplaza Historial DTE hardcodeado (`ClientProfilePage.jsx:521-593`).
- **Identidad de sucursal**: branch_id canónico (UUID) consistente en catálogo, plano, QR y favoritas.

### Out of Scope
- Pagos/gateways completos, KDS, reservas, multitenant corporativo (otro changes). Sin escandallo (RECIPE_INGREDIENT) en alergias.

## Capabilities

### New Capabilities
- `branch-identity`: branch_id canónico único consumido por catálogo, plano, QR y favoritas.
- `client-favorites`: FAVORITE por persona+sucursal, orden, toggle y `isFavorite`.
- `floor-map-table-intent`: plano de piso, intención efímera de mesa y apertura de sesión por QR.
- `allergy-shield`: vocabulario normalizado, persistencia y alerta no bloqueante en checkout.
- `tip-history`: read-model derivado de PAYMENT para historial de propinas.

### Modified Capabilities
None — ninguna spec vigente cubre estos dominios (specs actuales: waiter-*, account-split, sos-waiter-call, modo-hora-punta, demo-fase1-gaps).

## Approach

ER v2 como contrato de entidades backend (Java, stack a definir). Front demo consume el mismo contrato: un enum ALLERGEN compartido (gluten, lácteos, frutos secos, huevo, pescado, sésamo), store cliente con estado efímero de mesa (no persistente, expira por timeout), y read-model de propinas sobre PAYMENT sin tabla nueva. Cambios por slices independientes encadenados (ver Delivery Forecast).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/mocks/tables.json` | Modified | Añadir branch_id y qr_token por mesa |
| `src/mocks/tableContext.js` | Modified | `code` mal ubicado; alinear a qr_token |
| `src/mocks/menu.json` | Modified | Allergens ya en español; alinear a enum |
| `ClientProfilePage.jsx` | Modified | Alergias persistidas (88-102); reemplazo Historial DTE (521-593) |
| `WhatsAppReservationChatModal.jsx`, `useReservationStore.js` | Modified | Migrar IDs de sucursal a canon |
| `ClientPage.jsx`, `ClientQrScanPage.jsx` | Modified | Toggle favorita, isFavorite; QR por qr_token |
| Entidades backend (FAVORITE, DINE_TABLE.qr_token, PERSON_PROFILE.allergies, PAYMENT) | New | Diseño sobre ER v2 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend Java sin stack definido (solo ER) | High | Limitar change a diseño/contrato; stack en change aparte |
| Migrar IDs de sucursal rompe fixtures/tests existentes | Med | Slices con mapeo id-viejo→UUID y tests actualizados por slice |
| Normalización de alergias rompe UI/tests previos | Med | Enum único con mapeo de legado en el slice de alergias |
| Fixtures de PAYMENT sin tip_amount → historial vacío | Med | Seed demo con tip_amount en el slice de propinas |
| Intención efímera confundida con ocupación real | Low | Estados visuales distintos + expiración explícita |

## Rollback Plan

Slices independientes: revertir merge de un slice sin tocar los demás. Para branch-identity: archivo de mapeo id-viejo→UUID permite volver a IDs legados si un fixture depende de ellos. Estado efímero de mesa: desactivar por flag de store sin migración.

## Dependencies

- `openspec/docs/Diagrama_V2.mmd` (contrato ER v2).
- Decisiones del change de reseñas/reservas que usen `useReservationStore`.

## Success Criteria

- [ ] Un único branch_id por sucursal en catálogo, plano, QR y favoritas (sin IDs duplicados en fixtures).
- [ ] Toggle favorita persiste; listado ordenado created_at DESC; excluye duplicados person+branch.
- [ ] Elegir mesa no abre sesión (expira); escanear qr_token sí abre DINE_SESSION.
- [ ] Alergia persistida cruza contra plato y muestra alerta no bloqueante en checkout.
- [ ] Historial de propinas muestra solo PAYMENT completed con tip>0 del pagador, con % calculado.
- [ ] Strict TDD: nuevo comportamiento comienza en RED; suite completa verde.

## Delivery Forecast (auto-forecast)

- Líneas estimadas total: **~1200–1800** (front + tests; backend aún sin código) → supera budget de review (600).
- Chained PRs recomendados: **Sí** — 5 slices por work unit en Feature Branch Chain con tracker: ① branch-identity → ② favoritas → ③ plano+QR → ④ alergias → ⑤ propinas; cada slice ≤600 líneas con tests y docs propios.