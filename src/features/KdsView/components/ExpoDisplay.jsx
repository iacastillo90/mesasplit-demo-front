// src/features/KdsView/components/ExpoDisplay.jsx — vista exhibición Expo View fullscreen (kds-expo-view)
// Pantalla de exhibición fullscreen para pase de cocina / pasaplatos.
// Avance automático en carrusel mediante temporizador sin requerir interacción humana.
// Tipografía gigante, barra de progreso y contraste para visualización a distancia.
// Oculta todos los botones de mutación (marcar listo, tachar ítem, modales).
// Salida explícita por control de cabecera o tecla Escape (Esc).
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por línea).

import { useEffect, useState } from 'react';

export default function ExpoDisplay({ tickets = [], onClose }) {
  // Índice de la comanda activa en el carrusel de la Expo View.
  const [currentIndex, setCurrentIndex] = useState(0);

  // Escucha la tecla Escape para salir del modo exhibición.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Avance automático del temporizador cada 4 segundos si hay más de 1 ticket.
  useEffect(() => {
    if (tickets.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickets.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [tickets.length]);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-brand-950 p-8 text-white">
        <span className="text-6xl">✨</span>
        <h2 className="mt-4 text-3xl font-bold">MODO EXHIBICIÓN</h2>
        <p className="mt-2 text-lg text-brand-50/60">No hay comandas pendientes en este momento</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-2xl bg-brand-800 px-6 py-3 text-sm font-bold text-white hover:bg-brand-700"
        >
          Salir de Expo (Esc)
        </button>
      </div>
    );
  }

  // Asegura un índice válido.
  const safeIndex = currentIndex % tickets.length;
  const currentTicket = tickets[safeIndex];

  return (
    // Contenedor fullscreen z-50 en modo oscuro profundo.
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-brand-950 p-8 text-white">
      {/* Cabecera de la Expo View con indicador y botón de salida. */}
      <div className="flex items-center justify-between border-b border-brand-800 pb-4">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-amber-500/20 px-4 py-1 text-sm font-extrabold text-amber-400 border border-amber-500/40">
            📺 MODO EXHIBICIÓN
          </span>
          <span className="text-sm font-bold text-brand-50/60">
            Comanda {safeIndex + 1} de {tickets.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-brand-900 border border-brand-700 px-5 py-2.5 text-xs font-bold text-brand-50 hover:bg-brand-800 transition active:scale-95 shadow-soft"
        >
          ✕ Salir de Expo (Esc)
        </button>
      </div>

      {/* Tarjeta gigante de la comanda activa para lectura a gran distancia. */}
      <div className="my-auto flex flex-col items-center justify-center text-center">
        <div className="w-full max-w-4xl rounded-3xl bg-brand-900 border-2 border-brand-700 p-10 shadow-2xl">
          {/* Identificación de la mesa y horario. */}
          <div className="flex items-center justify-between border-b border-brand-800 pb-6">
            <span className="text-5xl font-black text-brand-50">Mesa {currentTicket.tableNumber ?? '—'}</span>
            <span className="rounded-full bg-brand-800 px-4 py-2 text-base font-bold text-brand-50/80 uppercase">
              {currentTicket.status === 'in_preparation' ? '🔥 En Preparación' : '⏱️ Pendiente'}
            </span>
          </div>

          {/* Lista de platos en tamaño gigante. */}
          <div className="mt-8 flex flex-col gap-4 text-left">
            {(currentTicket.items ?? []).map((item, idx) => (
              <div key={item.id ?? idx} className="flex items-center justify-between rounded-2xl bg-brand-950/80 p-4 border border-brand-800">
                <span className="text-2xl font-extrabold text-brand-50">{item.name}</span>
                <span className="rounded-xl bg-brand-500/20 px-4 py-2 text-2xl font-black text-brand-50 border border-brand-500/40">
                  x{item.qty ?? 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pie con indicador de progreso. */}
      <div className="flex items-center justify-center gap-2 border-t border-brand-800/80 pt-4">
        {tickets.map((t, i) => (
          <span
            key={t.id ?? i}
            className={`h-2 rounded-full transition-all ${
              i === safeIndex ? 'w-12 bg-brand-500' : 'w-2 bg-brand-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
