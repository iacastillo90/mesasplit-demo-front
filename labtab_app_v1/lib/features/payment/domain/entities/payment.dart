class Payment {
  final String id;
  final String billId;
  final int amount;
  final int tipAmount;
  final int totalAmount;
  final String method;
  final String status;
  final String? paidAt;
  final String? externalTransactionId;

  const Payment({
    required this.id,
    required this.billId,
    required this.amount,
    this.tipAmount = 0,
    required this.totalAmount,
    required this.method,
    required this.status,
    this.paidAt,
    this.externalTransactionId,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      billId: json['billId'] as String,
      amount: (json['amount'] as num).toInt(),
      tipAmount: (json['tipAmount'] as num?)?.toInt() ?? 0,
      totalAmount: (json['totalAmount'] as num).toInt(),
      method: json['method'] as String,
      status: json['status'] as String,
      paidAt: json['paidAt'] as String?,
      externalTransactionId: json['externalTransactionId'] as String?,
    );
  }
}
