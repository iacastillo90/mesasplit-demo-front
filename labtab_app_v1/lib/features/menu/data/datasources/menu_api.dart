import 'package:dio/dio.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/core/network/exceptions.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';

class MenuApi {
  final Dio _dio;

  MenuApi(this._dio);

  Future<List<MenuSection>> getSections() async {
    final response = await _dio.get('/menu/sections');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => (json as List)
          .map((e) => MenuSection.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
    if (apiResponse.data == null) {
      throw ServerException('Respuesta vacía del servidor');
    }
    return apiResponse.data!;
  }

  Future<Dish> getDish(String dishId) async {
    final response = await _dio.get('/menu/dishes/$dishId');
    final apiResponse = ApiResponse.fromJson(
      response.data as Map<String, dynamic>,
      (json) => Dish.fromJson(json as Map<String, dynamic>),
    );
    if (apiResponse.data == null) {
      throw ServerException('Plato no encontrado');
    }
    return apiResponse.data!;
  }
}
