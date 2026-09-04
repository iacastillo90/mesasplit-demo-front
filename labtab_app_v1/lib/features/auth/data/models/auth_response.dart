class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final int expiresIn;
  final PersonAuth person;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.expiresIn,
    required this.person,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      expiresIn: json['expiresIn'] as int,
      person: PersonAuth.fromJson(json['person'] as Map<String, dynamic>),
    );
  }
}

class PersonAuth {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? branchId;
  final String? avatarUrl;

  const PersonAuth({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.branchId,
    this.avatarUrl,
  });

  factory PersonAuth.fromJson(Map<String, dynamic> json) {
    return PersonAuth(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: json['role'] as String,
      branchId: json['branchId'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }
}
