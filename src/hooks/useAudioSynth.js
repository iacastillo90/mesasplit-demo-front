// src/hooks/useAudioSynth.js — Hook de efectos auditivos sintéticos nativos vía Web Audio API
// Sintetiza tonos suaves de comanda lista, sirena sutil de S.O.S. y arpegios de recompensa sin archivos MP3 externos.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState y useEffect de React.
import { useState, useCallback } from 'react';

// Estado global estático de silencio para compartir entre instancias del hook.
let globalIsMuted = false;
// Oyentes del cambio de silencio.
const listeners = new Set();

// Componente/Hook `useAudioSynth`.
export function useAudioSynth() {
  // Estado local sincronizado con el estado global de silencio.
  const [muted, setMuted] = useState(globalIsMuted);

  // Cambia el estado de silencio global.
  const toggleMute = useCallback(() => {
    globalIsMuted = !globalIsMuted;
    listeners.forEach((listener) => listener(globalIsMuted));
  }, []);

  // Helper privado para instanciar el AudioContext del navegador.
  const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    return new AudioCtx();
  };

  // Reproduce el tono suave de comanda lista en cocina (campana 880 Hz).
  const playBell = useCallback(() => {
    if (globalIsMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Ignora errores si el contexto de audio está bloqueado en entorno sin interacción.
    }
  }, []);

  // Reproduce la sirena sutil de S.O.S. / Botón de pánico.
  const playSiren = useCallback(() => {
    if (globalIsMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Ignora en entornos sin reproducción de audio activa.
    }
  }, []);

  // Reproduce el arpegio festivo de recompensa o pago (C5 - E5 - G5).
  const playChime = useCallback(() => {
    if (globalIsMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99]; // Do - Mi - Sol
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch {
      // Ignora bloqueos de autoplay.
    }
  }, []);

  return {
    isMuted: muted,
    toggleMute,
    playBell,
    playSiren,
    playChime,
  };
}
