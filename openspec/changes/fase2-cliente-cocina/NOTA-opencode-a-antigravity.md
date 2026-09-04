# NOTA-opencode-a-antigravity — implementar fase2-cliente-cocina

**Para**: Antigravity (implementador)
**De**: opencode (orquestador)
**Fecha**: 2026-08-17

## Tarea

Implementar el change **fase2-cliente-cocina** (Fase 2 — Diferenciación, track Cliente + Cocina) completo según:
- Proposal: `openspec/changes/fase2-cliente-cocina/proposal.md`
- Spec (contrato): `openspec/changes/fase2-cliente-cocina/specs/spec.md` — 7 ADDED requirements, 22 escenarios
- Tasks: `openspec/changes/fase2-cliente-cocina/tasks.md` — 8 fases, 35 tasks

Mientras tanto, opencode implementa EN PARALELO el change **fase2-mozo-caja-radar** (otro track, slices disjuntos: no tocar `src/features/WaiterView`, `PosView`, `RadarView`, `CorporateView` — excepto DeliveryColumn en RadarView que es la fuente de estado de la U7 del checklist; si necesitás leerla, solo leé, no edites).

## Entrega acordada

**Commits por unidad directo a main** (decisión del usuario, como en demo-fase1-gaps). 7 commits:
1. `feat: factura en Mesa Virtual` (client-factura)
2. `feat: tracking de pedido en Mesa Virtual` (client-order-tracking)
3. `feat: verificación de alcohol al agregar bebida` (client-alcohol-verification)
4. `feat: reconexión de sesión de Mesa Virtual` (client-session-reconnect)
5. `feat: Expo View en KDS` (kds-expo-view)
6. `feat: vista agregada batch en KDS` (kds-batch-view)
7. `feat: checklist de empaque delivery en KDS` (kds-delivery-checklist)

Orden libre (units independientes). Cada unit = 1 commit (o 2 si el tamaño lo pide: test + implementación).

## Reglas obligatorias

1. **Strict TDD**: cada unit arranca RED (`npm run test` falla), luego GREEN, luego wiring. No skipear.
2. **Commits en español**, conventional, mensaje con PORQUÉ (AGENTS.md).
3. **Cada línea de código comentada en español**.
4. **No commitear** `openspec/`, `.atl/`, `AGENTS.md`. Solo `src/` + configs.
5. **Spec es contrato**: MUST del spec incumplido = bug. Respetar las decisiones de alcance:
   - factura ≠ DTE de caja: sin folio CAF, sin selector boleta/factura
   - tracking: SOLO tópico existente `order.status.change` + `TICKET_STATUS` desde `statusEnums.js` (no del barrel)
   - alcohol: agregar flag `alcoholic` a `menu.json` (default false, ≥1 true), propagar por `getMenu` sin cambiar firma
   - reconexión: patrón persist de `useDemoStore`; JSON corrupto no debe crashear (Zustand v5 degrada a default)
   - Expo View: sin interacción, ocultar botones sensibles
   - batch: agregación read-only por plato
   - checklist: fuente de verdad = `useRadarStore.deliveryOrders` (mismo array de DeliveryColumn); despachado = transición a `status: 'completed'`; persist `mesasplit-packing-{orderId}`
6. **Warnings conocidos**: `deliveryOrders` no expone `items` estructurados hoy — U7 debe implementar `itemsSummary` como unidad única y usar fixtures con `items` en tests; baseline actual: 90 tests verdes en 20 suites — no romper nada.
7. **Verificación final**: suite completa `npm run test` (debe quedar 90 + nuevos, 100% verde) + `npm run build` + `npm run lint`.

## Comunicación de retorno

Dejá `openspec/changes/fase2-cliente-cocina/apply-progress.md` con: units completadas, commits (SHA), resultado suite/build, y la tabla TDD Cycle Evidence (RED→GREEN→Wiring por unit, como hiciste en demo-fase1-gaps). opencode hará verify + archive.

— opencode