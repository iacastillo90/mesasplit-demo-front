import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/menu/presentation/providers/menu_provider.dart';
import 'package:labtab_app_v1/features/order/presentation/providers/order_provider.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';
import 'package:labtab_app_v1/core/widgets/skeleton_loader.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class MenuScreen extends ConsumerStatefulWidget {
  const MenuScreen({super.key});

  @override
  ConsumerState<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends ConsumerState<MenuScreen> {
  @override
  void initState() {
    super.initState();
    final state = ref.read(menuProvider);
    if (state.status == MenuStatus.initial) {
      ref.read(menuProvider.notifier).loadMenu();
    }
  }

  @override
  Widget build(BuildContext context) {
    final menuState = ref.watch(menuProvider);
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Menú'),
        actions: [
          if (cartState.itemCount > 0)
            Badge(
              label: Text('${cartState.itemCount}'),
              child: IconButton(
                icon: const Icon(Icons.shopping_cart),
                onPressed: () => context.push('/orders'),
              ),
            ),
        ],
      ),
      body: _buildBody(menuState),
    );
  }

  Widget _buildBody(MenuState state) {
    switch (state.status) {
      case MenuStatus.initial:
      case MenuStatus.loading:
        return const SkeletonLoader();
      case MenuStatus.error:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text(state.error ?? 'Error al cargar menú'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.read(menuProvider.notifier).refresh(),
                child: const Text('Reintentar'),
              ),
            ],
          ),
        );
      case MenuStatus.loaded:
        if (state.sections.isEmpty) {
          return const Center(child: Text('Menú no disponible'));
        }
        return RefreshIndicator(
          onRefresh: () => ref.read(menuProvider.notifier).refresh(),
          child: ListView.builder(
            padding: const EdgeInsets.all(8),
            itemCount: state.sections.length,
            itemBuilder: (context, index) {
              final section = state.sections[index];
              return _MenuSectionWidget(section: section);
            },
          ),
        );
    }
  }
}

class _MenuSectionWidget extends StatelessWidget {
  final MenuSection section;

  const _MenuSectionWidget({required this.section});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Text(
            section.name,
            style: Theme.of(context).textTheme.titleLarge,
          ),
        ),
        if (section.description != null)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              section.description!,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ),
        ...section.dishes.map((dish) => _DishCard(dish: dish)),
        const Divider(),
      ],
    );
  }
}

class _DishCard extends StatelessWidget {
  final Dish dish;

  const _DishCard({required this.dish});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: InkWell(
        onTap: dish.isAvailable
            ? () => context.push('/menu/${dish.id}')
            : null,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              if (dish.imageUrl != null)
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    dish.imageUrl!,
                    width: 80,
                    height: 80,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey[200],
                      child: const Icon(Icons.restaurant),
                    ),
                  ),
                )
              else
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.grey[200],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.restaurant, color: Colors.grey),
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            dish.name,
                            style: const TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 16,
                            ),
                          ),
                        ),
                        if (!dish.isAvailable)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red[100],
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Agotado',
                              style: TextStyle(
                                color: Colors.red,
                                fontSize: 12,
                              ),
                            ),
                          ),
                      ],
                    ),
                    if (dish.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        dish.description!,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 13,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 4),
                    if (dish.allergens.isNotEmpty)
                      Wrap(
                        spacing: 4,
                        children: dish.allergens
                            .map((a) => Chip(
                                  label: Text(a, style: const TextStyle(fontSize: 10)),
                                  visualDensity: VisualDensity.compact,
                                  padding: EdgeInsets.zero,
                                ))
                            .toList(),
                      ),
                    const SizedBox(height: 4),
                    PriceText(price: dish.price),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
