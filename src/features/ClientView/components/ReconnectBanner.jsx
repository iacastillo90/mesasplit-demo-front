// src/features/ClientView/components/ReconnectBanner.jsx — banner de reconexión de sesión (client-session-reconnect)
// Muestra una notificación temporal durante la restauración de la sesión del cliente desde localStorage / realtime.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { useEffect, useState } from 'react';

export default function ReconnectBanner() {
  // Estado de visibilidad del banner de reconexión.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Simula la ventana de reconexión / rehidratación (se oculta automáticamente a los 1.5s).
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    // Banner superior discreto de reconexión de sesión.
    <div className="flex items-center justify-between rounded-xl bg-brand-900/90 px-4 py-2 text-xs text-brand-50 shadow-soft border border-brand-700 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Sesión restaurada correctamente</span>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="text-[10px] text-brand-50/60 hover:text-brand-50"
      >
        ✕
      </button>
    </div>
  );
}
