import 'package:labtab_app_v1/features/bill/domain/entities/bill.dart';

abstract class BillRepository {
  Future<Bill> getSessionBill(String sessionId);
  Future<Bill> getBill(String billId);
  Future<BillSummaryByGuest> getSummaryByGuest(String billId);
}
