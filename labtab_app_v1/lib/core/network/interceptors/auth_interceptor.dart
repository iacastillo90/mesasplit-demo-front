import 'package:dio/dio.dart';
import '../../storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  final SecureStorageService _storage;

  AuthInterceptor(this._storage);

  @override
  void onRequest(
      RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.getAccessToken();
    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshToken = await _storage.getRefreshToken();
      if (refreshToken != null && !_isRefreshRequest(err.requestOptions)) {
        try {
          final dio = Dio(BaseOptions(
            baseUrl: err.requestOptions.baseUrl,
            headers: {'Content-Type': 'application/json'},
          ));
          final response = await dio.post('/auth/refresh', data: {
            'refreshToken': refreshToken,
          });
          final data = response.data['data'];
          final newToken = data['accessToken'] as String;
          final newRefresh = data['refreshToken'] as String;

          await _storage.saveAccessToken(newToken);
          await _storage.saveRefreshToken(newRefresh);

          err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
          final retryResponse = await dio.fetch(err.requestOptions);
          handler.resolve(retryResponse);
          return;
        } catch (_) {
          await _storage.clearAll();
        }
      }
    }
    handler.next(err);
  }

  bool _isRefreshRequest(RequestOptions options) {
    return options.path.contains('/auth/refresh');
  }
}
