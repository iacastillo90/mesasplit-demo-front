# 05 - Modelo de Datos

> Fuente de verdad: `LabTab-Back/src/main/java/cl/labtab/api/dtos/`. Los DTOs de la app son un espejo de esos records Java. Si algo no coincide, manda el código del back.

## Convenciones

- Todos los precios en **CLP** (`BigDecimal` en el back → `int` en la app, sin decimales)
- UUIDs como `String` en JSON
- Fechas ISO 8601 (`2026-09-01T14:30:00Z`); hora local `America/Santiago`
- Enums serializados como `String` en MAYÚSCULAS
- **Envelope**: toda respuesta exitosa = `{ "data": ..., "meta": { "timestamp", "requestId" } }`; error = `{ "error": { "code", "message", "detail" } }`

---

## 1. Authentication

### LoginRequest
```json
{ "email": "juan@example.com", "password": "MiPassword123!" }
```

### AuthResponse (`POST /auth/login`)
```json
{
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 14400,
    "person": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "juan@example.com",
      "fullName": "Juan Perez",
      "role": "STAFF",
      "branchId": "660e8400-e29b-41d4-a716-446655440001",
      "avatarUrl": "https://cdn.labtab.cl/avatars/juan.jpg"
    },
    "availableBranches": [
      { "branchId": "660e8400-e29b-41d4-a716-446655440001", "branchName": "LabTab Centro", "role": "STAFF" }
    ]
  },
  "meta": { "timestamp": "2026-09-01T14:30:00Z", "requestId": "uuid-v4" }
}
```

### RefreshTokenResponse (`POST /auth/refresh`)
```json
{
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 14400,
    "refreshToken": "eyJ..."   // rota el refresh token
  },
  "meta": { "...": "..." }
}
```

### GuestSessionRequest (`POST /auth/guest-session`)
```json
{
  "qrToken": "abc123def456ghi789",
  "displayName": "Juan",
  "allergies": []
}
```

> ⚠️ MVP: `displayName` es REQUERIDO (validación en UI). `allergies` siempre se envía como `[]` (sin campo de alergios en UI).

### GuestSessionResponse
```json
{
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 14400,
    "guest": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "displayName": "Mesa 5 - Comensal 1",
      "dineSessionId": "880e8400-e29b-41d4-a716-446655440003",
      "tableId": "990e8400-e29b-41d4-a716-446655440004",
      "tableName": "Mesa 5"
    }
  },
  "meta": { "...": "..." }
}
```

> `POST /auth/guest-session` **no crea sesión**. Si la mesa no tiene una `DineSession` OPEN, responde `409 SESSION_NOT_OPEN`.

---

## 2. Sesión y Comensales

### SessionResponse (`GET /sessions/{sessionId}`)
```json
{
  "data": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "tableId": "990e8400-e29b-41d4-a716-446655440004",
    "tableName": "Mesa 5",
    "status": "OPEN",
    "guestCount": 3,
    "openedBy": "550e8400-e29b-41d4-a716-446655440000",
    "startedAt": "2026-09-01T14:30:00Z",
    "endedAt": null,
    "guests": [
      { "id": "770e8400-e29b-41d4-a716-446655440002", "displayName": "Juan", "tempLabel": "Cliente 1", "allergies": ["gluten"] }
    ],
    "activeBillId": "ff0e8400-e29b-41d4-a716-446655440040"
  },
  "meta": { "...": "..." }
}
```

### DineSessionStatusEnum
```
OPEN | CLOSING | CLOSED
```

---

## 3. Menú

### MenuSectionResponse (`GET /menu/sections` → `data: []`)
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Entradas",
      "description": "Para compartir",
      "displayOrder": 1,
      "dishes": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "name": "Empanadas de Pino",
          "description": "Masa casera, pino tradicional.",
          "price": 3500,
          "imageUrl": "https://cdn.labtab.cl/dishes/empanadas.jpg",
          "isAvailable": true,
          "tags": ["tradicional"],
          "allergens": ["gluten", "huevo"],
          "displayOrder": 1
        }
      ]
    }
  ],
  "meta": { "...": "..." }
}
```

### DishResponse
Campos: `id`, `name`, `description`, `price` (BigDecimal), `imageUrl`, `isAvailable`, `tags[]`, `allergens[]`, `displayOrder`.

---

## 4. Pedidos

### CreateOrderRequest (`POST /orders`)
```json
{
  "dineSessionId": "880e8400-e29b-41d4-a716-446655440003",
  "channel": "QR",
  "notes": "Sin cebolla por favor",
  "lines": [
    {
      "dishId": "550e8400-e29b-41d4-a716-446655440010",
      "quantity": 2,
      "unitPrice": 3500,
      "itemNotes": "Extra salsa de ajo",
      "modifiers": [
        { "optionId": "extra-aioli", "name": "Salsa aioli extra", "extraPrice": 800 }
      ],
      "courseType": "ENTRADA",
      "dineGuestId": "770e8400-e29b-41d4-a716-446655440002"
    }
  ]
}
```

> `unitPrice` lo **ignora** el backend (zero-trust): el precio real sale de `dish.price`. `courseType` ∈ `ENTRADA | FONDO | POSTRE`. `channel` ∈ `QR | STAFF | POS`.

### OrderResponse (`data`)
```json
{
  "id": "cc0e8400-e29b-41d4-a716-446655440030",
  "status": "PLACED",
  "subtotal": 7800,
  "total": 7800,
  "itemCount": 2,
  "lines": [
    { "id": "dd0e8400-e29b-41d4-a716-446655440031", "name": "Empanadas de Pino", "quantity": 2, "status": "QUEUED" }
  ],
  "kitchenTicketId": "ee0e8400-e29b-41d4-a716-446655440033"
}
```

### OrderStatusEnum
```
PLACED | ACCEPTED | IN_PREPARATION | READY | SERVED | CANCELLED
```

### OrderLineStatusEnum
```
QUEUED | PREPARING | READY | SERVED | CANCELLED
```

---

## 5. Cuenta

### BillResponse (`data`)
```json
{
  "id": "ff0e8400-e29b-41d4-a716-446655440040",
  "dineSessionId": "880e8400-e29b-41d4-a716-446655440003",
  "status": "OPEN",
  "subtotal": 7800,
  "serviceChargeAmount": 780,
  "tipTotal": 0,
  "totalAmount": 8580,
  "paidTotal": 0,
  "balanceDue": 8580,
  "version": 1
}
```

### BillStatusEnum
```
OPEN | PAID | VOID
```

### BillSummaryByGuestResponse (`GET /bills/{billId}/summary-by-guest` → `data`)
```json
{
  "guests": [
    {
      "guestId": "770e8400-e29b-41d4-a716-446655440002",
      "displayName": "Juan",
      "lines": [
        { "billLineId": "a10e8400-e29b-41d4-a716-446655440041", "name": "Empanadas de Pino x2", "quantity": 2, "lineTotal": 7000, "paidAmount": 0 }
      ],
      "guestTotal": 7000,
      "guestPaid": 0,
      "guestBalance": 7000
    }
  ],
  "sharedLines": []
}
```

> `sharedLines` es un `List<BillLineResponse>` (misma estructura que `lines`).

---

## 6. Pagos

### CreatePaymentRequest (`POST /payments`)
```json
{
  "billId": "ff0e8400-e29b-41d4-a716-446655440040",
  "amount": 7000,
  "tipAmount": 0,
  "totalAmount": 7000,
  "method": "MERCADO_PAGO",
  "provider": "mercadopago",
  "externalTransactionId": "uuid-o-null",
  "currency": "CLP",
  "dineGuestId": "770e8400-e29b-41d4-a716-446655440002"
}
```

> `externalTransactionId` es opcional: si el gateway lo reenvía, el back responde `409` (idempotencia) con el pago original.

### PaymentResponse (`data`)
```json
{
  "id": "b20e8400-e29b-41d4-a716-446655440050",
  "billId": "ff0e8400-e29b-41d4-a716-446655440040",
  "amount": 7000,
  "tipAmount": 0,
  "totalAmount": 7000,
  "method": "MERCADO_PAGO",
  "status": "PENDING",
  "paidAt": null,
  "bill": {
    "id": "ff0e8400-e29b-41d4-a716-446655440040",
    "status": "OPEN",
    "balanceDue": 8580,
    "paidTotal": 0
  }
}
```

### PaymentMethodEnum
```
WEBPAY | MERCADO_PAGO | APPLE_PAY | GOOGLE_PAY | CARD | CASH | TRANSFER
```

> ⚠️ MVP solo usa: `CASH`, `WEBPAY`, `MERCADO_PAGO`, `TRANSFER`.
> No hay integración real con gateway — métodos son solo registro.
> `APPLE_PAY`, `GOOGLE_PAY`, `CARD` no están en la UI.

### PaymentStatusEnum
```
PENDING | COMPLETED | FAILED | REFUNDED
```

---

## 7. Branch / Mesa (referencia)

### DiningTableResponse
`id`, `name`, `zone`, `capacity`, `status`, `qrToken`, `positionX`, `positionY`, `shape`, `activeSessionId`.

### TableStatusEnum
```
AVAILABLE | OCCUPIED | RESERVED | CLEANING
```

---

## 8. S.O.S. y Feedback (referencia — spec, backend pendiente)

> Los DTOs abajo son el **contrato** de `back/api-contracts/rest-api.md`. El backend aún **no expone** estos endpoints (no hay controller). Incluidos como referencia de la app.

### CreateServiceRequestRequest (`POST /service-requests`)
```json
{
  "dineSessionId": "880e8400-e29b-41d4-a716-446655440003",
  "requestType": "WAITER",
  "tableName": "Mesa 5"
}
```

### ServiceRequestResponse (`data`)
```json
{
  "id": "sr-...",
  "requestType": "WAITER",
  "status": "OPEN",
  "tableName": "Mesa 5"
}
```

### ServiceRequestTypeEnum
```
WAITER | BILL | WATER | OTHER
```

### ServiceRequestStatusEnum
```
OPEN | ACCEPTED | RESOLVED
```

### CreateFeedbackRequest (`POST /feedback`)
```json
{
  "dineSessionId": "880e8400-e29b-41d4-a716-446655440003",
  "rating": 5,
  "comment": "Excelente atención"
}
```

### FeedbackResponse (`data`)
```json
{
  "id": "fb-...",
  "rating": 5,
  "comment": "Excelente atención"
}
```

> Errores de feedback: `422` rating fuera de rango 1-5 · `409` ya existe feedback para la sesión.

---

## 9. Enums del Back (referencia rápida)

| Enum | Valores |
|------|---------|
| `CourseTypeEnum` | `ENTRADA` `FONDO` `POSTRE` |
| `ChannelEnum` | `QR` `STAFF` `POS` |
| `OrderStatusEnum` | `PLACED` `ACCEPTED` `IN_PREPARATION` `READY` `SERVED` `CANCELLED` |
| `OrderLineStatusEnum` | `QUEUED` `PREPARING` `READY` `SERVED` `CANCELLED` |
| `DineSessionStatusEnum` | `OPEN` `CLOSING` `CLOSED` |
| `BillStatusEnum` | `OPEN` `PAID` `VOID` |
| `PaymentMethodEnum` | `WEBPAY` `MERCADO_PAGO` `APPLE_PAY` `GOOGLE_PAY` `CARD` `CASH` `TRANSFER` |
| `PaymentStatusEnum` | `PENDING` `COMPLETED` `FAILED` `REFUNDED` |
| `TableStatusEnum` | `AVAILABLE` `OCCUPIED` `RESERVED` `CLEANING` |
| `CourseStatusEnum` | `PENDING` `MARCHING` `DONE` |
| `KitchenTicketStatusEnum` | `OPEN` `IN_PROGRESS` `DONE` `CANCELLED` |
| `ServiceRequestTypeEnum` | `WAITER` `BILL` `WATER` `OTHER` |
| `ServiceRequestStatusEnum` | `OPEN` `ACCEPTED` `RESOLVED` |

---

## 10. Mapeo App → Backend

| App Model | Backend DTO | Notas |
|-----------|-------------|-------|
| `Person` | `PersonAuthResponse` | Dentro de `AuthResponse.person` |
| `BranchOption` | `BranchOptionResponse` | `availableBranches[]` |
| `Guest` | `GuestAuthResponse` | Dentro de `GuestSessionResponse.guest` |
| `Session` | `SessionResponse` | Sesión de mesa |
| `GuestDiner` | `GuestResponse` | Comensal dentro de la sesión |
| `MenuSection` | `MenuSectionResponse` | Sección con `dishes[]` |
| `Dish` | `DishResponse` | Plato |
| `Order` | `OrderResponse` | Pedido con `lines[]` |
| `OrderLine` | `OrderLineResponse` | Línea del pedido |
| `Bill` | `BillResponse` | Cuenta |
| `BillLine` | `BillLineResponse` | Línea de cuenta / compartida |
| `GuestBillSummary` | `GuestBillSummaryResponse` | Split por comensal |
| `Payment` | `PaymentResponse` | Pago (con `bill` anidado) |
| `ServiceRequest` | `ServiceRequestResponse` | S.O.S. (spec, backend pendiente) |
| `Feedback` | `FeedbackResponse` | Feedback post-pago (spec, backend pendiente) |
