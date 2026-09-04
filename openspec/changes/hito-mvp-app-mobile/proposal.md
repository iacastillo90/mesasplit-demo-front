# Proposal: Hito MVP App Mobile — LabTab Comensal

## Contexto y Motivación

La app móvil Flutter para comensales de LabTab necesita ser implementada siguiendo SDD (Spec-Driven Development). El backend Spring Boot ya tiene los endpoints listos. La app debe permitir el flujo completo: QR → unirse → menú → pedido → cuenta → pago.

## Alcance del Cambio

- **App Flutter nueva** en `labtab_app_v1/`
- **8 fases**: Setup, Auth, Menú, Pedido, Cuenta, Pago, Polling, S.O.S./Feedback
- **~50 archivos fuente** en estructura Feature-First + Clean Architecture
- **30 tests unitarios** (auth_repository, cart, bill_provider)
- **0 issues** en `flutter analyze`

## Stack

| Capa | Tecnología | Decisión |
|------|-----------|----------|
| Framework | Flutter 3.x + Dart | Cierre de stack |
| Estado | Riverpod 2.x (StateNotifier) | Sin code gen (analyzer incompatible) |
| Navegación | go_router 14.x | ShellRoute para bottom nav |
| Red | Dio 5.x | Plain (retrofit eliminado) |
| Storage | flutter_secure_storage 9.x | JWT + datos de sesión |
| QR | mobile_scanner 5.x | Escaneo de cámara |

## Decisiones Clave

1. **Sin code generation**: freezed/json_serializable/build_runner eliminados por incompatibilidad con Dart 3.13.x
2. **Sin riverpod_generator**: misma razón. Providers manuales con StateNotifier
3. **APIs unwrap ApiResponse internamente**: datasources parsean envelope, repos son passthrough
4. **Zero-trust money**: app NUNCA calcula precios para cobrar; backend es source of truth
5. **Polling en vez de STOMP**: GUEST no tiene acceso a `/topic/branch/*`
6. **S.O.S./Feedback mocked**: backend no implementa estos endpoints

## Gaps Conocidos

1. Guest no puede crear sesión — requiere QR token válido
2. STOMP bloqueado para GUEST — MVP usa polling cada 10s
3. S.O.S. y Feedback sin backend — mocks con flags
4. No hay registro desde la app — solo login staff
5. Perfil es read-only — no hay endpoint de edición

## Plan de Rollback

Si el MVP falla en integración con backend:
1. Mantener mocks activos para S.O.S./Feedback
2. Usar Prism mock server para demos
3. Reducir polling a 30s si hay rate limiting
