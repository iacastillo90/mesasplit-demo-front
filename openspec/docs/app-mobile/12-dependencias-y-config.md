# 12 - Dependencias y Configuracion

## Paquetes Flutter (pubspec.yaml)

```yaml
name: labtab_mobile
description: LabTab - App del comensal
version: 1.0.0+1
publish_to: 'none'

environment:
  sdk: '>=3.5.0 <4.0.0'
  flutter: '>=3.24.0'

dependencies:
  flutter:
    sdk: flutter

  # Estado
  flutter_riverpod: ^2.6.1
  riverpod_annotation: ^2.6.1

  # Navegacion
  go_router: ^14.8.1

  # Networking
  dio: ^5.7.0
  retrofit: ^4.4.2
  retrofit_generator: ^4.4.2
  stomp_dart_client: ^2.0.0

  # Modelos
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0

  # Storage
  flutter_secure_storage: ^9.2.4
  shared_preferences: ^2.3.4
  flutter_cache_manager: ^3.4.1

  # UI
  cached_network_image: ^3.4.1
  shimmer: ^3.0.0
  gap: ^3.0.1
  intl: ^0.19.0

  # QR
  mobile_scanner: ^5.2.3

  # Pagos
  webview_flutter: ^4.10.0
  url_launcher: ^6.3.1

  # Notificaciones
  flutter_local_notifications: ^18.0.1

  # Utilidades
  uuid: ^4.5.1
  logger: ^2.5.0
  connectivity_plus: ^6.1.1
  package_info_plus: ^8.1.3
  device_info_plus: ^11.1.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^5.0.0

  # Code generation
  build_runner: ^2.4.14
  freezed: ^2.5.8
  json_serializable: ^6.9.2
  retrofit_generator: ^4.4.2
  riverpod_generator: ^2.6.3

  # Testing
  mockito: ^5.4.5
  mocktail: ^1.0.4
  patrol: ^3.13.0
  patrol_finders: ^3.13.0

  # Analysis
  dart_code_metrics: ^5.7.6

flutter:
  uses-material-design: true

  assets:
    - assets/images/
    - assets/icons/
    - assets/animations/
```

---

## Variables de Entorno

### .env (desarrollo)

```env
# API
API_BASE_URL=http://localhost:8080/api/v1
WS_BASE_URL=ws://localhost:8080/ws
APP_ENV=development

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false

# Timeouts (ms)
CONNECT_TIMEOUT=10000
RECEIVE_TIMEOUT=15000

# Cache
MENU_CACHE_TTL=300
BRANCH_CACHE_TTL=1800
PROFILE_CACHE_TTL=86400
```

### .env (produccion)

```env
# API
API_BASE_URL=https://api.labtab.cl/api/v1
WS_BASE_URL=wss://api.labtab.cl/ws
APP_ENV=production

# Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true

# Timeouts (ms)
CONNECT_TIMEOUT=5000
RECEIVE_TIMEOUT=10000

# Cache
MENU_CACHE_TTL=300
BRANCH_CACHE_TTL=1800
PROFILE_CACHE_TTL=86400
```

### Acceso a env

```dart
// lib/config/env.dart
class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080/api/v1',
  );
  
  static const wsBaseUrl = String.fromEnvironment(
    'WS_BASE_URL',
    defaultValue: 'ws://localhost:8080/ws',
  );
  
  static const appEnv = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );
  
  static bool get isProduction => appEnv == 'production';
}
```

---

## Configuracion de Android

### android/app/build.gradle

```groovy
android {
    defaultConfig {
        applicationId "cl.labtab.mobile"
        minSdk 29  // Android 10
        targetSdk 35
        versionCode 1
        versionName "1.0.0"
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### android/app/src/main/AndroidManifest.xml

```xml
<manifest>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    
    <application
        android:name="${applicationName}"
        android:label="LabTab"
        android:icon="@mipmap/ic_launcher">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme">
        </activity>
    </application>
</manifest>
```

---

## Configuracion de iOS

### ios/Runner/Info.plist

```xml
<key>CFBundleIdentifier</key>
<string>cl.labtab.mobile</string>
<key>CFBundleName</key>
<string>LabTab</string>
<key>MinimumOSVersion</key>
<string>15.0</string>
<key>NSCameraUsageDescription</key>
<string>LabTab necesita acceso a la camara para escanear QR codes de mesas</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>LabTab necesita acceso a la galeria para seleccionar avatar</string>
```

---

## Configuracion de Firebase

### Firebase project config

```dart
// firebase_options.dart (generado por flutterfire configure)
// Copiar desde Firebase Console
```

### Configuracion en main.dart

```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Secure Storage
  await FlutterSecureStorage().checkAndConfigure();
  
  // Notifications (MVP: solo locales)
  await LocalNotification.initialize();
  
  runApp(const ProviderScope(child: LabTabApp()));
}
```

---

## Configuracion de Riverpod

```dart
// lib/app.dart
class LabTabApp extends ConsumerWidget {
  const LabTabApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    
    return MaterialApp.router(
      title: 'LabTab',
      theme: LabTabTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
```

---

## Configuracion de Tema

```dart
// lib/config/theme.dart
class LabTabTheme {
  static ThemeData get light => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: const Color(0xFF10B981), // Verde LabTab
      brightness: Brightness.light,
    ),
    fontFamily: 'Inter',
    textTheme: const TextTheme(
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
      titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
      titleMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontSize: 16),
      bodyMedium: TextStyle(fontSize: 14),
      labelLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
    ),
    appBarTheme: const AppBarTheme(
      centerTitle: true,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    ),
  );
}
```

---

## Estructura de Assets

```
assets/
├── images/
│   ├── logo.png
│   ├── logo_dark.png
│   ├── empty_orders.png
│   ├── empty_bill.png
│   ├── payment_success.png
│   └── onboarding_bg.png
├── icons/
│   ├── gluten.svg
│   ├── lactose.svg
│   ├── shellfish.svg
│   ├── fish.svg
│   ├── soy.svg
│   ├── egg.svg
│   └── nuts.svg
└── animations/
    ├── loading.json (Lottie)
    ├── success.json (Lottie)
    └── scan_line.json (Lottie)
```

---

## Comandos Utiles

```bash
# Setup
flutter pub get
dart run build_runner build --delete-conflicting-outputs

# Desarrollo
flutter run --dart-define=APP_ENV=development
flutter run --dart-define=APP_ENV=development --flavor dev

# Tests
flutter test
flutter test --coverage
flutter test --coverage && genhtml coverage/lcov.info -o coverage/html

# Build
flutter build apk --release
flutter build apk --release --split-per-abi
flutter build ios --release

# Analyze
flutter analyze
dart format --set-exit-if-changed .

# Clean
flutter clean && flutter pub get
dart run build_runner clean
```
