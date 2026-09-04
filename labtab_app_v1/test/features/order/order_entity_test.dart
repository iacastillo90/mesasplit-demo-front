import 'package:flutter_test/flutter_test.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/features/order/domain/entities/order.dart';

void main() {
  group('OrderLine.fromJson', () {
    test('mapea campos y parsea unitPrice como int nullable', () {
      final line = OrderLine.fromJson({
        'id': 'line-1',
        'name': 'Bife de chorizo',
        'quantity': 2,
        'status': 'READY',
        'dishName': 'Bife de chorizo',
        'unitPrice': 15990,
      });

      expect(line.id, 'line-1');
      expect(line.name, 'Bife de chorizo');
      expect(line.quantity, 2);
      expect(line.status, 'READY');
      expect(line.dishName, 'Bife de chorizo');
      expect(line.unitPrice, 15990);
      expect(line.unitPrice, isA<int>());
    });

    test('unitPrice null cuando no viene', () {
      final line = OrderLine.fromJson({
        'id': 'line-2',
        'status': 'PENDING',
      });

      expect(line.unitPrice, isNull);
      expect(line.quantity, 1);
      expect(line.name, isNull);
    });
  });

  group('Order.fromJson', () {
    test('mapea subtotal/total como int y sus líneas', () {
      final order = Order.fromJson({
        'id': 'order-1',
        'status': 'OPEN',
        'subtotal': 31980,
        'total': 31980,
        'itemCount': 2,
        'kitchenTicketId': 'kt-1',
        'lines': [
          {'id': 'line-1', 'status': 'READY', 'quantity': 2},
        ],
      });

      expect(order.id, 'order-1');
      expect(order.status, 'OPEN');
      expect(order.subtotal, 31980);
      expect(order.total, 31980);
      expect(order.subtotal, isA<int>());
      expect(order.itemCount, 2);
      expect(order.kitchenTicketId, 'kt-1');
      expect(order.lines.length, 1);
      expect(order.lines.first.status, 'READY');
    });

    test('lines vacío cuando no viene', () {
      final order = Order.fromJson({
        'id': 'order-2',
        'status': 'OPEN',
        'subtotal': 0,
        'total': 0,
        'itemCount': 0,
      });

      expect(order.lines, isEmpty);
      expect(order.kitchenTicketId, isNull);
    });
  });

  group('ApiResponse<Order> envelope', () {
    test('parsea data como lista de pedidos', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'data': [
            {
              'id': 'order-1',
              'status': 'OPEN',
              'subtotal': 10000,
              'total': 10000,
              'itemCount': 1,
              'lines': [],
            },
          ],
          'meta': {'timestamp': '2026-09-03T12:00:00Z'},
        },
        (json) => (json as List)
            .map((e) => Order.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

      expect(apiResponse.isSuccess, true);
      expect(apiResponse.data, isA<List<Order>>());
      expect(apiResponse.data!.first.id, 'order-1');
      expect(apiResponse.meta!.timestamp, '2026-09-03T12:00:00Z');
    });

    test('parsea un error del envelope', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'error': {
            'code': 'SESSION_NOT_FOUND',
            'message': 'Sesión no encontrada',
          },
        },
        (json) => Order.fromJson(json as Map<String, dynamic>),
      );

      expect(apiResponse.isSuccess, false);
      expect(apiResponse.error!.code, 'SESSION_NOT_FOUND');
      expect(apiResponse.error!.message, 'Sesión no encontrada');
    });
  });
}
