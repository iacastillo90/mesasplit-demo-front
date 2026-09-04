import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/auth/data/providers/auth_providers.dart';
import 'package:labtab_app_v1/features/order/data/datasources/order_api.dart';
import 'package:labtab_app_v1/features/order/data/repositories/order_repository_impl.dart';
import 'package:labtab_app_v1/features/order/domain/repositories/order_repository.dart';

final orderApiProvider = Provider<OrderApi>((ref) {
  final dio = ref.watch(dioProvider);
  return OrderApi(dio);
});

final orderRepositoryProvider = Provider<OrderRepository>((ref) {
  final api = ref.watch(orderApiProvider);
  return OrderRepositoryImpl(api);
});
