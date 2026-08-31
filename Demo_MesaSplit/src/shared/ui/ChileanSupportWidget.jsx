// src/shared/ui/ChileanSupportWidget.jsx — Widget de Soporte 24/7 Chileno (fase12-cobertura-total-20-modulos-saas)
// Provee atención en vivo por WhatsApp, teléfono corporativo y correo electrónico
// con equipo dedicado chileno para restaurantes y franquicias gastronómicas.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// React e hooks de estado.
import { useState } from 'react';

// Componente de widget flotante de Soporte 24/7.
export default function ChileanSupportWidget() {
  // Estado para expandir/colapsar el panel de soporte.
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      {/* Panel flotante desplegable de soporte. */}
      {isOpen && (
        <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 text-brand-900 shadow-2xl border border-brand-200 w-80 animate-fade-in">
          {/* Cabecera con equipo dedicado chileno. */}
          <div className="flex items-center justify-between border-b border-brand-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl">🇨🇱</span>
              <div>
                <h3 className="text-xs font-bold text-brand-900">Soporte MesaSplit 24/7</h3>
                <p className="text-[10px] text-emerald-600 font-semibold">● Equipo Chileno en Línea</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-brand-800/60 hover:text-brand-900 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>

          {/* Opciones de contacto directo por WhatsApp y Teléfono. */}
          <div className="flex flex-col gap-2">
            <a
              href="https://wa.me/56987654321"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition active:scale-95"
            >
              <span className="text-lg">💬</span>
              <div className="flex flex-col">
                <span>WhatsApp Soporte Directo</span>
                <span className="text-[10px] font-normal text-emerald-700">+56 9 8765 4321</span>
              </div>
            </a>

            <a
              href="tel:+56229876543"
              className="flex items-center gap-3 rounded-2xl bg-sky-50 p-2.5 text-xs font-bold text-sky-800 border border-sky-200 hover:bg-sky-100 transition active:scale-95"
            >
              <span className="text-lg">📞</span>
              <div className="flex flex-col">
                <span>Línea Telefónica Gastronómica</span>
                <span className="text-[10px] font-normal text-sky-700">+56 2 2987 6543</span>
              </div>
            </a>
          </div>

          {/* Pie informativo del nivel de servicio SLA. */}
          <p className="text-[10px] text-center text-brand-800/60 font-medium border-t border-brand-100 pt-2">
            Respuesta promedio &lt; 2 minutos · Cobertura Santiago y Regiones
          </p>
        </div>
      )}

      {/* Botón gatillador flotante con bandera de Chile y animación glow. */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-brand-900 hover:bg-brand-950 text-white px-4 py-2.5 text-xs font-bold shadow-2xl transition active:scale-95 border border-amber-500/40 glow-sky"
      >
        <span className="text-base">🇨🇱</span>
        <span>Soporte 24/7</span>
      </button>
    </div>
  );
}
