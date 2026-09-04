import 'package:flutter_test/flutter_test.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/features/payment/domain/entities/payment.dart';

void main() {
  group('Payment.fromJson', () {
    test('mapea montos como int', () {
      final payment = Payment.fromJson({
        'id': 'pay-1',
        'billId': 'bill-1',
        'amount': 20000,
        'tipAmount': 2000,
        'totalAmount': 22000,
        'method': 'WEBPAY',
        'status': 'COMPLETED',
        'paidAt': '2026-09-03T12:30:00Z',
        'externalTransactionId': 'tx-123',
      });

      expect(payment.id, 'pay-1');
      expect(payment.billId, 'bill-1');
      expect(payment.amount, 20000);
      expect(payment.amount, isA<int>());
      expect(payment.tipAmount, 2000);
      expect(payment.totalAmount, 22000);
      expect(payment.method, 'WEBPAY');
      expect(payment.status, 'COMPLETED');
      expect(payment.paidAt, '2026-09-03T12:30:00Z');
      expect(payment.externalTransactionId, 'tx-123');
    });

    test('tipAmount default 0 y campos opcionales null', () {
      final payment = Payment.fromJson({
        'id': 'pay-2',
        'billId': 'bill-1',
        'amount': 5000,
        'totalAmount': 5000,
        'method': 'CASH',
        'status': 'PENDING',
      });

      expect(payment.tipAmount, 0);
      expect(payment.paidAt, isNull);
      expect(payment.externalTransactionId, isNull);
    });
  });

  group('ApiResponse<Payment> envelope', () {
    test('parsea data como pago', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'data': {
            'id': 'pay-1',
            'billId': 'bill-1',
            'amount': 22000,
            'totalAmount': 22000,
            'method': 'WEBPAY',
            'status': 'COMPLETED',
          },
          'meta': {'timestamp': '2026-09-03T12:00:00Z', 'requestId': 'req-9'},
        },
        (json) => Payment.fromJson(json as Map<String, dynamic>),
      );

      expect(apiResponse.isSuccess, true);
      expect(apiResponse.data, isA<Payment>());
      expect(apiResponse.data!.status, 'COMPLETED');
      expect(apiResponse.meta!.requestId, 'req-9');
    });

    test('parsea un error del envelope', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'error': {
            'code': 'PAYMENT_FAILED',
            'message': 'El pago fue rechazado',
            'detail': 'Tarjeta sin fondos',
          },
        },
        (json) => Payment.fromJson(json as Map<String, dynamic>),
      );

      expect(apiResponse.isSuccess, false);
      expect(apiResponse.error!.code, 'PAYMENT_FAILED');
      expect(apiResponse.error!.detail, 'Tarjeta sin fondos');
    });
  });
}
