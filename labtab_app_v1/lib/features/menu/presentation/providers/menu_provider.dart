import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:labtab_app_v1/features/menu/domain/repositories/menu_repository.dart';
import 'package:labtab_app_v1/features/menu/domain/entities/menu_section.dart';
import 'package:labtab_app_v1/features/menu/data/providers/menu_providers.dart';

enum MenuStatus { initial, loading, loaded, error }

class MenuState {
  final MenuStatus status;
  final List<MenuSection> sections;
  final String? error;

  const MenuState({
    this.status = MenuStatus.initial,
    this.sections = const [],
    this.error,
  });

  MenuState copyWith({
    MenuStatus? status,
    List<MenuSection>? sections,
    String? error,
  }) {
    return MenuState(
      status: status ?? this.status,
      sections: sections ?? this.sections,
      error: error ?? this.error,
    );
  }
}

class MenuNotifier extends StateNotifier<MenuState> {
  final MenuRepository _repository;

  MenuNotifier(this._repository) : super(const MenuState());

  Future<void> loadMenu() async {
    state = state.copyWith(status: MenuStatus.loading, error: null);
    try {
      final sections = await _repository.getSections();
      state = state.copyWith(
        status: MenuStatus.loaded,
        sections: sections,
      );
    } catch (e) {
      state = state.copyWith(
        status: MenuStatus.error,
        error: e.toString(),
      );
    }
  }

  Future<void> refresh() async => loadMenu();
}

final menuProvider = StateNotifierProvider<MenuNotifier, MenuState>((ref) {
  final repository = ref.watch(menuRepositoryProvider);
  return MenuNotifier(repository);
});
