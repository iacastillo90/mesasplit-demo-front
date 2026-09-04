import 'package:dio/dio.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/auth/data/models/guest_session_request.dart';
import 'package:labtab_app_v1/features/auth/data/models/guest_session_response.dart';
import 'package:labtab_app_v1/features/auth/data/models/auth_response.dart';
import 'package:labtab_app_v1/features/auth/data/models/login_request.dart';
import 'package:labtab_app_v1/features/auth/data/models/refresh_token_request.dart';
import 'package:labtab_app_v1/features/auth/data/models/refresh_token_response.dart';

class AuthApi {
  final Dio _dio;

  AuthApi(this._dio);

  Future<GuestSessionResponse> guestSession(GuestSessionRequest request) async {
    final response = await _dio.post(
      '/auth/guest-session',
      data: request.toJson(),
    );
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => GuestSessionResponse.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }

  Future<AuthResponse> login(LoginRequest request) async {
    final response = await _dio.post(
      '/auth/login',
      data: request.toJson(),
    );
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => AuthResponse.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }

  Future<RefreshTokenResponse> refresh(RefreshTokenRequest request) async {
    final response = await _dio.post(
      '/auth/refresh',
      data: request.toJson(),
    );
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => RefreshTokenResponse.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }

  Future<void> logout() async {
    await _dio.post('/auth/logout');
  }
}
