import 'package:dio/dio.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/payment/domain/entities/payment.dart';
import 'package:labtab_app_v1/features/payment/data/models/create_payment_request.dart';

class PaymentApi {
  final Dio _dio;

  PaymentApi(this._dio);

  Future<Payment> createPayment(CreatePaymentRequest request) async {
    final response = await _dio.post(
      '/payments',
      data: request.toJson(),
    );
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Payment.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Error al procesar el pago');
    }
    return apiResponse.data!;
  }

  Future<Payment> getPayment(String paymentId) async {
    final response = await _dio.get('/payments/$paymentId');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Payment.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Pago no encontrado');
    }
    return apiResponse.data!;
  }
}
