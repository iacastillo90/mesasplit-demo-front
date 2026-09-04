# Plan de Integración Backend ↔ App Mobile

## Overview
Plan para conectar la app Flutter con el backend Spring Boot de LabTab.

## Endpoints del Backend

### Auth
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/guest-session` | PUBLIC+BRANCH | Unirse a mesa vía QR |
| POST | `/api/v1/auth/login` | PUBLIC | Login staff |
| POST | `/api/v1/auth/refresh` | PUBLIC | Refrescar JWT |
| POST | `/api/v1/auth/logout` | AUTH | Cerrar sesión |

### Menú
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/v1/menu/sections` | GUEST/STAFF | Secciones del menú |
| GET | `/api/v1/menu/dishes/{dishId}` | GUEST/STAFF | Detalle de plato |

### Pedidos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/v1/orders` | GUEST/STAFF | Crear pedido |
| GET | `/api/v1/sessions/{sessionId}/orders` | GUEST/STAFF | Pedidos de sesión |

### Cuenta
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/v1/sessions/{sessionId}/bill` | GUEST/STAFF | Cuenta de sesión |
| GET | `/api/v1/bills/{billId}` | GUEST/STAFF | Detalle de cuenta |
| GET | `/api/v1/bills/{billId}/summary-by-guest` | GUEST/STAFF | Split por comensal |

### Pagos
| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/v1/payments` | GUEST/STAFF | Registrar pago |
| GET | `/api/v1/payments/{paymentId}` | GUEST/STAFF | Detalle de pago |

## Envelope de Respuesta

### Éxito
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-01T00:00:00Z",
    "requestId": "abc-123"
  }
}
```

### Error
```json
{
  "error": {
    "code": "DINE_SESSION_NOT_FOUND",
    "message": "Sesión no encontrada",
    "detail": "No se encontró la sesión con ID: xxx"
  }
}
```

## Estrategia de Integración

### 1. URL Base y Networking
```
Android Emulator: http://10.0.2.2:8080/api/v1
iOS Simulator:    http://localhost:8080/api/v1
Device real:      http://<IP_LAN>:8080/api/v1
```

### 2. Autenticación
- Guest: Bearer token del POST /auth/guest-session
- Staff: Bearer token del POST /auth/login
- Auto-refresh: interceptor detecta 401 → POST /auth/refresh → retry

### 3. Deserialización
- TODAS las respuestas pasan por `ApiResponse.fromJson()` con `genericArgumentFactories`
- Los datasources extraen `data` del envelope
- Los repositorios devuelven el tipo de dominio directo
- NUNCA se deserializa desde el root del JSON

### 4. WebSocket (Futuro)
- Endpoint: `ws://<host>:8080/ws`
- Topics: `/topic/branch/{branchId}/order-updates`
- Bloqueado para GUEST en backend actual
- MVP usa polling cada 10s

### 5. Polling (MVP)
```dart
// Cada 10 segundos
Timer.periodic(Duration(seconds: 10), (_) {
  ref.read(sessionOrdersProvider(sessionId).notifier).refresh();
});
```

## Flujo de Datos: Punta a Punta

```
1. QR Scan → POST /auth/guest-session
   → { accessToken, guest: { id, dineSessionId, tableId } }
   → Guardar tokens en SecureStorage

2. GET /menu/sections
   → [{ id, name, dishes: [{ id, name, price, allergens }] }]

3. POST /orders
   → { id, status: "PENDING", lines: [...] }

4. GET /sessions/{sessionId}/orders
   → [{ id, status, lines: [{ status: "PENDING"|"IN_PROGRESS"|"SERVED" }] }]

5. GET /sessions/{sessionId}/bill
   → { id, status: "OPEN", subtotal, totalAmount, balanceDue }

6. GET /bills/{billId}/summary-by-guest
   → { guests: [{ guestId, displayName, guestTotal, guestBalance }] }

7. POST /payments
   → { id, amount, method, status: "COMPLETED" }
```

## Errores Conocidos del Backend

| Código | HTTP | Descripción |
|--------|------|-------------|
| `DINE_SESSION_NOT_FOUND` | 404 | Sesión no existe |
| `DISH_NOT_FOUND` | 404 | Plato no encontrado |
| `BILL_NOT_FOUND` | 404 | Cuenta no encontrada |
| `PAYMENT_FAILED` | 400 | Pago rechazado |
| `UNAUTHORIZED` | 401 | Token inválido/expirado |
| `FORBIDDEN` | 403 | Sin permisos |

## Checklist de Integración

- [ ] Verificar CORS en backend para mobile
- [ ] Probar flujo completo con backend real
- [ ] Validar manejo de errores HTTP 4xx/5xx
- [ ] Test de refresh token automático
- [ ] Test de reconexión after network loss
- [ ] Validar que envelope se deserializa correctamente
- [ ] Probar con datos reales de menú
- [ ] Verificar que service charge se calcula en backend
- [ ] Test de split por comensal con datos reales
