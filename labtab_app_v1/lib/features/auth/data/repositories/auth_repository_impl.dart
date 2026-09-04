import 'package:dio/dio.dart';
import 'package:labtab_app_v1/core/storage/secure_storage.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/guest.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/user.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/auth_tokens.dart';
import 'package:labtab_app_v1/features/auth/domain/repositories/auth_repository.dart';
import '../datasources/auth_api.dart';
import '../models/guest_session_request.dart';
import '../models/login_request.dart';
import '../models/refresh_token_request.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthApi _api;
  final SecureStorageService _storage;

  AuthRepositoryImpl(this._api, this._storage);

  @override
  Future<Guest> guestSession({
    required String qrToken,
    String? displayName,
    List<String>? allergies,
  }) async {
    try {
      final request = GuestSessionRequest(
        qrToken: qrToken,
        displayName: displayName,
        allergies: allergies ?? [],
      );
      final guestSessionData = await _api.guestSession(request);

      await _storage.saveAccessToken(guestSessionData.accessToken);
      await _storage.saveGuestId(guestSessionData.guest.id);
      await _storage.saveDineSessionId(guestSessionData.guest.dineSessionId);
      await _storage.saveTableId(guestSessionData.guest.tableId);
      if (guestSessionData.guest.tableName != null) {
        await _storage.saveTableName(guestSessionData.guest.tableName!);
      }
      if (displayName != null) {
        await _storage.saveDisplayName(displayName);
      }

      return Guest(
        id: guestSessionData.guest.id,
        displayName: guestSessionData.guest.displayName,
        dineSessionId: guestSessionData.guest.dineSessionId,
        tableId: guestSessionData.guest.tableId,
        tableName: guestSessionData.guest.tableName,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error!;
      }
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<User> login({
    required String email,
    required String password,
  }) async {
    try {
      final request = LoginRequest(email: email, password: password);
      final authData = await _api.login(request);

      await _storage.saveAccessToken(authData.accessToken);
      await _storage.saveRefreshToken(authData.refreshToken);

      return User(
        id: authData.person.id,
        email: authData.person.email,
        fullName: authData.person.fullName,
        role: authData.person.role,
        branchId: authData.person.branchId,
        avatarUrl: authData.person.avatarUrl,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error!;
      }
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<AuthTokens> refresh(String refreshToken) async {
    try {
      final request = RefreshTokenRequest(refreshToken: refreshToken);
      final tokens = await _api.refresh(request);

      await _storage.saveAccessToken(tokens.accessToken);
      await _storage.saveRefreshToken(tokens.refreshToken);

      return AuthTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      );
    } on DioException catch (e) {
      if (e.error is AppException) {
        throw e.error!;
      }
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await _api.logout();
    } catch (_) {
      // logout puede fallar pero limpiamos local de todas formas
    } finally {
      await _storage.clearAll();
    }
  }

  @override
  Future<bool> hasValidSession() async {
    return _storage.hasTokens();
  }
}
