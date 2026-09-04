import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/order/domain/repositories/order_repository.dart';
import 'package:labtab_app_v1/features/order/domain/entities/order.dart';
import 'package:labtab_app_v1/features/order/data/models/create_order_request.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';
import 'package:labtab_app_v1/features/order/data/providers/order_providers.dart';
import 'package:labtab_app_v1/config/constants.dart';
import 'package:labtab_app_v1/core/notifications/notification_service.dart';
import 'package:labtab_app_v1/core/notifications/notification_providers.dart';

enum OrderStatus { initial, loading, success, error }

class CartItem {
  final Dish dish;
  int quantity;
  String? notes;
  String? courseType;

  CartItem({
    required this.dish,
    this.quantity = 1,
    this.notes,
    this.courseType,
  });

  int get lineTotal => dish.price * quantity;
}

class CartState {
  final List<CartItem> items;

  const CartState({this.items = const []});

  CartState copyWith({List<CartItem>? items}) {
    return CartState(items: items ?? this.items);
  }

  int get total => items.fold(0, (sum, item) => sum + item.lineTotal);
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(const CartState());

  void addItem(Dish dish, {int quantity = 1, String? notes, String? courseType}) {
    final existingIndex = state.items.indexWhere(
      (item) => item.dish.id == dish.id,
    );

    if (existingIndex >= 0) {
      final updated = List<CartItem>.from(state.items);
      updated[existingIndex] = CartItem(
        dish: dish,
        quantity: updated[existingIndex].quantity + quantity,
        notes: notes,
        courseType: courseType,
      );
      state = state.copyWith(items: updated);
    } else {
      state = state.copyWith(
        items: [
          ...state.items,
          CartItem(dish: dish, quantity: quantity, notes: notes, courseType: courseType),
        ],
      );
    }
  }

  void removeItem(String dishId) {
    state = state.copyWith(
      items: state.items.where((item) => item.dish.id != dishId).toList(),
    );
  }

  void updateQuantity(String dishId, int quantity) {
    if (quantity <= 0) {
      removeItem(dishId);
      return;
    }
    final updated = List<CartItem>.from(state.items);
    final index = updated.indexWhere((item) => item.dish.id == dishId);
    if (index >= 0) {
      updated[index] = CartItem(
        dish: updated[index].dish,
        quantity: quantity,
        notes: updated[index].notes,
        courseType: updated[index].courseType,
      );
      state = state.copyWith(items: updated);
    }
  }

  void clear() => state = const CartState();
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});

enum OrderSubmitStatus { initial, loading, success, error }

class OrderSubmitState {
  final OrderSubmitStatus status;
  final Order? lastOrder;
  final String? error;

  const OrderSubmitState({
    this.status = OrderSubmitStatus.initial,
    this.lastOrder,
    this.error,
  });
}

class OrderSubmitNotifier extends StateNotifier<OrderSubmitState> {
  final OrderRepository _repository;

  OrderSubmitNotifier(this._repository) : super(const OrderSubmitState());

  Future<Order?> submitOrder({
    required String dineSessionId,
    required List<CartItem> cartItems,
    String? notes,
    String? guestId,
  }) async {
    state = const OrderSubmitState(status: OrderSubmitStatus.loading);

    try {
      final lines = cartItems
          .map((item) => CreateOrderLineRequest(
                dishId: item.dish.id,
                quantity: item.quantity,
                unitPrice: item.dish.price,
                itemNotes: item.notes,
                courseType: item.courseType,
                dineGuestId: guestId,
              ))
          .toList();

      final request = CreateOrderRequest(
        dineSessionId: dineSessionId,
        channel: 'QR',
        notes: notes,
        lines: lines,
      );

      final order = await _repository.createOrder(request);
      state = OrderSubmitState(
        status: OrderSubmitStatus.success,
        lastOrder: order,
      );
      return order;
    } catch (e) {
      state = OrderSubmitState(
        status: OrderSubmitStatus.error,
        error: e.toString(),
      );
      return null;
    }
  }

  void reset() => state = const OrderSubmitState();
}

final orderSubmitProvider =
    StateNotifierProvider<OrderSubmitNotifier, OrderSubmitState>((ref) {
  final repository = ref.watch(orderRepositoryProvider);
  return OrderSubmitNotifier(repository);
});

class SessionOrdersNotifier extends StateNotifier<AsyncValue<List<Order>>> {
  final OrderRepository _repository;
  final String sessionId;
  final NotificationService _notificationService;
  Timer? _pollTimer;
  final Set<String> _notifiedReadyLineIds = {};
  bool _firstLoadDone = false;

  SessionOrdersNotifier(
    this._repository,
    this.sessionId,
    this._notificationService,
  ) : super(const AsyncValue.loading()) {
    loadOrders();
    _startPolling();
  }

  void _startPolling() {
    _pollTimer = Timer.periodic(
      PollingConstants.orderPollInterval,
      (_) => _pollOrders(),
    );
  }

  Future<void> _pollOrders() async {
    try {
      final orders = await _repository.getSessionOrders(sessionId);
      if (mounted) {
        _checkReadyTransitions(orders);
        state = AsyncValue.data(orders);
      }
    } catch (_) {
      // Silently ignore poll errors — don't crash on background refresh
    }
  }

  void _checkReadyTransitions(List<Order> orders) {
    final readyLines = <String, OrderLine>{};
    for (final order in orders) {
      for (final line in order.lines) {
        if (line.status == 'READY') {
          readyLines[line.id] = line;
        }
      }
    }

    // Primera carga: sembrar los IDs ya en READY para no notificar de más.
    if (!_firstLoadDone) {
      _notifiedReadyLineIds.addAll(readyLines.keys);
      _firstLoadDone = true;
      return;
    }

    for (final entry in readyLines.entries) {
      if (_notifiedReadyLineIds.contains(entry.key)) continue;
      final line = entry.value;
      final dishName = line.dishName ?? line.name ?? 'Tu plato';
      unawaited(
        _notificationService.showOrderReady(
          lineId: line.id,
          dishName: dishName,
        ),
      );
      _notifiedReadyLineIds.add(line.id);
    }
  }

  Future<void> loadOrders() async {
    state = const AsyncValue.loading();
    try {
      final orders = await _repository.getSessionOrders(sessionId);
      _checkReadyTransitions(orders);
      state = AsyncValue.data(orders);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() async => loadOrders();

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }
}

final sessionOrdersProvider = StateNotifierProvider.family<
    SessionOrdersNotifier, AsyncValue<List<Order>>, String>((ref, sessionId) {
  final repository = ref.watch(orderRepositoryProvider);
  final notificationService = ref.watch(notificationServiceProvider);
  return SessionOrdersNotifier(repository, sessionId, notificationService);
});
