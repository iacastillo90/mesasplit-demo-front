# 06 - Flujos de Negocio

> Convención: el backend es la fuente de verdad de dinero y estado. La app orquesta y muestra, no decide.

---

## Flujo 1: QR Onboarding (Crítico)

El comensal **se une** a una sesión ya abierta. **No la crea** (eso lo hace el mozo, hito Alfa).

```
┌─────────┐     ┌─────────┐     ┌─────────────┐
│ Comensal│     │   App   │     │   Backend   │
│ escanea │────>│ Detecta │────>│ valida      │
│ QR      │     │ QR      │     │ qrToken     │
└─────────┘     └─────────┘     └──────┬──────┘
                                       │
                     ┌─────────────────┼─────────────────┐
                     │                 │                 │
               ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
               │ qrToken   │     │ mesa SIN  │     │ sesión    │
               │ no existe │     │ sesión    │     │ OPEN      │
               │ 404       │     │ OPEN      │     │ -> crea   │
               │ QR_TOKEN_ │     │ 409       │     │ DineGuest │
               │ INVALID   │     │ SESSION_  │     │ + JWT     │
               └───────────┘     │ NOT_OPEN  │     │ GUEST     │
                                 └───────────┘     └───────────┘
```

### Algoritmo

```
FUNCTION handleQrScan(qrPayload):
  qrToken = qrPayload.qrToken

  // 1. Unirse (el back valida tabla + sesión OPEN)
  // 1. QR scan → OnboardingScreen (NO se llama al back aún)
  NAVIGATE OnboardingScreen(qrToken)

  // 2. OnboardingScreen llama al backend
  response = POST /auth/guest-session { qrToken, displayName, allergies: [] }

  IF 404 QR_TOKEN_INVALID:
    RETURN Error("Mesa no encontrada")

  IF 409 SESSION_NOT_OPEN:
    RETURN Error("La mesa aún no está habilitada, avisá al mesero")

  // 3. Guardar JWT de invitado
  saveAccessToken(response.data.accessToken)
  saveGuestData(guestId, dineSessionId, tableId, tableName)
  // NOTA: expiresIn NO se persiste actualmente

  // 4. Navegar a Home
  NAVIGATE HomeScreen(guest)
```

---

## Flujo 2: Hacer Pedido (Zero-Trust, Crítico)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Comensal │───>│   App    │───>│ Backend  │───>│ Cocina   │
│ agrega   │    │ armado   │    │ valida + │    │ recibe   │
│ ítems    │    │ pedido   │    │ guarda   │    │ ticket   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                  │
                          ┌───────┴───────┐
                          │ Zero-Trust    │
                          │ 1. Sesión     │
                          │    OPEN?      │
                          │ 2. Dish       │
                          │    existe?    │
                          │ 3. Dish       │
                          │    available? │
                          │ 4. Price =    │
                          │    dish.price │
                          └───────────────┘
```

### Algoritmo de Validación (server-side, la app solo reenvía)

```
FUNCTION createOrder(request):
  // El cliente ENVÍA unitPrice, pero el backend NO lo confía
  session = FIND DineSession WHERE id = request.dineSessionId AND status = OPEN

  FOR EACH lineRequest IN request.lines:
    dish = FIND Dish WHERE id = lineRequest.dishId AND branchId = session.branchId
    IF dish IS NULL: RETURN 404
    IF dish.isAvailable == false: RETURN 422 (Lista 86)
    realPrice = dish.price                // ignora lineRequest.unitPrice
    lineTotal = (realPrice + SUM(modifiers.extraPrice)) * quantity

  order = CREATE Order(status=PLACED, channel=request.channel)
  ticket = CREATE KitchenTicket(order)
  RETURN OrderResponse { id, status, lines[], kitchenTicketId }

  // Estados reales del backend (no los del spec original):
  // Order: PLACED → ACCEPTED → IN_PREPARATION → READY → SERVED (+ CANCELLED)
  // OrderLine: QUEUED → PREPARING → READY → SERVED (+ CANCELLED)
```

---

## Flujo 3: Pago (Mercado Pago / Webpay, Crítico)

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Comensal │──>│   App    │──>│ Backend  │──>│ Gateway  │
│ paga su  │   │ POST     │   │ crea     │   │ MP/      │
│ parte    │   │ /payments│   │ Payment  │   │ Webpay   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                │
                        ┌───────┴───────┐
                        │ Lock optimista│
                        │ @Version Bill │
                        │ + idempotencia│
                        │ externalTxId  │
                        └───────────────┘
```

### Algoritmo de Pago con Concurrencia (server-side)

```
FUNCTION processPayment(request):
  bill = FIND Bill WHERE id = request.billId
  IF bill.status != OPEN: RETURN 409
  IF request.amount > bill.balanceDue: RETURN 422

  IF request.externalTransactionId != null:
    existing = FIND Payment WHERE externalTransactionId = request.externalTransactionId
    IF existing != null: RETURN 409 (idempotencia -> devolver pago original)

  payment = CREATE Payment(status=PENDING, ...)

  bill.paidTotal += payment.totalAmount
  bill.balanceDue = bill.totalAmount - bill.paidTotal
  IF bill.balanceDue <= 0:
    bill.status = PAID
    session.status = CLOSED
    table.status = AVAILABLE

  RETURN PaymentResponse { payment, bill }
```

### Flujo en la app (MVP — sin WebView)

```
Métodos disponibles en MVP:
- CASH: Pago en efectivo (se registra localmente)
- WEBPAY: Tarjeta (sin integración real, solo registro)
- MERCADO_PAGO: Mercado Pago (sin integración real, solo registro)
- TRANSFER: Transferencia (sin integración real, solo registro)

1. POST /payments { billId, amount, tipAmount, totalAmount, method, currency: "CLP", dineGuestId }
2. Response: PaymentResponse { id, status: PENDING, bill }
3. En MVP: mostrar PaymentSuccessScreen directamente (sin WebView)
4. Propinas: botones predefinidos ($0, $1.000, $2.000, $3.000), sin input libre

> ⚠️ En MVP no hay integración real con gateway de pagos. Los métodos son solo registro.
> El flujo real con WebView de MP/Webpay está pendiente para fase posterior.
> La navegación post-pago es a /menu (no a la cuenta).

---

## Flujo 4: Split por Comensal (Zero-Trust)

La división la calcula el **backend** en `GET /bills/{billId}/summary-by-guest`. La app no recalcula dinero.

```
FUNCTION getSummaryByGuest(billId):
  bill = FIND Bill WHERE id = billId
  billLines = FIND BillLine WHERE billId = billId AND status = ACTIVE

  FOR EACH guest IN activeGuests:
    guestLines = billLines WHERE dineGuestId == guest.id
    guestTotal = SUM(guestLines.lineTotal)

  sharedLines = billLines WHERE dineGuestId IS NULL

  RETURN { guests: [{guestId, displayName, lines[], guestTotal, guestPaid, guestBalance}], sharedLines[] }
```

---

## Flujo 5: S.O.S. (Llamar al mesero)

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Comensal │───>│   App    │───>│ Backend  │───>│  Staff   │
│ toca el  │    │ POST     │    │ crea     │    │ (local)  │
│ botón    │    │ /service-│    │ SERVICE_ │    │ recibe   │
│          │    │ requests │    │ REQUEST  │    │ call.    │
└──────────┘    └──────────┘    └──────────┘    │ waiter   │
                                                 └──────────┘
```

```
FUNCTION callWaiter(requestType):
  // MVP: MOCKED — sin backend real
  // No existe POST /service-requests aún
  // La app muestra confirmación simulada
  mostrar confirmación "Solicitud enviada. El mesero se acercará pronto."
  // Cuando backend esté listo, reemplazar con:
  // response = POST /service-requests { dineSessionId, requestType, tableName }
  // IF 201: mostrar confirmación "Mesero avisado"
```

> ⚠️ Backend pendiente: `POST /service-requests` aún no está implementado (solo spec + enums). Ver 08.
> MVP usa mock hardcoded — no hay flags `kSosEnabled`/`kFeedbackEnabled`.

---

## Flujo 6: Feedback Post-Pago

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Pago     │───>│ Modal 1-5│───>│ POST     │
│ exitoso  │    │ + texto  │    │ /feedback│
└──────────┘    └──────────┘    └──────────┘
```

```
FUNCTION submitFeedback(rating, comment):
  // MVP: MOCKED — sin backend real
  // No existe POST /feedback aún
  // La app muestra confirmación simulada
  mostrar confirmación "Gracias por tu feedback!"
  // Cuando backend esté listo, reemplazar con:
  // response = POST /feedback { dineSessionId, rating, comment }
  // IF 422: mostrar "Calificación fuera de rango"
  // IF 409: ya existe feedback de la sesión (ignorar, cerrar modal)
  // IF 201: confirmación silenciosa, cerrar modal
```

> ⚠️ Backend pendiente: `POST /feedback` aún no está implementado (solo spec). Ver 08.
> MVP usa mock hardcoded — no hay flags.

---

## Resumen de Flujos Críticos

| Flujo | Criticidad | Riesgo principal | Mitigación |
|-------|-----------|------------------|------------|
| QR Onboarding | P0 | Sesión fantasma / QR inválido | El back valida qrToken + sesión OPEN (409/404) |
| Zero-Trust Order | P0 | Precio manipulado en cliente | El back ignora `unitPrice` del cliente |
| Pago parcial | P0 | Doble pago / race condition | Lock optimista (`@Version`) + idempotencia |
| Split | P0 | División incorrecta | El back calcula `summary-by-guest` |
| Tiempo real | P0 | Sin canal GUEST hoy | Polling hasta resolver `pregunta-arquitectura` (ver 08) |
| S.O.S. | P0 | Backend pendiente | Mock hardcoded en MVP — confirmación simulada sin backend |
| Feedback | P1 | Doble envío | Mock hardcoded en MVP — sin flags de feature toggle |
