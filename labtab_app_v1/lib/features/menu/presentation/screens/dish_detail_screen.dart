import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/menu/presentation/providers/menu_provider.dart';
import 'package:labtab_app_v1/features/order/presentation/providers/order_provider.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class DishDetailScreen extends ConsumerStatefulWidget {
  final String dishId;

  const DishDetailScreen({super.key, required this.dishId});

  @override
  ConsumerState<DishDetailScreen> createState() => _DishDetailScreenState();
}

class _DishDetailScreenState extends ConsumerState<DishDetailScreen> {
  int _quantity = 1;
  String? _notes;

  @override
  Widget build(BuildContext context) {
    final menuState = ref.watch(menuProvider);
    final dish = menuState.sections
        .expand((s) => s.dishes)
        .where((d) => d.id == widget.dishId)
        .firstOrNull;

    if (dish == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Plato')),
        body: const Center(child: Text('Plato no encontrado')),
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(dish.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (dish.imageUrl != null)
              Image.network(
                dish.imageUrl!,
                height: 250,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 250,
                  color: Colors.grey[200],
                  child: const Icon(Icons.restaurant, size: 64),
                ),
              )
            else
              Container(
                height: 250,
                color: Colors.grey[200],
                child: const Icon(Icons.restaurant, size: 64),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          dish.name,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                      ),
                      PriceText(price: dish.price),
                    ],
                  ),
                  if (dish.description != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      dish.description!,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                  if (dish.allergens.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Text(
                      'Alérgenos',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: dish.allergens
                          .map((a) => Chip(label: Text(a)))
                          .toList(),
                    ),
                  ],
                  const SizedBox(height: 24),
                  if (!dish.isAvailable)
                    const Card(
                      color: Colors.red,
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Text(
                          'Este plato no está disponible',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    )
                  else ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline),
                          onPressed: _quantity > 1
                              ? () => setState(() => _quantity--)
                              : null,
                          iconSize: 32,
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            '$_quantity',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline),
                          onPressed: () => setState(() => _quantity++),
                          iconSize: 32,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      decoration: const InputDecoration(
                        labelText: 'Notas (opcional)',
                        hintText: 'Ej: Sin cebolla, poco cocido...',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 2,
                      onChanged: (value) => _notes = value,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: () {
                        ref.read(cartProvider.notifier).addItem(
                              dish,
                              quantity: _quantity,
                              notes: _notes,
                            );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              '$_quantity x ${dish.name} agregado al carrito',
                            ),
                            action: SnackBarAction(
                              label: 'Ver carrito',
                              onPressed: () => context.push('/orders'),
                            ),
                          ),
                        );
                        Navigator.of(context).pop();
                      },
                      icon: const Icon(Icons.add_shopping_cart),
                      label: Text(
                        'Agregar ${_quantity > 1 ? '($_quantity)' : ''} - \$${dish.price * _quantity}',
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
