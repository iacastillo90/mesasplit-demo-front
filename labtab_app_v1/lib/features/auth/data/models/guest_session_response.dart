class GuestSessionResponse {
  final String accessToken;
  final int expiresIn;
  final GuestAuth guest;

  const GuestSessionResponse({
    required this.accessToken,
    required this.expiresIn,
    required this.guest,
  });

  factory GuestSessionResponse.fromJson(Map<String, dynamic> json) {
    return GuestSessionResponse(
      accessToken: json['accessToken'] as String,
      expiresIn: json['expiresIn'] as int,
      guest: GuestAuth.fromJson(json['guest'] as Map<String, dynamic>),
    );
  }
}

class GuestAuth {
  final String id;
  final String displayName;
  final String dineSessionId;
  final String tableId;
  final String? tableName;

  const GuestAuth({
    required this.id,
    required this.displayName,
    required this.dineSessionId,
    required this.tableId,
    this.tableName,
  });

  factory GuestAuth.fromJson(Map<String, dynamic> json) {
    return GuestAuth(
      id: json['id'] as String,
      displayName: json['displayName'] as String,
      dineSessionId: json['dineSessionId'] as String,
      tableId: json['tableId'] as String,
      tableName: json['tableName'] as String?,
    );
  }
}
