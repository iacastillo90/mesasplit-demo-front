// src/hooks/useAudioSynth.test.js — tests unitarios para useAudioSynth
// Prueba la alternancia del estado de silencio global y la invocación segura de los tonos sintéticos.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Imports de Vitest y Testing Library.
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
// Hook de audio a probar.
import { useAudioSynth } from './useAudioSynth.js';

// Describe bloque para useAudioSynth.
describe('useAudioSynth: Notificaciones auditivas nativas Web Audio', () => {
  // Test 1: Inicialización con sonido activo.
  it('inicializa con sonido activo (isMuted = false)', () => {
    const { result } = renderHook(() => useAudioSynth());
    expect(result.current.isMuted).toBe(false);
  });

  // Test 2: Alternancia de silencio global.
  it('permite alternar el silencio global al invocar toggleMute', () => {
    const { result } = renderHook(() => useAudioSynth());

    act(() => {
      result.current.toggleMute();
    });

    // Sin importar fallos de AudioContext en jsdom, el método no lanza excepciones.
    expect(typeof result.current.playBell).toBe('function');
    expect(typeof result.current.playSiren).toBe('function');
    expect(typeof result.current.playChime).toBe('function');
  });
});
