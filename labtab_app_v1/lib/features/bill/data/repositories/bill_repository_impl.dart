import 'package:dio/dio.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/bill/domain/entities/bill.dart';
import 'package:labtab_app_v1/features/bill/domain/repositories/bill_repository.dart';
import '../datasources/bill_api.dart';

class BillRepositoryImpl implements BillRepository {
  final BillApi _api;

  BillRepositoryImpl(this._api);

  @override
  Future<Bill> getSessionBill(String sessionId) async {
    try {
      return await _api.getSessionBill(sessionId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<Bill> getBill(String billId) async {
    try {
      return await _api.getBill(billId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<BillSummaryByGuest> getSummaryByGuest(String billId) async {
    try {
      return await _api.getSummaryByGuest(billId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }
}
