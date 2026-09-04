# Plan de Integración Front ↔ Back — MesaSplit → LabTab (Hito Alfa)

> Objetivo: conectar `Demo_MesaSplit` (front) al backend `LabTab-Back` (Alfa) aprovechando las
> vistas para testear el back, **sin borrar nada de la demo** (las funcionalidades MVP quedan
> mockeadas detrás de un flag). En paralelo: Swagger en español + documentación `.docx`.

## Restricciones
- **No borrar nada** de `Demo_MesaSplit`: fixtures, vistas, tests se conservan.
- Patrón adapter (00-ecosistema §13.7): solo se cambia el interior de `services/`, jamás componentes/stores.
- Lo **Alfa** se conecta al back; lo **MVP** (S.O.S., reservas, inventario, DTE/SII, delivery, what-if, RRHH) queda mock.

## Mapeo vista → backend
| Vista | Rol backend | Endpoints clave |
|:--|:--|:--|
| Portal | — | `POST /auth/login` |
| Cliente | GUEST | `POST /auth/guest-session`, `GET /menu/sections`, `POST /orders` |
| Mozo | STAFF | `GET /branch/tables`, `POST /sessions`, `POST /orders`, `PATCH /menu/dishes/{id}/availability` |
| KDS | KITCHEN | `GET /kitchen/tickets`, `PATCH /kitchen/tickets/{id}/status` + WS |
| Caja | STAFF/MANAGER | `POST /bills`, `POST /payments`, `PATCH /bills/{id}/apply-discount` |
| Radar | MANAGER | `GET /branch/tables` + WS, `GET /exceptions` |
| Super Admin | SUPERADMIN | (mayormente MVP: SII, inventario, what-if quedan mock) |

## Sprints

### Sprint 0 — Cimientos
- Swagger en español: `@Tag` + `@Operation` en controllers.
- Activar CORS: `.cors(Customizer.withDefaults())` en `SecurityFilterChain`.
- Cliente API en el front: `src/api/httpClient.js` (JWT + envelope `{data, meta}`).
- Flag `VITE_DEMO_MODE=backend|same-device`.
- **DoD:** build front y back en verde; Swagger visible; CORS OK desde Vite.

### Sprint 1 — Auth + roles
- Portal/login → `POST /auth/login`; guardar token; mapeo de roles front→back.
- **DoD:** login real con `mozo@labtab.cl`/`LabTab2026!` desde la demo.

### Sprint 2 — Mozo
- Menú, mesas/pisos, abrir sesión, tomar pedido, Lista 86.
- **DoD:** mozo crea sesión y pedido contra PostgreSQL real.

### Sprint 3 — Cocina + realtime
- Tickets, estados, recall + WebSocket STOMP (`order.item_added`, `kds.item_ready`, `course.fire`, `kds.stock_86`).
- **DoD:** pedido del mozo aparece en KDS en tiempo real.

### Sprint 4 — Caja
- Cuenta, división por comensal, pagos, descuento con PIN.
- **DoD:** cobro + split funcionando contra el back.

### Sprint 5 — Local Admin (Radar)
- Mesas en vivo (WS `table.status_changed`), feed de excepciones.
- **DoD:** radar refleja mesas en tiempo real.

### Sprint 6 — Cliente (GUEST)
- Onboarding QR, menú, pedir (own-session ya enforce en el back).
- **DoD:** cliente escanea QR y pide.

### Sprint 7 — Cierre + documentación
- Super Admin (lo Alfa conectado, lo MVP mock documentado).
- `Avances.docx` (informe de entrega) + `Entidades.docx` (documentación técnica por entidad/capa).
- Pruebas end-to-end con las vistas reales.

## Orden
Sprint 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7. Docs y Swagger se generan en paralelo.
