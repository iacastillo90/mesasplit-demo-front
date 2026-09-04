import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';
import 'package:labtab_app_v1/features/payment/data/providers/payment_providers.dart';
import 'package:labtab_app_v1/features/bill/presentation/providers/bill_provider.dart';


class PaymentSuccessScreen extends ConsumerStatefulWidget {
  final int amount;
  final String method;
  final String? paymentId;

  const PaymentSuccessScreen({
    super.key,
    required this.amount,
    required this.method,
    this.paymentId,
  });

  @override
  ConsumerState<PaymentSuccessScreen> createState() => _PaymentSuccessScreenState();
}

class _PaymentSuccessScreenState extends ConsumerState<PaymentSuccessScreen> {
  Timer? _pollingTimer;
  String _status = 'PENDING';
  int _pollCount = 0;
  final int _maxPolls = 15; // 15 polls * 2s = 30s max

  @override
  void initState() {
    super.initState();
    _startPolling();
  }

  void _startPolling() {
    if (widget.paymentId == null || widget.method == 'CASH') {
      setState(() {
        _status = 'COMPLETED';
      });
      return;
    }
    
    // TODO: abrir WebView cuando el back devuelva redirectUrl
    // Actualmente el backend no devuelve redirectUrl, así que usamos el polling como fallback.

    _pollingTimer = Timer.periodic(const Duration(seconds: 2), (timer) async {
      _pollCount++;
      if (_pollCount >= _maxPolls) {
        timer.cancel();
        if (mounted) {
          setState(() {
            _status = 'FAILED';
          });
        }
        return;
      }

      try {
        final repository = ref.read(paymentRepositoryProvider);
        final payment = await repository.getPayment(widget.paymentId!);
        
        if (mounted) {
          setState(() {
            _status = payment.status;
          });

          if (_status == 'COMPLETED' || _status == 'FAILED' || _status == 'REFUNDED') {
            timer.cancel();
          }
        }
      } catch (e) {
        // Ignoramos errores de red y reintentamos en el siguiente ciclo
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    String methodName;
    switch (widget.method) {
      case 'CASH':
        methodName = 'Efectivo';
        break;
      case 'WEBPAY':
        methodName = 'Tarjeta';
        break;
      case 'MERCADO_PAGO':
        methodName = 'Mercado Pago';
        break;
      case 'TRANSFER':
        methodName = 'Transferencia';
        break;
      default:
        methodName = widget.method;
    }

    if (_status == 'PENDING') {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(color: Color(0xFF10B981)),
              const SizedBox(height: 24),
              const Text(
                'Procesando pago...',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              Text(
                'Esperando confirmación de $methodName',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
        ),
      );
    }

    if (_status == 'FAILED' || _status == 'REFUNDED') {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: const BoxDecoration(
                    color: Colors.redAccent,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.error_outline,
                    size: 48,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Error en el pago',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                const Text(
                  'No se pudo completar la transacción.',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 48),
                ElevatedButton(
                  onPressed: () => context.pop(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    foregroundColor: Colors.white,
                    padding:
                        const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                  ),
                  child: const Text('Intentar nuevamente'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // Success State (COMPLETED)
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: const BoxDecoration(
                  color: Color(0xFF10B981),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check,
                  size: 48,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              const Text(
                '¡Pago exitoso!',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              PriceText(
                price: widget.amount,
                style: const TextStyle(fontSize: 24),
              ),
              const SizedBox(height: 8),
              Text(
                'via $methodName',
                style: const TextStyle(fontSize: 16, color: Colors.grey),
              ),
              const SizedBox(height: 48),
              ElevatedButton(
                onPressed: () {
                  ref.invalidate(billProvider);
                  context.go('/menu');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
                ),
                child: const Text('Volver al menú'),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.push('/feedback'),
                child: const Text('Dejar tu opinión'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
