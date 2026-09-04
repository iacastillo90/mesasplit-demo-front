# LabTab — Auditoría Técnica V3

**Propuesta técnica para revisión senior**  
**Versión**: V3  
**Stack backend**: Java 21 LTS + Spring Boot 3.3.x + PostgreSQL 16  
**Stack frontend**: React 18.3 + Vite 6 + Tailwind 3.4  
**Infraestructura**: AWS EC2 + Docker Compose

Este directorio contiene los documentos técnicos centralizados para la auditoría
del sistema LabTab. Cada documento es una copia del original ubicado en `back/` o
`front/` — los originales son la fuente autoritativa; esta carpeta existe para
facilitar la revisión sin necesidad de navegar el árbol completo.

---

## Índice de Documentos

### 🗺️ Modelo de Datos (Fuente de Verdad)

| Documento | Descripción |
|:---|:---|
| [Diagrama_V3.mmd](./Diagrama_V3.mmd) | **29 entidades** — modelo ER completo reconciliado. Fuente única de verdad para el schema de PostgreSQL. Contiene: tipos de campo, PKs, FKs, constraints CHECK, campos de denorm RLS y lock optimista |

---

### 📋 Producto y Visión

| Documento | Descripción |
|:---|:---|
| [00-ecosistema-maestro-sdd.md](./00-ecosistema-maestro-sdd.md) | Especificación completa del producto: 6 vistas (Cliente, Mozo, KDS, POS, Local Admin, Super Admin), design tokens, reglas de negocio transversales, contratos de eventos WebSocket, roadmap por fases y glosario Chile-specific |
| [CHANGELOG.md](./CHANGELOG.md) | Trazabilidad V0 (Node) → V1 (Python) → V2 (React demo) → V3 (Java). Decisiones de ruptura documentadas con motivo técnico |

---

### 🔌 Contratos de API

| Documento | Descripción |
|:---|:---|
| [rest-api.md](./rest-api.md) | **40+ endpoints REST**: request/response con tipos exactos, códigos de error, roles autorizados, notas de idempotencia y paginación |
| [websocket-payloads.md](./websocket-payloads.md) | **11 eventos STOMP**: payloads completos con topics, roles autorizados por topic, y ejemplos de publicación desde Spring |

---

### 🏗️ Arquitectura Backend

| Documento | Descripción |
|:---|:---|
| [06-arquitectura-backend.md](./06-arquitectura-backend.md) | Stack con versiones exactas, `pom.xml` completo (Maven), árbol de paquetes Java (~30 paquetes), `application.yml` para dev y prod, `SecurityConfiguration.java`, `WebSocketConfiguration.java`, convenciones de nombrado |
| [06b-modelo-datos-y-migraciones.md](./06b-modelo-datos-y-migraciones.md) | Estrategia Flyway (V1–V13), mapeo de tipos Java↔PostgreSQL con Hypersistence Utils, constraints CHECK, índices de rendimiento, lógica de EXCEPTION_LOG |
| [07-seguridad-y-roles.md](./07-seguridad-y-roles.md) | 6 roles del sistema, **matriz de permisos 26×6**, JWT claims y duración, validación de PIN BCrypt, aislamiento multi-tenant `BranchContextHolder`, autorización STOMP por topic con código del interceptor |
| [08-flujos-criticos.md](./08-flujos-criticos.md) | **5 diagramas de secuencia Mermaid**: Pago QR + lock optimista, División por ítem, Anulación con PIN + auditoría inline, Course Control y Onboarding QR. Estrategia de testing con Testcontainers (7 tests mínimos no negociables) |

---

### ☁️ Infraestructura y Operaciones

| Documento | Descripción |
|:---|:---|
| [09-infraestructura-aws.md](./09-infraestructura-aws.md) | Topología EC2, `docker-compose.yml` dev+prod, `Dockerfile` multi-stage, `nginx.conf` con SSL + WebSocket upgrade, `.env.example`, backup PostgreSQL → S3, comandos operativos de deploy |
| [10-integraciones-externas.md](./10-integraciones-externas.md) | Transbank Webpay Plus, MercadoPago QR dinámico, SII Chile DTE con modo contingencia, patrón Strategy extensible para nuevos gateways |

---

## Decisiones de Diseño Clave (Resumen Ejecutivo)

| Decisión | Alternativa descartada | Razón |
|:---|:---|:---|
| Java 21 + Spring Boot 3.3 | Node.js / Python (V0/V1) | Tipado estático, Virtual Threads, Spring Security 6 maduro |
| PostgreSQL 16 nativo | Supabase gestionado (V1) | Control total, Flyway, tipos `TEXT[]` y `JSONB` nativos |
| Flyway por grupo de entidades | Migración monolítica | La migración única de V1 falló a mitad — schema en estado parcial |
| Lock optimista `@Version` en BILL | Lock pesimista global | Máximo throughput; solo 1 escritura por cuenta a la vez en conflicto |
| Testcontainers (PostgreSQL real) | H2 en memoria | `TEXT[]` e índices CHECK no funcionan en H2; falsos positivos en CI |
| Auditoría inline `ExceptionLogService.createLog(...)` para EXCEPTION_LOG | AOP `@Auditable` (eliminado) | Contexto explícito (reason, amount, authorizedBy) en el punto de uso |
| Autorización STOMP por topic en SUBSCRIBE | Validar solo en CONNECT | CONNECT válido no garantiza que el topic sea del `branchId` del JWT |
| PIN BCrypt en `BRANCH_ROLE` | PIN en texto plano | Antifraude — el PIN de manager protege anulaciones y descuentos |

---

## Cómo navegar la auditoría

**Si sos desarrollador backend Java**: empezá por `06-arquitectura-backend.md` → `06b` → `07` → `08`.

**Si sos arquitecto de soluciones**: empezá por `Diagrama_V3.mmd` → `08-flujos-criticos.md` → `09-infraestructura-aws.md`.

**Si sos evaluador de producto / cliente**: empezá por `00-ecosistema-maestro-sdd.md` → `CHANGELOG.md` → `rest-api.md`.

**Si sos auditor de seguridad**: empezá por `07-seguridad-y-roles.md` → `08-flujos-criticos.md` (Flujo 3 — Anulación con PIN) → `10-integraciones-externas.md` (Sección 3 — SII).
