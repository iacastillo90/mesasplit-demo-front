import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';

abstract class MenuRepository {
  Future<List<MenuSection>> getSections();
  Future<Dish> getDish(String dishId);
}
