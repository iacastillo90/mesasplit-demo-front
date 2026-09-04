class User {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String? branchId;
  final String? avatarUrl;

  const User({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    this.branchId,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      fullName: json['fullName'] as String,
      role: json['role'] as String,
      branchId: json['branchId'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'fullName': fullName,
        'role': role,
        'branchId': branchId,
        'avatarUrl': avatarUrl,
      };
}
