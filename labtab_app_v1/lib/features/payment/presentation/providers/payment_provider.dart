import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/payment/domain/repositories/payment_repository.dart';
import 'package:labtab_app_v1/features/payment/domain/entities/payment.dart';
import 'package:labtab_app_v1/features/payment/data/models/create_payment_request.dart';
import 'package:labtab_app_v1/features/payment/data/providers/payment_providers.dart';

enum PaymentSubmitStatus { initial, loading, success, error }

class PaymentSubmitState {
  final PaymentSubmitStatus status;
  final Payment? payment;
  final String? error;

  const PaymentSubmitState({
    this.status = PaymentSubmitStatus.initial,
    this.payment,
    this.error,
  });
}

class PaymentSubmitNotifier extends StateNotifier<PaymentSubmitState> {
  final PaymentRepository _repository;

  PaymentSubmitNotifier(this._repository)
      : super(const PaymentSubmitState());

  Future<Payment?> submitPayment({
    required String billId,
    required int amount,
    int tipAmount = 0,
    required int totalAmount,
    required String method,
    String? provider,
    String? externalTransactionId,
    String? guestId,
  }) async {
    state = const PaymentSubmitState(status: PaymentSubmitStatus.loading);

    try {
      final request = CreatePaymentRequest(
        billId: billId,
        amount: amount,
        tipAmount: tipAmount,
        totalAmount: totalAmount,
        method: method,
        provider: provider,
        externalTransactionId: externalTransactionId,
        dineGuestId: guestId,
      );

      final payment = await _repository.createPayment(request);
      state = PaymentSubmitState(
        status: PaymentSubmitStatus.success,
        payment: payment,
      );
      return payment;
    } catch (e) {
      state = PaymentSubmitState(
        status: PaymentSubmitStatus.error,
        error: e.toString(),
      );
      return null;
    }
  }

  void reset() => state = const PaymentSubmitState();
}

final paymentSubmitProvider =
    StateNotifierProvider<PaymentSubmitNotifier, PaymentSubmitState>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return PaymentSubmitNotifier(repository);
});
