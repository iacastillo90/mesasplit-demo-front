# Delta Spec: fase2-mozo-caja-radar — Fase 2: Diferenciación (Mozo · Caja · Radar · Super Admin)

## Purpose

Nueve capacidades demo-grade independientes (3 Mozo, 3 Caja, 1 Radar, 2 Super Admin), todas ADDED sobre un sistema sin backend. Cada unidad es un slice con tests RED-GREEN (`npm run test`, `strict_tdd: true`); los tasks planificarán un commit por unidad directo a main.

## Decisiones de alcance (resolución de riesgos del proposal)

1. **PIN demo-grade (9921)**: la nota de crédito reutiliza el patrón existente `PinAuthModal` (PIN de admin `9921`). El PIN es DEMO y no constituye seguridad real; la UI MUST declarar "Demo: 9921". Sin backend de autenticación en alcance.
2. **`users.json` verificado — sin extensión**: `src/mocks/users.json` YA incluye `salesCountToday` y `avgRating` por usuario (verificado). Rendimiento y gamificación los consumen vía `useDemoStore.users`. No se modifica el fixture.
3. **`menu.json` — única extensión de fixture**: cada ítem MUST ganar `cost` (CLP entero, `0 < cost < price`); el margen se deriva `(price − cost) / price`. Alimenta what-if y matriz de menú. `foodCost` corporativo (spec demo-fase1-gaps) queda intacto.
4. **Invariante de integridad (unir/ceder)**: test pin obligatorio — tras `mergeBills`, `Σ price×qty` de la cuenta unida === suma de totales origen, sin líneas perdidas ni duplicadas. Reusa la lógica pura de `splitService` (`checkConservation`) SIN acoplar la spec `account-split` (aditivo, sin MODIFIED).
5. **Aislamiento de Caja**: nota de crédito, CFD y mostrador MUST NOT tocar `dteModalOpen`, `blindCloseOpen` ni `cashShift`, y MUST NOT duplicar publicadores existentes (`payment.completed`, `shift.closed`). Está permitido publicar eventos propios nuevos (ej. `credit.note_issued`).
6. **Presupuesto de 400 líneas**: las 9 unidades son independientes (estado, selectores y vistas propios); `sdd-tasks` planificará slicing por unidad (1 commit/unidad) y encadenará PRs si el diff agregado lo amerita.
7. **Paneles read-only**: rendimiento, leaderboard, what-if y matriz de menú MUST NO mutar stores ni persistir; la simulación what-if MUST NO escribir claves nuevas en localStorage.

## ADDED Requirements

### Requirement: Upsell asistido en OrderPad `[waiter-upsell]`

El sistema MUST exponer un selector puro `suggestUpsell(itemId, menu)` que devuelva a lo sumo un candidato (o `null`) según un mapa de reglas demo fijo (hamburguesa → papas fritas; pizza → bebida), keyed por id/categoría de producto. Al agregar un plato con regla, OrderPad MUST renderizar un chip de sugerencia explícito; el chip MUST NO agregar nada por sí solo; solo al tocarlo el sistema MUST agregar una unidad del sugerido al `orderDraft` por el flujo normal de agregado. El sistema MUST NOT auto-agregar sugerencias en ningún momento. Sin regla para el ítem, el selector MUST devolver `null` y el chip MUST NO renderizarse.

#### Scenario: Chip visible al agregar plato con regla

- GIVEN menú con regla hamburguesa → papas fritas y una hamburguesa recién agregada al `orderDraft`
- WHEN OrderPad renderiza
- THEN el chip de sugerencia es visible con el producto sugerido

#### Scenario: Nunca auto-add

- GIVEN `orderDraft` sin papas fritas
- WHEN se agrega una hamburguesa (sin tocar el chip)
- THEN `orderDraft` contiene SOLO la hamburguesa Y no se agrega ningún ítem extra

#### Scenario: Tap explícito agrega una unidad

- GIVEN el chip de sugerencia visible
- WHEN el mozo toca el chip
- THEN una unidad del producto sugerido se agrega al `orderDraft`

#### Scenario: Sin regla no hay chip

- GIVEN un ítem sin regla en el mapa (ej. ensalada)
- WHEN se agrega al `orderDraft`
- THEN `suggestUpsell` devuelve `null` Y no se renderiza chip

### Requirement: Unir y ceder mesa `[waiter-table-transfer]`

El sistema MUST exponer `mergeBills(originId, targetId)` (unir cuentas) y `transferTable(tableId, waiterId)` (ceder mesa) en el store del garzón, con selección de destino demo-grade y confirmación explícita previa a mutar. `mergeBills` MUST combinar ambas cuentas en una, preservando TODAS las líneas con su `qty`/`price` intactos; el total de la cuenta unida MUST ser exactamente la suma de los totales origen (invariante de conservación). `transferTable` MUST reasignar la mesa al garzón destino en el estado demo: la mesa MUST desaparecer de la grilla del garzón origen y aparecer en la del destino. Cancelar la confirmación MUST NOT mutar estado. Los tests MUST incluir el invariante de integridad (ver Decisiones 4).

#### Scenario: Unir conserva integridad de ítems

- GIVEN cuenta A `[{ H. Clásica, qty 2, 8900 }]` (total 17800) y cuenta B `[{ Pizza, qty 1, 10900 }]`
- WHEN `mergeBills(A, B)` confirma
- THEN la cuenta unida contiene las líneas de A y B con qty/price intactos Y su total es 28700 (17800 + 10900)

#### Scenario: Invariante de integridad (test pin)

- GIVEN pares de cuentas con totales T1 y T2 (incluye casos con ítems repetidos)
- WHEN la suite de integridad de `mergeBills` se ejecuta
- THEN para cada caso `Σ price×qty` de la cuenta unida === T1 + T2 Y ninguna línea se pierde ni se duplica

#### Scenario: Cancelar no muta

- GIVEN el modal de confirmación de unir abierto
- WHEN el mozo cancela
- THEN ninguna cuenta cambia Y no se publica evento de transferencia

#### Scenario: Ceder mesa a otro garzón

- GIVEN mesa t5 asignada al garzón origen
- WHEN `transferTable('t5', 'u3')` confirma
- THEN la grilla del origen ya no muestra t5 Y el estado destino la asigna a u3

#### Scenario: Destino inválido bloqueado

- GIVEN destino igual al origen o inexistente
- WHEN se intenta unir/ceder
- THEN la acción se bloquea sin mutar estado

### Requirement: Mi Rendimiento (read-only) `[waiter-performance]`

El panel "Mi Rendimiento" (WaiterView, read-only) MUST mostrar tres métricas derivadas de estado demo existente vía selector puro `selectWaiterPerformance(userId, users, tables)`: pedidos tomados (`users.salesCountToday` del garzón en `useDemoStore.users`), ticket promedio (promedio de `avgTicket` de sucursal de `fetchFranchiseOverview` como proxy demo del negocio) y mesas servidas (conteo de mesas asignadas en `useWaiterStore.tables`). El panel MUST NOT mutar stores ni requerir backend; MAY mostrar `avgRating` del garzón como dato complementario. Sin registro del garzón en `users`, las métricas MUST mostrar `0` sin `NaN`.

#### Scenario: Métricas derivadas de datos existentes

- GIVEN garzón con `salesCountToday: 21` en `users` y 4 mesas asignadas
- WHEN `selectWaiterPerformance` evalúa
- THEN `ordersTaken` es 21 Y `tablesServed` es 4 Y `avgTicket` es un valor ≥ 0

#### Scenario: Panel read-only

- GIVEN el panel renderizado
- WHEN no se ejecuta ninguna interacción
- THEN los stores demo y del garzón no mutan

#### Scenario: Sin datos del garzón

- GIVEN garzón sin registro en `users`
- WHEN el panel renderiza
- THEN las métricas muestran `0` sin `NaN` en pantalla

### Requirement: Nota de crédito con PIN admin `[pos-credit-note]`

La nota de crédito MUST estar disponible sobre una venta pagada (`bill` con `status: 'paid'`) seleccionada en PosView y MUST requerir aprobación de PIN de admin (patrón `PinAuthModal`, PIN demo `9921`, ver Decisiones 1) antes de registrar cualquier efecto. Al aprobar, el sistema MUST registrar `{ id, billId, amount, motivo, timestamp, aprobadoPor }` en `creditNotes` del store y MOSTRAR el registro; la nota MUST referenciar su venta (`billId`) y monto. PIN incorrecto MUST bloquear sin registrar y mostrar error. Sin venta pagada seleccionada, la acción MUST estar deshabilitada. La unidad MUST NOT tocar `dteModalOpen`, `blindCloseOpen` ni `cashShift`, y MUST NOT publicar `shift.closed` ni duplicar `payment.completed` (ver Decisiones 5); el alta MAY publicar `credit.note_issued`.

#### Scenario: Aprobación con PIN correcto

- GIVEN venta pagada b-1 ($20.000) seleccionada
- WHEN se confirma la nota con PIN `9921` y un motivo
- THEN `creditNotes` contiene `{ billId: 'b-1', amount: 20000 }` Y el modal se cierra Y el registro es visible

#### Scenario: PIN incorrecto bloquea

- GIVEN el modal de nota abierto
- WHEN se ingresa un PIN distinto de `9921`
- THEN no se registra ninguna nota Y se muestra mensaje de error

#### Scenario: Aislamiento del flujo de caja

- GIVEN spy sobre `bus.publish` y estado con DTE/BlindClose/cashShift actuales
- WHEN se emite una nota de crédito
- THEN `shift.closed` y `payment.completed` no se publican Y `dteModalOpen`, `blindCloseOpen` y `cashShift` no cambian

#### Scenario: Sin venta seleccionada

- GIVEN ninguna venta pagada seleccionada
- WHEN se intenta abrir la nota
- THEN la acción está deshabilitada o bloqueada sin mutar estado

### Requirement: Comprobante CFD (demo) `[pos-cfd]`

Tras confirmar un pago, el sistema MUST ofrecer la opción de emitir un Comprobante CFD, variante de comprobante fiscal demo DISTINTA de la boleta DTE. El modal CFD MUST capturar `rut` y `razonSocial` del cliente y, al confirmar, MUST registrar `{ id, billId, folio, rut, razonSocial, timestamp }` y mostrar la vista de documento demo. La emisión CFD MUST NOT reutilizar ni modificar DteModal ni el `dteFolio` de `payment.completed`: ambos documentos coexisten como registros separados. Con `rut` vacío o con formato inválido (`XXXXXXXX-X`), la confirmación MUST bloquearse con mensaje. Sin SII real (ver Decisiones 5): el `folio` MUST ser un valor demo derivado/incremental y el documento MUST aclarar su carácter demostrativo.

#### Scenario: Emisión CFD con datos de cliente

- GIVEN pago de b-2 confirmado
- WHEN se abre el modal CFD, se ingresa RUT `11.111.111-1`, razón social y se confirma
- THEN el registro CFD aparece con `billId: 'b-2'` Y la vista de documento lo muestra

#### Scenario: CFD distinto de DTE

- GIVEN DteModal cerrado y `dteFolio` del pago emitido sin cambios
- WHEN se emite un CFD
- THEN DteModal no se abre Y `dteFolio` de `payment.completed` no se altera Y el CFD tiene folio propio

#### Scenario: RUT inválido bloquea

- GIVEN el modal CFD con `rut` vacío o mal formado
- WHEN se confirma
- THEN no se registra nada Y se muestra error de validación

### Requirement: Modo mostrador (venta rápida sin mesa) `[pos-counter-mode]`

El modo mostrador MUST coexistir con el flujo de mesa: al activar `counterMode`, el store MUST conservar `openBills` y `activeBill` intactos y manejar un carrito separado `counterCart`. El flujo MUST permitir agregar ítems rápidos del menú, ver total, pagar y mostrar recibo. Al confirmar el pago de mostrador, el sistema MUST publicar `payment.completed` con `tableNumber: null` (marcador inequívoco) y vaciar `counterCart`. Con `counterCart` vacío, la acción de pago MUST estar deshabilitada. Alternar modos MUST NOT perder ni mezclar el estado de mesa con el de mostrador.

#### Scenario: Coexistencia con el flujo de mesa

- GIVEN `openBills` con 3 cuentas y `activeBill` = b-1
- WHEN se activa el modo mostrador y se opera `counterCart`
- THEN `openBills` y `activeBill` permanecen sin cambios

#### Scenario: Venta de mostrador completa

- GIVEN `counterCart` con 2 ítems (total $11.800)
- WHEN se confirma el pago
- THEN `payment.completed` se publica con `tableNumber: null` Y `counterCart` queda vacío Y el recibo se muestra

#### Scenario: Carrito vacío bloquea el pago

- GIVEN `counterCart` vacío
- WHEN se intenta pagar
- THEN la acción está deshabilitada Y no se publica ningún evento

### Requirement: Leaderboard de staff (Radar) `[radar-gamification]`

El leaderboard de staff (RadarView) MUST derivar puntajes SOLO de estado existente vía selector puro `selectStaffLeaderboard(users, kdsState)`: puntos de mozos por pedidos servidos (proxy `users.salesCountToday`) y completaciones del KDS (estado KDS existente, ej. `recallStack`); la fórmula exacta de puntos MAY definirse en design como regla cosmética. El panel MUST ser read-only (sin mutar stores ni publicar eventos) y las insignias/medallas MUST ser cosméticas (nivel por rango de puntaje). El orden MUST ser determinista: descendente por puntaje, desempate por nombre. Con `users` vacío, el panel MUST mostrar estado vacío sin error.

#### Scenario: Orden y puntajes

- GIVEN `users` con `salesCountToday` distintos (u3: 21, u1: 12) y estado KDS con completaciones
- WHEN `selectStaffLeaderboard` evalúa
- THEN la lista ordena descendente por puntaje Y el primer lugar es el de mayor puntaje

#### Scenario: Desempate determinista

- GIVEN dos usuarios con igual puntaje
- WHEN el selector ordena
- THEN entre ellos el orden es alfabético por nombre

#### Scenario: Panel read-only

- GIVEN el leaderboard renderizado
- WHEN no se ejecuta ninguna interacción
- THEN los stores de radar, KDS y users no mutan

#### Scenario: Sin datos

- GIVEN `users` vacío
- WHEN el panel renderiza
- THEN muestra estado vacío sin lanzar error

### Requirement: Simulador What-If de precios `[corporate-what-if]`

El simulador (SuperAdmin) MUST exponer un control de precio (slider) sobre un producto del menú y MUST proyectar impacto con proyección lineal simple derivada de `corporateService` (`fetchFranchiseOverview`: `salesTotal`/`avgTicket` como base de referencia): `proyecciónVentas = ventasBase × (precioNuevo / precioActual)` y `gananciaProyectada = proyecciónVentas × margen(precioNuevo)` con margen desde `menu.json` (precio − costo, ver Decisiones 3). El simulador MUST ser read-only: el precio nuevo MUST NO persistirse (sin localStorage ni mutación de menú/store); el estado del slider es local a la vista. Con `precioNuevo` menor o igual al costo, la proyección MUST señalar margen ≤ 0 (aviso) sin producir error. Con `precioNuevo === precioActual`, la proyección MUST coincidir con la línea base.

#### Scenario: Proyección lineal

- GIVEN producto de $10.000 con costo $5.000 y ventas base $200.000
- WHEN el slider se mueve a $12.000
- THEN `proyecciónVentas` es 240.000 (200000 × 1.2) Y `gananciaProyectada` = 240.000 × 0.5833 (margen a $12.000)

#### Scenario: Sin persistencia de la simulación

- GIVEN el slider movido a otro precio
- WHEN se recarga la vista o se re-evalúa el store corporativo
- THEN `menu` y `fetchFranchiseOverview` conservan el precio original Y no existe clave nueva en localStorage

#### Scenario: Precio menor o igual al costo

- GIVEN producto con costo $5.000
- WHEN el slider baja a $4.500
- THEN la proyección muestra margen ≤ 0 con aviso Y no lanza error

### Requirement: Matriz de ingeniería de menú `[corporate-menu-engineering]`

La matriz (SuperAdmin) MUST clasificar cada producto del menú en estrella / caballo de batalla / puzzle / perro según volumen de ventas × margen, con datos demo: volumen por producto desde estado de ventas existente (eventos `payment.completed` en `franchiseEvents` de `useCorporateStore`) y margen desde `menu.json` (precio − costo). La clasificación MUST exponerse como función pura `classifyMenu(volume, margin)` con umbrales demo fijos (medianas de volumen y margen). El panel MUST ser read-only y MUST mostrar una explicación de cada cuadrante (definición y recomendación demo). Un producto sin ventas MUST clasificarse en el cuadrante de bajo volumen sin error, y la matriz MUST NOT mutar stores.

#### Scenario: Clasificación por cuadrante

- GIVEN volumen y margen altos
- WHEN `classifyMenu` evalúa
- THEN clasifica `estrella`
- AND con margen alto y volumen bajo clasifica `puzzle`
- AND con volumen alto y margen bajo clasifica `caballo de batalla`
- AND con ambos bajos clasifica `perro`

#### Scenario: Panel read-only con explicación

- GIVEN la matriz renderizada
- WHEN no se ejecuta ninguna interacción
- THEN los stores corporativos no mutan Y cada cuadrante muestra su explicación

#### Scenario: Producto sin ventas

- GIVEN un producto sin volumen registrado
- WHEN la matriz clasifica
- THEN cae en el cuadrante de bajo volumen sin lanzar error

## Resumen de cambios

| Tipo | Cantidad | Detalle |
|------|----------|---------|
| ADDED | 9 | `waiter-upsell`, `waiter-table-transfer`, `waiter-performance`, `pos-credit-note`, `pos-cfd`, `pos-counter-mode`, `radar-gamification`, `corporate-what-if`, `corporate-menu-engineering` |
| MODIFIED | 0 | — |
| REMOVED | 0 | — |
| RENAMED | 0 | — |

Al archivar, los 9 requisitos ADDED conforman la spec principal `openspec/specs/fase2-mozo-caja-radar/spec.md`. Fixture: solo `src/mocks/menu.json` se extiende (campo `cost`); `users.json` no cambia (ver Decisiones 2).
