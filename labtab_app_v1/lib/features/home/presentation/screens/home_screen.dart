import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomeScreen extends StatelessWidget {
  final Widget child;

  const HomeScreen({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final currentPath = GoRouterState.of(context).matchedLocation;

    int selectedIndex = 0;
    if (currentPath.startsWith('/orders')) {
      selectedIndex = 1;
    } else if (currentPath.startsWith('/bill')) {
      selectedIndex = 2;
    }

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: selectedIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/menu');
              break;
            case 1:
              context.go('/orders');
              break;
            case 2:
              context.go('/bill');
              break;
          }
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.restaurant_menu),
            selectedIcon: Icon(Icons.restaurant_menu, color: Color(0xFF10B981)),
            label: 'Menú',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long),
            selectedIcon: Icon(Icons.receipt_long, color: Color(0xFF10B981)),
            label: 'Pedidos',
          ),
          NavigationDestination(
            icon: Icon(Icons.payment),
            selectedIcon: Icon(Icons.payment, color: Color(0xFF10B981)),
            label: 'Cuenta',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/sos'),
        backgroundColor: const Color(0xFFEF4444),
        child: const Icon(Icons.support_agent, color: Colors.white),
      ),
    );
  }
}
