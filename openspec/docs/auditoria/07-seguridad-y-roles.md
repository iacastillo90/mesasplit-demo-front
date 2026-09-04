# Seguridad y Roles — LabTab Backend

**Versión**: 1.0  
**Stack**: Spring Security 6 + JJWT 0.12.x + Spring WebSocket/STOMP  
**Referencia**: `openspec/docs/Diagrama_V3.mmd` — entidades `BRANCH_ROLE`, `PERSON`

---

## 1. Roles del Sistema

Los roles se originan del campo `role` de la entidad `BRANCH_ROLE` del Diagrama_V3.
El rol `GUEST` es especial — se asigna dinámicamente en el JWT al hacer onboarding QR
(no existe como fila en `BRANCH_ROLE`).

| Rol | Origen en DB | Descripción operativa |
|:---|:---|:---|
| `SUPERADMIN` | `COMPANY_ROLE.role = 'ADMIN'` | Acceso total — todas las empresas y sucursales. Solo para soporte de LabTab. |
| `OWNER` | `BRANCH_ROLE.role = 'OWNER'` | Dueño de la empresa — ve todas las sucursales de su `company_id`. |
| `MANAGER` | `BRANCH_ROLE.role = 'MANAGER'` | Encargado de sucursal (Local Admin). Autoriza anulaciones con PIN. |
| `STAFF` | `BRANCH_ROLE.role = 'STAFF'` | Mozo/garzón y cajero POS. Toma órdenes y procesa pagos. |
| `KITCHEN` | `BRANCH_ROLE.role = 'KITCHEN'` | Cocinero — acceso exclusivo a la vista KDS. Solo lectura del menú. |
| `GUEST` | Dinámico (JWT al escanear QR) | Comensal anónimo — solo su sesión de mesa. No existe en `BRANCH_ROLE`. |

---

## 2. Matriz de Permisos por Recurso

`✅` = permitido · `❌` = denegado · `📌` = solo su propia entidad (ej. su `sessionId`) · `🔑` = requiere PIN de MANAGER además del rol

| Recurso / Operación | SUPERADMIN | OWNER | MANAGER | STAFF | KITCHEN | GUEST |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /auth/login` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /auth/guest-session` | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| `GET /sessions/{id}` | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `POST /sessions` (abrir mesa) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `PATCH /sessions/{id}/status` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `GET /menu/sections` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `PATCH /menu/dishes/{id}/availability` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `POST /menu/dishes` (crear plato) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /orders` (comanda) | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `PATCH /order-lines/{id}/status` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `DELETE /order-lines/{id}` (anulación) | ✅ | ✅ | 🔑 | 🔑 | ❌ | ❌ |
| `GET /kitchen/tickets` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `PATCH /kitchen/tickets/{id}/status` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `POST /bills` (crear cuenta) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /bills/{id}` | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `PATCH /bills/{id}/apply-discount` | ✅ | ✅ | 🔑 | ❌ | ❌ | ❌ |
| `POST /payments` | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `POST /payments/{id}/refund` | ✅ | ✅ | 🔑 | ❌ | ❌ | ❌ |
| `POST /tax-documents` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `POST /service-requests` (S.O.S.) | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `POST /feedback` | ✅ | ✅ | ✅ | ✅ | ❌ | 📌 |
| `GET /feedback` (listado) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `POST /reservations` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /stock` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `PATCH /stock/{id}/quantity` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| `GET /branch/config` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /branch/floors` (plano sala) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `GET /exceptions` (auditoría) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

> **Regla de prioridad**: Si un rol más alto necesita una operación que un rol más bajo
> también puede hacer, ambos están en la lista. La jerarquía es:
> `SUPERADMIN > OWNER > MANAGER > STAFF > KITCHEN > GUEST`.

---

## 3. Implementación de Autorización REST

### 3.1 `@PreAuthorize` a nivel de método

```java
// Ejemplo en BillController.java — autorización declarativa
@PatchMapping("/{billId}/apply-discount")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'OWNER', 'MANAGER')")
public ResponseEntity<ApiResponse<BillResponse>> applyDiscount(
        @PathVariable UUID billId,
        @RequestBody @Valid ApplyDiscountRequest request) {
    // La validación de PIN se hace DENTRO del servicio (capa de negocio, no de auth)
    return ResponseEntity.ok(billService.applyDiscount(billId, request));
}
```

### 3.2 `BranchContextHolder` — Aislamiento por `branchId`

Todos los endpoints `[BRANCH]` filtran automáticamente por el `branchId` del JWT.
El `BranchContextHolder` es un componente `ThreadLocal` que inyecta el `branchId`
en cada query sin que el código de negocio lo repita manualmente.

```java
// security/BranchContextHolder.java
@Component
public class BranchContextHolder {

    // ThreadLocal garantiza aislamiento por hilo (compatible con Virtual Threads)
    private static final ThreadLocal<UUID> branchIdHolder = new ThreadLocal<>();

    public static void set(UUID branchId) { branchIdHolder.set(branchId); }
    public static UUID get() { return branchIdHolder.get(); }
    public static void clear() { branchIdHolder.remove(); }  // Limpiar al final del request
}

// Uso en JwtAuthFilter.java — se setea una vez por request
UUID branchId = jwtService.extractBranchId(token);
BranchContextHolder.set(branchId);

// Uso en cualquier @Service — sin pasar branchId como parámetro
public List<Order> getSessionOrders(UUID sessionId) {
    UUID branchId = BranchContextHolder.get();  // Viene del JWT, no del request body
    return orderRepository.findByDineSessionIdAndBranchId(sessionId, branchId);
}
```

> **Regla de aislamiento**: Un usuario con `branchId = uuid-A` no puede ver recursos
> de `branchId = uuid-B` aunque conozca el UUID. El filtro es automático en la capa
> de servicio. Si el registro no existe para el `branchId` del JWT → `404 Not Found`.

---

## 4. Reglas de PIN — Capa de Negocio (No de JWT)

El PIN no es parte de la autenticación JWT. Es una segunda capa de autorización
en tiempo de ejecución para operaciones de alto riesgo antifraude.

### 4.1 Operaciones que requieren PIN de MANAGER

| Operación | Endpoint | Motivo |
|:---|:---|:---|
| Anular línea post-cocina | `DELETE /order-lines/{id}` | Riesgo de fraude por robo de producto |
| Aplicar descuento manual | `PATCH /bills/{id}/apply-discount` | Riesgo de descuentos no autorizados |
| Emitir reembolso | `POST /payments/{id}/refund` | Movimiento de dinero real |
| Abrir cajón sin venta | Operación POS local | Riesgo de extracción de efectivo |

### 4.2 Flujo de validación de PIN

```
1. Frontend solicita la operación sensible incluyendo { "managerPin": "1234" }
2. Backend recibe el PIN en texto plano (solo en HTTPS)
3. @Service busca el BranchRole del MANAGER en la DB:
   branchRoleRepository.findByBranchIdAndRole(branchId, MANAGER)
4. BCryptEncoder.matches(managerPin, branchRole.getPinCode())
   → Si false: lanza UnauthorizedPinException → HTTP 422 con code: PIN_INVALID
   → Si true: continúa con la operación
5. El service llama a `exceptionLogService.createLog(...)` inline y persiste el `ExceptionLog` con reason/amount/authorizedBy
```

### 4.3 Validación del PIN en código

```java
// services/implement/PinValidationService.java
@Service
public class PinValidationService {

    private final BranchRoleRepository branchRoleRepository;
    private final PasswordEncoder passwordEncoder;

    // Valida el PIN del MANAGER contra el hash en BRANCH_ROLE.pin_code
    public void validateManagerPin(UUID branchId, String providedPin) {
        BranchRole managerRole = branchRoleRepository
            .findByBranchIdAndRole(branchId, BranchRoleEnum.MANAGER)
            .orElseThrow(() -> new ResourceNotFoundException("MANAGER no encontrado en esta sucursal"));

        if (!passwordEncoder.matches(providedPin, managerRole.getPinCode())) {
            // Registra intento fallido en ExceptionLog (event_type: PIN_AUTH_FAILED)
            exceptionLogService.logFailedPin(branchId);
            throw new UnauthorizedPinException("PIN incorrecto");
        }
    }
}
```

### 4.4 Lista cerrada de motivos para anulaciones y descuentos

```java
// common/enums/VoidReasonEnum.java
public enum VoidReasonEnum {
    CORTESIA("Cortesía"),
    CLIENTE_INSATISFECHO("Cliente insatisfecho"),
    ERROR_DE_CARGA("Error de carga"),
    DETERIORO_INSUMO("Deterioro insumo");

    private final String displayName;
    // Getters...
}
```

> Un motivo fuera de esta lista → `422 Unprocessable Entity` con código `REASON_INVALID`.
> Esta lista **no se amplía sin revisión del equipo** — su rigidez es el control antifraude.

---

## 5. Política JWT

### 5.1 Tiempos de expiración

| Token | Duración | Razón |
|:---|:---|:---|
| Access Token | 4 horas (14400 segundos) | Cubre un turno completo sin obligar re-login al mozo |
| Refresh Token | 7 días (604800 segundos) | Persistencia entre turnos para usuarios recurrentes |
| JWT de GUEST | 4 horas | La sesión de mesa raramente dura más que un turno |

### 5.2 Claims del JWT

```json
{
  "sub": "uuid-person",
  "personId": "uuid-person",
  "branchId": "uuid-branch",
  "role": "STAFF",
  "email": "rodrigo@labtab.cl",
  "iat": 1705359600,
  "exp": 1705374000
}
```

Para JWTs de `GUEST`:
```json
{
  "sub": "uuid-guest",
  "guestId": "uuid-guest",
  "sessionId": "uuid-session",
  "branchId": "uuid-branch",
  "role": "GUEST",
  "iat": 1705359600,
  "exp": 1705374000
}
```

### 5.3 Generación y validación JWT con JJWT 0.12.x

```java
// security/JwtService.java
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    // Genera access token con claims de LabTab
    public String generateAccessToken(Person person, BranchRole branchRole) {
        return Jwts.builder()
            .subject(person.getId().toString())
            .claim("personId", person.getId().toString())
            .claim("branchId", branchRole.getBranchId().toString())
            .claim("role", branchRole.getRole().name())
            .claim("email", person.getEmail())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration * 1000))
            .signWith(getSigningKey())
            .compact();
    }

    // Extrae el branchId del token (usado por BranchContextHolder)
    public UUID extractBranchId(String token) {
        return UUID.fromString(
            getClaims(token).get("branchId", String.class)
        );
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
```

---

## 6. Autorización de Canales WebSocket / STOMP

> [!CAUTION]
> STOMP es una superficie de ataque **distinta** a REST. Validar el JWT en el `CONNECT`
> inicial **no es suficiente** — un cliente puede enviar un frame `SUBSCRIBE` a
> `/topic/branch/{otherBranchId}/kitchen` y escuchar eventos de otra sucursal si el
> servidor no valida el `branchId` en cada suscripción.

### 6.1 Topics y roles autorizados

| Topic STOMP | Descripción | Roles con permiso de SUBSCRIBE |
|:---|:---|:---|
| `/topic/branch/{id}/kitchen` | Eventos KDS: nuevas órdenes, marchar | `KITCHEN`, `MANAGER`, `OWNER`, `SUPERADMIN` |
| `/topic/branch/{id}/radar` | Estado de mesas en tiempo real | `MANAGER`, `OWNER`, `SUPERADMIN` |
| `/topic/branch/{id}/pos` | Eventos de caja: pagos QR recibidos, S.O.S. | `STAFF`, `MANAGER`, `OWNER`, `SUPERADMIN` |
| `/topic/branch/{id}/waiter/{waiterId}` | Notificaciones individuales del mozo | `STAFF` (solo su `waiterId`), `MANAGER`, `OWNER` |
| `/topic/session/{sessionId}/client` | Vista del comensal: estado de su pedido | `GUEST` (solo su `sessionId` del JWT) |
| `/topic/branch/{id}/alerts` | Feed de excepciones antifraude, alertas críticas | `MANAGER`, `OWNER`, `SUPERADMIN` |
| `/topic/branch/{id}/compliance` | Eventos de folio SII, turnos (clock in/out) | `OWNER`, `SUPERADMIN` |

### 6.2 Implementación del interceptor STOMP

```java
// websocket/StompAuthInterceptor.java
@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(
            message, StompHeaderAccessor.class
        );

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // CONNECT: extraer JWT del header, validar y guardar en la sesión STOMP
            String token = extractToken(accessor.getFirstNativeHeader("Authorization"));
            validateAndSetUser(accessor, token);

        } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            // SUBSCRIBE: validar que el branchId del topic coincida con el del JWT
            String destination = accessor.getDestination();
            String jwtBranchId = extractBranchIdFromSession(accessor);
            validateSubscriptionAccess(destination, jwtBranchId, accessor);
        }

        return message;
    }

    private void validateSubscriptionAccess(String destination,
                                             String jwtBranchId,
                                             StompHeaderAccessor accessor) {
        // Extrae el branchId del path del topic: /topic/branch/{branchId}/...
        String topicBranchId = extractBranchIdFromDestination(destination);

        if (topicBranchId != null && !topicBranchId.equals(jwtBranchId)) {
            // VIOLACIÓN: el cliente intenta escuchar una sucursal que no le corresponde
            // Enviamos ERROR frame y cerramos la conexión STOMP
            throw new MessagingException("Acceso denegado al topic: " + destination);
        }

        // Validación adicional para topics personales del mozo
        if (destination.contains("/waiter/")) {
            validateWaiterAccess(destination, accessor);
        }

        // Validación para el topic de sesión del GUEST
        if (destination.startsWith("/topic/session/")) {
            validateGuestSessionAccess(destination, accessor);
        }
    }
}
```

### 6.3 Flujo completo de conexión STOMP

```
1. Cliente envía CONNECT con header "Authorization: Bearer <jwt>"
2. StompAuthInterceptor.preSend() — StompCommand.CONNECT:
   → JwtService.validateToken(token)
   → Si inválido: enviar StompCommand.ERROR + cerrar conexión
   → Si válido: extraer {personId, branchId, role}, guardar en StompSession.attributes
3. Cliente envía SUBSCRIBE /topic/branch/{id}/kitchen
4. StompAuthInterceptor.preSend() — StompCommand.SUBSCRIBE:
   → Extraer {branchId} del path del topic
   → Comparar con branchId guardado en StompSession.attributes (del paso 2)
   → Si no coincide: StompCommand.ERROR + cerrar conexión STOMP
   → Verificar que el role del JWT está en la lista de roles autorizados para ese topic
   → Si no tiene permiso de rol: StompCommand.ERROR
5. Conexión autorizada → cliente recibe eventos del topic
```

---

## 7. Estrategia de Aislamiento Multi-Tenant

En la fase actual (una empresa, una sucursal por instancia), el `branchId` del JWT
actúa como el equivalente de Row-Level Security (RLS) de PostgreSQL, implementado
en la capa de servicio Java.

### 7.1 Reglas de aislamiento

1. **Nunca** aceptar `branchId` del request body — siempre del JWT.
2. **Toda** query de datos de sucursal incluye `AND branch_id = :branchId`.
3. **Toda** creación de recurso setea `branch_id = BranchContextHolder.get()`.
4. Si un recurso existe pero no pertenece al `branchId` del JWT → `404 Not Found`
   (nunca `403` — no confirmar la existencia de recursos de otras sucursales).

### 7.2 Verificación de aislamiento en queries

```java
// repositories/OrderRepository.java
public interface OrderRepository extends JpaRepository<Order, UUID> {

    // CORRECTO: incluye branchId del BranchContextHolder
    List<Order> findByDineSessionIdAndBranchId(UUID sessionId, UUID branchId);

    // INCORRECTO (no usar): expone datos de otras sucursales
    // List<Order> findByDineSessionId(UUID sessionId);
}
```
