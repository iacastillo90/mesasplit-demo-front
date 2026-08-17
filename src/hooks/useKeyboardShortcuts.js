// src/hooks/useKeyboardShortcuts.js — hook personalizado para atajos de teclado globales en entorno operativo (POS & KDS)
// Registra listeners de teclado de forma segura (F2 = Cobrar rápido POS, Espacio = Avanzar KDS, Esc = Cerrar modales).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts = {}) {
  useEffect(() => {
    // Handler del evento keydown del navegador.
    const handleKeyDown = (event) => {
      // Ignora eventos de teclado si el foco está dentro de un input o textarea de texto activo.
      const targetTag = event.target?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        // Excepción: permite tecla Escape dentro de inputs para cerrar modales.
        if (event.key !== 'Escape') return;
      }

      // 1. Tecla F2: Cobrar Rápido POS.
      if (event.key === 'F2' && shortcuts.onF2) {
        event.preventDefault();
        shortcuts.onF2();
      }

      // 2. Tecla Espacio: Avanzar ticket en KDS.
      if ((event.key === ' ' || event.code === 'Space') && shortcuts.onSpace) {
        event.preventDefault();
        shortcuts.onSpace();
      }

      // 3. Tecla Escape: Cerrar modales activos.
      if (event.key === 'Escape' && shortcuts.onEscape) {
        event.preventDefault();
        shortcuts.onEscape();
      }
    };

    // Suscribe el listener a nivel de window.
    window.addEventListener('keydown', handleKeyDown);

    // Limpieza al desmontar el componente consumidor.
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
}
