// src/shared/i18n/useI18nStore.test.js — tests unitarios para useI18nStore
// Prueba el cambio reactivo de idioma entre Español, Inglés y Portugués y la resolución de claves.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Describe, it y expect de Vitest para la suite de pruebas.
import { describe, it, expect, beforeEach } from 'vitest';
// Store de traducción.
import { useI18nStore } from './useI18nStore.js';

// Describe bloque para useI18nStore.
describe('useI18nStore: Internacionalización dinámica (ES / EN / PT)', () => {
  // Reinicia a Español antes de cada test.
  beforeEach(() => {
    useI18nStore.setState({ lang: 'es' });
  });

  // Test 1: Resolución de clave por defecto en Español.
  it('resuelve claves traducidas en Español por defecto', () => {
    expect(useI18nStore.getState().t('seeCart')).toBe('Ver carrito');
  });

  // Test 2: Cambio de idioma a Inglés.
  it('cambia el idioma a Inglés y resuelve "View Cart"', () => {
    useI18nStore.getState().setLanguage('en');
    expect(useI18nStore.getState().t('seeCart')).toBe('View Cart');
  });

  // Test 3: Cambio de idioma a Portugués.
  it('cambia el idioma a Portugués y resuelve "Ver carrinho"', () => {
    useI18nStore.getState().setLanguage('pt');
    expect(useI18nStore.getState().t('seeCart')).toBe('Ver carrinho');
  });
});
