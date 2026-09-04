import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/bill/presentation/providers/bill_provider.dart';
import 'package:labtab_app_v1/features/auth/presentation/providers/auth_provider.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class BillSplitScreen extends ConsumerStatefulWidget {
  const BillSplitScreen({super.key});

  @override
  ConsumerState<BillSplitScreen> createState() => _BillSplitScreenState();
}

class _BillSplitScreenState extends ConsumerState<BillSplitScreen> {
  final Set<String> _selectedLineIds = {};

  int _calculateLocalTotal(dynamic myGuest, dynamic sharedLines) {
    int total = 0;
    if (myGuest != null) {
      for (final line in myGuest.lines) {
        if (_selectedLineIds.contains(line.billLineId)) {
          total += (line.lineTotal - line.paidAmount) as int;
        }
      }
    }
    for (final line in sharedLines) {
      if (_selectedLineIds.contains(line.billLineId)) {
        // En un caso real el backend puede dividir los items compartidos matemáticamente,
        // aquí solo sumamos el monto restante para que el usuario pague esa porción localmente.
        total += (line.lineTotal - line.paidAmount) as int;
      }
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final billState = ref.watch(billProvider);
    final authState = ref.watch(authProvider);

    if (billState.bill == null || billState.summary == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Dividir Cuenta')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    final bill = billState.bill!;
    final summary = billState.summary!;
    final myGuestId = authState.guest?.id;

    final myGuest = summary.guests.firstWhere(
      (g) => g.guestId == myGuestId,
      orElse: () => summary.guests.first,
    );

    final localTotal = _calculateLocalTotal(myGuest, summary.sharedLines);

    return Scaffold(
      appBar: AppBar(title: const Text('¿Qué deseas pagar?')),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (myGuest.lines.isNotEmpty) ...[
                  const Text(
                    'Mis Ítems',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...myGuest.lines.map((line) {
                    final remaining = line.lineTotal - line.paidAmount;
                    final isPaid = remaining <= 0;
                    return CheckboxListTile(
                      title: Text('${line.quantity}x ${line.name}'),
                      subtitle: isPaid
                          ? const Text('Pagado', style: TextStyle(color: Colors.green))
                          : null,
                      value: isPaid ? true : _selectedLineIds.contains(line.billLineId),
                      onChanged: isPaid
                          ? null
                          : (selected) {
                              setState(() {
                                if (selected == true) {
                                  _selectedLineIds.add(line.billLineId);
                                } else {
                                  _selectedLineIds.remove(line.billLineId);
                                }
                              });
                            },
                      secondary: PriceText(price: remaining),
                    );
                  }),
                  const SizedBox(height: 24),
                ],
                if (summary.sharedLines.isNotEmpty) ...[
                  const Text(
                    'Ítems Compartidos',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...summary.sharedLines.map((line) {
                    final remaining = line.lineTotal - line.paidAmount;
                    final isPaid = remaining <= 0;
                    return CheckboxListTile(
                      title: Text('${line.quantity}x ${line.name}'),
                      subtitle: isPaid
                          ? const Text('Pagado', style: TextStyle(color: Colors.green))
                          : null,
                      value: isPaid ? true : _selectedLineIds.contains(line.billLineId),
                      onChanged: isPaid
                          ? null
                          : (selected) {
                              setState(() {
                                if (selected == true) {
                                  _selectedLineIds.add(line.billLineId);
                                } else {
                                  _selectedLineIds.remove(line.billLineId);
                                }
                              });
                            },
                      secondary: PriceText(price: remaining),
                    );
                  }),
                ],
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Total a pagar:', style: TextStyle(fontSize: 16)),
                    PriceText(
                      price: localTotal > 0 ? localTotal : myGuest.guestBalance,
                      style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    final amountToPay = localTotal > 0 ? localTotal : myGuest.guestBalance;
                    if (amountToPay <= 0) return;
                    
                    context.push('/payment', extra: {
                      'billId': bill.id,
                      'totalAmount': amountToPay,
                      'guestId': authState.guest?.id,
                    });
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text('Confirmar Monto', style: TextStyle(fontSize: 18)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
