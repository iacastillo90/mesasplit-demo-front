class CreateBillRequest {
  final String dineSessionId;
  final double serviceChargePct;

  const CreateBillRequest({
    required this.dineSessionId,
    this.serviceChargePct = 0.0,
  });

  Map<String, dynamic> toJson() => {
        'dineSessionId': dineSessionId,
        'serviceChargePct': serviceChargePct,
      };
}
