# 02 - Requisitos Funcionales

## Leyenda

- **P0**: Obligatorio para el hito MVP
- **P1**: Deseable, se puede posponer

---

## Convención de contrato (aplicable a todos los FR)

Toda respuesta exitosa del backend llega envuelta en el envelope `ApiResponse<T>`:

```json
{
  "data": { "...": "..." },
  "meta": { "timestamp": "2026-09-01T14:30:00Z", "requestId": "uuid-v4" }
}
```

Los errores llegan con la forma `{ "error": { "code", "message", "detail" } }`. La app deserializa `data`, nunca la raíz plana.

---

## FR-001: QR Onboarding (P0)

**Como** comensal,
**quiero** escanear el QR de la mesa para unirme a la sesión,
**para que** pueda ver el menú y hacer pedidos.

### Criterios de Aceptación

- [ ] La app detecta un QR con formato `labtab://b/{branchId}/t/{tableId}/s/{qrToken}` (o directamente `qrToken`)
- [ ] `POST /auth/guest-session` con `qrToken`, `displayName` (opcional), `allergies` (opcional)
- [ ] Se recibe `GuestSessionResponse` dentro del envelope: `data.accessToken`, `data.guest.{id, displayName, dineSessionId, tableId, tableName}`
- [ ] **La sesión ya debe estar abierta por el staff**: si la mesa no tiene sesión OPEN, el back responde `409 SESSION_NOT_OPEN` y la app muestra "La mesa aún no está habilitada, avisá al mesero"
- [ ] Si el QR no existe: `404 QR_TOKEN_INVALID` → "Mesa no encontrada"
- [ ] Si el usuario ya tiene cuenta, puede loguearse y vincular su perfil

### Flujo

```
1. App detecta QR -> extrae qrToken
2. POST /auth/guest-session { qrToken, displayName?, allergies? }
3. Backend: busca DiningTable por qrToken
   - 404 si no existe (QR_TOKEN_INVALID)
4. Backend: busca DineSession OPEN en esa mesa
   - 409 si no hay sesión abierta (SESSION_NOT_OPEN)  <-- el comensal NO crea la sesión
5. Backend: crea DineGuest + JWT GUEST
6. Retorna { data: { accessToken, expiresIn, guest: {...} } }
7. App guarda token en secure storage, navega a Home
```

---

## FR-002: Login / Logout (P1)

**Como** usuario registrado,
**quiero** loguearme con email y password,
**para que** mis pedidos se asocien a mi perfil.

### Criterios de Aceptación

- [ ] `POST /auth/login` con `email` + `password`
- [ ] Se recibe `AuthResponse` con `accessToken`, `refreshToken`, `expiresIn`, `person`, `availableBranches`
- [ ] El refresh token se almacena en `flutter_secure_storage`
- [ ] El access token se renueva automáticamente antes de expirar (4h)
- [ ] `POST /auth/refresh` rota el refresh token (el back devuelve un nuevo `accessToken`)
- [ ] `POST /auth/logout` invalida el refresh token en el back y borra tokens locales

---

## FR-003: Ver Menú (P0)

**Como** comensal,
**quiero** ver el menú completo del restaurante,
**para que** sepa qué pedir con precios y alérgenos.

### Criterios de Aceptación

- [ ] `GET /menu/sections` retorna `data: List<MenuSectionResponse>` con `dishes[]` anidados
- [ ] Cada plato muestra: `name`, `description`, `price` (CLP), `imageUrl`, `allergens`, `tags`, `displayOrder`
- [ ] Platos con `isAvailable: false` se muestran deshabilitados ("Lista 86")
- [ ] El menú se cachea localmente (TTL 5 min)
- [ ] Se muestra alerta de alérgenos si el usuario los configuró
- [ ] Pull-to-refresh para recargar

### Modelo de respuesta esperado (envelope)

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
  "meta": { "timestamp": "2026-09-01T14:30:00Z", "requestId": "uuid-v4" }
}
```

---

## FR-004: Hacer Pedido (P0)

**Como** comensal,
**quiero** agregar platos a mi pedido y enviarlo a cocina,
**para que** me sirvan lo que quiero sin esperar al mesero.

### Criterios de Aceptación

- [ ] El usuario agrega platos desde el menú
- [ ] Puede modificar cantidad, agregar notas ("sin cebolla"), seleccionar modificadores y curso
- [ ] `POST /orders` con `dineSessionId`, `channel: "QR"`, `notes`, `lines[]`
- [ ] Cada línea: `dishId`, `quantity`, `unitPrice` (el back lo **ignora** y usa el de la BD), `itemNotes`, `modifiers[]`, `courseType`, `dineGuestId`
- [ ] **Zero-trust**: el precio lo asigna el backend (`dish.price`). La app muestra el precio pero no lo impone
- [ ] Se crea un `KitchenTicket` automáticamente en el backend
- [ ] Se recibe `OrderResponse` con estado inicial `PLACED`

### Valores de `courseType` (enum real)

`ENTRADA` · `FONDO` · `POSTRE`

### Estructura de modificador

```json
{ "optionId": "extra-aioli", "name": "Salsa aioli extra", "extraPrice": 800 }
```

---

## FR-005: Seguir Estado del Pedido (P0)

**Como** comensal,
**quiero** ver el estado de mi pedido,
**para que** sepa cuándo está listo.

### Criterios de Aceptación

- [ ] Consulta por polling `GET /sessions/{sessionId}/orders` → `data: List<OrderResponse>`
- [ ] Estados de línea (`OrderLineStatusEnum`): `QUEUED` → `PREPARING` → `READY` → `SERVED` (y `CANCELLED`)
- [ ] Estados de orden (`OrderStatusEnum`): `PLACED` → `ACCEPTED` → `IN_PREPARATION` → `READY` → `SERVED` (y `CANCELLED`)
- [ ] UI se actualiza (polling o WebSocket — ver gap en 08)

> **Gap de tiempo real (importante)**: hoy el backend publica eventos STOMP solo en `/topic/branch/{branchId}/...` y `GUEST` no puede suscribirse a esos topics. El canal de tiempo real del comensal es una `pregunta-arquitectura` pendiente. Hasta resolverla, la app arranca con **polling** de `GET /sessions/{sessionId}/orders`.

### Estados y Colores

| Estado | Label | Color |
|--------|-------|-------|
| PLACED | Recibido | Azul (#3B82F6) |
| IN_PREPARATION | En cocina | Naranja (#F59E0B) |
| READY | Listo para servir | Verde (#10B981) |
| SERVED | Entregado | Gris (#6B7280) |
| CANCELLED | Cancelado | Rojo (#EF4444) |

---

## FR-006: Ver Cuenta (P0)

**Como** comensal,
**quiero** ver el desglose de mi cuenta,
**para que** sepa cuánto debo antes de pagar.

### Criterios de Aceptación

- [ ] `GET /sessions/{sessionId}/bill` retorna `data: BillResponse` de la sesión
- [ ] Muestra: `subtotal`, `serviceChargeAmount`, `tipTotal`, `totalAmount`, `paidTotal`, `balanceDue`, `version`
- [ ] `GET /bills/{billId}/summary-by-guest` retorna `data: BillSummaryByGuestResponse` (split por comensal)
- [ ] Cada comensal ve solo sus líneas + las compartidas
- [ ] El split lo calcula el backend (zero-trust); la app solo lo muestra

---

## FR-007: Pagar lo suyo (P0)

**Como** comensal,
**quiero** pagar mi parte de la cuenta,
**para que** cada quien pague solo lo que consumió.

### Criterios de Aceptación

- [ ] El usuario ve su `guestTotal`/`guestBalance` desde `summary-by-guest`
- [ ] El backend calcula el desglose por comensal (`GuestBillSummaryResponse`)
- [ ] `POST /payments` con `billId`, `amount`, `tipAmount`, `totalAmount`, `method`, `provider`, `currency: "CLP"`, `dineGuestId`
- [ ] Soporta pago **parcial** (split)
- [ ] El backend usa lock optimista (`@Version` en `Bill`) e idempotencia por `externalTransactionId`
- [ ] Cuando `balanceDue == 0`, el backend cierra la cuenta/sesión automáticamente

### Algoritmo de división (server-side, referencia)

```
Para cada BillLine:
  Si dineGuestId != null -> el comensal asignado paga el 100%
  Si dineGuestId == null -> se divide entre los comensales activos de la sesión
El back agrupa en GuestBillSummaryResponse { guestId, displayName, lines[], guestTotal, guestPaid, guestBalance }
```

---

## FR-008: Pago Real (P0)

**Como** comensal,
**quiero** pagar con Mercado Pago (y Transbank al escalar),
**para que** el pago sea real, no simulado.

### Criterios de Aceptación

- [ ] `POST /payments` con `method: MERCADO_PAGO` (MVP) o `WEBPAY` (al escalar)
- [ ] El backend crea el `Payment` y devuelve `PaymentResponse` (con `bill` anidado)
- [ ] Para Mercado Pago: abrir checkout en WebView; el gateway confirma por su flujo
- [ ] Idempotencia: el `externalTransactionId` lo genera el backend/gateway; si el gateway reenvía, el back responde `409` con el pago original (la app nunca reintenta automáticamente)
- [ ] Cuando el pago completa, `balanceDue` se actualiza en `data.bill`

### Flujo de Pago (Mercado Pago)

```
1. App POST /payments { billId, amount, tipAmount, totalAmount, method: MERCADO_PAGO, provider: "mercadopago", currency: "CLP", dineGuestId }
2. Backend crea Payment(PENDING) y devuelve PaymentResponse (con redirectUrl/bill)
3. App abre WebView con el checkout
4. Usuario completa el pago
5. App consulta GET /payments/{paymentId} (o el back notifica) para verificar estado
6. Si COMPLETED -> success; si PENDING -> polling (máx 30s)
```

> **Nota**: `POST /payments/webhook/{provider}` quedó declarado MVP (sin `permitAll`). El flujo de confirmación real se define con el backend. No existe un endpoint `/payments/confirm`.

---

## FR-009: Mi Perfil (P1)

**Como** usuario registrado,
**quiero** ver/editar mi perfil,
**para que** el restaurante sepa mis alérgenos y preferencias.

### Criterios de Aceptación

- [ ] Muestra: nombre, email, avatar, alérgenos (del `PersonAuthResponse` en `login`)
- [ ] Los alérgenos se comparan contra los `allergens` de cada `DishResponse` para mostrar alertas
- [ ] Edición de perfil: post-MVP (no hay endpoint dedicado aún)

---

## FR-010: S.O.S. — Llamar al mesero (P0)

**Como** comensal,
**quiero** pedir al mesero (o la cuenta, o agua) desde la app,
**para que** no tenga que buscarlo con la mirada.

### Criterios de Aceptación

- [ ] Botón "Llamar al mesero" visible en la app (menú y/o cuenta)
- [ ] `POST /service-requests` con `dineSessionId`, `requestType`, `tableName`
- [ ] `requestType` ∈ `WAITER` · `BILL` · `WATER` · `OTHER`
- [ ] Respuesta `201` → `data: { id, requestType, status: "OPEN", tableName }`
- [ ] La app muestra confirmación "Mesero avisado"
- [ ] El backend emite el evento `call.waiter` al staff (del lado del local)

> **Dependencia de backend**: el endpoint `POST /service-requests` aún no está implementado en `LabTab-Back` (solo contrato en `rest-api.md` + enums). La app puede implementarse contra la spec; queda bloqueada en runtime hasta que el back lo exponga.

---

## FR-011: Feedback Post-Pago (P1)

**Como** comensal,
**quiero** calificar mi experiencia justo al pagar,
**para que** el local reciba mi opinión en el momento.

### Criterios de Aceptación

- [ ] Al completar el pago, se muestra un modal de calificación 1-5 + comentario opcional
- [ ] `POST /feedback` con `dineSessionId`, `rating` (1-5), `comment` (opcional)
- [ ] Respuesta `201` → `data: { id, rating, comment }`
- [ ] `422` si `rating` fuera de rango 1-5; `409` si ya existe feedback de la sesión
- [ ] Una sola calificación por sesión
- [ ] El modal se puede omitir (dismiss)

> **Dependencia de backend**: el endpoint `POST /feedback` aún no está implementado en `LabTab-Back` (solo contrato en `rest-api.md`). Misma condición que S.O.S.

---

## Resumen de User Stories MVP

| ID | Story | Prioridad |
|----|-------|-----------|
| US-01 | Como comensal, quiero escanear el QR y unirme a la sesión | P0 |
| US-02 | Como comensal, quiero ver el menú con precios y alérgenos | P0 |
| US-03 | Como comensal, quiero agregar platos y enviar el pedido | P0 |
| US-04 | Como comensal, quiero seguir el estado de mi pedido | P0 |
| US-05 | Como comensal, quiero ver mi subtotal y la cuenta | P0 |
| US-06 | Como comensal, quiero pagar mi parte (split) | P0 |
| US-07 | Como comensal, quiero pagar con Mercado Pago/Transbank | P0 |
| US-08 | Como comensal, quiero llamar al mesero (S.O.S.) | P0 |
| US-09 | Como usuario, quiero loguearme para vincular mi perfil | P1 |
| US-10 | Como usuario, quiero ver/editar mi perfil y alérgenos | P1 |
| US-11 | Como comensal, quiero calificar mi experiencia al pagar | P1 |
