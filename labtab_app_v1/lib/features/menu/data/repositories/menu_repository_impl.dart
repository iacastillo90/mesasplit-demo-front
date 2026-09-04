import 'package:dio/dio.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';
import 'package:labtab_app_v1/features/menu/domain/repositories/menu_repository.dart';
import '../datasources/menu_api.dart';

class MenuRepositoryImpl implements MenuRepository {
  final MenuApi _api;

  MenuRepositoryImpl(this._api);

  @override
  Future<List<MenuSection>> getSections() async {
    try {
      return await _api.getSections();
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }

  @override
  Future<Dish> getDish(String dishId) async {
    try {
      return await _api.getDish(dishId);
    } on DioException catch (e) {
      if (e.error is AppException) throw e.error!;
      throw NetworkException(e.message ?? 'Error de red');
    }
  }
}
