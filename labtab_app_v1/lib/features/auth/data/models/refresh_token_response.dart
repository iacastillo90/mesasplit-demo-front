class RefreshTokenResponse {
  final String accessToken;
  final int expiresIn;
  final String refreshToken;

  const RefreshTokenResponse({
    required this.accessToken,
    required this.expiresIn,
    required this.refreshToken,
  });

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      accessToken: json['accessToken'] as String,
      expiresIn: json['expiresIn'] as int,
      refreshToken: json['refreshToken'] as String,
    );
  }
}
