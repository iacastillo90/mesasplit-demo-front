# Estado MVP App Mobile — LabTab

## Resumen Ejecutivo

| Métrica | Estado |
|---------|--------|
| `flutter analyze` | ✅ 0 issues |
| `flutter test` | ✅ 45/45 passing |
| Fases completadas | 8/8 |
| Archivos fuente | ~55 |
| Tests unitarios | 45 |
| Dependencias externas | 12 |

## Estado por Fase

### Fase 1 — Setup y Arquitectura ✅
- Estructura Feature-First + Clean Architecture implementada
- Theme Material3 con seed #10B981
- go_router con redirect basado en auth state
- Dio con interceptors (JWT, auto-refresh, error handling)
- SecureStorageService con 12 operaciones CRUD
- Widgets: PriceText, SkeletonLoader

### Fase 2 — Auth / Onboarding ✅
- SplashScreen, QrScanScreen, OnboardingScreen, LoginScreen
- AuthRepositoryImpl con 4 operaciones (guestSession, login, refresh, logout)
- AuthProvider con estados: initial, loading, authenticated, unauthenticated, error
- Persistencia de tokens en secure storage

### Fase 3 — Menú ✅
- MenuScreen con secciones en lista plana
- DishDetailScreen con precio (int CLP), alergenos, tags
- MenuRepositoryImpl con getSections, getDish
- Pull-to-refresh implementado

### Fase 4 — Pedido ✅
- CartNotifier con addItem, removeItem, updateQuantity, clear
- OrderSubmitNotifier con envío a POST /orders
- SessionOrdersNotifier con polling (Timer.periodic, 5s)
- OrderScreen con carrito + lista de pedidos

### Fase 5 — Cuenta y Split ✅
- BillNotifier con loadBill (auto-carga summary si OPEN)
- BillScreen con detalle + resumen por comensal
- BillRepositoryImpl con 3 operaciones

### Fase 6 — Pago ✅
- PaymentScreen con 4 métodos de pago (CASH, WEBPAY, MERCADO_PAGO, TRANSFER)
- Propina con botones predefinidos ($0, $1.000, $2.000, $3.000)
- PaymentSubmitNotifier con estados
- PaymentSuccessScreen

### Fase 7 — Polling ✅
- SessionOrdersNotifier con Timer.periodic cada 5s
- Se cancela automáticamente al dispose (salir de pantalla)
- Pull-to-refresh como alternativa manual

### Fase 8 — S.O.S. y Feedback ✅ (Mocked)
- SosScreen mock con ⛔ marker (pantalla completa)
- FeedbackScreen mock con ⛔ marker (pantalla completa)
- FAB S.O.S. visible en todas las tabs de HomeScreen

## Correcciones de Revisión (v1)

### P0 — Críticas
- ✅ **Polling implementado**: `SessionOrdersNotifier` usa `Timer.periodic` con `PollingConstants.orderPollInterval` (5s). Se cancela en `dispose()`.
- ✅ **Dinero como int**: Todos los campos de dinero cambiados de `double` a `int` (CLP no tiene decimales). Archivos: `menu_section.dart`, `order.dart`, `create_order_request.dart`, `bill.dart`, `payment.dart`, `create_payment_request.dart`, `order_provider.dart`, `price_text.dart`, `payment_screen.dart`, `payment_success_screen.dart`.
- ✅ **LogInterceptor redactado**: `requestBody: false, responseBody: false` en `dio_client.dart`.

### P1 — Resueltos
- ✅ **Split**: Implementado en `bill_split_screen.dart`. Permite seleccionar ítems locales y enviar el total a `/payment`.
- ✅ **Pago verificación**: `payment_success_screen.dart` implementa polling local de `GET /payments/{paymentId}`. Muestra spinner en `PENDING` y actualiza a `COMPLETED`/`FAILED`.
- ✅ **WebView de MercadoPago / Transbank**: Implementado el fallback de polling y agregado el TODO para el WebView para cuando el backend devuelva `redirectUrl`.
- ✅ **Feedback post-pago**: Botón "Dejar tu opinión" agregado en `PaymentSuccessScreen`. Navega a `/feedback`.

### P2 — Seguridad / Config
- ✅ **env.dart por plataforma**: Detecta Android/iOS/otro. Override via `--dart-define`.
- ✅ **debugLogDiagnostics**: Cambiado a `false`.
- ✅ **Spec sos-feedback**: Marcado "Backend pendiente" explícitamente.
- ✅ **Notificaciones locales**: `LocalNotificationService` + detección de `READY` en `SessionOrdersNotifier`.
- ✅ **Perfil**: `features/profile/` con `ProfileScreen` + ruta `/profile`.
- ✅ **Tests envelope**: `menu_entity_test`, `order_entity_test`, `payment_entity_test` (45 tests total).

## Gap Conocidos (No Fixear, Documentar)
1. Guest no puede crear sesión — requiere QR token válido
2. STOMP bloqueado para GUEST — MVP usa polling (5s)
3. S.O.S. y Feedback sin backend — mocks hardcoded
4. Pago WebView — el back no devuelve redirectUrl, se usa polling como fallback

## Archivos Principales

```
labtab_app_v1/
├── lib/
│   ├── app.dart                          # LabTabApp ConsumerWidget
│   ├── main.dart                         # Entry point
│   ├── config/
│   │   ├── env.dart                      # API_BASE_URL por plataforma
│   │   ├── theme.dart                    # LabTab light theme
│   │   ├── routes.dart                   # go_router config
│   │   └── constants.dart                # StorageKeys, ApiConstants, PollingConstants
│   ├── core/
│   │   ├── network/
│   │   │   ├── dio_client.dart           # createDio() factory
│   │   │   ├── exceptions.dart           # AppException hierarchy
│   │   │   └── interceptors/
│   │   │       └── auth_interceptor.dart # JWT + auto-refresh
│   │   ├── storage/
│   │   │   └── secure_storage.dart       # SecureStorageService
│   │   └── widgets/
│   │       ├── price_text.dart           # PriceText (int CLP)
│   │       └── skeleton_loader.dart
│   ├── shared/models/
│   │   ├── api_response.dart             # ApiResponse<T>, Meta, ApiError
│   │   └── page_response.dart            # PageResponse<T>
│   └── features/
│       ├── auth/          # 15 archivos
│       ├── menu/          # 6 archivos
│       ├── order/         # 8 archivos (con polling)
│       ├── bill/          # 6 archivos
│       ├── payment/       # 8 archivos
│       ├── sos/           # 1 archivo (mocked)
│       ├── feedback/      # 1 archivo (mocked)
│       └── home/          # 1 archivo (shell)
├── test/
│   ├── features/auth/auth_repository_test.dart     (9 tests)
│   ├── features/order/cart_test.dart               (15 tests)
│   ├── features/bill/bill_provider_test.dart       (6 tests)
│   └── widget_test.dart                           (1 test - smoke)
└── pubspec.yaml
```

## Decisiones Técnicas Tomadas

1. **Modelos plain Dart** (no code gen): freezed 4.x incompatible con Dart 3.13.x
2. **Providers manuales** (no riverpod_generator): analyzer incompatible
3. **APIs unwrap ApiResponse internamente**: los datasources parsean el envelope y devuelven el tipo de dominio directo
4. **Repositorios passthrough**: los repos delegan al API sin double-unwrap
5. **Polling en vez de STOMP**: GUEST no tiene acceso a /topic/branch/*
6. **Dinero como int**: CLP no tiene decimales, double causaba precisión innecesaria
7. **LogInterceptor sin body**: previene exposición de tokens en logs
8. **env.dart por plataforma**: funcional en Android (emulador), iOS (simulador), y desktop

## Estado de Revisión

| Checklist | Estado |
|-----------|--------|
| `Revision_AppMobile_v1.md` | ✅ **Completo** (P0 + P1 + P2 resueltos, todos `[x]`) |
| `flutter analyze` | ✅ 0 issues |
| `flutter test` | ✅ 45/45 passing |
| `flutter build apk --debug` | ✅ APK generado |
| Última actualización | 2026-09-03 |
