import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/auth/domain/repositories/auth_repository.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/guest.dart';
import 'package:labtab_app_v1/features/auth/domain/entities/user.dart';
import 'package:labtab_app_v1/features/auth/data/providers/auth_providers.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final Guest? guest;
  final User? user;
  final String? error;

  const AuthState({
    this.status = AuthStatus.initial,
    this.guest,
    this.user,
    this.error,
  });

  AuthState copyWith({
    AuthStatus? status,
    Guest? guest,
    User? user,
    String? error,
  }) {
    return AuthState(
      status: status ?? this.status,
      guest: guest ?? this.guest,
      user: user ?? this.user,
      error: error ?? this.error,
    );
  }

  bool get isAuthenticated =>
      status == AuthStatus.authenticated &&
      (guest != null || user != null);
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(const AuthState());

  Future<void> guestOnboarding({
    required String qrToken,
    String? displayName,
    List<String>? allergies,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final guest = await _repository.guestSession(
        qrToken: qrToken,
        displayName: displayName,
        allergies: allergies,
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        guest: guest,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        error: e.toString(),
      );
    }
  }

  Future<void> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(status: AuthStatus.loading, error: null);
    try {
      final user = await _repository.login(
        email: email,
        password: password,
      );
      state = state.copyWith(
        status: AuthStatus.authenticated,
        user: user,
      );
    } catch (e) {
      state = state.copyWith(
        status: AuthStatus.error,
        error: e.toString(),
      );
    }
  }

  Future<void> checkSession() async {
    final hasSession = await _repository.hasValidSession();
    if (!hasSession) {
      state = state.copyWith(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> logout() async {
    await _repository.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    state = state.copyWith(error: null);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final repository = ref.watch(authRepositoryProvider);
  return AuthNotifier(repository);
});
