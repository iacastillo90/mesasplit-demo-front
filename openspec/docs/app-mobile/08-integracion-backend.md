# 08 - Integración Backend

> Fuente de verdad: `LabTab-Back/src/main/java/cl/labtab/api/controllers/`. Los endpoints listados acá son los que existen en el código.

## Base URL

```
Producción:  https://api.labtab.cl/api/v1
Desarrollo:  http://localhost:8080/api/v1
```

## Envelope de Respuesta

```json
// Éxito
{ "data": { ... }, "meta": { "timestamp": "...", "requestId": "uuid-v4" } }

// Error
{ "error": { "code": "SESSION_NOT_OPEN", "message": "La mesa no tiene una sesión activa", "detail": "..." } }
```

## Headers

```
Authorization: Bearer {accessToken}
Content-Type: application/json
Accept: application/json
```

---

## Endpoints que consume la App (comensal)

### 1. Autenticación

| Método | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/guest-session` | Public | `GuestSessionRequest` |
| POST | `/auth/login` | Public | `LoginRequest` |
| POST | `/auth/refresh` | Public | `RefreshTokenRequest` |
| POST | `/auth/logout` | Auth | `LogoutRequest` |

**POST /auth/guest-session** (la más usada en la app):
```json
// Request
{ "qrToken": "abc123def456ghi789", "displayName": "Juan", "allergies": ["gluten"] }

// Response 201
{
  "data": {
    "accessToken": "eyJ...",
    "expiresIn": 14400,
    "guest": {
      "id": "770e8400-...",
      "displayName": "Juan",
      "dineSessionId": "880e8400-...",
      "tableId": "990e8400-...",
      "tableName": "Mesa 5"
    }
  },
  "meta": { "...": "..." }
}

// Errores
// 404 QR_TOKEN_INVALID -> "Mesa no encontrada"
// 409 SESSION_NOT_OPEN -> "La mesa no tiene una sesión activa"   <-- el comensal NO crea sesión
```

### 2. Menú

| Método | Endpoint | Auth |
|--------|----------|------|
| GET | `/menu/sections` | Todos (GUEST incluido) |
| GET | `/menu/dishes/{dishId}` | Todos |

### 3. Pedidos

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/orders` | GUEST+ |
| GET | `/orders/{orderId}` | Todos |
| GET | `/sessions/{sessionId}/orders` | Todos |
| PATCH | `/order-lines/{lineId}/status` | KITCHEN/STAFF (no GUEST) |

### 4. Cuenta

| Método | Endpoint | Auth |
|--------|----------|------|
| GET | `/sessions/{sessionId}/bill` | Todos |
| GET | `/bills/{billId}` | Todos |
| GET | `/bills/{billId}/summary-by-guest` | Todos |

### 5. Pagos

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/payments` | GUEST+ |
| GET | `/payments/{paymentId}` | STAFF+ (no GUEST) |

### 6. Branch

| Método | Endpoint | Auth |
|--------|----------|------|
| GET | `/branch/config` | Todos |

### 7. S.O.S. y Feedback (spec — backend pendiente)

> ⚠️ Estos endpoints figuran como contrato en `back/api-contracts/rest-api.md` y sus enums existen (`ServiceRequestTypeEnum`, `ServiceRequestStatusEnum`), pero **no hay controller implementado** en `LabTab-Back`. La app se puede construir contra la spec; queda bloqueada en runtime hasta que el back los exponga. Tratar como `pregunta-arquitectura`.

**S.O.S. (`/service-requests`)**

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/service-requests` | GUEST+ |
| PATCH | `/service-requests/{id}/accept` | STAFF+ |
| PATCH | `/service-requests/{id}/resolve` | STAFF+ |

```json
// POST /service-requests
{ "dineSessionId": "uuid-session", "requestType": "WAITER", "tableName": "Mesa 5" }

// Response 201
{ "data": { "id": "uuid-request", "requestType": "WAITER", "status": "OPEN", "tableName": "Mesa 5" }, "meta": { "...": "..." } }

// requestType ∈ WAITER | BILL | WATER | OTHER
```

**Feedback (`/feedback`)**

| Método | Endpoint | Auth |
|--------|----------|------|
| POST | `/feedback` | GUEST+ |
| GET | `/feedback` | MANAGER+ |

```json
// POST /feedback
{ "dineSessionId": "uuid-session", "rating": 5, "comment": "Excelente atención" }

// Response 201
{ "data": { "id": "uuid-feedback", "rating": 5, "comment": "Excelente atención" }, "meta": { "...": "..." } }

// Errores: 422 rating fuera de rango 1-5 · 409 ya existe feedback de la sesión
```

---

## WebSocket (STOMP)

### Conexión

```
Endpoint: wss://api.labtab.cl/ws (SockJS)
Protocolo: STOMP over WebSocket
Auth: JWT en header "Authorization" del frame CONNECT
```

### Topics reales publicados por el backend

| Topic | Eventos |
|-------|---------|
| `/topic/branch/{branchId}/kitchen` | `order.item_added`, `course.fire`, `kds.item_ready`, `kds.stock_86` |
| `/topic/branch/{branchId}/radar` | `table.status_changed` |
| `/topic/branch/{branchId}/pos` | `payment.qr_received` |
| `/topic/branch/{branchId}/alerts` | `alert.fraud` |

### Formato de evento (StompEvent)

```json
{ "event": "kds.item_ready", "payload": { "...": "..." } }
```

### ⚠️ Gap del canal GUEST (crítico para el MVP)

El interceptor de STOMP del backend **bloquea al rol `GUEST` en cualquier topic que empiece por `/topic/branch/`**. Hoy **no existe** un topic de sesión para el comensal.

- La app **no debe** documentar ni consumir `/topic/session/{sessionId}/client` — no existe en el back.
- Hasta resolver esta `pregunta-arquitectura`, la app arranca con **polling** (`GET /sessions/{sessionId}/orders`).
- Opciones a acordar con el back: (a) agregar topic por sesión + autorización GUEST, o (b) mantener polling en MVP.

---

## Manejo de Errores

| Código | Significado | Acción en App |
|--------|-------------|---------------|
| 200 / 201 | Éxito | Procesar `data` |
| 400 | Datos inválidos | Mostrar validación |
| 401 | Token ausente/expirado | Refresh o re-login |
| 403 | Rol sin permiso | "No tenés permiso" |
| 404 | No encontrado | "No encontrado" |
| 409 | Conflicto (lock optimista / idempotencia / sesión cerrada) | No reintentar automáticamente; mostrar estado |
| 422 | Regla de negocio (Lista 86, PIN, monto inválido) | Mostrar mensaje de negocio |
| 429 | Rate limit | Esperar y reintentar |
| 500 | Error interno | Error genérico |

### Interceptor (dio)

```dart
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final statusCode = err.response?.statusCode;
    switch (statusCode) {
      case 401:
        _refreshAndRetry(err.requestOptions, handler);
        break;
      case 409:
        // Lock optimista o idempotencia: NO reintentar, mostrar estado real
        handler.reject(ConflictException(err.response?.data?['error']?['message'] ?? 'Conflicto'));
        break;
      case 429:
        _scheduleRetry(err.requestOptions, handler);
        break;
      default:
        handler.reject(ApiException(err.response?.data?['error']?['message'] ?? 'Error', statusCode));
    }
  }
}
```

---

## Flujo de Auto-Refresh Token

```
1. App detecta 401 en cualquier request
2. POST /auth/refresh con el refreshToken
3. Si refresh exitoso (rota el refresh):
   a. Guardar accessToken + refreshToken nuevos
   b. Reintentar el request original
4. Si refresh falla (expirado/revocado):
   a. Borrar tokens
   b. Redirigir a Login/QR
```
