// src/features/WaiterView/components/SosAlertToast.jsx — componente de alerta emergente de llamado S.O.S. (sos-waiter-call)
// Muestra una barra/modal flotante animada en rojo brillante (#EF4444) con pulso de atención cuando una mesa solicita ayuda urgente del garzón.

import { useEffect } from 'react';

export default function SosAlertToast({ alert, onDismiss, onAttend }) {
  // Si no existe alerta activa, no renderiza nada.
  if (!alert) return null;

  // Extrae número de mesa y mensaje de la alerta.
  const tableNumber = alert.table ?? alert.tableNumber ?? 'Mesa';
  const message = alert.message ?? `🚨 ¡La Mesa ${tableNumber} solicita atención inmediata del mozo!`;

  return (
    // Contenedor flotante fijado en la parte superior central con z-index elevado y animación de pulso.
    <div className="fixed top-4 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 animate-in slide-in-from-top-5 duration-300">
      {/* Tarjeta de alerta roja con gradiente y borde destacado */}
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-4 rounded-2xl shadow-2xl border-2 border-rose-300 flex flex-col gap-3 relative overflow-hidden">
        {/* Barra decorativa animada de pulso */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 animate-pulse" />

        {/* Fila superior: Icono de sirena, título y botón de cierre */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🚨</span>
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-md border border-white/20">
              ALERTA URGENTE MOZO
            </span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold transition-all"
          >
            ✕
          </button>
        </div>

        {/* Mensaje de la alerta */}
        <p className="text-sm font-extrabold leading-snug">{message}</p>

        {/* Botón de acción rápida: Atender Mesa */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/20">
          <button
            type="button"
            onClick={() => {
              if (onAttend) onAttend(tableNumber);
              onDismiss();
            }}
            className="w-full bg-white hover:bg-amber-100 text-rose-900 font-extrabold text-xs py-2 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>🏃‍♂️ Atender Mesa {tableNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
