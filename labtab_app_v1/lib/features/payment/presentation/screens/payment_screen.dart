import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/payment/presentation/providers/payment_provider.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  final String billId;
  final int totalAmount;
  final String? guestId;

  const PaymentScreen({
    super.key,
    required this.billId,
    required this.totalAmount,
    this.guestId,
  });

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  String _selectedMethod = 'CASH';
  int _tipAmount = 0;

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(paymentSubmitProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Pagar')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    const Text('Monto a pagar',
                        style: TextStyle(fontSize: 16, color: Colors.grey)),
                    const SizedBox(height: 8),
                    PriceText(
                      price: widget.totalAmount,
                      style: const TextStyle(
                          fontSize: 32, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text('Método de pago',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            _PaymentMethodTile(
              icon: Icons.money,
              title: 'Efectivo',
              subtitle: 'El mesero confirma el pago',
              isSelected: _selectedMethod == 'CASH',
              onTap: () => setState(() => _selectedMethod = 'CASH'),
            ),
            _PaymentMethodTile(
              icon: Icons.credit_card,
              title: 'Tarjeta / Webpay',
              subtitle: 'Transbank',
              isSelected: _selectedMethod == 'WEBPAY',
              onTap: () => setState(() => _selectedMethod = 'WEBPAY'),
            ),
            _PaymentMethodTile(
              icon: Icons.account_balance_wallet,
              title: 'Mercado Pago',
              subtitle: 'QR o link de pago',
              isSelected: _selectedMethod == 'MERCADO_PAGO',
              onTap: () => setState(() => _selectedMethod = 'MERCADO_PAGO'),
            ),
            _PaymentMethodTile(
              icon: Icons.qr_code,
              title: 'Transferencia',
              subtitle: 'Datos bancarios',
              isSelected: _selectedMethod == 'TRANSFER',
              onTap: () => setState(() => _selectedMethod = 'TRANSFER'),
            ),
            const SizedBox(height: 24),
            const Text('Propina (opcional)',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
            const SizedBox(height: 12),
            Row(
              children: [
                _TipButton(
                  amount: 0,
                  isSelected: _tipAmount == 0,
                  onTap: () => setState(() => _tipAmount = 0),
                ),
                const SizedBox(width: 8),
                _TipButton(
                  amount: 1000,
                  isSelected: _tipAmount == 1000,
                  onTap: () => setState(() => _tipAmount = 1000),
                ),
                const SizedBox(width: 8),
                _TipButton(
                  amount: 2000,
                  isSelected: _tipAmount == 2000,
                  onTap: () => setState(() => _tipAmount = 2000),
                ),
                const SizedBox(width: 8),
                _TipButton(
                  amount: 3000,
                  isSelected: _tipAmount == 3000,
                  onTap: () => setState(() => _tipAmount = 3000),
                ),
              ],
            ),
            const SizedBox(height: 24),
            if (paymentState.status == PaymentSubmitStatus.error)
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Text(
                  paymentState.error ?? 'Error al procesar',
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
              ),
            ElevatedButton(
              onPressed: paymentState.status == PaymentSubmitStatus.loading
                  ? null
                  : _submitPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: paymentState.status == PaymentSubmitStatus.loading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : Text(
                      'Pagar \$${widget.totalAmount + _tipAmount}',
                      style: const TextStyle(fontSize: 18),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _submitPayment() async {
    final total = widget.totalAmount + _tipAmount;

    final payment = await ref.read(paymentSubmitProvider.notifier).submitPayment(
          billId: widget.billId,
          amount: widget.totalAmount,
          tipAmount: _tipAmount,
          totalAmount: total,
          method: _selectedMethod,
          guestId: widget.guestId,
        );

    if (payment != null && mounted) {
      context.pushReplacement('/payment-success', extra: {
        'amount': total,
        'method': _selectedMethod,
        'paymentId': payment.id,
      });
    }
  }
}

class _PaymentMethodTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isSelected;
  final VoidCallback onTap;

  const _PaymentMethodTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      color: isSelected ? const Color(0xFFECFDF5) : null,
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Icon(icon, color: isSelected ? const Color(0xFF10B981) : null),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: isSelected
            ? const Icon(Icons.check_circle, color: Color(0xFF10B981))
            : null,
        onTap: onTap,
      ),
    );
  }
}

class _TipButton extends StatelessWidget {
  final int amount;
  final bool isSelected;
  final VoidCallback onTap;

  const _TipButton({
    required this.amount,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          backgroundColor: isSelected ? const Color(0xFFECFDF5) : null,
          side: BorderSide(
            color: isSelected ? const Color(0xFF10B981) : Colors.grey,
          ),
        ),
        child: Text(
          amount == 0 ? 'Sin propina' : '\$$amount',
          style: TextStyle(
            color: isSelected ? const Color(0xFF10B981) : null,
          ),
        ),
      ),
    );
  }
}
