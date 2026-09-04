import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/auth/data/providers/auth_providers.dart';
import 'package:labtab_app_v1/features/payment/data/datasources/payment_api.dart';
import 'package:labtab_app_v1/features/payment/data/repositories/payment_repository_impl.dart';
import 'package:labtab_app_v1/features/payment/domain/repositories/payment_repository.dart';

final paymentApiProvider = Provider<PaymentApi>((ref) {
  final dio = ref.watch(dioProvider);
  return PaymentApi(dio);
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final api = ref.watch(paymentApiProvider);
  return PaymentRepositoryImpl(api);
});
