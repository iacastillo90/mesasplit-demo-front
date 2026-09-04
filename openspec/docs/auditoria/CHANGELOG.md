# CHANGELOG — LabTab

Trazabilidad de la evolución técnica del proyecto. Cada versión documenta
funcionalidades baseline, limitaciones encontradas y decisiones de ruptura.

---

## V3 — Backend Java (Próximo)

**Estado**: En planificación  
**Stack**: Java 21 LTS + Spring Boot 3.3.x + PostgreSQL 16 + Docker Compose + AWS EC2

### Decisiones de ruptura respecto a V1 y V2

| Decisión | Razón |
|:---|:---|
| Java en lugar de Node/Python | Tipado estático reduce la clase de bugs de runtime que afectaron a V0 y V1 |
| PostgreSQL nativo en lugar de Supabase | Control total del schema, Flyway para migraciones, sin dependencia de terceros |
| Lock optimista en `BILL` | V0 y V1 no tenían control de concurrencia — el escenario QR+POS era un cobro duplicado silencioso |
| Flyway por grupo de entidades | La migración monolítica de Supabase (V1) falló a mitad de ejecución y dejó el schema en estado parcial |
| Tests con Testcontainers | H2 en memoria no replica TEXT[] ni JSONB de PostgreSQL — los tests de V1 pasaban pero fallaban en producción |
| paquete `security/` separado | V0 y V1 mezclaban lógica de auth con controladores — imposible de auditar |
| Auditoría antifraude inline (ExceptionLogService) | V0 y V1 no tenían EXCEPTION_LOG — fraude indetectable |
| STOMP con interceptor de autorización por topic | V1 usaba Socket.IO sin validación de branchId en SUBSCRIBE — cualquier cliente podía escuchar cualquier sucursal |

### Funcionalidades planificadas para V3

- [ ] 29 entidades del `Diagrama_V3.mmd` como modelos JPA
- [ ] Autonomía total de base de datos — PostgreSQL 16 nativo sin Supabase ni RLS externo
- [ ] 14 grupos de endpoints REST (ver `rest-api.md`)
- [ ] 11 eventos WebSocket/STOMP (ver `websocket-payloads.md`)
- [ ] Flyway: 13 migraciones (V1-V12 schema + V13 seed dev para datos dinámicos de demo)
- [ ] Spring Security 6 + JWT con aislamiento por `branchId`
- [ ] Lock optimista en BILL para concurrencia QR+POS
- [x] Auditoría inline (ExceptionLogService.createLog con contexto) → EXCEPTION_LOG automático
- [ ] 7 tests mínimos no negociables (ver Doc 08)
- [ ] Docker Compose para dev y producción
- [ ] Deploy en EC2 con Nginx + Certbot

---

## V2 — Demo Frontend React (Actual)

**Estado**: Activo — en venta  
**Stack**: React 18.3 + Vite 6 + Tailwind 3.4 + Zustand 5 + Vitest 3  
**Repositorio**: `LabTab` (frontend demo)

### Las 37 fases ejecutadas (resumen)

| Fase | Descripción |
|:---|:---|
| 1-4 | Setup de stack: Vite + React + Tailwind + ESLint + Prettier |
| 5-8 | Sistema de diseño: tokens, tipografía, componentes base |
| 9-12 | Vista Portal/Hub: landing page y navegación entre vistas |
| 13-16 | Vista Cliente (Mesa Virtual): QR onboarding, catálogo, pedido |
| 17-20 | Vista Garzón: gestión de mesas, órdenes, KDS notificaciones |
| 21-24 | Vista KDS Cocina: modo oscuro estricto, tickets, recall |
| 25-28 | Vista Local Admin Radar: plano de sala, feed de excepciones |
| 29-32 | Vista Super Admin: placeholder corporate view |
| 33-36 | BroadcastChannel para sincronización entre vistas (mismo dispositivo) |
| 37 | Suite de tests: Vitest 3 + Testing Library — 21 tests green en 6 suites |

### Funcionalidades que superan V0 y V1

- División de cuenta por ítem y por comensal con UI interactiva
- Course Control / Marchar Tiempos (no existía en V0 ni V1)
- Feed de Excepciones del Local Admin con alert.fraud en tiempo real
- Escudo de Alergias (allergies cross-check entre PERSON_PROFILE y DISH.allergens)
- Lista 86 (quiebre de stock) propagada en tiempo real a todas las vistas
- S.O.S. de mesa (call.waiter) con acuse de recibo del mozo
- Modo oscuro estricto en KDS (#011623) para lectura a distancia en cocina
- Recall de ticket KDS (no existía en V0 ni V1)
- QR token por mesa con sesión de comensal anónima
- 21 tests automatizados contra 0 tests en V0 y V1

### Limitaciones de V2 (que resuelve V3)

- Sin backend real — usa BroadcastChannel solo en el mismo dispositivo
- Sin persistencia — los datos se pierden al recargar
- Sin control de concurrencia — el escenario QR+POS simultáneo no está controlado
- Sin autenticación real — roles simulados en el store de Zustand
- Sin aislamiento de sucursal — cualquier usuario ve todos los datos del demo
- Sin SII/Transbank real — los pagos son simulados (mock)

---

## V1 — Backend Python (Archivado)

**Estado**: Archivado — descontinuado  
**Stack**: Python + FastAPI + Supabase (PostgreSQL gestionado)

### Qué mejoró respecto a V0

- API REST más estructurada con FastAPI
- Uso de Supabase como base de datos gestionada (eliminó la gestión manual de PostgreSQL)
- Primeros contratos de API documentados

### Limitaciones encontradas en auditoría técnica

- **Cero tests** — ninguna cobertura unitaria ni de integración
- **Migración monolítica en Supabase** que falló a mitad de ejecución — schema en estado parcial
- **Sin control de concurrencia** en pagos — cobro duplicado posible
- **Sin auditoría** de anulaciones ni descuentos — fraude indetectable
- **Socket.IO sin validación de branchId** en subscripción — cualquier cliente escuchaba cualquier sucursal
- **Supabase RLS** configurado parcialmente — lagunas de aislamiento detectadas en auditoría
- **Sin manejo de zona horaria** — timestamps en UTC inconsistentes con timestamps del SII en Chile

### Motivo del descarte

La deuda técnica en seguridad (aislamiento de tenant) y ausencia de tests hacía
que cualquier corrección requiriera reescribir casi todo el código existente.
El equipo decidió que era más eficiente iniciar V3 con Java sobre una base correcta
que parchear V1 indefinidamente.

---

## V0 — Backend Node.js (Archivado)

**Estado**: Archivado — descontinuado  
**Stack**: Node.js + Express + PostgreSQL (gestionado manualmente)

### Funcionalidades baseline

- API REST básica para mesas, órdenes y pagos
- WebSocket con Socket.IO para notificaciones en tiempo real
- PostgreSQL como base de datos

### Limitaciones encontradas en auditoría técnica

- **Cero tests** — ninguna cobertura
- **Sin migraciones formales** — schema aplicado manualmente con scripts SQL no versionados
- **Sin autenticación JWT** — tokens simples sin expiración ni renovación
- **Sin control de concurrencia** — race conditions en pagos y cierre de cuentas
- **Sin auditoría** — no existía el concepto de EXCEPTION_LOG
- **Sin aislamiento multi-tenant** — datos de todas las sucursales accesibles desde cualquier sesión
- **Gestión manual de PostgreSQL** — sin Docker, sin backups automatizados

### Razón del descarte

Deuda técnica acumulada hacía que cada nueva funcionalidad introducía regresiones.
El equipo decidió reescribir desde cero con V1 (Python), y posteriormente con V3 (Java).

---

*Este CHANGELOG es mantenido por el equipo técnico de LabTab.
Última actualización: 2025-01-15.*
