import 'package:flutter_test/flutter_test.dart';
import 'package:labtab_app_v1/shared/models/api_response.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';

void main() {
  group('Dish.fromJson', () {
    test('mapea todos los campos y parsea price como int', () {
      final dish = Dish.fromJson({
        'id': 'dish-1',
        'name': 'Bife de chorizo',
        'description': 'Con puré rústico',
        'price': 15990,
        'imageUrl': 'https://example.com/bife.jpg',
        'isAvailable': false,
        'tags': ['carnes', 'parrilla'],
        'allergens': ['gluten'],
        'displayOrder': 2,
      });

      expect(dish.id, 'dish-1');
      expect(dish.name, 'Bife de chorizo');
      expect(dish.description, 'Con puré rústico');
      expect(dish.price, 15990);
      expect(dish.price, isA<int>());
      expect(dish.imageUrl, 'https://example.com/bife.jpg');
      expect(dish.isAvailable, false);
      expect(dish.tags, ['carnes', 'parrilla']);
      expect(dish.allergens, ['gluten']);
      expect(dish.displayOrder, 2);
    });

    test('aplica defaults cuando faltan campos opcionales', () {
      final dish = Dish.fromJson({
        'id': 'dish-2',
        'name': 'Agua',
        'price': 2000,
      });

      expect(dish.description, isNull);
      expect(dish.imageUrl, isNull);
      expect(dish.isAvailable, true);
      expect(dish.tags, isEmpty);
      expect(dish.allergens, isEmpty);
      expect(dish.displayOrder, 0);
    });
  });

  group('MenuSection.fromJson', () {
    test('mapea la sección con sus platos', () {
      final section = MenuSection.fromJson({
        'id': 'sec-1',
        'name': 'Entradas',
        'description': 'Para empezar',
        'displayOrder': 1,
        'dishes': [
          {'id': 'dish-1', 'name': 'Empanadas', 'price': 3500},
          {'id': 'dish-2', 'name': 'Ceviche', 'price': 8900},
        ],
      });

      expect(section.id, 'sec-1');
      expect(section.name, 'Entradas');
      expect(section.displayOrder, 1);
      expect(section.dishes.length, 2);
      expect(section.dishes.first.name, 'Empanadas');
    });
  });

  group('ApiResponse<MenuSection> envelope', () {
    test('parsea data como lista de secciones', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'data': [
            {'id': 'sec-1', 'name': 'Entradas', 'displayOrder': 1, 'dishes': []},
          ],
          'meta': {'timestamp': '2026-09-03T12:00:00Z', 'requestId': 'req-1'},
        },
        (json) => (json as List)
            .map((e) => MenuSection.fromJson(e as Map<String, dynamic>))
            .toList(),
      );

      expect(apiResponse.isSuccess, true);
      expect(apiResponse.data, isA<List<MenuSection>>());
      expect(apiResponse.data!.length, 1);
      expect(apiResponse.data!.first.name, 'Entradas');
      expect(apiResponse.meta!.requestId, 'req-1');
      expect(apiResponse.error, isNull);
    });

    test('parsea un error del envelope', () {
      final apiResponse = ApiResponse.fromJson(
        {
          'error': {
            'code': 'MENU_NOT_FOUND',
            'message': 'Menú no disponible',
            'detail': 'La sucursal no tiene menú activo',
          },
        },
        (json) => Dish.fromJson(json as Map<String, dynamic>),
      );

      expect(apiResponse.isSuccess, false);
      expect(apiResponse.data, isNull);
      expect(apiResponse.error!.code, 'MENU_NOT_FOUND');
      expect(apiResponse.error!.message, 'Menú no disponible');
      expect(apiResponse.error!.detail, 'La sucursal no tiene menú activo');
    });
  });
}
