import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/auth/presentation/providers/auth_provider.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final guest = authState.guest;
    final user = authState.user;

    final displayName = guest?.displayName ?? user?.fullName ?? 'Invitado';
    final subtitle = guest?.tableName != null
        ? 'Mesa ${guest!.tableName}'
        : (user?.email ?? 'Sin datos');

    return Scaffold(
      appBar: AppBar(title: const Text('Perfil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Center(
            child: CircleAvatar(
              radius: 48,
              backgroundColor: const Color(0xFF10B981),
              child: Text(
                displayName.isNotEmpty ? displayName[0].toUpperCase() : '?',
                style: const TextStyle(
                  fontSize: 36,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: Text(
              displayName,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 4),
          Center(
            child: Text(
              subtitle,
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          const SizedBox(height: 32),
          Card(
            child: ListTile(
              leading: const Icon(Icons.notifications_outlined),
              title: const Text('Notificaciones'),
              subtitle: const Text('Avisos cuando tu plato esté listo'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // TODO: Implementar preferencias de notificación post-MVP
              },
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.no_food_outlined),
              title: const Text('Alergias'),
              subtitle: const Text('Tus restricciones alimentarias'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // TODO: Implementar gestión de alergias post-MVP
              },
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.help_outline),
              title: const Text('Ayuda'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                // TODO: Implementar pantalla de ayuda post-MVP
              },
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                context.go('/qr-scan');
              }
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFEF4444),
              side: const BorderSide(color: Color(0xFFEF4444)),
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
            icon: const Icon(Icons.logout),
            label: const Text('Cerrar sesión'),
          ),
        ],
      ),
    );
  }
}
