import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/auth/data/providers/auth_providers.dart';
import 'package:labtab_app_v1/features/menu/data/datasources/menu_api.dart';
import 'package:labtab_app_v1/features/menu/data/repositories/menu_repository_impl.dart';
import 'package:labtab_app_v1/features/menu/domain/repositories/menu_repository.dart';

final menuApiProvider = Provider<MenuApi>((ref) {
  final dio = ref.watch(dioProvider);
  return MenuApi(dio);
});

final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  final api = ref.watch(menuApiProvider);
  return MenuRepositoryImpl(api);
});
