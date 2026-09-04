# Modelo de Datos y Migraciones Backend — LabTab

**Versión**: 1.0  
**Stack**: Java 21 + Spring Boot 3.3.x + JPA/Hibernate 6.x + Hypersistence Utils 3.7.x + Flyway  
**Fuente de verdad del esquema**: `openspec/docs/Diagrama_V3.mmd` (29 entidades)  
**Paquete Java**: `cl.labtab.api.models`

Este documento es el puente entre el diagrama ER y el código SQL/JPA real.
Sin él, cada desarrollador resuelve el mismo tipo de campo de forma distinta.

---

## 0. Decisión de Stack — Sin Supabase (Explícito)

LabTab V3 gestiona su propia base de datos PostgreSQL 16 nativa en contenedor Docker o EC2. **No se utiliza Supabase, ni Supabase Auth, ni Supabase RLS**.

- **Identidad**: Autenticación propia vía JWT generado por Spring Security 6 con contraseñas BCrypt almacenadas en `person.password_hash`.
- **Aislamiento Multi-Tenant**: Filtrado automático en la capa de servicio Java vía `BranchContextHolder` que inyecta `branch_id` en las queries.
- **Migraciones**: Gestionadas exclusivamente por Flyway (`db/migration/`). No existen scripts externos ni consolas de terceros.

---

## 1. Decisiones de Mapeo de Tipos — Reglas Universales

Una decisión por categoría. No se re-decide campo a campo.

### 1.1 Tabla maestra de mapeo

| Tipo en `Diagrama_V3.mmd` | Columna(s) afectadas | Tipo PostgreSQL 16 | Tipo Java + Anotación JPA |
|:---|:---|:---|:---|
| `string[]` etiquetas/clasificación | `allergies`, `tags`, `allergens`, `cuisine_tags` | `TEXT[]` nativo | `List<String>` + `@Type(StringArrayType.class)` |
| `string[]` con precio/estructura | `ORDER_LINE.modifiers`, `BILL_LINE.modifiers` | `JSONB` | `List<ModifierOption>` (Record) + `@Type(JsonType.class)` |
| `jsonb` libre de terceros | `gateway_response_json`, `layout` | `JSONB` | `JsonNode` (Jackson) — **nunca** `Map<String,Object>` |
| `jsonb` tipado propio | `opening_hours` | `JSONB` | `OpeningHoursDTO` (Java Record) + `@Type(JsonType.class)` |
| `id PK` / `*_id FK` | Todos los identificadores | `UUID` | `UUID` Java + `@GeneratedValue(strategy = GenerationType.UUID)` |
| `timestamp` | `started_at`, `ended_at`, `paid_at`, `created_at`, `issued_at`, etc. | `TIMESTAMP WITH TIME ZONE` | `Instant` (java.time) — **nunca** `LocalDateTime` |
| Enums (`status`, `role`, `method`, `type`) | Todos los campos de estado | `VARCHAR(50)` | `enum` Java + `@Enumerated(EnumType.STRING)` — **nunca** `ORDINAL` |
| `decimal` / `float` financiero | `price`, `amount`, `subtotal`, `total`, etc. | `NUMERIC(12,2)` | `BigDecimal` Java |
| `float` no financiero | `stock_quantity`, `quantity_required` | `NUMERIC(10,4)` | `BigDecimal` Java |
| `boolean` | `is_active`, `is_available`, `paid`, etc. | `BOOLEAN` | `boolean` Java (primitivo) |
| `int` | `capacity`, `guest_count`, `quantity`, `display_order` | `INTEGER` | `int` Java (primitivo) |

### 1.2 Regla central documentada para PRs

> Los campos `JsonNode` son para estructuras **externas o libres** (respuesta de gateway,
> diseño de plano de sala) donde no controlamos el esquema y no necesitamos consultar
> propiedades internas en SQL. Los campos con **Record Java tipado** son para estructuras
> **propias y consultables** donde sí controlamos el esquema (horarios de apertura).
> Esta distinción no se vuelve a discutir en cada PR — se aplica esta regla.

---

## 2. Convención de Naming Hibernate — Configuración Obligatoria

El diagrama usa `snake_case` (`branch_id`, `dine_session_id`). Java usa `camelCase`
(`branchId`, `dineSessionId`). Hibernate resuelve la traducción **solo si** está
configurado explícitamente en `application.yml`:

```yaml
# application.yml — sección JPA obligatoria
spring:
  jpa:
    hibernate:
      naming:
        # Traduce camelCase Java → snake_case SQL automáticamente
        physical-strategy: org.springframework.boot.orm.jpa.hibernate.SpringPhysicalNamingStrategy
        # Resuelve nombres implícitos de tablas e índices
        implicit-strategy: org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy
    properties:
      hibernate:
        # Dialecto PostgreSQL 16 con soporte de tipos nativos
        dialect: org.hibernate.dialect.PostgreSQLDialect
        # Muestra SQL generado en development (desactivar en production)
        show_sql: false
        format_sql: false
```

**Sin esta configuración**, Hibernate 6 usa `CamelCaseToUnderscoresNamingStrategy` por
defecto (del estándar JPA) que puede generar nombres de columna distintos a los del
`Diagrama_V3.mmd` en casos de acrónimos (ej: `URL` vs `url`, `DTE` vs `d_t_e`).

---

## 3. Tipos Java Personalizados — Imports y Dependencia

```xml
<!-- pom.xml — Hypersistence Utils para tipos PostgreSQL nativos -->
<dependency>
    <groupId>io.hypersistence</groupId>
    <artifactId>hypersistence-utils-hibernate-63</artifactId>
    <version>3.7.0</version>
</dependency>
```

```java
// Importar en cada @Entity que use tipos especiales
import io.hypersistence.utils.hibernate.type.array.StringArrayType;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;

// Ejemplo: campo allergies en PERSON_PROFILE
@Type(StringArrayType.class)
@Column(name = "allergies", columnDefinition = "text[]")
private List<String> allergies;

// Ejemplo: campo modifiers en ORDER_LINE (con precio)
@Type(JsonType.class)
@Column(name = "modifiers", columnDefinition = "jsonb")
private List<ModifierOption> modifiers;

// Ejemplo: campo gateway_response_json en PAYMENT (libre)
@Type(JsonType.class)
@Column(name = "gateway_response_json", columnDefinition = "jsonb")
private JsonNode gatewayResponseJson;

// Ejemplo: campo opening_hours en BRANCH (tipado propio)
@Type(JsonType.class)
@Column(name = "opening_hours", columnDefinition = "jsonb")
private OpeningHoursDTO openingHours;
```

---

## 4. Constraints e Índices por Entidad

### 4.1 Tabla de constraints CHECK

| Entidad | Campo | Constraint SQL |
|:---|:---|:---|
| `DISH` | `price` | `CHECK (price >= 0)` |
| `ORDER_LINE` | `quantity` | `CHECK (quantity > 0)` |
| `ORDER_LINE` | `line_total` | `CHECK (line_total >= 0)` |
| `BILL` | `subtotal` | `CHECK (subtotal >= 0)` |
| `BILL` | `balance_due` | `CHECK (balance_due >= 0)` |
| `BILL` | `service_charge_pct` | `CHECK (service_charge_pct >= 0 AND service_charge_pct <= 100)` |
| `PAYMENT` | `amount` | `CHECK (amount > 0)` |
| `PAYMENT` | `tip_amount` | `CHECK (tip_amount >= 0)` |
| `RESERVATION` | `party_size` | `CHECK (party_size > 0)` |
| `DINE_FEEDBACK` | `rating` | `CHECK (rating BETWEEN 1 AND 5)` |
| `RECIPE_INGREDIENT` | `quantity_required` | `CHECK (quantity_required > 0)` |
| `STOCK_ITEM` | `stock_quantity` | `CHECK (stock_quantity >= 0)` |

### 4.2 Constraints UNIQUE

| Entidad | Campo(s) | Razón |
|:---|:---|:---|
| `PERSON` | `email` | Unicidad de cuenta de usuario |
| `COMPANY` | `slug` | Identificador de URL único |
| `DINING_TABLE` | `qr_token` | Token QR de acceso a la mesa |
| `PAYMENT` | `external_transaction_id` | Idempotencia de pagos (evita cobro duplicado) |
| `DINE_FEEDBACK` | `(dine_session_id, person_id)` | Un feedback por sesión/persona |

### 4.3 Índices de performance

```sql
-- Índices creados en V12__create_indexes.sql

-- BILL: lock optimista (campo version) — se agrega como @Version en la entidad JPA
-- No requiere índice SQL — Hibernate lo gestiona

-- Consultas de cocina (el más frecuente del sistema)
CREATE INDEX idx_kitchen_ticket_branch_status
    ON kitchen_ticket(branch_id, status)
    WHERE status IN ('OPEN', 'IN_PROGRESS');

-- Lista de mesas del Radar (segunda más frecuente)
CREATE INDEX idx_dine_table_branch_status
    ON dining_table(branch_id, status);

-- Órdenes de una sesión (consulta frecuente del cliente y mozo)
CREATE INDEX idx_order_session
    ON "order"(dine_session_id, branch_id);

-- Líneas de orden por orden (consulta en cascada)
CREATE INDEX idx_order_line_order
    ON order_line(order_id, branch_id);

-- Platos disponibles por sucursal (catálogo QR)
CREATE INDEX idx_dish_branch_available
    ON dish(branch_id, is_available, display_order);

-- Feed de excepciones del Local Admin (ordenado por fecha desc)
CREATE INDEX idx_exception_log_branch_date
    ON exception_log(branch_id, created_at DESC);

-- Reservas por fecha y sucursal
CREATE INDEX idx_reservation_branch_date
    ON reservation(branch_id, reservation_date, status);

-- Pagos por cuenta (conciliación)
CREATE INDEX idx_payment_bill
    ON payment(bill_id, status);

-- Sesiones activas por mesa
CREATE INDEX idx_dine_session_table_status
    ON dine_session(table_id, status)
    WHERE status = 'OPEN';
```

### 4.4 Lock optimista en BILL — campo `@Version`

```java
// En la entidad BILL — protege contra cobro duplicado (QR + POS simultáneo)
@Entity
@Table(name = "bill")
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Lock optimista: Hibernate incrementa este campo en cada UPDATE.
    // Si dos transacciones intentan actualizar el mismo BILL simultáneamente,
    // la segunda recibe OptimisticLockException → Spring devuelve 409 Conflict.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // ... resto de campos
}
```

---

## 5. Campos de Auditoría Universal

**Todas las entidades** deben tener los siguientes campos base:

```java
// Clase base para herencia — todas las @Entity la extienden
@MappedSuperclass
public abstract class BaseEntity {

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
```

SQL equivalente en cada tabla:
```sql
created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
```

> **Nota**: `TIMESTAMP WITH TIME ZONE` (no `TIMESTAMP`) es obligatorio para evitar bugs
> de timezone en Chile donde el SII y Transbank trabajan con timestamps precisos.
> El horario de verano (CLST) cambia la diferencia con UTC de -4 a -3 horas.

---

## 6. Tabla EXCEPTION_LOG — Definición Completa

Esta tabla **no está en `Diagrama_V3.mmd`** porque es infraestructura de auditoría,
no un modelo de dominio. Se define aquí y se implementa en `V11__create_exception_log.sql`.

```sql
-- V11__create_exception_log.sql
-- Registro de auditoría antifraude: anulaciones con PIN, descuentos manuales,
-- aperturas de cajón sin venta. Persistido inline por `ExceptionLogService.createLog(...)`.
CREATE TABLE exception_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id        UUID NOT NULL REFERENCES branch(id),
    person_id        UUID REFERENCES person(id),        -- quién ejecutó la acción
    authorized_by    UUID REFERENCES person(id),        -- quién autorizó con PIN (MANAGER)
    event_type       VARCHAR(50) NOT NULL,              -- ITEM_VOID_AFTER_KITCHEN | ITEM_VOID_PRE_KITCHEN | MANUAL_DISCOUNT | DRAWER_OPENED_NO_SALE | REFUND_ISSUED | PIN_AUTH_FAILED
    reason           VARCHAR(100) NOT NULL,             -- lista cerrada: Cortesía | Cliente insatisfecho | Error de carga | Deterioro insumo
    order_id         UUID REFERENCES "order"(id),
    order_line_id    UUID REFERENCES order_line(id),
    amount           NUMERIC(12,2),                    -- monto anulado/descontado
    metadata         JSONB,                             -- snapshot del contexto (nombre del plato, mesa, etc.)
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tipos de evento válidos (enum Java: ExceptionEventType)
-- ITEM_VOID_AFTER_KITCHEN  → ítem anulado después de llegar a cocina
-- ITEM_VOID_PRE_KITCHEN    → ítem anulado antes de llegar a cocina
-- MANUAL_DISCOUNT          → descuento manual aplicado en cuenta
-- DRAWER_OPENED_NO_SALE    → gaveta de efectivo abierta sin venta asociada
-- REFUND_ISSUED            → reembolso emitido
-- PIN_AUTH_FAILED          → intento de PIN fallido (más de 3 = alerta)
```

---

## 7. Estrategia de Migraciones Flyway

### 7.1 Regla fundamental

**NO** crear una migración monolítica `V1__init_schema.sql`. Razón documentada:
cuando una migración gigante falla a mitad de ejecución (ej. constraint CHECK
que rechaza datos existentes), Flyway marca el schema como "broken" y requiere
intervención manual en producción. Este problema ocurrió en el repositorio Supabase
anterior de este proyecto.

**SÍ** crear una migración por grupo de entidades relacionadas, en orden de
dependencias (las tablas sin FK primero).

### 7.2 Plan de archivos de migración

```
src/main/resources/db/migration/

V1__create_company_branch_person.sql
    # COMPANY, COMPANY_ROLE, BRANCH, BRANCH_ROLE, PERSON, PERSON_PROFILE
    # Razón: son el núcleo de identidad — todo lo demás los referencia

V2__create_floor_table_session_guest.sql
    # DINING_FLOOR, MAP_ZONE, DINING_TABLE, DINE_SESSION, DINE_GUEST
    # Razón: gestión del salón — depende de BRANCH y PERSON

V3__create_menu_dish_stock.sql
    # MENU_SECTION, DISH, STOCK_ITEM, RECIPE_INGREDIENT
    # Razón: carta e inventario — depende de BRANCH

V4__create_order_order_line.sql
    # ORDER, ORDER_LINE
    # Razón: comandas — depende de DINE_SESSION, DISH, DINE_GUEST

V5__create_kitchen_ticket.sql
    # KITCHEN_TICKET
    # Razón: KDS — depende de ORDER

V6__create_bill_bill_line.sql
    # BILL, BILL_LINE
    # Razón: cuentas — depende de DINE_SESSION, ORDER_LINE, DINE_GUEST

V7__create_payment_payment_method.sql
    # PAYMENT, PAYMENT_METHOD
    # Razón: pagos — depende de BILL, PERSON

V8__create_tax_document_sii_caf.sql
    # TAX_DOCUMENT, SII_CAF_POOL (tabla adicional de gestión de folios)
    # Razón: DTE — depende de BILL, BRANCH

V9__create_reservation_service_request.sql
    # RESERVATION, SERVICE_REQUEST
    # Razón: dependen de BRANCH, DINE_SESSION, PERSON

V10__create_feedback_favorite.sql
    # DINE_FEEDBACK, FAVORITE
    # Razón: dependen de entidades anteriores

V11__create_exception_log.sql
    # EXCEPTION_LOG (tabla de auditoría — ver sección 6)
    # Razón: depende de BRANCH, PERSON, ORDER, ORDER_LINE

V12__create_indexes.sql
    # Todos los índices de performance (ver sección 4.3)
    # Razón: se crean al final para no interferir con las inserciones de seed

V13__seed_demo_data.sql
    # Datos de demo: 1 empresa, 1 sucursal, menú de 15 platos, 8 mesas, 3 usuarios
    # Solo ejecutar en perfil 'dev' — controlado por spring.profiles.active
```

### 7.3 Encabezado estándar de cada archivo de migración

```sql
-- =====================================================================
-- Migración: V1__create_company_branch_person.sql
-- Entidades: COMPANY, COMPANY_ROLE, BRANCH, BRANCH_ROLE, PERSON, PERSON_PROFILE
-- Diagrama_V3.mmd líneas: 53-113
-- Autor: LabTab Backend Team
-- =====================================================================

CREATE TABLE company (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    logo_url   TEXT,
    plan       VARCHAR(20) NOT NULL DEFAULT 'STARTER'
                   CHECK (plan IN ('STARTER', 'GROWTH', 'CHAIN')),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- PERSON: manejo de identidad propia (sin Supabase)
CREATE TABLE person (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,   -- BCrypt produce exactamente 60 caracteres
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

#### Mapping JPA Java (`Person.java`)
```java
@Entity
@Table(name = "person")
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 60)
    private String passwordHash;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
```

#### Creación de cuentas y Seed de Demo
- **Producción**: El registro de usuarios crea `PERSON` con hash BCrypt mediante `POST /auth/register`.
- **Desarrollo / Demo**: La migración `V13__seed_demo_data.sql` inserta cuentas de prueba (`admin@labtab.cl`, `mozo@labtab.cl`, `cocina@labtab.cl`) con contraseñas BCrypt pre-generadas.


### 7.4 Control de migraciones de demo por perfil

```yaml
# application-dev.yml — solo en ambiente de desarrollo
spring:
  flyway:
    locations: classpath:db/migration,classpath:db/seed
    # db/seed contiene V13__seed_demo_data.sql
```

```yaml
# application-prod.yml — en producción nunca se ejecuta el seed
spring:
  flyway:
    locations: classpath:db/migration
```

---

## 8. Tabla SII_CAF_POOL — Gestión de Folios

Tabla adicional no contemplada en `Diagrama_V3.mmd`, necesaria para el
flujo de emisión de DTE sin bloquear la caja (Modo Contingencia SII).

```sql
-- Incluida en V8__create_tax_document_sii_caf.sql
CREATE TABLE sii_caf_pool (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id        UUID NOT NULL REFERENCES branch(id),
    document_type    VARCHAR(10) NOT NULL CHECK (document_type IN ('boleta', 'factura')),
    folio_from       INTEGER NOT NULL,
    folio_to         INTEGER NOT NULL,
    last_used_folio  INTEGER NOT NULL DEFAULT 0,
    expiration_date  DATE NOT NULL,
    caf_xml          TEXT NOT NULL,      -- XML del CAF descargado del SII (cifrado en reposo)
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Alerta naranja: remainingCount < 50 → emite evento WebSocket dte.folio_used
-- Alerta roja:   remainingCount < 10 → emite alerta crítica al Compliance Hub
CREATE INDEX idx_sii_caf_branch_type ON sii_caf_pool(branch_id, document_type)
    WHERE is_active = TRUE;
```
