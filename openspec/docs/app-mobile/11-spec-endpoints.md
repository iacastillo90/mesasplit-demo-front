# 11 - Spec Endpoints (por Feature)

> Cada pantalla consume el envelope `{ data, meta }` y deserializa `data`. Los errores vienen como `{ error: { code, message, detail } }`.

---

## Feature: QR Onboarding

### Pantalla: QrScannerScreen

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/auth/guest-session` | `GuestSessionRequest` | 201 → `GuestSessionResponse` | 404 `QR_TOKEN_INVALID` · 409 `SESSION_NOT_OPEN` |

**States**:
```
idle -> scanning -> processing -> success -> navigate(Home)
                          \-> error -> showing_error -> scanning
```

**Widgets**: `QrScannerWidget`, `LoadingOverlay`, `ErrorSnackBar`.

> Caso 409 `SESSION_NOT_OPEN`: mensaje "La mesa aún no está habilitada, avisá al mesero" (no intentar crear sesión).

---

## Feature: Login

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/auth/login` | `LoginRequest` | 201 → `AuthResponse` | 401 "Credenciales inválidas" |

**Validations**: email requerido; password requerido.

---

## Feature: Ver Menú

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | GET | `/menu/sections` | - | 200 → `data: List<MenuSectionResponse>` | 500 "Error cargando menú" |

**Cache**: TTL 5 min, stale-while-revalidate, key `menu_{branchId}`.

---

## Feature: Hacer Pedido

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/orders` | `CreateOrderRequest` | 201 → `OrderResponse` | 404 sesión · 422 plato no disponible / sesión cerrada |

**Local state (carrito)**:
```dart
class CartItem {
  final Dish dish;
  int quantity;
  String? itemNotes;
  List<ModifierOption> modifiers;
  CourseType courseType;
}
```

**Envío**:
```
1. Serializar cartItems -> CreateOrderRequest (channel: "QR")
2. POST /orders
3. 201 -> limpiar carrito, navegar a OrderScreen
4. 422 -> mostrar mensaje de negocio (Lista 86 / sesión cerrada)
```

---

## Feature: Seguir Estado del Pedido

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | GET | `/sessions/{sessionId}/orders` | - | 200 → `data: List<OrderResponse>` | - |

> **Polling** como mecanismo base (cada 5-10s) mientras no se resuelva el canal STOMP del GUEST (ver 08).

---

## Feature: Ver Cuenta

| Paso | Método | Endpoint | Body | Success |
|------|--------|----------|------|---------|
| 1 | GET | `/sessions/{sessionId}/bill` | - | 200 → `BillResponse` |
| 2 | GET | `/bills/{billId}/summary-by-guest` | - | 200 → `BillSummaryByGuestResponse` |

---

## Feature: Pagar lo suyo

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/payments` | `CreatePaymentRequest` | 201 → `PaymentResponse` | 409 idempotencia/lock · 422 monto > saldo |
| 2 | GET | `/payments/{paymentId}` | - | 200 → `PaymentResponse` (COMPLETED) | - |

**Flujo por método**:

```
MERCADO_PAGO (MVP):
1. POST /payments { method: MERCADO_PAGO, provider: "mercadopago", amount, billId, dineGuestId }
2. Response: PaymentResponse { id, status: PENDING, bill }
3. Abrir checkout MP en WebView
4. GET /payments/{paymentId} para verificar (poll 2s, máx 30s)

WEBPAY (al escalar):
1. POST /payments { method: WEBPAY, provider: "transbank", ... }
2. Response: PaymentResponse { id, status: PENDING }
3. Abrir WebView de Transbank
4. GET /payments/{paymentId} para verificar
```

> No existe `/payments/confirm`. La confirmación la hace el backend (webhook del gateway).

---

## Feature: Perfil

| Paso | Método | Endpoint | Body | Success |
|------|--------|----------|------|---------|
| 1 | (login) | `/auth/login` | - | `AuthResponse.person` |

**MVP**: mostrar datos de `person` (nombre, email, avatar). **Post-MVP**: edición con API dedicada (no existe aún).

---

## Feature: S.O.S. — Llamar al mesero

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/service-requests` | `{ dineSessionId, requestType, tableName }` | 201 → `data: ServiceRequestResponse` | 4xx |

**States**:
```
idle -> sending -> success (confirmación "mesero avisado")
                \-> error -> mostrar error, permitir reintentar
```

**Botones**: mesero (`WAITER`), cuenta (`BILL`), agua (`WATER`), otro (`OTHER`).

> ⚠️ Endpoint **pendiente de implementación en el backend** (solo spec en `rest-api.md`). La pantalla se construye contra la spec y queda bloqueada en runtime.

---

## Feature: Feedback Post-Pago

| Paso | Método | Endpoint | Body | Success | Error |
|------|--------|----------|------|---------|-------|
| 1 | POST | `/feedback` | `{ dineSessionId, rating, comment }` | 201 → `data: FeedbackResponse` | 422 rating inválido · 409 ya enviado |

**States**:
```
pago exitoso -> mostrar modal 1-5 -> enviar -> confirmación -> cerrar
                                      \-> omitir (dismiss)
```

**Reglas**: una calificación por sesión (409 si se repite); rating 1-5; comentario opcional.

> ⚠️ Endpoint **pendiente de implementación en el backend** (solo spec en `rest-api.md`).
