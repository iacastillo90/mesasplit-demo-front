import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/core/network/dio_client.dart';
import 'package:labtab_app_v1/features/auth/data/datasources/auth_api.dart';
import 'package:labtab_app_v1/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:labtab_app_v1/features/auth/domain/repositories/auth_repository.dart';
import 'package:labtab_app_v1/core/storage/secure_storage.dart';

final secureStorageProvider = Provider<SecureStorageService>((ref) {
  return SecureStorageService();
});

final dioProvider = Provider((ref) {
  return createDio();
});

final authApiProvider = Provider<AuthApi>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthApi(dio);
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final api = ref.watch(authApiProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepositoryImpl(api, storage);
});
