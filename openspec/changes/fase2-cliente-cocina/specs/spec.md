# Spec: fase2-cliente-cocina — Fase 2 Diferenciación: Cliente (Mesa Virtual) + Cocina (KDS)

## Purpose

Agrega 7 funcionalidades demo de diferenciación en dos vistas: **Cliente** (Mesa Virtual) — factura, tracking de pedido, verificación de alcohol, reconexión de sesión — y **Cocina** (KDS) — Expo View, vista batch y checklist de empaque delivery. Todo extiende la arquitectura demo existente (`useClientStore`, `useSplitStore`, `useKdsStore`, `useRadarStore`, `useDemoStore`, `useRealtimeBus` con BroadcastChannel y `TICKET_STATUS`); sin backend, sin SII real, sin transporte nuevo. Cada unit es independiente y testeable RED-GREEN (`npm run test`).

## Decisiones de alcance (resolución de riesgos del proposal)

1. **Flag `alcoholic` ausente en `src/mocks/menu.json`**: la unit `client-alcohol-verification` MUST agregar el flag al modelo de catálogo y al fixture (default `false`; al menos un ítem con `alcoholic: true`). El servicio `getMenu` MUST propagarlo sin cambiar su firma.
2. **Fuente de verdad del checklist delivery**: se fija en `useRadarStore.deliveryOrders` — el MISMO arreglo que renderiza `DeliveryColumn`. Orden empaquetable = `status` activo (no `completed` ni `cancelled`, derivación de `selectActiveDelivery`). Despachado = transición a `status: 'completed'` (estado terminal que `DeliveryColumn`/`selectActiveDelivery` ya excluyen). El estado del checklist MUST persistir en localStorage bajo la clave `mesasplit-packing-{orderId}`.
3. **Factura cliente ≠ DTE de caja**: flujo demo propio (RUT + confirmación) sin folio CAF, sin selector boleta/factura ni razón social/giro (no replica `PosView/components/DteModal.jsx`).
4. **Tracking sin transporte nuevo**: deriva SOLO del tópico existente `order.status.change` del bus `useRealtimeBus('mesasplit')` y de `TICKET_STATUS` (`src/shared/constants/statusEnums.js`). La unit MAY publicar `order.status.change` sobre la instancia existente del bus para hacer observable la demo; NO MAY crear canales ni adaptadores nuevos.
5. **Presupuesto de 400 líneas**: las 7 units son independientes (test/commit/rollback propios). `sdd-tasks` MUST planificar el slicing por unit y emitir el forecast con las líneas guard (`Decision needed before apply`, `Chained PRs recommended`, `400-line budget risk`).

## Requirements

### Requirement: Solicitud de factura demo (Mesa Virtual) `[client-factura]`

`src/features/ClientView/pages/ClientPage.jsx` MUST ofrecer una solicitud de factura demo (modal `InvoiceRequestModal`) DISTINTA del flujo DTE de caja: el sistema MUST NOT emitir folio CAF, MUST NOT ofrecer selector boleta/factura ni solicitar razón social o giro, y MUST NOT interactuar con SII. El total a facturar MUST derivarse del modelo de cuenta existente (carrito `useClientStore.cart` vía `selectCartTotal`, o `useSplitStore.cartTotal`). El RUT MUST validarse con el validador existente `validateRut` (`src/shared/utils/validateRut.js`); solo un RUT válido habilita la confirmación. Al confirmar, el sistema MUST mostrar estado de confirmación ("Solicitud enviada") y MUST NOT cambiar el estado del carrito ni del ticket KDS.

#### Scenario: Solicitud exitosa con RUT válido

- GIVEN el cliente abre la solicitud de factura con un total derivado del carrito
- WHEN ingresa un RUT válido (ej. "12.345.678-5") y confirma
- THEN el sistema muestra "Solicitud enviada"
- AND NO se genera folio CAF ni documento tributario Y el carrito permanece intacto

#### Scenario: RUT inválido bloqueado

- GIVEN el cliente abre la solicitud de factura
- WHEN ingresa un RUT inválido (ej. "12.345.678-9") y confirma
- THEN el sistema muestra error de validación Y la solicitud NO se confirma

#### Scenario: Sin duplicación del flujo DTE de caja

- GIVEN el modal de factura del cliente abierto
- THEN el modal NO expone tipo de documento (boleta/factura), NO pide razón social/giro Y NO muestra folio

### Requirement: Tracking de pedido en Mesa Virtual `[client-order-tracking]`

`ClientPage` MUST suscribirse al tópico existente `order.status.change` del bus (`useRealtimeBus('mesasplit')`, `TOPICS.ORDER_STATUS_CHANGE`) y derivar la progresión del pedido mapeando `payload.status` con `TICKET_STATUS`: `pending` → "enviado a cocina", `in_preparation` → "en preparación", `ready` → "listo", `delivered` → "entregado". El payload identifica la orden por `orderId` o `ticketId`. Sin evento recibido, el estado derivado por defecto MUST ser "enviado a cocina" cuando existe una orden activa. El banner (`OrderTrackingBanner`) MUST reflejar el estado derivado y MUST NOT introducir transporte nuevo (ni tópicos fuera de `TOPICS`, ni canales, ni adaptadores).

#### Scenario: Progresión de estado vía bus

- GIVEN el banner de tracking con estado "enviado a cocina"
- WHEN el bus publica `order.status.change` con `{ orderId, status: 'ready' }`
- THEN el banner muestra "listo"

#### Scenario: Estado por defecto sin eventos

- GIVEN una orden activa sin eventos de estado recibidos
- WHEN ClientPage renderiza
- THEN el banner muestra "enviado a cocina"

#### Scenario: Estado inválido ignorado

- GIVEN el banner en "en preparación"
- WHEN el bus publica `order.status.change` con `status: 'desconocido'`
- THEN el banner permanece en "en preparación" sin crashear

### Requirement: Verificación de edad para ítems alcohólicos (Mesa Virtual) `[client-alcohol-verification]`

El modelo de catálogo (`src/mocks/menu.json`) MUST incluir el flag booleano `alcoholic` por ítem (default `false`) y el fixture MUST declarar al menos un ítem con `alcoholic: true`; `clientService.getMenu` MUST propagar el flag sin cambiar su firma. Antes de agregar al carrito un ítem con `alcoholic: true`, el sistema MUST mostrar el modal `AgeVerificationModal` (confirmación demo: checkbox "mayor de edad" o fecha de nacimiento) y MUST NOT agregar el ítem salvo que el cliente confirme. Los ítems no alcohólicos MUST agregarse sin gate. La verificación MUST NOT consultar fuentes reales de edad.

#### Scenario: Ítem alcohólico exige confirmación

- GIVEN un ítem del menú con `alcoholic: true`
- WHEN el cliente presiona "Agregar" y cancela la verificación
- THEN el modal se cierra Y el carrito NO contiene el ítem

#### Scenario: Confirmación exitosa agrega el ítem

- GIVEN un ítem del menú con `alcoholic: true`
- WHEN el cliente confirma la mayoría de edad
- THEN el ítem se agrega al carrito (contador/CTA lo refleja)

#### Scenario: Ítem no alcohólico sin gate

- GIVEN un ítem del menú sin `alcoholic: true`
- WHEN el cliente presiona "Agregar"
- THEN el ítem se agrega al carrito sin mostrar verificación

### Requirement: Reconexión de sesión del cliente `[client-session-reconnect]`

`useClientStore` MUST persistir `cart` y `tableContext` en localStorage usando el patrón de `useDemoStore` (middleware `persist` de Zustand + `createJSONStorage(() => localStorage)`) y MUST restaurarlos al recargar o perder realtime, sin perder el carrito. Durante la restauración el sistema MUST mostrar el indicador `ReconnectBanner` y ocultarlo al completarla. Sin sesión persistida (o datos corruptos/inválidos) el sistema MUST iniciar con el estado por defecto sin crashear.

#### Scenario: Reload restaura la sesión

- GIVEN un carrito y contexto de mesa persistidos en localStorage
- WHEN ClientPage se monta tras un reload
- THEN el carrito y el contexto de mesa se restauran Y el indicador de reconexión se muestra y luego se oculta

#### Scenario: Sin sesión persistida

- GIVEN localStorage sin datos de sesión del cliente
- WHEN ClientPage se monta
- THEN la vista inicia con el estado por defecto (menú se carga vía servicio) sin crashear

#### Scenario: Datos corruptos tolerados

- GIVEN localStorage con JSON inválido para la sesión del cliente
- WHEN ClientPage se monta
- THEN la vista inicia con el estado por defecto sin lanzar excepción

### Requirement: Expo View de cocina (KDS) `[kds-expo-view]`

`KdsPage` MUST exponer un toggle demo que active el modo exhibición fullscreen (`ExpoDisplay`) con los tickets pendientes de `useKdsStore.tickets`. El modo expo MUST ciclar automáticamente la presentación (avance por temporizador) sin requerir interacción, MUST usar tipografías grandes y barras de progreso legibles a distancia, y MUST ocultar los controles que mutan estado (marcar listo, tachar ítem, abrir modales, filtro de estación). La salida del modo expo MUST requerir una acción explícita del operador (control en cabecera o tecla Esc).

#### Scenario: Toggle activa expo y oculta controles

- GIVEN KdsPage con tickets pendientes
- WHEN el operador activa el toggle de Expo View
- THEN se muestra `ExpoDisplay` fullscreen con los tickets pendientes Y los botones de acción/modales NO son visibles

#### Scenario: Ciclo automático sin interacción

- GIVEN el modo expo activo con más de un ticket
- WHEN transcurre el intervalo del temporizador sin interacción
- THEN la presentación avanza al siguiente ticket del ciclo

#### Scenario: Salida explícita del modo expo

- GIVEN el modo expo activo
- WHEN el operador presiona el control de salida (o Esc)
- THEN el modo expo se desactiva Y la vista KDS normal con sus controles vuelve a mostrarse

### Requirement: Vista agregada por plato (KDS) `[kds-batch-view]`

`KdsPage` MUST mostrar una agregación read-only (`BatchSummaryView`) de los tickets activos de `useKdsStore.tickets` agrupando por nombre de plato y sumando cantidades (ej. "Hamburguesa Clásica x3"). La agregación MUST respetar el filtro de estación activa (`activeStation`) cuando no es `todas`, MUST NOT mutar `tickets` ni `recallStack`, y sin tickets activos MUST mostrar un estado vacío.

#### Scenario: Agregación por plato

- GIVEN tickets activos con "Hamburguesa Clásica" qty 2 en un ticket y qty 1 en otro (estación activa incluida)
- WHEN KdsPage muestra la vista batch
- THEN la vista agrupa "Hamburguesa Clásica x3"

#### Scenario: Lectura pura sin mutación

- GIVEN la vista batch visible
- WHEN la agregación se calcula/renderiza
- THEN `useKdsStore.tickets` y `recallStack` permanecen sin cambios

#### Scenario: Estado vacío

- GIVEN `useKdsStore.tickets` vacío
- WHEN la vista batch se muestra
- THEN la vista indica que no hay platos pendientes

### Requirement: Checklist de empaque delivery (KDS) `[kds-delivery-checklist]`

Cuando un pedido se marca listo para delivery, el KDS MUST abrir el checklist de empaque (`PackingChecklistModal`). La fuente de verdad MUST ser `useRadarStore.deliveryOrders` (el mismo arreglo que renderiza `DeliveryColumn`); una orden es empaquetable cuando su `status` está activo (no `completed` ni `cancelled`, derivación de `selectActiveDelivery`). El checklist MUST listar los ítems a empaquetar: si la orden expone `items` estructurados los usa; en su defecto, el resumen textual `itemsSummary` es una unidad verificable única. El operador MUST verificar cada ítem; con todos verificados, marcar "despachado" MUST transicionar la orden a `status: 'completed'` (estado terminal que `DeliveryColumn`/`selectActiveDelivery` excluyen del tablero activo). El estado del checklist (verificaciones + despachado) MUST persistir en localStorage bajo `mesasplit-packing-{orderId}` (demo) y restaurarse al reabrir. Un checklist incompleto MUST NOT despachar.

#### Scenario: Apertura del checklist al marcar listo

- GIVEN un pedido delivery con `status` activo en `useRadarStore.deliveryOrders`
- WHEN el operador lo marca listo para delivery
- THEN el checklist se abre listando los ítems a empaquetar del pedido

#### Scenario: Despacho tras verificar todo

- GIVEN el checklist abierto con 2 ítems a empaquetar
- WHEN el operador verifica ambos y confirma despacho
- THEN la orden queda con `status: 'completed'` en `deliveryOrders` Y `DeliveryColumn`/`selectActiveDelivery` la excluyen del tablero activo

#### Scenario: Checklist incompleto no despacha

- GIVEN el checklist abierto con 2 ítems a empaquetar
- WHEN el operador verifica solo uno y confirma despacho
- THEN la orden NO cambia a `completed` Y el sistema indica los ítems pendientes

#### Scenario: Persistencia demo del checklist

- GIVEN un checklist con 1 ítem verificado bajo `mesasplit-packing-{orderId}`
- WHEN el modal se cierra y se vuelve a abrir (o tras reload)
- THEN el checklist restaura las verificaciones persistidas
