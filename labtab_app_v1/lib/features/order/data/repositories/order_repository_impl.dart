import 'package:dio/dio.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/order/domain/entities/order.dart';
import 'package:labtab_app_v1/features/order/domain/repositories/order_repository.dart';
import '../datasources/order_api.dart';
import '../models/create_order_request.dart';

class OrderRepositoryImpl implements OrderRepository {
  final OrderApi _api;

  OrderRepositoryImpl(this._api);

  @override
  Future<Order> createOrder(CreateOrderRequest request) async {
    try {
      return await _api.createOrder(request);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<List<Order>> getSessionOrders(String sessionId) async {
    try {
      return await _api.getSessionOrders(sessionId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }
}
