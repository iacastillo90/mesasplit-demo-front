# Hito MVP App Mobile — LabTab

## Objetivo
App móvil Flutter para comensales que permite unirse a una mesa vía QR, ver el menú, hacer pedidos, ver la cuenta y pagar.

## Alcance (MVP)

### Fase 1 — Setup y Arquitectura
- Proyecto Flutter con estructura Feature-First + Clean Architecture
- Configuración de tema, rutas (go_router), constantes, entorno
- Capa de red: Dio + interceptors (JWT injection, auto-refresh, error handling)
- Storage seguro: flutter_secure_storage
- Modelos compartidos: ApiResponse<T>, PageResponse<T>
- Widgets reutilizables: PriceText, SkeletonLoader

### Fase 2 — Auth / Onboarding
- Splash screen (verificar sesión existente)
- Escaneo de QR (mobile_scanner)
- Onboarding guest (nombre, alergias)
- Login staff (email/password)
- Persistencia de tokens JWT

### Fase 3 — Menú
- Secciones del menú (GET /menu/sections)
- Detalle de plato con precio, alergenos, tags
- Pull-to-refresh

### Fase 4 — Pedido
- Carrito de compras (local, stateless)
- Envío de pedido (POST /orders)
- Lista de pedidos de la sesión (GET /sessions/{id}/orders)
- Estados de línea: PENDING, IN_PROGRESS, SERVED

### Fase 5 — Cuenta y Split
- Cuenta de la sesión (GET /sessions/{id}/bill)
- Detalle de cuenta (GET /bills/{billId})
- Resumen por comensal (GET /bills/{billId}/summary-by-guest)
- Service charge configurable

### Fase 6 — Pago
- Métodos de pago: efectivo, transferencia, tarjeta, QR
 Propina (tip)
- Registro de pago (POST /payments)
- Pantalla de éxito

### Fase 7 — Polling
- Polling de pedidos cada 10s (STOMP bloqueado para GUEST)
- Indicador visual de actualización

### Fase 8 — S.O.S. y Feedback (Mocked)
- Pantalla S.O.S. (mock, sin backend)
- Pantalla Feedback (mock, sin backend)
- Flags para deshabilitar en producción

## Stack
| Capa | Tecnología |
|------|-----------|
| Framework | Flutter 3.x + Dart |
| Estado | Riverpod 2.x (StateNotifier + Provider) |
| Navegación | go_router 14.x |
| Red | Dio 5.x |
| WebSocket | stomp_dart_client 2.x |
| Storage | flutter_secure_storage 9.x |
| QR | mobile_scanner 5.x |
| UI | Material Design 3, cached_network_image, shimmer |

## Decisiones Técnicas
1. **Sin code generation**: freezed/json_serializable eliminados por incompatibilidad con Dart 3.13.x. Modelos manuales.
2. **Sin riverpod_generator**: misma incompatibilidad del analyzer. Providers manuales con StateNotifier.
3. **Sin retrofit**: retrofit_generator 4.4.2 no existe. APIs plain Dio.
4. **STOMP bloqueado para GUEST**: MVP usa polling cada 10s.
5. **S.O.S. y Feedback mocked**: Backend no implementa estos endpoints.

## Criterios de Aceptación
- [ ] `flutter analyze` → 0 issues
- [ ] `flutter test` → todos pasan
- [ ] QR scan → onboarding → menú → pedido → cuenta → pago (flujo completo)
- [ ] Datos deserializados desde envelope `{data, meta}`, nunca desde root
- [ ] App nunca calcula money para cobrar
