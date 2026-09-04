class CreatePaymentRequest {
  final String billId;
  final int amount;
  final int tipAmount;
  final int totalAmount;
  final String method;
  final String? provider;
  final String? externalTransactionId;
  final String currency;
  final String? dineGuestId;

  const CreatePaymentRequest({
    required this.billId,
    required this.amount,
    this.tipAmount = 0,
    required this.totalAmount,
    required this.method,
    this.provider,
    this.externalTransactionId,
    this.currency = 'CLP',
    this.dineGuestId,
  });

  Map<String, dynamic> toJson() => {
        'billId': billId,
        'amount': amount,
        'tipAmount': tipAmount,
        'totalAmount': totalAmount,
        'method': method,
        if (provider != null) 'provider': provider,
        if (externalTransactionId != null)
          'externalTransactionId': externalTransactionId,
        'currency': currency,
        if (dineGuestId != null) 'dineGuestId': dineGuestId,
      };
}
