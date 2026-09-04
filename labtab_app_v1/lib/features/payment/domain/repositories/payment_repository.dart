import 'package:labtab_app_v1/features/payment/domain/entities/payment.dart';
import 'package:labtab_app_v1/features/payment/data/models/create_payment_request.dart';

abstract class PaymentRepository {
  Future<Payment> createPayment(CreatePaymentRequest request);
  Future<Payment> getPayment(String paymentId);
}
