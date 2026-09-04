import 'package:dio/dio.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/order/domain/entities/order.dart';
import 'package:labtab_app_v1/features/order/data/models/create_order_request.dart';

class OrderApi {
  final Dio _dio;

  OrderApi(this._dio);

  Future<Order> createOrder(CreateOrderRequest request) async {
    final response = await _dio.post(
      '/orders',
      data: request.toJson(),
    );
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Order.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }

  Future<List<Order>> getSessionOrders(String sessionId) async {
    final response = await _dio.get('/sessions/$sessionId/orders');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => (json as List)
          .map((e) => Order.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }
}
