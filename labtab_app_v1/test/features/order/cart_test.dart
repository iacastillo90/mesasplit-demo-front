import 'package:flutter_test/flutter_test.dart';
import 'package:labtab_app_v1/features/order/presentation/providers/order_provider.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';

Dish _fakeDish({
  String id = 'dish-1',
  String name = 'Ceviche',
  int price = 12000,
}) {
  return Dish(
    id: id,
    name: name,
    price: price,
  );
}

void main() {
  group('CartNotifier', () {
    late CartNotifier cart;

    setUp(() {
      cart = CartNotifier();
    });

    test('estado inicial está vacío', () {
      expect(cart.state.items, isEmpty);
      expect(cart.state.total, 0);
    });

    test('addItem agrega un plato al carrito', () {
      final dish = _fakeDish();
      cart.addItem(dish);

      expect(cart.state.items.length, 1);
      expect(cart.state.items.first.dish.id, 'dish-1');
      expect(cart.state.items.first.quantity, 1);
      expect(cart.state.total, 12000);
      expect(cart.state.itemCount, 1);
    });

    test('addItem con quantity suma al existente', () {
      final dish = _fakeDish();
      cart.addItem(dish, quantity: 2);
      cart.addItem(dish, quantity: 3);

      expect(cart.state.items.length, 1);
      expect(cart.state.items.first.quantity, 5);
      expect(cart.state.itemCount, 5);
    });

    test('addItem con diferentes platos mantiene ambos', () {
      final dish1 = _fakeDish(id: 'dish-1', price: 12000);
      final dish2 = _fakeDish(id: 'dish-2', name: 'Pisco Sour', price: 8000);

      cart.addItem(dish1);
      cart.addItem(dish2);

      expect(cart.state.items.length, 2);
      expect(cart.state.total, 20000);
    });

    test('removeItem elimina un plato', () {
      final dish = _fakeDish();
      cart.addItem(dish);
      cart.removeItem('dish-1');

      expect(cart.state.items, isEmpty);
      expect(cart.state.total, 0);
    });

    test('removeItem con id inexistente no cambia nada', () {
      final dish = _fakeDish();
      cart.addItem(dish);
      cart.removeItem('nonexistent');

      expect(cart.state.items.length, 1);
    });

    test('updateQuantity cambia la cantidad', () {
      final dish = _fakeDish();
      cart.addItem(dish);
      cart.updateQuantity('dish-1', 4);

      expect(cart.state.items.first.quantity, 4);
      expect(cart.state.total, 48000);
    });

    test('updateQuantity con 0 elimina el item', () {
      final dish = _fakeDish();
      cart.addItem(dish);
      cart.updateQuantity('dish-1', 0);

      expect(cart.state.items, isEmpty);
    });

    test('updateQuantity con negativo elimina el item', () {
      final dish = _fakeDish();
      cart.addItem(dish);
      cart.updateQuantity('dish-1', -1);

      expect(cart.state.items, isEmpty);
    });

    test('clear vacía el carrito', () {
      cart.addItem(_fakeDish());
      cart.addItem(_fakeDish(id: 'dish-2'));
      cart.clear();

      expect(cart.state.items, isEmpty);
      expect(cart.state.total, 0);
    });

    test('lineTotal calcula correctamente', () {
      final item = CartItem(dish: _fakeDish(price: 5000), quantity: 3);
      expect(item.lineTotal, 15000);
    });

    test('guarda notes y courseType', () {
      final dish = _fakeDish();
      cart.addItem(dish, notes: 'Sin cebolla', courseType: 'entrada');

      expect(cart.state.items.first.notes, 'Sin cebolla');
      expect(cart.state.items.first.courseType, 'entrada');
    });
  });

  group('CartState', () {
    test('copyWith preserva valores existentes', () {
      final dish = _fakeDish();
      final state = CartState(
        items: [CartItem(dish: dish, quantity: 2)],
      );
      final copied = state.copyWith();

      expect(copied.items.length, 1);
      expect(copied.items.first.quantity, 2);
    });

    test('total suma correctamente múltiples items', () {
      final state = CartState(
        items: [
          CartItem(dish: _fakeDish(id: 'a', price: 10000), quantity: 2),
          CartItem(dish: _fakeDish(id: 'b', price: 5000), quantity: 1),
        ],
      );

      expect(state.total, 25000);
      expect(state.itemCount, 3);
    });
  });
}
