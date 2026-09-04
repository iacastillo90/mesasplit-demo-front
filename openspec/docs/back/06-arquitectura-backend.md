# Arquitectura Backend — LabTab

**Versión**: 1.1  
**Stack**: Java 21 LTS + Spring Boot 3.5.16 + Gradle  
**Paquete base**: `cl.labtab.api`  
**Fuente de verdad del esquema**: `openspec/docs/Diagrama_V3.mmd` (29 entidades)

> **Decisión de stack registrada (Hito Alfa, inicio del proyecto).**
> El build usa **Gradle 9.7.x** (`LabTab-Back/build.gradle`) en lugar de Maven, y **Spring Boot 3.5.16**
> (última versión estable de la línea 3.x, compatible 1:1 con esta arquitectura). Se mantiene
> `cl.labtab.api` como paquete base y PostgreSQL 16 como base de datos; **H2 queda descartado también
> para tests** (Testcontainers, ver Doc 08). Spring Boot 4.x fue evaluado y descartado para este hito:
> no tiene artefacto público de Hypersistence Utils para Hibernate 7.

Este documento define el stack, la estructura de paquetes, las dependencias y los patrones
de implementación que **todos los desarrolladores deben replicar**. No es una guía de
referencia — es el contrato de implementación del backend.

---

## 1. Stack y Versiones Exactas

| Tecnología | Versión | Rol en el sistema |
|:---|:---|:---|
| Java | 21 LTS (virtual threads habilitados) | Runtime — Loom reduce la complejidad de I/O concurrente |
| Spring Boot | 3.5.16 | Framework principal — auto-configuration, embedded Tomcat |
| Spring Data JPA | 3.5.16 (incluido en Boot) | Capa de persistencia — repositorios, queries JPQL |
| Hibernate | 6.6.x (incluido en JPA) | ORM — traducción Java ↔ PostgreSQL |
| Hypersistence Utils | 3.9.11 (`hypersistence-utils-hibernate-63`) | Tipos PostgreSQL nativos: `TEXT[]`, `JSONB` (ver Doc 06b) |
| MapStruct | 1.5.5 | Mapeo Model ↔ DTO en tiempo de compilación — sin reflexión en runtime |
| JJWT | 0.12.6 | Firma y validación de JWT (HS256) |
| Spring WebSocket + STOMP | 3.5.16 (incluido en Boot) | Canal de tiempo real — 11 eventos del sistema |
| Springdoc OpenAPI | 2.6.0 | Swagger UI autogenerado desde las anotaciones |
| Flyway | 10.x (incluido en Boot) | Migraciones de base de datos versionadas (ver Doc 06b) |
| PostgreSQL | 16 (Alpine) | Base de datos — en Docker, `postgres:16-alpine` |
| JUnit 5 + Testcontainers | gestionado por BOM | Testing de integración contra PostgreSQL real (ver Doc 08) |
| Gradle | 9.7.x | Build tool — `LabTab-Back/build.gradle` como fuente de verdad de dependencias |

> **Virtual Threads (Project Loom)**: habilitados en `application.yml` con
> `spring.threads.virtual.enabled: true`. Elimina la necesidad de programación reactiva
> (WebFlux) para manejar concurrencia en I/O — el código permanece imperativo y legible.

---

## 2. Estructura de Paquetes Java

```
cl.labtab.api/
│
├── models/                  # Entidades JPA (@Entity) — 1 clase por tabla de Diagrama_V3
│   ├── BaseEntity.java      # @MappedSuperclass: createdAt, updatedAt (Instant)
│   ├── Company.java
│   ├── Branch.java
│   ├── BranchRole.java
│   ├── Person.java
│   ├── PersonProfile.java
│   ├── DiningFloor.java
│   ├── MapZone.java
│   ├── DiningTable.java
│   ├── DineSession.java
│   ├── DineGuest.java
│   ├── MenuSection.java
│   ├── Dish.java
│   ├── Order.java
│   ├── OrderLine.java
│   ├── KitchenTicket.java
│   ├── Bill.java            # @Version Long version — lock optimista
│   ├── BillLine.java
│   ├── Payment.java
│   ├── PaymentMethod.java
│   ├── Reservation.java
│   ├── ServiceRequest.java
│   ├── DineFeedback.java
│   ├── Favorite.java
│   ├── StockItem.java
│   ├── RecipeIngredient.java
│   ├── TaxDocument.java
│   └── ExceptionLog.java    # Tabla de auditoría antifraude (no en Diagrama_V3)
│
├── dtos/                    # Records Java 21 (inmutables) para Request y Response
│   ├── request/             # DTOs de entrada — validados con @Valid (Bean Validation)
│   │   ├── LoginRequest.java
│   │   ├── GuestSessionRequest.java
│   │   ├── CreateOrderRequest.java
│   │   ├── CreatePaymentRequest.java
│   │   └── ...              # 1 record por operación con body
│   └── response/            # DTOs de salida — nunca exponer @Entity directamente
│       ├── AuthResponse.java
│       ├── SessionResponse.java
│       ├── OrderResponse.java
│       ├── BillSummaryResponse.java
│       └── ...              # 1 record por respuesta con contrato explícito
│
├── exception/               # Excepciones custom y handler global
│   ├── GlobalExceptionHandler.java  # @RestControllerAdvice — mapea excepciones → HTTP
│   ├── ResourceNotFoundException.java   # 404
│   ├── BusinessRuleException.java        # 422
│   ├── ConflictException.java            # 409
│   └── UnauthorizedPinException.java     # 422 con código PIN_INVALID
│
├── mappers/                 # Interfaces MapStruct — generadas en tiempo de compilación
│   ├── OrderMapper.java     # @Mapper(componentModel = "spring")
│   ├── BillMapper.java
│   ├── PaymentMapper.java
│   └── ...                  # 1 mapper por entidad principal (no por cada DTO)
│
├── repositories/            # Interfaces Spring Data JPA (@Repository)
│   ├── BranchRepository.java
│   ├── DineSessionRepository.java
│   ├── OrderRepository.java
│   ├── BillRepository.java  # Incluye métodos con @Lock para escenario de cierre de caja
│   ├── PaymentRepository.java
│   └── ...                  # 1 interfaz por @Entity
│
├── services/                # Interfaces de servicio (contrato de negocio)
│   ├── OrderService.java
│   ├── PaymentService.java
│   ├── BillService.java
│   └── implement/           # @Service con la implementación real
│       ├── OrderServiceImpl.java
│       ├── PaymentServiceImpl.java
│       └── BillServiceImpl.java
│
├── controllers/             # @RestController — delega al Service, no contiene lógica
│   ├── AuthController.java
│   ├── SessionController.java
│   ├── MenuController.java
│   ├── OrderController.java
│   ├── KitchenController.java
│   ├── BillController.java
│   ├── PaymentController.java
│   ├── TaxDocumentController.java
│   ├── ServiceRequestController.java
│   ├── FeedbackController.java
│   ├── ReservationController.java
│   ├── StockController.java
│   ├── BranchController.java
│   └── ExceptionLogController.java
│
├── configurations/          # Beans de configuración (no de seguridad ni WebSocket)
│   ├── CorsConfiguration.java
│   ├── OpenApiConfiguration.java
│   ├── JacksonConfiguration.java
│   └── VirtualThreadsConfiguration.java
│
├── security/                # Spring Security 6 + JWT — paquete propio
│   ├── SecurityConfiguration.java    # SecurityFilterChain, rutas públicas vs protegidas
│   ├── JwtAuthFilter.java            # OncePerRequestFilter — extrae y valida JWT del header
│   ├── JwtService.java               # Genera, valida y parsea JWT con JJWT 0.12.x
│   ├── UserDetailsServiceImpl.java   # Carga Person + BranchRole desde la DB por email
│   └── BranchContextHolder.java      # ThreadLocal del branchId del JWT
│
├── websocket/               # STOMP handlers y publicadores de eventos
│   ├── WebSocketConfiguration.java
│   ├── StompAuthInterceptor.java     # Valida JWT en CONNECT y branchId en SUBSCRIBE
│   ├── OrderEventPublisher.java
│   ├── KitchenEventPublisher.java
│   ├── PaymentEventPublisher.java
│   ├── AlertEventPublisher.java
│   └── TableEventPublisher.java
│
└── common/                  # Enums compartidos, constantes, utilidades
    ├── enums/
    │   ├── BranchRoleEnum.java       # SUPERADMIN, OWNER, MANAGER, STAFF, KITCHEN, GUEST
    │   ├── OrderStatusEnum.java
    │   ├── BillStatusEnum.java
    │   ├── PaymentMethodEnum.java
    │   ├── PaymentStatusEnum.java
    │   ├── TableStatusEnum.java
    │   ├── DineSessionStatusEnum.java
    │   ├── KitchenTicketStatusEnum.java
    │   ├── SiiStatusEnum.java
    │   └── ExceptionEventTypeEnum.java
    └── DateUtils.java
```

---

## 3. Dependencias — Gradle (`build.gradle`)

> **Nota de stack**: el build real vive en `LabTab-Back/build.gradle` (Gradle). El bloque XML de abajo
> se conserva como **referencia del conjunto de dependencias** (mismo set, traducido a Gradle).
> Para el módulo de tipos nativos de PostgreSQL, con Hibernate 6.6 se usa el artefacto
> `hypersistence-utils-hibernate-63:3.9.11` (ver Doc 06b).

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.5</version>
        <relativePath/>
    </parent>

    <groupId>cl.labtab</groupId>
    <artifactId>labtab-api</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>labtab-api</name>
    <description>Backend API para LabTab — división de cuentas gastronómicas</description>

    <properties>
        <java.version>21</java.version>
        <mapstruct.version>1.5.5.Final</mapstruct.version>
        <jjwt.version>0.12.6</jjwt.version>
        <hypersistence.version>3.7.0</hypersistence.version>
        <springdoc.version>2.6.0</springdoc.version>
        <testcontainers.version>1.19.8</testcontainers.version>
    </properties>

    <dependencies>

        <!-- Web MVC — @RestController, @RequestMapping, HTTP stack -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Data JPA + Hibernate 6.x -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Spring Security 6 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- WebSocket + STOMP -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>

        <!-- Bean Validation — @Valid en DTOs de request -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Actuator — /actuator/health para Docker healthcheck -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Driver JDBC de PostgreSQL 16 -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Flyway — migraciones de base de datos -->
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-database-postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Hypersistence Utils — TEXT[] y JSONB nativos de PostgreSQL -->
        <dependency>
            <groupId>io.hypersistence</groupId>
            <artifactId>hypersistence-utils-hibernate-63</artifactId>
            <version>${hypersistence.version}</version>
        </dependency>

        <!-- JJWT — generación y validación de JWT -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>

        <!-- MapStruct — mapeo Model ↔ DTO en compilación -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${mapstruct.version}</version>
        </dependency>

        <!-- Springdoc OpenAPI 2.x — Swagger UI -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>${springdoc.version}</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>postgresql</artifactId>
            <version>${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.testcontainers</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${testcontainers.version}</version>
            <scope>test</scope>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>21</source>
                    <target>21</target>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>${mapstruct.version}</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## 4. Flujo End-to-End de una Request HTTP

```
Cliente HTTP
    │
    ▼
[JwtAuthFilter]           ← OncePerRequestFilter: extrae Bearer token, valida con JwtService
    │ válido               Carga UserDetails (Person + BranchRole) desde UserDetailsServiceImpl
    ▼
[SecurityFilterChain]     ← Verifica rol del JWT contra permisos de la ruta (@PreAuthorize)
    │ autorizado
    ▼
[@RestController]         ← Recibe request, extrae @PathVariable / @RequestBody
    │                        Llama @Valid en el DTO → Bean Validation actúa aquí
    ▼
[@Service Impl]           ← Lógica de negocio
    │                        BranchContextHolder.getBranchId() filtra por sucursal del JWT
    │                        operación sensible → llamada explícita a exceptionLogService.createLog(...)
    ▼
[@Repository]             ← Spring Data JPA genera SQL desde métodos o @Query JPQL
    │                        Ejecuta sobre el PostgreSQL del pool HikariCP
    ▼
[PostgreSQL 16]           ← Aplica constraints CHECK, UNIQUE, triggers
    │
    ▼
[MapStruct Mapper]        ← @Entity → DTO Response (nunca exponer la entidad directamente)
    │
    ▼
[GlobalExceptionHandler]  ← Si ocurre excepción en cualquier capa, la mapea al código HTTP
    │                        correcto con el formato de error estándar del API
    ▼
Cliente HTTP              ← { "data": {...}, "meta": { "timestamp": "...", "requestId": "..." } }
```

---

## 5. Configuración Spring Security

```java
// security/SecurityConfiguration.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // Habilita @PreAuthorize a nivel de método en @Service
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                    JwtAuthFilter jwtAuthFilter) throws Exception {
        return http
            .csrf(AbstractHttpConfigurer::disable)        // API stateless — sin CSRF
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/login").permitAll()
                .requestMatchers("/api/v1/auth/refresh").permitAll()
                .requestMatchers("/api/v1/auth/guest-session").permitAll()
                .requestMatchers("/api/v1/payments/webhook/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);  // BCrypt para passwords y PINs
    }
}
```

---

## 6. Configuración WebSocket / STOMP

```java
// websocket/WebSocketConfiguration.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfiguration implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")   // Ajustar a dominio en producción
            .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // StompAuthInterceptor valida JWT en CONNECT y branchId en SUBSCRIBE
        // Ver detalles completos en Doc 07 — Seguridad y Roles
        registration.interceptors(stompAuthInterceptor);
    }
}
```

---

## 7. `application.yml` — Development y Production

```yaml
# application.yml — base compartida
spring:
  application:
    name: labtab-api
  threads:
    virtual:
      enabled: true              # Virtual Threads (Project Loom) en Tomcat
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: validate          # NUNCA create/update — Flyway gestiona el schema
      naming:
        physical-strategy: org.springframework.boot.orm.jpa.hibernate.SpringPhysicalNamingStrategy
        implicit-strategy: org.springframework.boot.orm.jpa.hibernate.SpringImplicitNamingStrategy
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        show_sql: false
        jdbc:
          time_zone: UTC
  flyway:
    enabled: true
    locations: classpath:db/migration
  jackson:
    serialization:
      write-dates-as-timestamps: false
    time-zone: UTC

jwt:
  secret: ${JWT_SECRET}
  access-token-expiration: 14400   # 4 horas
  refresh-token-expiration: 604800 # 7 días

management:
  endpoints:
    web:
      exposure:
        include: health
  endpoint:
    health:
      show-details: never

server:
  port: 8080
  compression:
    enabled: true
    mime-types: application/json
```

```yaml
# application-dev.yml — sobrescribe en development
spring:
  jpa:
    properties:
      hibernate:
        show_sql: true
        format_sql: true
  flyway:
    locations: classpath:db/migration,classpath:db/seed  # incluye V13 seed

springdoc:
  swagger-ui:
    enabled: true
    path: /swagger-ui/index.html

logging:
  level:
    cl.labtab: DEBUG
    org.springframework.security: DEBUG
```

```yaml
# application-prod.yml — producción
springdoc:
  swagger-ui:
    enabled: false  # Swagger deshabilitado en producción

logging:
  level:
    root: WARN
    cl.labtab: INFO
```

---

## 8. Convenciones de Nombrado Java

| Elemento | Convención | Ejemplo |
|:---|:---|:---|
| Clases @Entity | PascalCase del Diagrama_V3 | `DineSession`, `OrderLine`, `BillLine` |
| Tablas SQL | snake_case del Diagrama_V3 | `dine_session`, `order_line` |
| Campos Java | camelCase | `branchId`, `balanceDue`, `dineSessionId` |
| Columnas SQL | snake_case | `branch_id`, `balance_due` |
| Enums | UPPER_SNAKE_CASE | `WEBPAY`, `MERCADO_PAGO`, `START_NOW` |
| DTOs Request | `<Verbo><Entidad>Request` | `CreateOrderRequest`, `ApplyDiscountRequest` |
| DTOs Response | `<Entidad>Response` | `OrderResponse`, `BillSummaryResponse` |
| Services | `<Entidad>Service` / `<Entidad>ServiceImpl` | `PaymentService` / `PaymentServiceImpl` |
| Tests unitarios | `<Clase>Test` | `BillServiceTest` |
| Tests integración | `<Clase>IntegrationTest` | `PaymentIntegrationTest` |

### Términos del dominio que no se traducen

| Concepto del negocio | Nombre en código | Nota |
|:---|:---|:---|
| Comanda | `Order` | Traducción POS estándar |
| Garzón/Mozo | `STAFF` (rol) | "garzón" en comentarios en español |
| Cuenta | `Bill` | No `Invoice` — boleta ≠ factura en SII Chile |
| Lista 86 | `isAvailable = false` en `Dish` | Argot de cocina para agotado |
| Marchar plato | `fireCourse()` | Orden de cocina para servir ahora |
| Escandallo | `RecipeIngredient.quantityRequired` | Gramaje por plato |
