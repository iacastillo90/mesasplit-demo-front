# Delta Spec — demo-fase1-gaps

## Propósito

Cierra las cinco brechas del MVP Fase 1 (demo sin backend): onboarding de Mesa Virtual, turno de caja operativo, KDS offline y dos paneles read-only de Super Admin (Costo Primario y Compliance SII). Las cinco unidades son **independientes** entre sí (cada una vive en su slice con tests RED-GREEN, `npm run test`); la fase de tasks definirá el encadenado de PRs respetando el presupuesto de revisión de 400 líneas.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **Testabilidad de `navigator.onLine` (jsdom)**: la detección de conectividad del KDS MUST usar un adaptador inyectable (`createConnectivityAdapter`); los tests inyectan un fake porque jsdom no permite controlar `navigator.onLine`.
2. **Fuente del costo (Costo Primario)**: hoy no existe dato de costo en los stores. Se fija la fuente en el fixture corporativo: `fetchFranchiseOverview` y el shape de `branches` en `useCorporateStore` MUST incorporar `foodCost` (CLP por sucursal). El `costPrice` del modelo `Product` queda fuera de alcance.
3. **Responsabilidades cash-shift vs BlindClose**: `cashShift` rastrea la apertura/cierre **operativo** del turno (persistido en localStorage); `submitBlindClose`/`BlindCloseModal` sigue siendo el **arqueo/auditoría** y el ÚNICO publicador de `shift.closed`. No se duplica el flujo.
4. **Canal realtime no disponible**: el modo offline reutiliza la tolerancia existente del bus (caída a `NoopAdapter` sin lanzar, spec realtime-bus) — no agrega transporte nuevo.

## ADDED Requirements

### Requirement: Onboarding de primera visita (Mesa Virtual) `[client-onboarding]`

La vista `src/features/ClientView/pages/ClientPage.jsx` MUST mostrar una guía de primera visita (welcome modal o tip strip, a elección de diseño) SOLO cuando no exista la marca de descarte persistida. Al descartar, el sistema MUST persistir `onboardingDismissed=true` en localStorage bajo la clave `mesasplit-onboarding` (patrón de persistencia de la demo, ver `useDemoStore`). La guía MUST NOT bloquear la orden: agregar al carrito, abrir el carrito y S.O.S. MUST seguir operativos con la guía visible.

#### Scenario: Primera visita muestra la guía

- GIVEN localStorage sin clave `mesasplit-onboarding`
- WHEN ClientPage se renderiza
- THEN la guía de bienvenida es visible

#### Scenario: Descarte persistido y no reaparece

- GIVEN la guía visible
- WHEN el cliente la descarta
- THEN la guía desaparece Y localStorage contiene `mesasplit-onboarding=true` Y al re-renderizar/reload NO se muestra

#### Scenario: La guía no bloquea pedidos

- GIVEN la guía visible
- WHEN el cliente presiona "Agregar" en un plato del menú
- THEN el ítem se agrega al carrito (contador/CTA lo refleja) sin requerir cerrar la guía

### Requirement: Turno de caja operativo (PosView) `[cash-shift]`

`src/features/PosView/store/usePosStore.js` MUST exponer estado `cashShift` con `status: 'open' | 'closed'`, `openedAt`, `initialAmount?`, `closedAt?` y `summary?`, más las acciones `openCashShift({ initialAmount? })` y `closeCashShift(summary)`. `openCashShift` MUST registrar `openedAt` (timestamp) y el monto inicial opcional; `closeCashShift` MUST registrar `closedAt` y el resumen recibido. El estado `cashShift` MUST persistirse en localStorage vía middleware `persist` de Zustand (clave `mesasplit-cash-shift`, `partialize` limitado a `cashShift`) y sobrevivir al reload. `closeCashShift` MUST NOT publicar `shift.closed` ni tocar `blindCloseOpen`: el arqueo/auditoría sigue siendo exclusivo de `submitBlindClose`/BlindCloseModal (único publicador de `shift.closed`). La vista MAY cerrar el turno operativo al confirmar un Cierre Ciego (propagación unidireccional opcional).

#### Scenario: Apertura de turno

- GIVEN `cashShift.status` es `'closed'`
- WHEN se invoca `openCashShift({ initialAmount: 50000 })`
- THEN `status` es `'open'`, `openedAt` es un timestamp válido e `initialAmount` es `50000`

#### Scenario: Cierre de turno con resumen

- GIVEN `cashShift.status` es `'open'`
- WHEN se invoca `closeCashShift({ totalVendido: 185000 })`
- THEN `status` es `'closed'`, `closedAt` es un timestamp válido y `summary.totalVendido` es `185000`

#### Scenario: Persistencia del turno

- GIVEN un turno `'open'` persistido en `mesasplit-cash-shift`
- WHEN el store se rehidrata (reload)
- THEN `cashShift.status` es `'open'` restaurado desde localStorage

#### Scenario: Sin duplicación del arqueo

- GIVEN un turno `'open'` y un spy sobre `bus.publish`
- WHEN se invoca `closeCashShift({ totalVendido: 100 })`
- THEN `shift.closed` NO se publica Y `blindCloseOpen` permanece sin cambios

### Requirement: KDS offline con cola y auto-flush (KdsView) `[kds-offline]`

La conectividad MUST detectarse mediante un adaptador inyectable `createConnectivityAdapter` cuya implementación por defecto usa `navigator.onLine` y los eventos `online`/`offline`; los tests inyectan un fake controlable. `useKdsStore` MUST exponer `isOnline` (actualizado por el adaptador) y una cola `offlineQueue`. Estando offline, las acciones que publican eventos del bus (`completeTicket` → `kds.item_ready`, `toggleStock86` → `kds.stock_86`) MUST encolar el envelope en `offlineQueue` (orden FIFO) en lugar de publicar. Al volver a estar online, el store MUST hacer flush de la cola publicando cada envelope pendiente en orden y vaciarla. El KDS MUST NOT crashear si el canal realtime no está disponible (el bus ya cae a `NoopAdapter` sin lanzar). `OfflineBanner` MUST renderizarse cuando `isOnline === false` y SHOULD mostrar la cantidad de pendientes (`offlineQueue.length`) cuando sea mayor a cero.

#### Scenario: Indicador visible offline

- GIVEN un adaptador fake que reporta `offline`
- WHEN KdsPage renderiza
- THEN el banner de offline es visible

#### Scenario: Encolado local offline

- GIVEN `isOnline === false`
- WHEN se invoca `completeTicket(ticketId)`
- THEN el ticket se completa en el estado local Y el envelope `kds.item_ready` queda en `offlineQueue` Y `bus.publish` no se invoca

#### Scenario: Auto-flush al reconectar

- GIVEN `offlineQueue` con 2 envelopes
- WHEN el adaptador reporta `online`
- THEN ambos envelopes se publican en orden (`bus.publish` invocado 2 veces) Y la cola queda vacía

#### Scenario: Sin canal realtime no crashea

- GIVEN el bus sin BroadcastChannel disponible (resuelve a NoopAdapter) e `isOnline === true`
- WHEN una acción publica un evento
- THEN no se lanza excepción Y la vista sigue operable

### Requirement: Costo Primario read-only (Super Admin) `[costo-primario]`

La fuente de datos MUST ser el fixture corporativo: `src/features/CorporateView/services/corporateService.js` y el shape de `branches` en `useCorporateStore` MUST incluir `foodCost` (CLP por sucursal); `loadCorporateData` MUST propagar el campo al store. `CostoPrimarioCard` (read-only, en SuperAdminPage) MUST mostrar el porcentaje `costoPrimario = (Σ foodCost / Σ salesTotal) × 100` con un decimal, más los montos Σ de costo y de ventas; `salesTotal` es el campo existente de `branches`. La card MUST NOT mutar el store ni exponer acciones, y MUST explicar la fórmula en su pie. Sin costos o sin ventas (`Σ salesTotal === 0`), la card MUST mostrar `0%` / "sin datos" sin producir `NaN`.

#### Scenario: Cálculo de la métrica

- GIVEN branches con `{ salesTotal: 1000, foodCost: 400 }` y `{ salesTotal: 1000, foodCost: 200 }`
- WHEN el selector de costo primario se evalúa
- THEN devuelve `30.0` (600 / 2000 × 100)

#### Scenario: Panel read-only

- GIVEN la card renderizada
- WHEN no se ejecuta ninguna interacción
- THEN el store no muta (sin acciones invocadas, mismo estado de `branches`)

#### Scenario: Sin datos de costo

- GIVEN `Σ foodCost === 0` o `Σ salesTotal === 0`
- WHEN la card renderiza
- THEN muestra `0%` o "sin datos" (sin `NaN` en pantalla)

### Requirement: Compliance SII read-only (Super Admin) `[compliance-sii]`

`ComplianceSiiPanel` (read-only, en SuperAdminPage) MUST renderizar tres checks derivados de estado REAL de stores existentes vía selectores puros exportados: (a) **DTE Boleta** — OK cuando `franchiseEvents` (`useCorporateStore`) contiene al menos un evento de pago con DTE (`dteFolio` definido); (b) **Folios consecutivos** — OK cuando los `dteFolio` de los eventos de pago en `franchiseEvents`, en orden cronológico, son consecutivos (Δ=1); con 0-1 folios el check MUST ser OK (sin evidencia de quiebre). Para habilitarlo, el listener existente de `payment.completed` en `useCorporateStore` MUST registrar el campo `dteFolio` (tomado del payload, sin flujo nuevo) y el fixture `INITIAL_EVENTS` MUST incluir `dteFolio` en su evento de pago; (c) **Cierre Ciego** — OK cuando `usePosStore` expone la capacidad del arqueo (estado `blindCloseOpen` y acción `submitBlindClose`, que publica `shift.closed`). El panel MUST NOT crear flujos nuevos ni mutar stores; los checks MUST referenciar las capacidades existentes (DteModal, folios de PosPage/`confirmPayment`, BlindCloseModal).

#### Scenario: Los tres checks en OK

- GIVEN `franchiseEvents` con folios consecutivos (1041, 1042, 1043) y `usePosStore` con `submitBlindClose`
- WHEN el panel renderiza
- THEN los tres checks muestran estado OK

#### Scenario: Quiebre de folios detectado

- GIVEN `franchiseEvents` con folios 1041 y 1043 (sin 1042)
- WHEN el panel renderiza
- THEN el check de folios muestra estado de riesgo Y los demás checks siguen su estado real

#### Scenario: Panel read-only

- GIVEN el panel visible
- WHEN no se ejecuta ninguna interacción
- THEN los stores corporativo y POS no mutan
