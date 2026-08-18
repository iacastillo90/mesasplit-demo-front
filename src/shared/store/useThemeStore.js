// src/shared/store/useThemeStore.js — store global Zustand para tema Claro ☀️ y Oscuro 🌙 (fase26-toggle-tema-claro-oscuro-funcional)
// Permite alternar dinámicamente el tema de la aplicación, persistir en localStorage y aplicar la clase dark al documento HTML.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

import { create } from 'zustand';

// Función auxiliar para obtener el tema inicial persistido o por defecto.
const getInitialTheme = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedTheme = localStorage.getItem('mesasplit_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  }
  return 'light';
};

// Store de Zustand para la gestión de tema global.
export const useThemeStore = create((set, get) => ({
  // Tema actual activo ('light' o 'dark').
  theme: getInitialTheme(),

  // Alterna entre tema claro y oscuro de manera inmediata.
  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        localStorage.setItem('mesasplit_theme', nextTheme);
      }
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: nextTheme });
    return nextTheme;
  },

  // Establece un tema específico de forma directa.
  setTheme: (newTheme) => {
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        localStorage.setItem('mesasplit_theme', newTheme);
      }
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme: newTheme });
  },
}));
