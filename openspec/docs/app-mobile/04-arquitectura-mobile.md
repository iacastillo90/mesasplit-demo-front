# 04 - Arquitectura Mobile

## Stack Tecnico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| **Framework** | Flutter 3.x + Dart 3.5+ | UI nativa dual-platform, rendering propio (no bridges), hot reload para iteracion rapida |
| **Estado** | Riverpod 2.x | Tipado fuerte, testable, sin BuildContext, soporte notifyListeners + async |
| **Navegacion** | go_router 14.x | Declarativa, deep links, nested navigation, guard routes |
| **Networking** | dio 5.x + retrofit 2.x | Interceptors, retry, cancelacion, type-safe API client generado por annotation |
| **WebSocket** | stomp_dart_client 2.x | STOMP over SockJS, reconnect automatico, suscripcion por topic |
| **Cache** | flutter_cache_manager | Cache de imagenes y menu con TTL configurable |
| **Secure Storage** | flutter_secure_storage | Tokens en keystore nativo (Android Keystore / iOS Keychain) |
| **Serializacion** | json_serializable + freezed | Immutable models, union types, copyWith, equals/hashCode automaticos |
| **QR** | mobile_scanner | ZXing-based, multi-format, detection en tiempo real |
| **Pagos** | Transbank SDK + MercadoPago | SDK nativos para Chile, WebView fallback |
| **Push** | firebase_messaging | FCM para notificaciones push |
| **Testing** | flutter_test + mockito + patrol | Unit, widget, E2E en unified stack |
| **Build** | build_runner | Code generation para retrofit, json_serializable, freezed |

### Por que Flutter y no React Native / Native?

| Criterio | Flutter | React Native | Native (Kotlin/Swift) |
|----------|---------|--------------|----------------------|
| Performance | **Excellent** (compiled) | Good (bridge) | **Excellent** |
| Dual platform | **1 codebase** | 1 codebase | 2 codebases |
| UI consistencia | **Pixel-perfect** | Depende de libs | Nativa |
| WebSocket nativo | **Si** (dart:io) | Necesita lib | Si |
| Tamaño app | ~20MB | ~15MB | ~8MB |
| Equipo Flutter existente | **Si** | No | No |
| Hot reload | **Si** | Si | Si (Compose) |
| QR nativo | **mobile_scanner** | react-native-camera | ZXing / AVFoundation |

**Decision**: Flutter. La consistencia visual dual-platform, el rendimiento compilado, y que el equipo ya tiene experiencia con Dart justifican la eleccion.

> **Decisión cerrada (MVP)**: la propuesta de colaboración planteaba como *hipótesis* "unificar todo en JavaScript/TypeScript con React Native y Expo" ("eso lo fundamentas tú"). El proyecto **mantiene Flutter/Dart** como stack de la app del comensal. En el MVP se entrega como **app nativa** (Android APK + iOS), probada mediante instalación manual; la publicación en tiendas es de *Producto terminado* (dic). Ver `brief-trabajo-hito-MVP-mobile.md` sección 2.1.

## Arquitectura de Capas

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION                       │
│  Screens / Widgets / Controllers (Riverpod)          │
├─────────────────────────────────────────────────────┤
│                    DOMAIN                            │
│  Entities / Use Cases / Repository Interfaces        │
├─────────────────────────────────────────────────────┤
│                      DATA                           │
│  API Client (Retrofit) / WebSocket / Local Cache    │
│  Repository Implementations / DTOs                   │
└─────────────────────────────────────────────────────┘
         │                    │
    ┌────┴────┐         ┌────┴────┐
    │  dio    │         │ stomp   │
    │  HTTP   │         │  WS     │
    └────┬────┘         └────┬────┘
         │                    │
    ┌────┴────────────────────┴────┐
    │       Backend API            │
    │   /api/v1/*  +  /ws          │
    └──────────────────────────────┘
```

## Estructura de Directorios

```
lib/
├── main.dart
├── app.dart                          # MaterialApp + router
├── config/
│   ├── env.dart                      # Environment variables
│   ├── theme.dart                    # ThemeData
│   ├── constants.dart                # API URLs, timeouts, etc
│   └── routes.dart                   # go_router config
├── core/
│   ├── network/
│   │   ├── api_client.dart           # Dio + interceptors (retrofit)
│   │   ├── api_client.g.dart         # Generated
│   │   ├── websocket_client.dart     # STOMP client
│   │   ├── interceptors/
│   │   │   ├── auth_interceptor.dart  # JWT injection
│   │   │   ├── retry_interceptor.dart
│   │   │   └── logging_interceptor.dart
│   │   └── exceptions.dart           # Network exceptions
│   ├── storage/
│   │   ├── secure_storage.dart        # Token storage
│   │   └── cache_service.dart         # flutter_cache_manager
│   ├── utils/
│   │   ├── formatters.dart            # Currency, date formatting
│   │   ├── validators.dart            # Form validation
│   │   └── extensions.dart            # Dart extensions
│   └── widgets/
│       ├── labtab_button.dart
│       ├── labtab_card.dart
│       ├── price_text.dart
│       ├── allergen_badge.dart
│       └── skeleton_loader.dart
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_remote_ds.dart
│   │   │   │   └── auth_local_ds.dart
│   │   │   ├── models/
│   │   │   │   ├── login_request.dart
│   │   │   │   ├── auth_response.dart
│   │   │   │   └── guest_session_request.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── user.dart
│   │   │   │   └── guest.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login.dart
│   │   │       ├── logout.dart
│   │   │       └── guest_onboarding.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── auth_provider.dart
│   │       ├── screens/
│   │       │   ├── login_screen.dart
│   │       │   └── onboarding_screen.dart
│   │       └── widgets/
│   │           └── login_form.dart
│   ├── menu/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── order/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── bill/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── payment/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── profile/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
    ├── providers/
    │   ├── auth_state_provider.dart
    │   ├── websocket_provider.dart
    │   └── branch_provider.dart
    └── models/
        ├── api_response.dart
        └── page_response.dart
```

## Decisiones Tecnicas Justificadas

### 1. Riverpod sobre BLoC

**Problema**: Gestion de estado global (auth, WebSocket, sesion activa).

**Opcion A: BLoC**
- Pros: Separacion clara, testable, bien documentado
- Contras: Boilerplate alto (events, states, bloc), necesita BuildContext para acceder

**Opcion B: Riverpod**
- Pros: Sin BuildContext, anotaciones @override para testing, provider auto-dispose, soporte async nativo, code generation
- Contras: Curva de aprendizaje, menos community content que BLoC

**Decision**: Riverpod. El `ConsumerWidget` + `ref.watch` es mas limpio que BLoC para nuestro caso de uso donde el estado de auth afecta toda la app.

### 2. Retrofit (code generation) sobre Dio manual

**Problema**: la app del comensal consume ~14 endpoints (guest-session, login, refresh, logout, menú, pedidos, cuenta, pagos, branch config), cada uno con su request/response y el envelope `{data, meta}`.

**Opcion A: Dio manual**
```dart
Future<List<MenuSectionResponse>> getSections() async {
  final response = await _dio.get('/api/v1/menu/sections');
  return (response.data as List).map((e) => MenuSectionResponse.fromJson(e)).toList();
}
```
-> Repetitivo, propenso a errores de tipeo, sin type safety en compile time.

**Opcion B: Retrofit**
```dart
@RestApi()
abstract class MenuApi {
  factory MenuApi(Dio dio, {String baseUrl}) = _MenuApi;
  
  @GET('/api/v1/menu/sections')
  Future<List<MenuSectionResponse>> getSections();
}
```
-> Type-safe, genera el .g.dart automaticamente, refactor seguro.

**Decision**: Retrofit. Con ~14 endpoints (más el envelope `{data, meta}`), la generacion de codigo ahorra horas de boilerplate.

### 3. Freezed para Modelos

**Problema**: DTOs necesitan `==`, `hashCode`, `toString`, `copyWith`, `fromJson`, `toJson`.

**Opcion**: `freezed` + `json_serializable`

```dart
@freezed
class DishResponse with _$DishResponse {
  const factory DishResponse({
    required String id,
    required String name,
    String? description,
    required int price,
    String? imageUrl,
    @Default(false) bool isAvailable,
    @Default([]) List<String> tags,
    @Default([]) List<String> allergens,
    @Default(0) int displayOrder,
  }) = _DishResponse;
  
  factory DishResponse.fromJson(Map<String, dynamic> json) =>
      _$DishResponseFromJson(json);
}
```

**Decision**: freezed. La inmutabilidad es clave para Riverpod y para evitar bugs de estado.

### 4. Tiempo Real (sujeto al gap GUEST)

**Problema**: El usuario necesita ver actualizaciones del estado de su pedido.

**Estado actual**: el backend publica eventos STOMP solo en `/topic/branch/{branchId}/...` y bloquea al rol GUEST en esos topics. El canal de tiempo real del comensal es una `pregunta-arquitectura` pendiente (ver 08). El MVP arranca con **polling** y migra a STOMP cuando el back habilite un topic de sesión para GUEST.

**Implementacion (condicional, post-gap)**:
```dart
class WebSocketClient {
  final StompClient _stomp;

  void subscribeToSession(String sessionId, void Function(OrderEvent) onEvent) {
    // topic por sesión: NO existe aún en el backend. Sujeto a la decisión de
    // la pregunta-arquitectura (ver 08). No asumir este topic hasta que exista.
    _stomp.subscribe(
      destination: '/topic/session/$sessionId/client', // provisional
      callback: (frame) {
        final event = OrderEvent.fromJson(jsonDecode(frame.body!));
        onEvent(event);
      },
    );
  }

  // Auto-reconnect con backoff exponencial
  void _onDisconnect() {
    Future.delayed(_reconnectDelay, () {
      _reconnectDelay = (_reconnectDelay * 2).clamp(Duration.zero, maxReconnectDelay);
      connect();
    });
  }
}
```

### 5. Cache Strategy

```
┌─────────────┬───────────┬──────────────────────────┐
│ Recurso     │ TTL       │ Estrategia                │
├─────────────┼───────────┼──────────────────────────┤
│ Menu        │ 5 min     │ Cache + stale-while-      │
│             │           │ revalidate                │
│ Branch cfg  │ 30 min    │ Cache, refresh en background │
│ Perfil      │ 24 h      │ Cache, sync on edit       │
│ JWT access  │ 4 h       │ Secure storage            │
│ JWT refresh │ 7 d       │ Secure storage + biometric │
│ Floor plan  │ Sin cache │ Siempre fresh (cambio rapido) │
│ Bill        │ Sin cache │ Siempre fresh             │
└─────────────┴───────────┴──────────────────────────┘
```

## Patron de Navegacion

```
go_router
├── /qr-scan (no auth required)
├── /onboarding (after QR scan)
├── /login
├── /home (ShellRoute with bottom nav)
│   ├── /home/menu (Tab 1)
│   │   └── /home/menu/:dishId (Detalle plato)
│   ├── /home/orders (Tab 2)
│   └── /home/bill (Tab 3)
│       └── /home/bill/split (Dividir cuenta)
│       └── /home/bill/payment (Pagar)
├── /profile
└── /payment/webpay (WebView para Transbank)
```

## Manejo de Errores

```dart
sealed class AppException implements Exception {
  final String message;
  final int? statusCode;
  
  AppException(this.message, {this.statusCode});
}

class NetworkException extends AppException { ... }
class AuthException extends AppException { ... }
class ValidationException extends AppException { ... }
class PaymentException extends AppException { ... }
class ConflictException extends AppException { ... }  // 409 - Optimistic lock
```

Los interceptors de Dio capturan errores HTTP y los convierten en `AppException` tipados.
