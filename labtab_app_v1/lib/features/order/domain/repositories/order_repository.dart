import 'package:labtab_app_v1/features/order/domain/entities/order.dart';
import 'package:labtab_app_v1/features/order/data/models/create_order_request.dart';

abstract class OrderRepository {
  Future<Order> createOrder(CreateOrderRequest request);
  Future<List<Order>> getSessionOrders(String sessionId);
}
