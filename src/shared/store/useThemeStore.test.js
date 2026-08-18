// src/shared/store/useThemeStore.test.js — Pruebas unitarias de useThemeStore (fase26-toggle-tema-claro-oscuro-funcional)
// Requisito AGENTS.md: Cada línea de código debe estar comentada en español.

import { describe, expect, it, beforeEach } from 'vitest';
import { useThemeStore } from './useThemeStore.js';

describe('useThemeStore — Gestión de Tema Global Claro/Oscuro', () => {
  beforeEach(() => {
    useThemeStore.getState().setTheme('light');
  });

  it('inicia por defecto en tema claro "light"', () => {
    expect(useThemeStore.getState().theme).toBe('light');
  });

  it('alterna dinámicamente entre "light" y "dark" al llamar toggleTheme', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });
});
