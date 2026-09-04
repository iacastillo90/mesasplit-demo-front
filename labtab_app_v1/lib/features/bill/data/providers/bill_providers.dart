import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/auth/data/providers/auth_providers.dart';
import 'package:labtab_app_v1/features/bill/data/datasources/bill_api.dart';
import 'package:labtab_app_v1/features/bill/data/repositories/bill_repository_impl.dart';
import 'package:labtab_app_v1/features/bill/domain/repositories/bill_repository.dart';

final billApiProvider = Provider<BillApi>((ref) {
  final dio = ref.watch(dioProvider);
  return BillApi(dio);
});

final billRepositoryProvider = Provider<BillRepository>((ref) {
  final api = ref.watch(billApiProvider);
  return BillRepositoryImpl(api);
});
