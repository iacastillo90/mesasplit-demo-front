import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../config/constants.dart';

class SecureStorageService {
  final FlutterSecureStorage _storage;

  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<void> saveAccessToken(String token) =>
      _storage.write(key: StorageKeys.accessToken, value: token);

  Future<String?> getAccessToken() =>
      _storage.read(key: StorageKeys.accessToken);

  Future<void> saveRefreshToken(String token) =>
      _storage.write(key: StorageKeys.refreshToken, value: token);

  Future<String?> getRefreshToken() =>
      _storage.read(key: StorageKeys.refreshToken);

  Future<void> saveGuestId(String id) =>
      _storage.write(key: StorageKeys.guestId, value: id);

  Future<String?> getGuestId() => _storage.read(key: StorageKeys.guestId);

  Future<void> saveDineSessionId(String id) =>
      _storage.write(key: StorageKeys.dineSessionId, value: id);

  Future<String?> getDineSessionId() =>
      _storage.read(key: StorageKeys.dineSessionId);

  Future<void> saveTableId(String id) =>
      _storage.write(key: StorageKeys.tableId, value: id);

  Future<String?> getTableId() => _storage.read(key: StorageKeys.tableId);

  Future<void> saveTableName(String name) =>
      _storage.write(key: StorageKeys.tableName, value: name);

  Future<String?> getTableName() => _storage.read(key: StorageKeys.tableName);

  Future<void> saveDisplayName(String name) =>
      _storage.write(key: StorageKeys.displayName, value: name);

  Future<String?> getDisplayName() =>
      _storage.read(key: StorageKeys.displayName);

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  Future<bool> hasTokens() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}
