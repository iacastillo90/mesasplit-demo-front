# 09 - Estrategia de Test

## Piramide de Testing

```
        ╱╲
       ╱  ╲        E2E Tests (Patrol)
      ╱ 5% ╲       Flujos criticos completos
     ╱──────╲
    ╱        ╲     Integration Tests
   ╱   20%    ╲    Combinacion de features
  ╱────────────╲
 ╱              ╲  Unit Tests
╱     75%        ╲ Business logic, providers, repositories
╱────────────────╲
```

---

## 1. Unit Tests (75%)

> **Zero-trust**: el split de cuenta y los totales los calcula el **backend** (`summary-by-guest`). La app no tiene lógica local de dinero para cobrar; los unit tests se concentran en mapeos (envelope `{data, meta}`), formatters de precio/fecha y lógica de UI/estado, no en recalcular división.

### Business Logic

```dart
// test/domain/usecases/split_bill_test.dart
void main() {
  group('splitBillByGuest', () {
    test('divides individual items correctly', () {
      final billLines = [
        BillLine(id: '1', dineGuestId: 'g1', lineTotal: 17800),
        BillLine(id: '2', dineGuestId: 'g1', lineTotal: 18900),
        BillLine(id: '3', dineGuestId: 'g2', lineTotal: 6500),
      ];
      final guests = [
        Guest(id: 'g1', displayName: 'Juan'),
        Guest(id: 'g2', displayName: 'Maria'),
      ];

      final result = splitBillByGuest(billLines, guests);

      expect(result.guests[0].guestTotal, 36700);
      expect(result.guests[1].guestTotal, 6500);
    });

    test('divides shared items equally', () {
      final billLines = [
        BillLine(id: '1', dineGuestId: null, lineTotal: 22500),
      ];
      final guests = [
        Guest(id: 'g1', displayName: 'Juan'),
        Guest(id: 'g2', displayName: 'Maria'),
        Guest(id: 'g3', displayName: 'Pedro'),
      ];

      final result = splitBillByGuest(billLines, guests);

      expect(result.guests[0].guestTotal, 7500);
      expect(result.guests[1].guestTotal, 7500);
      expect(result.guests[2].guestTotal, 7500);
    });

    test('handles mixed individual and shared items', () {
      final billLines = [
        BillLine(id: '1', dineGuestId: 'g1', lineTotal: 17800),
        BillLine(id: '2', dineGuestId: null, lineTotal: 22500),
      ];
      final guests = [
        Guest(id: 'g1', displayName: 'Juan'),
        Guest(id: 'g2', displayName: 'Maria'),
      ];

      final result = splitBillByGuest(billLines, guests);

      // Juan: 17800 + (22500/2) = 17800 + 11250 = 29050
      expect(result.guests[0].guestTotal, 29050);
      // Maria: 0 + (22500/2) = 11250
      expect(result.guests[1].guestTotal, 11250);
    });
  });
}
```

### Providers (Riverpod)

```dart
// test/presentation/providers/auth_provider_test.dart
void main() {
  group('AuthProvider', () {
    test('emits unauthenticated when no token exists', () async {
      final container = ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(MockSecureStorage(empty: true)),
        ],
      );

      final auth = container.read(authProvider);
      expect(auth, isA<AuthState>());
      expect(auth.isAuthenticated, false);
    });

    test('emits authenticated when valid token exists', () async {
      final container = ProviderContainer(
        overrides: [
          secureStorageProvider.overrideWithValue(MockSecureStorage(
            accessToken: 'valid-token',
            refreshToken: 'valid-refresh',
          )),
        ],
      );

      final auth = container.read(authProvider);
      expect(auth.isAuthenticated, true);
    });
  });
}
```

### Repositories

```dart
// test/data/repositories/auth_repository_impl_test.dart
void main() {
  group('AuthRepositoryImpl', () {
    late MockAuthApi mockApi;
    late MockSecureStorage mockStorage;
    late AuthRepositoryImpl repository;

    setUp(() {
      mockApi = MockAuthApi();
      mockStorage = MockSecureStorage();
      repository = AuthRepositoryImpl(mockApi, mockStorage);
    });

    test('guestOnboarding saves tokens and returns guest', () async {
      when(mockApi.guestSession(any)).thenAnswer((_) async => GuestAuthResponse(
        accessToken: 'guest-token',
        expiresIn: 14400,
        guest: Guest(...),
      ));

      final result = await repository.guestOnboarding(
        qrToken: 'test-token',
        displayName: 'Juan',
      );

      verify(mockStorage.saveAccessToken('guest-token')).called(1);
      expect(result.guest.displayName, 'Juan');
    });
  });
}
```

---

## 2. Widget Tests (20%)

### Pantallas Criticas

```dart
// test/presentation/screens/menu_screen_test.dart
void main() {
  group('MenuScreen', () {
    testWidgets('displays sections and dishes', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            menuProvider.overrideWithValue(MenuState(sections: [
              MenuSection(
                id: '1',
                name: 'Entradas',
                dishes: [
                  Dish(id: '1', name: 'Empanadas', price: 8900, isAvailable: true),
                  Dish(id: '2', name: 'Ceviche', price: 12900, isAvailable: false),
                ],
              ),
            ])),
          ],
          child: MaterialApp(home: MenuScreen()),
        ),
      );

      expect(find.text('Entradas'), findsOneWidget);
      expect(find.text('Empanadas'), findsOneWidget);
      expect(find.text('Ceviche'), findsOneWidget);
      expect(find.text('$8.900'), findsOneWidget);
    });

    testWidgets('disabled dishes show no add button', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            menuProvider.overrideWithValue(MenuState(sections: [
              MenuSection(
                id: '1',
                name: 'Entradas',
                dishes: [
                  Dish(id: '1', name: 'Ceviche', isAvailable: false),
                ],
              ),
            ])),
          ],
          child: MaterialApp(home: MenuScreen()),
        ),
      );

      expect(find.byIcon(Icons.add), findsNothing);
      expect(find.text('NO DISPONIBLE'), findsOneWidget);
    });
  });
}

// test/presentation/screens/order_status_test.dart
void main() {
  group('OrderStatus', () {
    testWidgets('shows correct color for each status', (tester) async {
      // Test que cada estado tiene el color correcto
      expect(statusToColor('PLACED'), Colors.blue);
      expect(statusToColor('IN_PREPARATION'), Colors.orange);
      expect(statusToColor('READY'), Colors.green);
      expect(statusToColor('SERVED'), Colors.grey);
    });
  });
}
```

---

## 3. Integration Tests (5%)

### Flujo Critico: QR -> Pedido -> Pago

```dart
// integration_test/qr_to_payment_test.dart
void main() {
  group('QR to Payment Flow', () {
    testWidgets('complete happy path', (tester) async {
      // 1. Scan QR
      await tester.pumpApp(QrScannerScreen());
      await tester.tap(find.byType(QrScannerWidget));
      await tester.pumpAndSettle();

      // 2. Onboarding
      await tester.enterText(find.byKey(Key('name-field')), 'Juan');
      await tester.tap(find.byType(GlutenChip));
      await tester.tap(find.text('Unirme a la mesa'));
      await tester.pumpAndSettle();

      // 3. Menu loads
      expect(find.text('Entradas'), findsOneWidget);

      // 4. Add dish
      await tester.tap(find.text('Empanadas de mariscos'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Agregar'));
      await tester.pumpAndSettle();

      // 5. Orders tab shows badge
      expect(find.text('1'), findsOneWidget); // badge

      // 6. View orders
      await tester.tap(find.text('Pedidos'));
      await tester.pumpAndSettle();
      expect(find.text('Empanadas de mariscos'), findsOneWidget);

      // 7. View bill
      await tester.tap(find.text('Cuenta'));
      await tester.pumpAndSettle();
      expect(find.textContaining('\$'), findsWidgets);

      // 8. Split bill
      await tester.tap(find.text('Dividir cuenta'));
      await tester.pumpAndSettle();

      // 9. Select items
      await tester.tap(find.byType(Checkbox).first);
      await tester.pumpAndSettle();

      // 10. Pay
      await tester.tap(find.text('Pagar'));
      await tester.pumpAndSettle();

      // Verify final state
      expect(find.text('Pago exitoso'), findsOneWidget);
    });
  });
}
```

---

## Mocking Strategy

### Proveedor de Mocks

```dart
// test/helpers/mock_providers.dart
final mockAuthProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(MockAuthRepository());
});

final mockMenuProvider = StateNotifierProvider<MenuNotifier, MenuState>((ref) {
  return MenuNotifier(MockMenuRepository());
});

final mockWebSocketProvider = Provider<LabTabWebSocket>((ref) {
  return MockLabTabWebSocket();
});
```

### Datos de Test

```dart
// test/fixtures/test_data.dart
class TestData {
  static final guest = Guest(
    id: 'test-guest-id',
    displayName: 'Test Guest',
    dineSessionId: 'test-session-id',
    tableId: 'test-table-id',
    tableName: 'Mesa Test',
  );

  static final menu = [
    MenuSection(
      id: 'section-1',
      name: 'Entradas',
      dishes: [
        Dish(id: 'dish-1', name: 'Empanadas', price: 8900, isAvailable: true),
        Dish(id: 'dish-2', name: 'Papas', price: 6500, isAvailable: true),
      ],
    ),
  ];

  static final order = Order(
    id: 'order-1',
    status: 'PLACED',
    subtotal: 15400,
    total: 15400,
    lines: [
      OrderLine(id: 'line-1', name: 'Empanadas', quantity: 2, status: 'QUEUED'),
    ],
  );

  static final bill = Bill(
    id: 'bill-1',
    status: 'OPEN',
    subtotal: 15400,
    serviceChargeAmount: 1540,
    totalAmount: 16940,
    paidTotal: 0,
    balanceDue: 16940,
    version: 1,
  );
}
```

---

## Cobertura Minima

| Metrica | Target | Herramienta |
|---------|--------|-------------|
| Line coverage | >= 80% | `flutter test --coverage` |
| Branch coverage | >= 70% | `lcov` |
| Widget coverage | 100% pantallas criticas | `patrol` |
| Integration coverage | 100% flujos P0 | `integration_test` |

### Flujos que DEBEN tener E2E test

1. QR Scan -> Onboarding -> Ver Menu
2. Agregar plato -> Ver en pedidos -> Estado cambia via WS
3. Ver cuenta -> Dividir -> Pagar -> Exito
4. Login -> Ver menu (con perfil vinculado)
5. Error: QR invalido -> Mostrar error
6. Error: Plato no disponible -> No se puede agregar

---

## CI/CD Testing Pipeline

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.27.0'
      
      - name: Install dependencies
        run: flutter pub get
      
      - name: Generate code
        run: dart run build_runner build --delete-conflicting-outputs
      
      - name: Unit tests
        run: flutter test --coverage
      
      - name: Check coverage
        run: |
          COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep "lines" | awk '{print $3}')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage below 80%: $COVERAGE"
            exit 1
          fi
      
      - name: Build APK
        run: flutter build apk --debug
      
      - name: Build IPA
        run: flutter build ios --debug --no-codesign
```
