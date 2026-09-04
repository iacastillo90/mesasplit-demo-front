import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SosScreen extends ConsumerStatefulWidget {
  const SosScreen({super.key});

  @override
  ConsumerState<SosScreen> createState() => _SosScreenState();
}

class _SosScreenState extends ConsumerState<SosScreen> {
  bool _sent = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('S.O.S.'),
        backgroundColor: const Color(0xFFEF4444),
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(
              Icons.support_agent,
              size: 80,
              color: Color(0xFFEF4444),
            ),
            const SizedBox(height: 24),
            const Text(
              '¿Necesitás ayuda?',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Elegí qué necesitás y el mesero se acercará a tu mesa.',
              style: TextStyle(color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            if (_sent) ...[
              const Card(
                color: Colors.green,
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Solicitud enviada. El mesero se acercará pronto.',
                    style: TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            ] else ...[
              _SosButton(
                icon: Icons.person,
                title: 'Llamar al mesero',
                subtitle: 'Necesito atención',
                onPressed: () => _sendRequest('WAITER'),
              ),
              const SizedBox(height: 12),
              _SosButton(
                icon: Icons.receipt,
                title: 'Pedir la cuenta',
                subtitle: 'Quiero pagar',
                onPressed: () => _sendRequest('BILL'),
              ),
              const SizedBox(height: 12),
              _SosButton(
                icon: Icons.water_drop,
                title: 'Pedir agua',
                subtitle: 'Agua por favor',
                onPressed: () => _sendRequest('WATER'),
              ),
              const SizedBox(height: 12),
              _SosButton(
                icon: Icons.help_outline,
                title: 'Otro',
                subtitle: 'Ayuda general',
                onPressed: () => _sendRequest('OTHER'),
              ),
            ],
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _sendRequest(String type) async {
    // ⛔ MOCK: El backend no tiene implementado POST /service-requests
    // Cuando el back lo tenga, reemplazar por la llamada real
    setState(() {
      _sent = true;
      _error = null;
    });

    // TODO: Implementar POST /service-requests cuando el backend lo tenga
    // final authState = ref.read(authProvider);
    // await serviceRequestApi.createServiceRequest(
    //   ServiceRequestRequest(
    //     dineSessionId: authState.guest?.dineSessionId,
    //     requestType: type,
    //     tableName: authState.guest?.tableName,
    //   ),
    // );
  }
}

class _SosButton extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onPressed;

  const _SosButton({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32, color: const Color(0xFFEF4444)),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onPressed,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }
}
