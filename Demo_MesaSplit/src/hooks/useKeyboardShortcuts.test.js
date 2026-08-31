// src/hooks/useKeyboardShortcuts.test.js — suite de pruebas unitarias para el hook de atajos de teclado
// Valida el disparo de callbacks para teclas F2, Espacio y Escape en entornos operativos.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts.js';

describe('useKeyboardShortcuts: Hook de atajos de teclado globales', () => {
  it('Escenario 1: Presionar F2 gatilla el callback onF2', () => {
    const handleF2 = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onF2: handleF2 }));

    fireEvent.keyDown(window, { key: 'F2', code: 'F2' });
    expect(handleF2).toHaveBeenCalledTimes(1);
  });

  it('Escenario 2: Presionar Espacio gatilla el callback onSpace', () => {
    const handleSpace = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onSpace: handleSpace }));

    fireEvent.keyDown(window, { key: ' ', code: 'Space' });
    expect(handleSpace).toHaveBeenCalledTimes(1);
  });

  it('Escenario 3: Presionar Escape gatilla el callback onEscape', () => {
    const handleEscape = vi.fn();
    renderHook(() => useKeyboardShortcuts({ onEscape: handleEscape }));

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });
});
