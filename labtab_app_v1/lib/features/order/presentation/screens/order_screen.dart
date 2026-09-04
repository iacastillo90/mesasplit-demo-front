import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/order/presentation/providers/order_provider.dart';
import 'package:labtab_app_v1/features/auth/presentation/providers/auth_provider.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class OrderScreen extends ConsumerStatefulWidget {
  const OrderScreen({super.key});

  @override
  ConsumerState<OrderScreen> createState() => _OrderScreenState();
}

class _OrderScreenState extends ConsumerState<OrderScreen> {
  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  void _loadOrders() {
    final authState = ref.read(authProvider);
    final sessionId = authState.guest?.dineSessionId;
    if (sessionId != null) {
      ref.read(sessionOrdersProvider(sessionId).notifier).loadOrders();
    }
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final authState = ref.watch(authProvider);
    final submitState = ref.watch(orderSubmitProvider);
    final sessionId = authState.guest?.dineSessionId;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Pedido'),
      ),
      body: Column(
        children: [
          if (cartState.items.isNotEmpty)
            Expanded(
              flex: 0,
              child: _CartSection(cartState: cartState),
            ),
          if (submitState.status == OrderSubmitStatus.loading)
            const LinearProgressIndicator(),
          Expanded(
            child: sessionId != null
                ? _OrdersList(sessionId: sessionId)
                : const Center(child: Text('No hay sesión activa')),
          ),
        ],
      ),
      bottomNavigationBar: cartState.items.isNotEmpty
          ? SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: ElevatedButton(
                  onPressed: submitState.status == OrderSubmitStatus.loading
                      ? null
                      : _submitOrder,
                  child: Text(
                    submitState.status == OrderSubmitStatus.loading
                        ? 'Enviando...'
                        : 'Enviar pedido - \$${cartState.total}',
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Future<void> _submitOrder() async {
    final cartState = ref.read(cartProvider);
    final authState = ref.read(authProvider);
    final sessionId = authState.guest?.dineSessionId;
    final guestId = authState.guest?.id;

    if (sessionId == null) return;

    final order = await ref.read(orderSubmitProvider.notifier).submitOrder(
          dineSessionId: sessionId,
          cartItems: cartState.items,
          guestId: guestId,
        );

    if (order != null && mounted) {
      ref.read(cartProvider.notifier).clear();
      ref.read(orderSubmitProvider.notifier).reset();
      _loadOrders();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pedido enviado a cocina'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }
}

class _CartSection extends ConsumerWidget {
  final CartState cartState;

  const _CartSection({required this.cartState});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[100],
        border: Border(bottom: BorderSide(color: Colors.grey[300]!)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'En tu carrito',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          ...cartState.items.map((item) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Text('${item.quantity}x'),
                    const SizedBox(width: 8),
                    Expanded(child: Text(item.dish.name)),
                    Text('\$${item.lineTotal}'),
                    IconButton(
                      icon: const Icon(Icons.close, size: 16),
                      onPressed: () {
                        ref.read(cartProvider.notifier).removeItem(item.dish.id);
                      },
                    ),
                  ],
                ),
              )),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total:', style: TextStyle(fontWeight: FontWeight.bold)),
              PriceText(price: cartState.total),
            ],
          ),
        ],
      ),
    );
  }
}

class _OrdersList extends ConsumerWidget {
  final String sessionId;

  const _OrdersList({required this.sessionId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(sessionOrdersProvider(sessionId));

    return ordersAsync.when(
      data: (orders) {
        if (orders.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.receipt_long, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text('Aún no has hecho pedidos'),
              ],
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () =>
              ref.read(sessionOrdersProvider(sessionId).notifier).refresh(),
          child: ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: orders.length,
            itemBuilder: (context, index) {
              final order = orders[index];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 4),
                child: ExpansionTile(
                  title: Text('Pedido #${order.id.substring(0, 8)}'),
                  subtitle: Row(
                    children: [
                      _StatusChip(status: order.status),
                      const SizedBox(width: 8),
                      PriceText(price: order.total),
                    ],
                  ),
                  children: order.lines.map((line) => ListTile(
                        title: Text('${line.quantity}x ${line.name ?? 'Plato'}'),
                        trailing: _StatusChip(status: line.status),
                      )).toList(),
                ),
              );
            },
          ),
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: $e'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref
                  .read(sessionOrdersProvider(sessionId).notifier)
                  .refresh(),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;

  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    Color color;
    String label;

    switch (status) {
      case 'PLACED':
        color = Colors.blue;
        label = 'Recibido';
        break;
      case 'ACCEPTED':
        color = Colors.orange;
        label = 'Aceptado';
        break;
      case 'IN_PREPARATION':
      case 'QUEUED':
      case 'PREPARING':
        color = Colors.orange;
        label = 'Preparando';
        break;
      case 'READY':
        color = Colors.green;
        label = 'Listo';
        break;
      case 'SERVED':
        color = Colors.green[700]!;
        label = 'Servido';
        break;
      case 'CANCELLED':
        color = Colors.red;
        label = 'Cancelado';
        break;
      default:
        color = Colors.grey;
        label = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        label,
        style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w500),
      ),
    );
  }
}
