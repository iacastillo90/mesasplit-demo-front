# Contratos de API REST — LabTab Backend

**Versión**: 1.0  
**Stack**: Java 21 + Spring Boot 3.3.x  
**Base URL**: `https://api.labtab.cl/api/v1`  
**Formato**: JSON (`Content-Type: application/json`) en todos los endpoints  
**Autenticación**: `Authorization: Bearer <access_token>` (JWT) en todos los endpoints salvo los marcados como `[PUBLIC]`

---

## Convenciones Generales

### Estructura de respuesta exitosa
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T20:30:00Z",
    "requestId": "uuid-v4"
  }
}
```

### Estructura de error estándar
```json
{
  "error": {
    "code": "BILL_ALREADY_PAID",
    "message": "La cuenta ya fue pagada.",
    "detail": "BILL id=abc123 tiene status=paid.",
    "timestamp": "2025-01-15T20:30:00Z"
  }
}
```

### Códigos de error HTTP usados
| Código | Significado en LabTab |
|:---|:---|
| `200 OK` | Operación exitosa (GET, PATCH) |
| `201 Created` | Recurso creado exitosamente (POST) |
| `400 Bad Request` | Datos de entrada inválidos o faltantes |
| `401 Unauthorized` | Token JWT ausente, expirado o inválido |
| `403 Forbidden` | Rol sin permiso para esta operación |
| `404 Not Found` | Recurso no encontrado (en el `branchId` del JWT) |
| `409 Conflict` | Conflicto de estado (cuenta ya pagada, pago duplicado, lock optimista) |
| `422 Unprocessable Entity` | Regla de negocio violada (stock agotado, PIN incorrecto) |
| `500 Internal Server Error` | Error inesperado del servidor |

### Aislamiento por `branchId`
Todos los endpoints con `[BRANCH]` filtran automáticamente por el `branchId` incluido en el JWT.
Un usuario no puede acceder a recursos de otra sucursal aunque conozca su ID.

---

## Grupo 1 — Autenticación (`/auth`)

### `POST /auth/login` `[PUBLIC]`
Autentica a un empleado (staff, kitchen, manager, owner) con email y contraseña.

**Request:**
```json
{
  "email": "rodrigo@labtab.cl",
  "password": "SuperSecreta123"
}
```

**Response `201`:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 14400,
    "person": {
      "id": "uuid",
      "email": "rodrigo@labtab.cl",
      "fullName": "Rodrigo Silva",
      "role": "STAFF",
      "branchId": "uuid-branch",
      "avatarUrl": "https://cdn.labtab.cl/avatars/rodrigo.jpg"
    }
  }
}
```

**Errores:** `400` campos faltantes · `401` credenciales inválidas · `403` cuenta inactiva

---

### `POST /auth/refresh` `[PUBLIC]`
Renueva el access token usando el refresh token.

**Request:**
```json
{ "refreshToken": "eyJhbGciOiJIUzI1NiJ9..." }
```

**Response `200`:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 14400
  }
}
```

**Errores:** `401` refresh token expirado o inválido

---

### `POST /auth/logout`
Invalida el refresh token del usuario en sesión.

**Response `200`:** `{ "data": { "message": "Sesión cerrada." } }`

---

### `POST /auth/guest-session` `[PUBLIC]` `[BRANCH]`
Onboarding de comensal vía QR. Crea un `DINE_GUEST` anónimo y devuelve JWT de rol `GUEST`.

**Request:**
```json
{
  "qrToken": "tok_abc123xyz",
  "displayName": "Ignacio",
  "allergies": ["maní", "gluten"]
}
```

**Response `201`:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "expiresIn": 14400,
    "guest": {
      "id": "uuid-guest",
      "displayName": "Ignacio",
      "dineSessionId": "uuid-session",
      "tableId": "uuid-table",
      "tableName": "Mesa 4"
    }
  }
}
```

**Errores:** `404` qrToken no existe · `409` la mesa no tiene sesión abierta · `422` sesión cerrada

---

## Grupo 2 — Sesiones de Mesa (`/sessions`) `[BRANCH]`

### `POST /sessions`
Abre una nueva sesión en una mesa. Solo STAFF, MANAGER, OWNER.

**Request:**
```json
{
  "tableId": "uuid-table",
  "guestCount": 4
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-session",
    "tableId": "uuid-table",
    "tableName": "Mesa 4",
    "status": "OPEN",
    "guestCount": 4,
    "openedBy": "uuid-person",
    "startedAt": "2025-01-15T20:00:00Z"
  }
}
```

**Errores:** `404` mesa no encontrada · `409` la mesa ya tiene una sesión abierta

---

### `GET /sessions/{sessionId}`
Obtiene el estado completo de una sesión (guests, órdenes, bill).

**Roles:** Todos

**Response `200`:**
```json
{
  "data": {
    "id": "uuid-session",
    "tableId": "uuid-table",
    "tableName": "Mesa 4",
    "status": "OPEN",
    "guestCount": 4,
    "startedAt": "2025-01-15T20:00:00Z",
    "guests": [
      { "id": "uuid-guest-1", "displayName": "Ana", "allergies": [] },
      { "id": "uuid-guest-2", "displayName": "Pedro", "allergies": ["maní"] }
    ],
    "activeBillId": "uuid-bill"
  }
}
```

**Errores:** `404` sesión no encontrada

---

### `PATCH /sessions/{sessionId}/status`
Cierra una sesión. Solo MANAGER, OWNER.

**Request:**
```json
{ "status": "CLOSED" }
```

**Response `200`:** Objeto sesión actualizado.

**Errores:** `409` la sesión tiene bill con balance pendiente

---

### `POST /sessions/{sessionId}/guests`
Agrega un comensal identificado a una sesión existente.

**Request:**
```json
{
  "personId": "uuid-person",
  "displayName": "María"
}
```

**Response `201`:** Objeto `DINE_GUEST` creado.

---

## Grupo 3 — Menú (`/menu`) `[BRANCH]`

### `GET /menu/sections`
Lista todas las secciones del menú con sus platos.

**Roles:** Todos (GUEST incluido)

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-section",
      "name": "Entradas",
      "displayOrder": 1,
      "dishes": [
        {
          "id": "uuid-dish",
          "name": "Empanadas de Pino",
          "description": "Masa casera, pino tradicional.",
          "price": 3500,
          "imageUrl": "https://cdn.labtab.cl/dishes/empanadas.jpg",
          "isAvailable": true,
          "tags": ["vegetariano"],
          "allergens": ["gluten", "huevo"],
          "displayOrder": 1
        }
      ]
    }
  ]
}
```

---

### `GET /menu/dishes/{dishId}`
Detalle de un plato con alérgenos completos.

**Response `200`:** Objeto plato con campo `allergens[]` completo.

---

### `PATCH /menu/dishes/{dishId}/availability`
Declara quiebre de stock (Lista 86). Solo KITCHEN, STAFF, MANAGER.

**Request:**
```json
{
  "isAvailable": false,
  "remainingUnits": 0
}
```

**Response `200`:** Objeto plato actualizado. Emite evento WebSocket `kds.stock_86`.

---

### `POST /menu/sections` · `PATCH /menu/sections/{id}` · `DELETE /menu/sections/{id}`
Gestión de secciones. Solo MANAGER, OWNER.

### `POST /menu/dishes` · `PATCH /menu/dishes/{id}` · `DELETE /menu/dishes/{id}`
Gestión de platos. Solo MANAGER, OWNER.

---

## Grupo 4 — Órdenes (`/orders`) `[BRANCH]`

### `POST /orders`
Crea una nueva orden (comanda) en una sesión. STAFF, GUEST, MANAGER.

**Request:**
```json
{
  "dineSessionId": "uuid-session",
  "channel": "QR",
  "notes": "Sin cebolla en la mesa",
  "lines": [
    {
      "dishId": "uuid-dish",
      "quantity": 2,
      "unitPrice": 8900,
      "itemNotes": "Término medio",
      "modifiers": [
        { "optionId": "mod-01", "name": "Sin Cebolla", "extraPrice": 0 }
      ],
      "courseType": "ENTRADA",
      "dineGuestId": "uuid-guest-1"
    }
  ]
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-order",
    "status": "PLACED",
    "subtotal": 17800,
    "total": 17800,
    "itemCount": 2,
    "lines": [
      { "id": "uuid-line", "name": "Lomo Vetado", "quantity": 2, "status": "QUEUED" }
    ],
    "kitchenTicketId": "uuid-ticket"
  }
}
```

**Errores:** `404` sesión no encontrada · `422` plato no disponible (Lista 86) · `422` sesión cerrada

---

### `GET /orders/{orderId}`
Detalle completo de una orden con sus líneas.

**Roles:** Todos

---

### `GET /sessions/{sessionId}/orders`
Lista todas las órdenes de una sesión.

**Roles:** Todos

---

### `PATCH /order-lines/{lineId}/status`
Actualiza el estado de una línea de orden. Solo KITCHEN, STAFF, MANAGER.

**Request:**
```json
{ "status": "READY" }
```

**Valores válidos de status:** `QUEUED` → `PREPARING` → `READY` → `SERVED` → `CANCELLED`

**Response `200`:** Objeto línea actualizado. Emite `kds.item_ready` si `status = ready`.

---

### `DELETE /order-lines/{lineId}` — Anulación con PIN
Anula una línea. Si ya fue enviada a cocina, requiere PIN del MANAGER.

**Request:**
```json
{
  "reason": "Cortesía",
  "managerPin": "1234"
}
```

**Razones válidas (lista cerrada):** `Cortesía` · `Cliente insatisfecho` · `Error de carga` · `Deterioro insumo`

**Response `200`:** `{ "data": { "voided": true, "exceptionLogId": "uuid-log" } }`

**Errores:** `422` PIN incorrecto · `422` motivo no está en la lista cerrada · `403` rol sin permiso

> **Nota**: Esta operación es persistida inline por `ExceptionLogService.createLog(...)`
> y genera un registro en `EXCEPTION_LOG`. Emite evento WebSocket `alert.fraud`.

---

### `POST /orders/{orderId}/fire-course`
Dispara el marchar de un curso de platos (Course Control). Solo STAFF, MANAGER.

**Request:**
```json
{ "courseType": "FONDO" }
```

**Response `200`:** `{ "data": { "fired": true } }`. Emite evento STOMP `course.fire`.

---

## Grupo 5 — Cocina / KDS (`/kitchen`) `[BRANCH]`

### `GET /kitchen/tickets`
Lista todos los tickets activos, filtrados opcionalmente por estación.

**Roles:** KITCHEN, STAFF, MANAGER, OWNER

**Query params:** `?station=parrilla` · `?status=OPEN,IN_PROGRESS`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-ticket",
      "orderId": "uuid-order",
      "tableName": "Mesa 4",
      "status": "OPEN",
      "priority": "normal",
      "itemsSummary": "2x Lomo Vetado, 1x Empanadas",
      "startedAt": "2025-01-15T20:05:00Z",
      "elapsedSeconds": 300,
      "lines": [
        {
          "orderLineId": "uuid-line",
          "name": "Lomo Vetado",
          "quantity": 2,
          "modifiers": ["Término Medio"],
          "allergyFlags": [],
          "courseStatus": "MARCHING",
          "status": "PREPARING"
        }
      ]
    }
  ]
}
```

---

### `PATCH /kitchen/tickets/{ticketId}/status`
Actualiza el estado de un ticket. Solo KITCHEN, MANAGER.

**Request:**
```json
{ "status": "DONE" }
```

**Valores válidos:** `OPEN` → `IN_PROGRESS` → `DONE` → `CANCELLED`

**Response `200`:** Ticket actualizado. Si `status = done`, emite `kds.item_ready` para cada línea.

---

### `POST /kitchen/tickets/{ticketId}/recall`
Recupera un ticket marcado como `done` por error. Solo KITCHEN, MANAGER.

**Response `200`:** `{ "data": { "recalled": true, "ticket": { ... } } }`

---

## Grupo 6 — Cuentas (`/bills`) `[BRANCH]`

### `POST /bills`
Crea una cuenta (bill) para una sesión. Solo STAFF, MANAGER.

**Request:**
```json
{
  "dineSessionId": "uuid-session",
  "serviceChargePct": 10
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-bill",
    "dineSessionId": "uuid-session",
    "status": "OPEN",
    "subtotal": 35600,
    "serviceChargeAmount": 3560,
    "tipTotal": 0,
    "totalAmount": 39160,
    "paidTotal": 0,
    "balanceDue": 39160,
    "version": 1
  }
}
```

---

### `GET /bills/{billId}`
Detalle completo de la cuenta con líneas, pagos y estado.

**Roles:** Todos

---

### `GET /sessions/{sessionId}/bill`
Obtiene la cuenta activa de una sesión.

---

### `GET /bills/{billId}/summary-by-guest`
Vista de la cuenta dividida por comensal. Clave para el flujo de división por ítem.

**Response `200`:**
```json
{
  "data": {
    "guests": [
      {
        "guestId": "uuid-guest-1",
        "displayName": "Ana",
        "lines": [
          {
            "billLineId": "uuid-bline",
            "name": "Lomo Vetado",
            "quantity": 1,
            "lineTotal": 8900,
            "paidAmount": 0
          }
        ],
        "guestTotal": 8900,
        "guestPaid": 0,
        "guestBalance": 8900
      }
    ],
    "sharedLines": []
  }
}
```

---

### `PATCH /bills/{billId}/apply-discount`
Aplica un descuento a la cuenta. Requiere PIN del MANAGER.

**Request:**
```json
{
  "discountAmount": 5000,
  "reason": "Cliente insatisfecho",
  "managerPin": "1234"
}
```

**Response `200`:** Bill actualizado con `discountAmount` reflejado. Genera registro en `EXCEPTION_LOG`.

**Errores:** `422` PIN incorrecto · `422` descuento mayor al subtotal

---

## Grupo 7 — Pagos (`/payments`) `[BRANCH]`

### `POST /payments`
Registra un pago sobre una cuenta. Soporta pagos parciales (división).

**Request:**
```json
{
  "billId": "uuid-bill",
  "amount": 19580,
  "tipAmount": 1958,
  "totalAmount": 21538,
  "method": "WEBPAY",
  "provider": "transbank",
  "externalTransactionId": "TB-20250115-9921",
  "currency": "CLP",
  "dineGuestId": "uuid-guest-1"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-payment",
    "billId": "uuid-bill",
    "amount": 19580,
    "tipAmount": 1958,
    "totalAmount": 21538,
    "method": "WEBPAY",
    "status": "COMPLETED",
    "paidAt": "2025-01-15T21:00:00Z",
    "bill": {
      "paidTotal": 21538,
      "balanceDue": 17622,
      "status": "OPEN"
    }
  }
}
```

**Errores:**
- `409` `externalTransactionId` ya existe (idempotencia) — devuelve el pago original en `error.data`
- `409` conflicto de versión en BILL (lock optimista — reintentar con GET actualizado)
- `422` monto mayor al balance due

> **Nota de idempotencia**: Si el gateway reenvía el webhook con el mismo `externalTransactionId`,
> el servidor devuelve `409 Conflict` con `error.data.existingPayment`. El frontend debe mostrar
> el estado ya procesado, nunca reintentar automáticamente.

---

### `POST /payments/webhook/{provider}` `[PUBLIC]`
Endpoint para recibir notificaciones de pago de gateways externos (Webpay, MercadoPago).

**Path params:** `provider = transbank | mercadopago`

**Response `200`:** `{ "received": true }`

> **Nota de seguridad**: Este endpoint valida la firma/HMAC del provider antes de procesar.
> No está bajo JWT pero sí bajo validación de firma del gateway.

---

### `GET /payments/{paymentId}`
Detalle de un pago.

**Roles:** STAFF, MANAGER, OWNER, SUPERADMIN

---

### `POST /payments/{paymentId}/refund`
Inicia un reembolso. Solo MANAGER, OWNER. Requiere PIN.

**Request:**
```json
{
  "reason": "Cliente insatisfecho",
  "managerPin": "1234"
}
```

**Response `200`:** `{ "data": { "refunded": true, "refundAmount": 21538 } }`

---

### `GET /payment-methods`
Lista los métodos de pago guardados de la persona autenticada (pago en un clic). No devuelve el `token`.

**Roles:** Cualquier rol autenticado excepto GUEST

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-pm",
      "provider": "WEBPAY",
      "brand": "VISA",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2027,
      "walletId": null,
      "isDefault": true
    }
  ]
}
```

> **Nota**: Los métodos de pago se crean como efecto secundario de `POST /payments`, cuando el
> cliente opta por guardar el método (se almacena el token del gateway, nunca el PAN). No existe
> un endpoint de creación manual: solo listado y eliminación.

---

### `DELETE /payment-methods/{id}`
Elimina un método de pago guardado propio.

**Roles:** Cualquier rol autenticado excepto GUEST

**Response `200`:** `{ "data": { "deleted": true } }`

**Errores:** `404` método no encontrado o no pertenece a la persona

---

## Grupo 8 — Documentos Tributarios (`/tax-documents`) `[BRANCH]`

### `POST /tax-documents`
Emite un DTE (boleta o factura) asociado a una cuenta pagada.

**Request para boleta:**
```json
{
  "billId": "uuid-bill",
  "type": "BOLETA"
}
```

**Request para factura:**
```json
{
  "billId": "uuid-bill",
  "type": "FACTURA",
  "buyerRut": "76.543.210-9",
  "buyerBusinessName": "Restaurantes Del Sur SpA"
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-dte",
    "type": "BOLETA",
    "folioNumber": 4521,
    "siiStatus": "ISSUED",
    "pdfUrl": "https://cdn.labtab.cl/dte/boleta-4521.pdf",
    "issuedAt": "2025-01-15T21:05:00Z"
  }
}
```

**Errores:** `422` el bill no está pagado · `422` no hay folios CAF disponibles · `409` ya existe DTE para este bill

> **Modo Contingencia SII**: Si el SII no responde en el momento de la emisión, `siiStatus = contingency`
> y el DTE queda encolado para reintentar. El endpoint devuelve `201` igualmente para no bloquear la caja.

---

### `GET /tax-documents/{dteId}`
Detalle de un DTE.

### `GET /bills/{billId}/tax-document`
DTE de una cuenta específica.

---

## Grupo 9 — Solicitudes de Servicio S.O.S. (`/service-requests`) `[BRANCH]`

### `POST /service-requests`
Levanta un llamado S.O.S. desde la mesa del cliente. Rol GUEST o STAFF.

**Request:**
```json
{
  "dineSessionId": "uuid-session",
  "requestType": "WAITER",
  "tableName": "Mesa 4"
}
```

**Tipos válidos:** `WAITER` · `BILL` · `WATER` · `OTHER`

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-request",
    "requestType": "WAITER",
    "status": "OPEN",
    "tableName": "Mesa 4"
  }
}
```

Emite evento WebSocket `call.waiter`.

---

### `PATCH /service-requests/{requestId}/accept`
El mozo acepta la solicitud. Solo STAFF, MANAGER.

**Response `200`:** `{ "data": { "status": "ACCEPTED", "acceptedBy": "uuid-person", "acceptedAt": "..." } }`

---

### `PATCH /service-requests/{requestId}/resolve`
Marca la solicitud como resuelta.

**Response `200`:** `{ "data": { "status": "RESOLVED", "resolvedAt": "..." } }`

---

## Grupo 10 — Feedback (`/feedback`) `[BRANCH]`

### `POST /feedback`
Envía calificación post-pago. Rol GUEST o STAFF.

**Request:**
```json
{
  "dineSessionId": "uuid-session",
  "rating": 5,
  "comment": "Excelente atención, volvemos pronto."
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid-feedback",
    "rating": 5,
    "comment": "Excelente atención..."
  }
}
```

**Errores:** `422` rating fuera de rango 1-5 · `409` ya existe feedback para esta sesión

---

### `GET /feedback`
Lista feedback de la sucursal. Solo MANAGER, OWNER, SUPERADMIN.

**Query params:** `?from=2025-01-01&to=2025-01-31` · `?minRating=1&maxRating=2`

---

## Grupo 11 — Reservas (`/reservations`) `[BRANCH]`

### `POST /reservations`
Crea una reserva. STAFF, MANAGER, OWNER.

**Request:**
```json
{
  "personId": "uuid-person",
  "guestName": "Carlos Fuentes",
  "guestEmail": "carlos@mail.com",
  "guestPhone": "+56912345678",
  "partySize": 4,
  "reservationDate": "2025-02-01",
  "reservationTime": "20:00",
  "notes": "Cumpleaños, mesa cerca de la ventana",
  "dineTableId": null
}
```

**Response `201`:** Objeto `RESERVATION` con `status = confirmed`.

---

### `GET /reservations`
Lista reservas de la sucursal. Solo STAFF, MANAGER, OWNER.

**Query params:** `?date=2025-02-01` · `?status=CONFIRMED`

---

### `PATCH /reservations/{reservationId}/status`
Actualiza estado de una reserva. Solo STAFF, MANAGER.

**Request:**
```json
{ "status": "COMPLETED" }
```

**Valores válidos:** `CONFIRMED` · `WAITLISTED` · `CANCELLED` · `COMPLETED` · `NO_SHOW`

---

## Grupo 12 — Stock e Inventario (`/stock`) `[BRANCH]`

### `GET /stock`
Lista todos los insumos con stock actual. Solo KITCHEN, MANAGER, OWNER.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-stock",
      "name": "Carne Lomo",
      "stockQuantity": 12.5,
      "unit": "gramos"
    }
  ]
}
```

---

### `PATCH /stock/{stockItemId}/quantity`
Registra merma o ajuste de stock. Solo KITCHEN, MANAGER.

**Request:**
```json
{
  "adjustment": -3.0,
  "reason": "Deterioro insumo",
  "unit": "kilos"
}
```

**Response `200`:** Stock item actualizado.

---

## Grupo 13 — Configuración de Sucursal (`/branch`) `[BRANCH]`

### `GET /branch/config`
Configuración general de la sucursal.

**Roles:** Todos

**Response `200`:**
```json
{
  "data": {
    "id": "uuid-branch",
    "name": "LabTab Vitacura",
    "serviceChargePct": 10,
    "timezone": "America/Santiago",
    "openingHours": {
      "monday": { "open": "12:00", "close": "23:00" }
    }
  }
}
```

---

### `GET /branch/floors`
Lista pisos con zonas y mesas. Solo STAFF, MANAGER, OWNER.

**Response `200`:** Array de `DINING_FLOOR` con `zones[]` y `tables[]`.

---

### `GET /branch/tables`
Lista todas las mesas con su estado actual. Solo STAFF, MANAGER, OWNER.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-table",
      "name": "Mesa 4",
      "zone": "Salón",
      "capacity": 4,
      "status": "OCCUPIED",
      "qrToken": "tok_abc123xyz",
      "positionX": 100,
      "positionY": 200,
      "shape": "rect",
      "activeSessionId": "uuid-session"
    }
  ]
}
```

---

### `PATCH /branch/tables/{tableId}/status`
Actualiza el estado de una mesa. Solo STAFF, MANAGER.

**Request:**
```json
{ "status": "CLEANING" }
```

**Valores válidos:** `AVAILABLE` · `OCCUPIED` · `RESERVED` · `CLEANING`

---

## Grupo 14 — Auditoría y Excepciones (`/exceptions`) `[BRANCH]`

### `GET /exceptions`
Feed de Excepciones del Local Admin. Solo MANAGER, OWNER, SUPERADMIN.

**Query params:** `?from=2025-01-15T00:00:00Z&to=2025-01-15T23:59:59Z` · `?eventType=ITEM_VOID_AFTER_KITCHEN`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid-log",
      "eventType": "ITEM_VOID_AFTER_KITCHEN",
      "reason": "Cortesía",
      "amount": 8900,
      "personName": "Rodrigo Silva",
      "authorizedByName": "Carmen López",
      "orderId": "uuid-order",
      "orderLineName": "Lomo Vetado x2",
      "createdAt": "2025-01-15T21:10:00Z"
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## Grupo 15 — Favoritos (`/favorites`)

### `POST /favorites`
Marca una sucursal como favorita para la persona autenticada.

**Roles:** Cualquier rol autenticado excepto GUEST

**Request:**
```json
{
  "branchId": "uuid-branch"
}
```

**Response `201`:** Objeto `FAVORITE` creado.

**Errores:** `409` la sucursal ya está en favoritos

---

### `GET /favorites`
Lista las sucursales favoritas de la persona autenticada (resumen de sucursal).

**Roles:** Cualquier rol autenticado excepto GUEST

**Response `200`:** Array de resúmenes de sucursal.

---

### `DELETE /favorites/{branchId}`
Elimina la sucursal de favoritos de la persona autenticada.

**Roles:** Cualquier rol autenticado excepto GUEST

**Response `200`:** `{ "data": { "deleted": true } }`

**Errores:** `404` la sucursal no está en favoritos

---

## Referencia Rápida — Todos los Endpoints

| Método | Ruta | Roles mínimos |
|:---|:---|:---|
| `POST` | `/auth/login` | PUBLIC |
| `POST` | `/auth/refresh` | PUBLIC |
| `POST` | `/auth/logout` | Autenticado |
| `POST` | `/auth/guest-session` | PUBLIC |
| `POST` | `/sessions` | STAFF+ |
| `GET` | `/sessions/{id}` | Todos |
| `PATCH` | `/sessions/{id}/status` | MANAGER+ |
| `POST` | `/sessions/{id}/guests` | STAFF+ |
| `GET` | `/menu/sections` | Todos |
| `GET` | `/menu/dishes/{id}` | Todos |
| `PATCH` | `/menu/dishes/{id}/availability` | KITCHEN+ |
| `POST` | `/menu/sections` | MANAGER+ |
| `POST` | `/menu/dishes` | MANAGER+ |
| `POST` | `/orders` | GUEST+ |
| `GET` | `/orders/{id}` | Todos |
| `GET` | `/sessions/{id}/orders` | Todos |
| `PATCH` | `/order-lines/{id}/status` | KITCHEN+ |
| `DELETE` | `/order-lines/{id}` | STAFF+ + PIN |
| `POST` | `/orders/{id}/fire-course` | STAFF+ |
| `GET` | `/kitchen/tickets` | KITCHEN+ |
| `PATCH` | `/kitchen/tickets/{id}/status` | KITCHEN+ |
| `POST` | `/kitchen/tickets/{id}/recall` | KITCHEN+ |
| `POST` | `/bills` | STAFF+ |
| `GET` | `/bills/{id}` | Todos |
| `GET` | `/sessions/{id}/bill` | Todos |
| `GET` | `/bills/{id}/summary-by-guest` | Todos |
| `PATCH` | `/bills/{id}/apply-discount` | MANAGER+ + PIN |
| `POST` | `/payments` | STAFF+ / GUEST |
| `POST` | `/payments/webhook/{provider}` | PUBLIC + firma |
| `GET` | `/payments/{id}` | STAFF+ |
| `POST` | `/payments/{id}/refund` | MANAGER+ + PIN |
| `GET` | `/payment-methods` | Autenticado (no GUEST) |
| `DELETE` | `/payment-methods/{id}` | Autenticado (no GUEST) |
| `POST` | `/tax-documents` | STAFF+ |
| `GET` | `/tax-documents/{id}` | STAFF+ |
| `GET` | `/bills/{id}/tax-document` | STAFF+ |
| `POST` | `/service-requests` | GUEST+ |
| `PATCH` | `/service-requests/{id}/accept` | STAFF+ |
| `PATCH` | `/service-requests/{id}/resolve` | STAFF+ |
| `POST` | `/feedback` | GUEST+ |
| `GET` | `/feedback` | MANAGER+ |
| `POST` | `/reservations` | STAFF+ |
| `GET` | `/reservations` | STAFF+ |
| `PATCH` | `/reservations/{id}/status` | STAFF+ |
| `GET` | `/stock` | KITCHEN+ |
| `PATCH` | `/stock/{id}/quantity` | KITCHEN+ |
| `GET` | `/branch/config` | Todos |
| `GET` | `/branch/floors` | STAFF+ |
| `GET` | `/branch/tables` | STAFF+ |
| `PATCH` | `/branch/tables/{id}/status` | STAFF+ |
| `GET` | `/exceptions` | MANAGER+ |
| `POST` | `/favorites` | Autenticado (no GUEST) |
| `GET` | `/favorites` | Autenticado (no GUEST) |
| `DELETE` | `/favorites/{branchId}` | Autenticado (no GUEST) |
