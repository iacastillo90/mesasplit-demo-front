class GuestSessionRequest {
  final String qrToken;
  final String? displayName;
  final List<String> allergies;

  const GuestSessionRequest({
    required this.qrToken,
    this.displayName,
    this.allergies = const [],
  });

  Map<String, dynamic> toJson() => {
        'qrToken': qrToken,
        if (displayName != null) 'displayName': displayName,
        'allergies': allergies,
      };
}
