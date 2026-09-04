import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/bill/domain/repositories/bill_repository.dart';
import 'package:labtab_app_v1/features/bill/domain/entities/bill.dart';
import 'package:labtab_app_v1/features/bill/data/providers/bill_providers.dart';

class BillState {
  final bool loading;
  final Bill? bill;
  final BillSummaryByGuest? summary;
  final String? error;

  const BillState({
    this.loading = false,
    this.bill,
    this.summary,
    this.error,
  });

  BillState copyWith({
    bool? loading,
    Bill? bill,
    BillSummaryByGuest? summary,
    String? error,
  }) {
    return BillState(
      loading: loading ?? this.loading,
      bill: bill ?? this.bill,
      summary: summary ?? this.summary,
      error: error ?? this.error,
    );
  }
}

class BillNotifier extends StateNotifier<BillState> {
  final BillRepository _repository;

  BillNotifier(this._repository) : super(const BillState());

  Future<void> loadBill(String sessionId) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final bill = await _repository.getSessionBill(sessionId);
      state = state.copyWith(loading: false, bill: bill);

      if (bill.status == 'OPEN') {
        final summary = await _repository.getSummaryByGuest(bill.id);
        state = state.copyWith(summary: summary);
      }
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> refresh(String sessionId) async => loadBill(sessionId);
}

final billProvider = StateNotifierProvider<BillNotifier, BillState>((ref) {
  final repository = ref.watch(billRepositoryProvider);
  return BillNotifier(repository);
});
