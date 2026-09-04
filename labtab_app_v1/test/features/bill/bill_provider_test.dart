import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:labtab_app_v1/features/bill/domain/repositories/bill_repository.dart';
import 'package:labtab_app_v1/features/bill/presentation/providers/bill_provider.dart';
import 'package:labtab_app_v1/features/bill/domain/entities/bill.dart';

class MockBillRepository extends Mock implements BillRepository {}

Bill _fakeBill({
  String id = 'bill-1',
  String status = 'OPEN',
  int subtotal = 50000,
  int totalAmount = 55000,
  int balanceDue = 55000,
}) {
  return Bill(
    id: id,
    dineSessionId: 'session-1',
    status: status,
    subtotal: subtotal,
    totalAmount: totalAmount,
    balanceDue: balanceDue,
  );
}

BillSummaryByGuest _fakeSummary() {
  return const BillSummaryByGuest(
    guests: [
      GuestBillSummary(
        guestId: 'guest-1',
        displayName: 'Juan',
        guestTotal: 27500,
        guestBalance: 27500,
      ),
      GuestBillSummary(
        guestId: 'guest-2',
        displayName: 'María',
        guestTotal: 27500,
        guestBalance: 27500,
      ),
    ],
  );
}

void main() {
  late BillNotifier notifier;
  late MockBillRepository mockRepo;

  setUp(() {
    mockRepo = MockBillRepository();
    notifier = BillNotifier(mockRepo);
  });

  group('loadBill', () {
    test('carga bill OPEN con summary', () async {
      final bill = _fakeBill(status: 'OPEN');
      final summary = _fakeSummary();

      when(() => mockRepo.getSessionBill('session-1'))
          .thenAnswer((_) async => bill);
      when(() => mockRepo.getSummaryByGuest('bill-1'))
          .thenAnswer((_) async => summary);

      await notifier.loadBill('session-1');

      expect(notifier.state.loading, false);
      expect(notifier.state.bill, isNotNull);
      expect(notifier.state.bill!.id, 'bill-1');
      expect(notifier.state.bill!.status, 'OPEN');
      expect(notifier.state.summary, isNotNull);
      expect(notifier.state.summary!.guests.length, 2);
      expect(notifier.state.error, isNull);
    });

    test('si bill no está OPEN, no carga summary', () async {
      final bill = _fakeBill(status: 'CLOSED');

      when(() => mockRepo.getSessionBill('session-1'))
          .thenAnswer((_) async => bill);

      await notifier.loadBill('session-1');

      expect(notifier.state.bill!.status, 'CLOSED');
      expect(notifier.state.summary, isNull);
    });

    test('error guarda mensaje de error', () async {
      when(() => mockRepo.getSessionBill('session-1'))
          .thenThrow(Exception('Cuenta no encontrada'));

      await notifier.loadBill('session-1');

      expect(notifier.state.loading, false);
      expect(notifier.state.error, isNotNull);
      expect(notifier.state.bill, isNull);
    });

    test('muestra loading mientras carga', () async {
      when(() => mockRepo.getSessionBill('session-1'))
          .thenAnswer((_) async {
        await Future.delayed(const Duration(milliseconds: 50));
        return _fakeBill();
      });

      final future = notifier.loadBill('session-1');
      expect(notifier.state.loading, true);
      await future;
      expect(notifier.state.loading, false);
    });
  });

  group('BillState', () {
    test('copyWith preserva valores existentes', () {
      const state = BillState(loading: false, error: null);
      final bill = _fakeBill();
      final updated = state.copyWith(bill: bill);

      expect(updated.bill, bill);
      expect(updated.loading, false);
    });

    test('copyWith reemplaza loading', () {
      const state = BillState(loading: true);
      final updated = state.copyWith(loading: false);

      expect(updated.loading, false);
    });
  });
}
