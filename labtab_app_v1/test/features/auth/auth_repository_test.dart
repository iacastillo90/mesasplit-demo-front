import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:labtab_app_v1/features/auth/data/datasources/auth_api.dart';
import 'package:labtab_app_v1/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:labtab_app_v1/features/auth/data/models/guest_session_response.dart';
import 'package:labtab_app_v1/features/auth/data/models/auth_response.dart';
import 'package:labtab_app_v1/features/auth/data/models/refresh_token_response.dart';
import 'package:labtab_app_v1/features/auth/data/models/guest_session_request.dart';
import 'package:labtab_app_v1/features/auth/data/models/login_request.dart';
import 'package:labtab_app_v1/features/auth/data/models/refresh_token_request.dart';
import 'package:labtab_app_v1/core/storage/secure_storage.dart';
import 'package:dio/dio.dart';

class MockAuthApi extends Mock implements AuthApi {}
class MockSecureStorage extends Mock implements SecureStorageService {}

void main() {
  setUpAll(() {
    registerFallbackValue(GuestSessionRequest(
      qrToken: '',
    ));
    registerFallbackValue(LoginRequest(
      email: '',
      password: '',
    ));
    registerFallbackValue(RefreshTokenRequest(
      refreshToken: '',
    ));
  });

  late AuthRepositoryImpl repository;
  late MockAuthApi mockApi;
  late MockSecureStorage mockStorage;

  setUp(() {
    mockApi = MockAuthApi();
    mockStorage = MockSecureStorage();
    repository = AuthRepositoryImpl(mockApi, mockStorage);
  });

  group('guestSession', () {
    test('guarda tokens y retorna Guest', () async {
      final response = GuestSessionResponse(
        accessToken: 'token-123',
        expiresIn: 3600,
        guest: GuestAuth(
          id: 'guest-1',
          displayName: 'Juan',
          dineSessionId: 'session-1',
          tableId: 'table-1',
          tableName: 'Mesa 5',
        ),
      );

      when(() => mockApi.guestSession(any())).thenAnswer((_) async => response);
      when(() => mockStorage.saveAccessToken(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveGuestId(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveDineSessionId(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveTableId(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveTableName(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveDisplayName(any())).thenAnswer((_) async {});

      final guest = await repository.guestSession(
        qrToken: 'qr-token-123',
        displayName: 'Juan',
      );

      expect(guest.id, 'guest-1');
      expect(guest.displayName, 'Juan');
      expect(guest.dineSessionId, 'session-1');
      expect(guest.tableId, 'table-1');
      expect(guest.tableName, 'Mesa 5');

      verify(() => mockStorage.saveAccessToken('token-123')).called(1);
      verify(() => mockStorage.saveGuestId('guest-1')).called(1);
      verify(() => mockStorage.saveDineSessionId('session-1')).called(1);
    });

    test('sin displayName no guarda tableName', () async {
      final response = GuestSessionResponse(
        accessToken: 'token-123',
        expiresIn: 3600,
        guest: GuestAuth(
          id: 'guest-1',
          displayName: 'Anónimo',
          dineSessionId: 'session-1',
          tableId: 'table-1',
        ),
      );

      when(() => mockApi.guestSession(any())).thenAnswer((_) async => response);
      when(() => mockStorage.saveAccessToken(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveGuestId(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveDineSessionId(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveTableId(any())).thenAnswer((_) async {});

      await repository.guestSession(qrToken: 'qr-token');

      verifyNever(() => mockStorage.saveDisplayName(any()));
    });

    test('error de API lanza excepción', () async {
      when(() => mockApi.guestSession(any())).thenThrow(
        DioException(
          requestOptions: RequestOptions(path: '/auth/guest-session'),
          message: 'Error de conexión',
        ),
      );

      expect(
        () => repository.guestSession(qrToken: 'qr-token'),
        throwsException,
      );
    });
  });

  group('login', () {
    test('guarda tokens y retorna User', () async {
      final response = AuthResponse(
        accessToken: 'access-123',
        refreshToken: 'refresh-123',
        expiresIn: 3600,
        person: PersonAuth(
          id: 'user-1',
          email: 'test@labtab.cl',
          fullName: 'Test User',
          role: 'ADMIN',
          branchId: 'branch-1',
        ),
      );

      when(() => mockApi.login(any())).thenAnswer((_) async => response);
      when(() => mockStorage.saveAccessToken(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveRefreshToken(any())).thenAnswer((_) async {});

      final user = await repository.login(
        email: 'test@labtab.cl',
        password: '123456',
      );

      expect(user.id, 'user-1');
      expect(user.email, 'test@labtab.cl');
      expect(user.fullName, 'Test User');
      expect(user.role, 'ADMIN');

      verify(() => mockStorage.saveAccessToken('access-123')).called(1);
      verify(() => mockStorage.saveRefreshToken('refresh-123')).called(1);
    });
  });

  group('refresh', () {
    test('guarda nuevos tokens y retorna AuthTokens', () async {
      final response = RefreshTokenResponse(
        accessToken: 'new-access',
        expiresIn: 3600,
        refreshToken: 'new-refresh',
      );

      when(() => mockApi.refresh(any())).thenAnswer((_) async => response);
      when(() => mockStorage.saveAccessToken(any())).thenAnswer((_) async {});
      when(() => mockStorage.saveRefreshToken(any())).thenAnswer((_) async {});

      final tokens = await repository.refresh('old-refresh');

      expect(tokens.accessToken, 'new-access');
      expect(tokens.refreshToken, 'new-refresh');

      verify(() => mockStorage.saveAccessToken('new-access')).called(1);
      verify(() => mockStorage.saveRefreshToken('new-refresh')).called(1);
    });
  });

  group('logout', () {
    test('limpia storage aunque el API falle', () async {
      when(() => mockApi.logout()).thenThrow(Exception('network error'));
      when(() => mockStorage.clearAll()).thenAnswer((_) async {});

      await repository.logout();

      verify(() => mockStorage.clearAll()).called(1);
    });

    test('limpia storage en éxito', () async {
      when(() => mockApi.logout()).thenAnswer((_) async {});
      when(() => mockStorage.clearAll()).thenAnswer((_) async {});

      await repository.logout();

      verify(() => mockStorage.clearAll()).called(1);
    });
  });

  group('hasValidSession', () {
    test('retorna true si hay tokens', () async {
      when(() => mockStorage.hasTokens()).thenAnswer((_) async => true);

      final result = await repository.hasValidSession();

      expect(result, true);
    });

    test('retorna false si no hay tokens', () async {
      when(() => mockStorage.hasTokens()).thenAnswer((_) async => false);

      final result = await repository.hasValidSession();

      expect(result, false);
    });
  });
}
