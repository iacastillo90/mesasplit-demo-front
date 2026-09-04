import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:labtab_app_v1/features/bill/presentation/providers/bill_provider.dart';
import 'package:labtab_app_v1/features/auth/presentation/providers/auth_provider.dart';
import 'package:labtab_app_v1/core/widgets/price_text.dart';

class BillScreen extends ConsumerStatefulWidget {
  const BillScreen({super.key});

  @override
  ConsumerState<BillScreen> createState() => _BillScreenState();
}

class _BillScreenState extends ConsumerState<BillScreen> {
  @override
  void initState() {
    super.initState();
    _loadBill();
  }

  void _loadBill() {
    final authState = ref.read(authProvider);
    final sessionId = authState.guest?.dineSessionId;
    if (sessionId != null) {
      ref.read(billProvider.notifier).loadBill(sessionId);
    }
  }

  @override
  Widget build(BuildContext context) {
    final billState = ref.watch(billProvider);
    final authState = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Cuenta'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          ),
        ],
      ),
      body: billState.loading
          ? const Center(child: CircularProgressIndicator())
          : billState.error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt, size: 64, color: Colors.grey),
                      const SizedBox(height: 16),
                      Text(billState.error!),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _loadBill,
                        child: const Text('Reintentar'),
                      ),
                    ],
                  ),
                )
              : billState.bill == null
                  ? const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.receipt, size: 64, color: Colors.grey),
                          SizedBox(height: 16),
                          Text('Aún no hay cuenta abierta'),
                        ],
                      ),
                    )
                  : _buildBillContent(billState, authState),
    );
  }

  Widget _buildBillContent(BillState billState, AuthState authState) {
    final bill = billState.bill!;
    final summary = billState.summary;

    return RefreshIndicator(
      onRefresh: () => ref.read(billProvider.notifier).refresh(
            authState.guest?.dineSessionId ?? '',
          ),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Subtotal',
                            style: TextStyle(fontSize: 16)),
                        PriceText(price: bill.subtotal),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Servicio',
                            style: TextStyle(fontSize: 16)),
                        PriceText(price: bill.serviceChargeAmount),
                      ],
                    ),
                    if (bill.tipTotal > 0) ...[
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Propina',
                              style: TextStyle(fontSize: 16)),
                          PriceText(price: bill.tipTotal),
                        ],
                      ),
                    ],
                    const Divider(),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total',
                            style: TextStyle(
                                fontSize: 20, fontWeight: FontWeight.bold)),
                        PriceText(
                          price: bill.totalAmount,
                          style: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Pagado',
                            style: TextStyle(
                                fontSize: 16, color: Colors.grey[600])),
                        PriceText(
                          price: bill.paidTotal,
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Saldo',
                            style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: Colors.red)),
                        PriceText(
                          price: bill.balanceDue,
                          style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.red),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            if (summary != null) ...[
              const SizedBox(height: 24),
              Text('Mi parte',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 12),
              ...summary.guests.map((guest) {
                final isMe = guest.guestId == authState.guest?.id;
                return Card(
                  color: isMe ? const Color(0xFFECFDF5) : null,
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              '${guest.displayName}${isMe ? ' (tú)' : ''}',
                              style: TextStyle(
                                fontWeight: isMe
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            PriceText(price: guest.guestTotal),
                          ],
                        ),
                        if (guest.lines.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          ...guest.lines.map((line) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                        '${line.quantity}x ${line.name}'),
                                    PriceText(price: line.lineTotal),
                                  ],
                                ),
                              )),
                        ],
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Mi saldo:'),
                            PriceText(
                              price: guest.guestBalance,
                              style: TextStyle(
                                color: guest.guestBalance > 0
                                    ? Colors.red
                                    : Colors.green,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
            if (bill.status == 'OPEN' && bill.balanceDue > 0) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  context.push('/bill-split');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  foregroundColor: Colors.white,
                ),
                child: const Text('Pagar mi parte'),
              ),
            ],
            if (bill.balanceDue <= 0)
              const Card(
                color: Colors.green,
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text(
                    'Cuenta pagada',
                    style: TextStyle(color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: () => context.push('/feedback'),
              child: const Text('Dejar feedback'),
            ),
          ],
        ),
      ),
    );
  }
}
