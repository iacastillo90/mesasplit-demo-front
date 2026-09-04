import 'package:labtab_app_v1/features/auth/domain/entities/guest.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/user.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/auth_tokens.dart';

abstract class AuthRepository {
  Future<Guest> guestSession({
    required String qrToken,
    String? displayName,
    List<String>? allergies,
  });

  Future<User> login({required String email, required String password});

  Future<AuthTokens> refresh(String refreshToken);

  Future<void> logout();

  Future<bool> hasValidSession();
}
