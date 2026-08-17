// src/shared/ui/DemoControlBar.jsx — Hub flotante de simulación en tiempo real para la demo MesaSplit
// Componente colapsable que permite a ejecutantes y evaluadores comerciales simular eventos
// inter-vistas (Mesa 4 pedido, SOS, cocina listo, pago QR y reset) sin cambiar de pestaña.

// useState de React para manejar el colapso/expansión del hub demo.
import { useState } from 'react';
// Hook de simulación de eventos en tiempo real.
import { useDemoSimulator } from '../../hooks/useDemoSimulator.js';

// Componente DemoControlBar.
export default function DemoControlBar() {
  // Estado local para alternar entre la versión minificada (badge) y expandida (bar).
  const [isOpen, setIsOpen] = useState(false);

  // Hook que contiene las acciones de simulación en 1 clic.
  const {
    lastAction,
    simulateOrderMesa4,
    simulateSosCall,
    simulateKitchenReady,
    simulateQrPayment,
    resetDemoState,
  } = useDemoSimulator();

  // Si está colapsado, muestra únicamente el botón flotante insignia "⚡ Demo Control".
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* Botón flotante pulsante de apertura de la barra demo */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#012032] hover:bg-[#024064] text-white px-4 py-2.5 rounded-full shadow-2xl border border-sky-400/40 text-sm font-semibold transition-all duration-200 transform hover:scale-105"
          title="Abrir panel de simulación en tiempo real"
        >
          {/* Icono de rayo indicador de simulación interactiva */}
          <span className="text-amber-400 animate-pulse text-base">⚡</span>
          {/* Etiqueta del botón */}
          <span>Demo Control</span>
        </button>
      </div>
    );
  }

  // Renderizado de la barra expandida en la parte inferior de la pantalla.
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 md:max-w-2xl bg-[#011623]/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-sky-500/30 transition-all duration-300 animate-in slide-in-from-bottom-5">
      {/* Cabecera del panel de simulación */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          {/* Rayo decorativo */}
          <span className="text-amber-400 font-bold">⚡</span>
          {/* Título del panel */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300">
            Hub de Simulación Realtime Demo
          </h4>
        </div>
        {/* Botón para minimizar el panel */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          ✕ Minimizar
        </button>
      </div>

      {/* Grid de botones de acción rápida para la simulación */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
        {/* 1. Pedido Mesa 4 */}
        <button
          type="button"
          onClick={simulateOrderMesa4}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-sky-900/40 hover:bg-sky-600/50 border border-sky-500/30 text-xs font-medium transition-all text-sky-100 active:scale-95"
        >
          <span className="text-base mb-1">🍔</span>
          <span>+ Pedido M4</span>
        </button>

        {/* 2. Alerta S.O.S. */}
        <button
          type="button"
          onClick={simulateSosCall}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-rose-900/40 hover:bg-rose-600/50 border border-rose-500/30 text-xs font-medium transition-all text-rose-100 active:scale-95"
        >
          <span className="text-base mb-1">🚨</span>
          <span>Alerta S.O.S.</span>
        </button>

        {/* 3. Plato Listo en KDS */}
        <button
          type="button"
          onClick={simulateKitchenReady}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-600/50 border border-emerald-500/30 text-xs font-medium transition-all text-emerald-100 active:scale-95"
        >
          <span className="text-base mb-1">🍳</span>
          <span>Plato Listo</span>
        </button>

        {/* 4. Solicitud Cuenta / Pago QR */}
        <button
          type="button"
          onClick={simulateQrPayment}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-900/40 hover:bg-amber-600/50 border border-amber-500/30 text-xs font-medium transition-all text-amber-100 active:scale-95"
        >
          <span className="text-base mb-1">💳</span>
          <span>Pago QR</span>
        </button>

        {/* 5. Reset Demo State */}
        <button
          type="button"
          onClick={resetDemoState}
          className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600/40 text-xs font-medium transition-all text-slate-300 active:scale-95"
        >
          <span className="text-base mb-1">🔄</span>
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Banner de feedback si se ha ejecutado alguna acción reciente */}
      {lastAction && (
        <div className="bg-sky-950/80 border border-sky-500/30 rounded-lg px-3 py-1.5 text-[11px] text-sky-200 font-mono flex items-center justify-between">
          <span className="truncate">{lastAction}</span>
          <span className="text-emerald-400 text-[10px] ml-2 shrink-0">✓ Emitido</span>
        </div>
      )}
    </div>
  );
}
