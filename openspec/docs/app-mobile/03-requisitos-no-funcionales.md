# 03 - Requisitos No Funcionales

## NFR-001: Performance

| Metrica | Target | Medicion |
|---------|--------|----------|
| Tiempo de carga inicial (cold start) | < 3s | Time to Interactive |
| Navegacion entre pantallas | < 300ms | Perceived Performance |
| Carga de menu | < 1.5s (cache hit < 200ms) | Network + Render |
| Envio de pedido | < 800ms (hasta respuesta) | API Latency |
| WebSocket latency (evento -> UI update) | < 500ms | End-to-end |
| Tamaño del APK/IPA | < 25MB | Build artifact |
| FPS en scroll (menu, items) | >= 55fps | DevTools Profiler |
| Memoria RAM maxima | < 150MB | DevTools Memory |

## NFR-002: Disponibilidad y Offline

| Escenario | Comportamiento |
|-----------|---------------|
| Sin conexion | Mostrar menu cacheado (ultima version conocida), indicador "Sin conexion" |
| Conexion lenta (3G) | Degradar imagenes a thumbnail, priorizar datos sobre estilo |
| Reconexion | Auto-reconectar WebSocket, reintentar pedidos pendientes |
| Cache TTL | Menu: 5 min, Branch config: 30 min, Perfil: 24h |

**No hay modo offline completo**: hacer pedidos y pagar requiere conexion.

## NFR-003: Seguridad

### Autenticacion

- JWT access token (4 horas) en flutter_secure_storage (NO en SharedPreferences)
- Refresh token (7 dias) en flutter_secure_storage con biometric protection
- Auto-refresh: renovar access token 5 minutos antes de expirar
- Logout: POST `/auth/logout` + borrar tokens locales

### Datos Sensibles

- Nunca loggear passwords, PINs, tokens o datos de tarjeta
- Las imagenes de tarjeta NO se almacenan (se pasan al gateway)
- El `externalTransactionId` se genera UUID v4 en el gateway, NO en la app

### Transporte

- Todas las llamadas API usan HTTPS (TLS 1.2+)
- WebSocket usa WSS (WebSocket Secure)
- Certificate pinning recomendado (fase 2)

### Biometria

- Desbloqueo de app con huella/face (Local Authentication)
- Requerir biometria para pagos > $50.000 CLP

## NFR-004: Compatibilidad

| Plataforma | Minima | Recomendada |
|------------|--------|-------------|
| Android | 10 (API 29) | 13+ |
| iOS | 15.0 | 17+ |
| Flutter | 3.24+ | 3.27+ |
| Dart | 3.5+ | 3.6+ |

### Device Support

- smartphones (portrait + landscape)
- tablets (layout adaptativo, MVP solo portrait)
- Notch / Dynamic Island: safe area adapters
- Dark mode: no en MVP (fase 2)

## NFR-005: Accesibilidad

- Contraste minimo 4.5:1 (WCAG AA)
- Touch targets minimo 48x48 dp
- Labels en todos los iconos (Semantics widget)
- Screen reader support (TalkBack / VoiceOver)
- Fontos escalables (no hardcodear tamaños)

## NFR-006: Localizacion

- MVP: solo `es-CL`
- Moneda: CLP (peso chileno, sin decimales)
- Formato de fecha: `dd/MM/yyyy`
- Formato de hora: `HH:mm`
- Timezone: `America/Santiago`
- Separador de miles: punto (`$12.500`)

## NFR-007: Testing

| Tipo | Cobertura Minima | Herramienta |
|------|------------------|-------------|
| Unit tests | 80% business logic | flutter_test + mockito |
| Widget tests | Todas las pantallas criticas | flutter_test |
| Integration tests | Flujos criticos (QR -> pedido -> pago) | integration_test + patrol |
| E2E | Happy path completo | patrol |

## NFR-008: CI/CD

- Build automatico en push a `main`
- Tests corren en CI antes de merge
- Build de APK + IPA para QA
- Deploy a Play Store (internal track) y TestFlight automatico post-merge a `release`

## NFR-009: Observabilidad

- Crash reporting: Firebase Crashlytics
- Analytics: Firebase Analytics (eventos clave: qr_scan, order_placed, payment_completed)
- Logging estructurado (no PII en logs)
- Performance monitoring: Firebase Performance

## NFR-010: Mantenibilidad

- Clean Architecture (presentation / domain / data)
- Maximo 3 niveles de imports en cualquier archivo
- Todos los widgets con const constructors cuando sea posible
- Naming: PascalCase widgets, camelCase variables, snake_case archivos
- Generacion de codigo: `build_runner` para json_serializable, freezed
