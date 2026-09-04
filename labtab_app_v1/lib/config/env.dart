import 'dart:io' show Platform;

class Env {
  static const _apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');
  static const _wsBaseUrlOverride = String.fromEnvironment('WS_BASE_URL');

  static String get apiBaseUrl {
    if (_apiBaseUrlOverride.isNotEmpty) return _apiBaseUrlOverride;
    if (Platform.isAndroid) return 'http://10.0.2.2:8080/api/v1';
    if (Platform.isIOS) return 'http://localhost:8080/api/v1';
    return 'http://localhost:8080/api/v1';
  }

  static String get wsBaseUrl {
    if (_wsBaseUrlOverride.isNotEmpty) return _wsBaseUrlOverride;
    if (Platform.isAndroid) return 'ws://10.0.2.2:8080/ws';
    if (Platform.isIOS) return 'ws://localhost:8080/ws';
    return 'ws://localhost:8080/ws';
  }

  static const appEnv = String.fromEnvironment(
    'APP_ENV',
    defaultValue: 'development',
  );

  static bool get isProduction => appEnv == 'production';
}
