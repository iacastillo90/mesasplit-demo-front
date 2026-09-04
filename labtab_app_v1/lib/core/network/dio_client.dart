import 'package:dio/dio.dart';
import 'package:labtab_app_v1/config/env.dart';
import 'exceptions.dart';

class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final statusCode = err.response?.statusCode;
    final body = err.response?.data;

    if (statusCode != null && body is Map<String, dynamic>) {
      final errorData = body['error'] as Map<String, dynamic>?;
      if (errorData != null) {
        final code = errorData['code'] as String? ?? 'UNKNOWN';
        final message =
            errorData['message'] as String? ?? 'Error desconocido';
        final detail = errorData['detail'] as String?;

        switch (statusCode) {
          case 401:
            handler.reject(DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: AuthException(message, statusCode: statusCode, code: code),
            ));
            return;
          case 404:
            handler.reject(DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: NotFoundException(message,
                  statusCode: statusCode, code: code),
            ));
            return;
          case 409:
            handler.reject(DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: ConflictException(message,
                  statusCode: statusCode, code: code, detail: detail),
            ));
            return;
          case 422:
            handler.reject(DioException(
              requestOptions: err.requestOptions,
              response: err.response,
              type: DioExceptionType.badResponse,
              error: BusinessRuleException(message,
                  statusCode: statusCode, code: code, detail: detail),
            ));
            return;
          default:
            if (statusCode >= 500) {
              handler.reject(DioException(
                requestOptions: err.requestOptions,
                response: err.response,
                type: DioExceptionType.badResponse,
                error: ServerException(message,
                    statusCode: statusCode, code: code),
              ));
              return;
            }
        }
      }
    }

    handler.reject(DioException(
      requestOptions: err.requestOptions,
      response: err.response,
      type: err.type,
      error: NetworkException(
        err.message ?? 'Error de red',
        statusCode: statusCode,
      ),
    ));
  }
}

Dio createDio() {
  final dio = Dio(BaseOptions(
    baseUrl: Env.apiBaseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.addAll([
    ErrorInterceptor(),
    LogInterceptor(
      requestBody: false,
      responseBody: false,
      logPrint: (obj) {},
    ),
  ]);

  return dio;
}
