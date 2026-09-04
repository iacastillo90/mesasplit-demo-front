import 'package:dio/dio.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/payment/domain/entities/payment.dart';
import 'package:labtab_app_v1/features/payment/domain/repositories/payment_repository.dart';
import '../datasources/payment_api.dart';
import '../models/create_payment_request.dart';

class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentApi _api;

  PaymentRepositoryImpl(this._api);

  @override
  Future<Payment> createPayment(CreatePaymentRequest request) async {
    try {
      return await _api.createPayment(request);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<Payment> getPayment(String paymentId) async {
    try {
      return await _api.getPayment(paymentId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }
}
