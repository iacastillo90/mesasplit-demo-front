class Bill {
  final String id;
  final String dineSessionId;
  final String status;
  final int subtotal;
  final int serviceChargeAmount;
  final int tipTotal;
  final int totalAmount;
  final int paidTotal;
  final int balanceDue;
  final int? version;

  const Bill({
    required this.id,
    required this.dineSessionId,
    required this.status,
    required this.subtotal,
    this.serviceChargeAmount = 0,
    this.tipTotal = 0,
    required this.totalAmount,
    this.paidTotal = 0,
    required this.balanceDue,
    this.version,
  });

  factory Bill.fromJson(Map<String, dynamic> json) {
    return Bill(
      id: json['id'] as String,
      dineSessionId: json['dineSessionId'] as String,
      status: json['status'] as String,
      subtotal: (json['subtotal'] as num).toInt(),
      serviceChargeAmount: (json['serviceChargeAmount'] as num?)?.toInt() ?? 0,
      tipTotal: (json['tipTotal'] as num?)?.toInt() ?? 0,
      totalAmount: (json['totalAmount'] as num).toInt(),
      paidTotal: (json['paidTotal'] as num?)?.toInt() ?? 0,
      balanceDue: (json['balanceDue'] as num).toInt(),
      version: json['version'] as int?,
    );
  }
}

class BillSummaryByGuest {
  final List<GuestBillSummary> guests;
  final List<BillLine> sharedLines;

  const BillSummaryByGuest({
    this.guests = const [],
    this.sharedLines = const [],
  });

  factory BillSummaryByGuest.fromJson(Map<String, dynamic> json) {
    return BillSummaryByGuest(
      guests: (json['guests'] as List<dynamic>?)
              ?.map((e) => GuestBillSummary.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      sharedLines: (json['sharedLines'] as List<dynamic>?)
              ?.map((e) => BillLine.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}

class GuestBillSummary {
  final String guestId;
  final String displayName;
  final List<BillLine> lines;
  final int guestTotal;
  final int guestPaid;
  final int guestBalance;

  const GuestBillSummary({
    required this.guestId,
    required this.displayName,
    this.lines = const [],
    required this.guestTotal,
    this.guestPaid = 0,
    required this.guestBalance,
  });

  factory GuestBillSummary.fromJson(Map<String, dynamic> json) {
    return GuestBillSummary(
      guestId: json['guestId'] as String,
      displayName: json['displayName'] as String,
      lines: (json['lines'] as List<dynamic>?)
              ?.map((e) => BillLine.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      guestTotal: (json['guestTotal'] as num).toInt(),
      guestPaid: (json['guestPaid'] as num?)?.toInt() ?? 0,
      guestBalance: (json['guestBalance'] as num).toInt(),
    );
  }
}

class BillLine {
  final String billLineId;
  final String name;
  final int quantity;
  final int lineTotal;
  final int paidAmount;

  const BillLine({
    required this.billLineId,
    required this.name,
    this.quantity = 1,
    required this.lineTotal,
    this.paidAmount = 0,
  });

  factory BillLine.fromJson(Map<String, dynamic> json) {
    return BillLine(
      billLineId: json['billLineId'] as String,
      name: json['name'] as String,
      quantity: json['quantity'] as int? ?? 1,
      lineTotal: (json['lineTotal'] as num).toInt(),
      paidAmount: (json['paidAmount'] as num?)?.toInt() ?? 0,
    );
  }
}
