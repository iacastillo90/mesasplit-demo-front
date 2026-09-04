import 'package:dio/dio.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/bill/domain/entities/bill.dart';

class BillApi {
  final Dio _dio;

  BillApi(this._dio);

  Future<Bill> getSessionBill(String sessionId) async {
    final response = await _dio.get('/sessions/$sessionId/bill');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Bill.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('No hay cuenta abierta para esta sesión');
    }
    return apiResponse.data!;
  }

  Future<Bill> getBill(String billId) async {
    final response = await _dio.get('/bills/$billId');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Bill.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Cuenta no encontrada');
    }
    return apiResponse.data!;
  }

  Future<BillSummaryByGuest> getSummaryByGuest(String billId) async {
    final response = await _dio.get('/bills/$billId/summary-by-guest');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => BillSummaryByGuest.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Resumen no disponible');
    }
    return apiResponse.data!;
  }
}
