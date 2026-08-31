// src/shared/i18n/LanguageSelector.test.jsx — tests unitarios para LanguageSelector
// Prueba el renderizado de las banderas y la alternancia de idiomas en el store.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
// Componente a probar.
import LanguageSelector from './LanguageSelector.jsx';
// Store i18n.
import { useI18nStore } from './useI18nStore.js';

// Describe bloque para LanguageSelector.
describe('LanguageSelector: Selector dinámico de idioma i18n', () => {
  // Test 1: Renderizado de los botones de idioma.
  it('renderiza las 3 opciones de idioma (ES, EN, PT)', () => {
    // Renderiza el selector.
    render(<LanguageSelector />);

    // Confirma la presencia de los botones ES, EN y PT.
    expect(screen.getByRole('button', { name: /ES/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /EN/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /PT/i })).toBeInTheDocument();
  });

  // Test 2: Cambio de idioma al hacer clic en EN.
  it('cambia el idioma activo en el store al pulsar el botón EN', () => {
    // Renderiza el selector.
    render(<LanguageSelector />);

    // Hace clic en EN.
    const enBtn = screen.getByRole('button', { name: /EN/i });
    fireEvent.click(enBtn);

    // Confirma que el store pase a 'en'.
    expect(useI18nStore.getState().lang).toBe('en');
  });
});
