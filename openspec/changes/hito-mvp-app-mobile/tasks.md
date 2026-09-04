# Tasks: Hito MVP App Mobile — LabTab Comensal

## Fase 1 — Setup y Arquitectura
- [x] 1.1 Crear proyecto Flutter con pubspec.yaml <!-- id: 1.1 -->
- [x] 1.2 Configurar tema Material3 (theme.dart) <!-- id: 1.2 -->
- [x] 1.3 Configurar rutas go_router con ShellRoute <!-- id: 1.3 -->
- [x] 1.4 Crear constants.dart (StorageKeys, ApiConstants, PollingConstants) <!-- id: 1.4 -->
- [x] 1.5 Crear env.dart (API_BASE_URL, WS_BASE_URL) <!-- id: 1.5 -->
- [x] 1.6 Crear dio_client.dart con interceptors <!-- id: 1.6 -->
- [x] 1.7 Crear exceptions.dart (AppException sealed hierarchy) <!-- id: 1.7 -->
- [x] 1.8 Crear secure_storage.dart <!-- id: 1.8 -->
- [x] 1.9 Crear widgets reutilizables (PriceText, SkeletonLoader) <!-- id: 1.9 -->
- [x] 1.10 Crear shared models (ApiResponse, PageResponse) <!-- id: 1.10 -->

## Fase 2 — Auth / Onboarding
- [x] 2.1 Crear entities (Guest, User, AuthTokens) <!-- id: 2.1 -->
- [x] 2.2 Crear models (GuestSessionRequest/Response, LoginRequest, AuthResponse, RefreshTokenRequest/Response) <!-- id: 2.2 -->
- [x] 2.3 Crear AuthApi (datasource) <!-- id: 2.3 -->
- [x] 2.4 Crear AuthRepository interface + impl <!-- id: 2.4 -->
- [x] 2.5 Crear AuthProvider (StateNotifier) <!-- id: 2.5 -->
- [x] 2.6 Crear SplashScreen <!-- id: 2.6 -->
- [x] 2.7 Crear QrScanScreen <!-- id: 2.7 -->
- [x] 2.8 Crear OnboardingScreen <!-- id: 2.8 -->
- [x] 2.9 Crear LoginScreen <!-- id: 2.9 -->

## Fase 3 — Menú
- [x] 3.1 Crear entities (MenuSection, Dish) <!-- id: 3.1 -->
- [x] 3.2 Crear MenuApi (datasource) <!-- id: 3.2 -->
- [x] 3.3 Crear MenuRepository interface + impl <!-- id: 3.3 -->
- [x] 3.4 Crear MenuProvider <!-- id: 3.4 -->
- [x] 3.5 Crear MenuScreen <!-- id: 3.5 -->
- [x] 3.6 Crear DishDetailScreen <!-- id: 3.6 -->

## Fase 4 — Pedido
- [x] 4.1 Crear entities (Order, OrderLine) <!-- id: 4.1 -->
- [x] 4.2 Crear models (CreateOrderRequest) <!-- id: 4.2 -->
- [x] 4.3 Crear OrderApi (datasource) <!-- id: 4.3 -->
- [x] 4.4 Crear OrderRepository interface + impl <!-- id: 4.4 -->
- [x] 4.5 Crear CartProvider (StateNotifier) <!-- id: 4.5 -->
- [x] 4.6 Crear OrderSubmitProvider <!-- id: 4.6 -->
- [x] 4.7 Crear SessionOrdersProvider (polling) <!-- id: 4.7 -->
- [x] 4.8 Crear OrderScreen <!-- id: 4.8 -->

## Fase 5 — Cuenta y Split
- [x] 5.1 Crear entities (Bill, BillSummaryByGuest, GuestBillSummary, BillLine) <!-- id: 5.1 -->
- [x] 5.2 Crear BillApi (datasource) <!-- id: 5.2 -->
- [x] 5.3 Crear BillRepository interface + impl <!-- id: 5.3 -->
- [x] 5.4 Crear BillProvider <!-- id: 5.4 -->
- [x] 5.5 Crear BillScreen <!-- id: 5.5 -->

## Fase 6 — Pago
- [x] 6.1 Crear entities (Payment) <!-- id: 6.1 -->
- [x] 6.2 Crear models (CreatePaymentRequest) <!-- id: 6.2 -->
- [x] 6.3 Crear PaymentApi (datasource) <!-- id: 6.3 -->
- [x] 6.4 Crear PaymentRepository interface + impl <!-- id: 6.4 -->
- [x] 6.5 Crear PaymentProvider <!-- id: 6.5 -->
- [x] 6.6 Crear PaymentScreen <!-- id: 6.6 -->
- [x] 6.7 Crear PaymentSuccessScreen <!-- id: 6.7 -->

## Fase 7 — Polling
- [x] 7.1 Implementar SessionOrdersNotifier con Timer <!-- id: 7.1 -->
- [x] 7.2 Integrar polling en OrderScreen <!-- id: 7.2 -->

## Fase 8 — S.O.S. y Feedback
- [x] 8.1 Crear SosScreen (mocked) <!-- id: 8.1 -->
- [x] 8.2 Crear FeedbackScreen (mocked) <!-- id: 8.2 -->
- [x] 8.3 Crear HomeScreen con bottom nav + FAB S.O.S. <!-- id: 8.3 -->

## Verificación
- [x] 9.1 flutter analyze → 0 issues <!-- id: 9.1 -->
- [x] 9.2 flutter test → 30/30 passing <!-- id: 9.2 -->
- [x] 9.3 Crear entregables (Hito, Estado, Plan Integración) <!-- id: 9.3 -->
- [x] 9.4 Crear SDD specs para todas las capabilities <!-- id: 9.4 -->
- [x] 9.5 Crear SDD change (proposal, design, tasks) <!-- id: 9.5 -->
