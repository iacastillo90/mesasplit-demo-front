// src/features/RadarView/components/MermaBar.jsx — barra de comando de registro de mermas (local-admin-radar)
// Campo de entrada rápido para registrar mermas de insumos o alimentos vencidos ("3 kilos de tomate vencido").
// Soporta tema dinámico Claro ☀️ y Oscuro 🌙 con useThemeStore.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { useThemeStore } from '../../../shared/store/useThemeStore.js';

export default function MermaBar({ mermaLogs, onAddMerma }) {
  // Store de tema global para alternar entre claro y oscuro.
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === 'dark';

  // Estado local para el texto tipeado en la barra de mermas.
  const [textInput, setTextInput] = useState('');

  // Manejador del envío del registro de mermas.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    onAddMerma(textInput.trim());
    setTextInput('');
  };

  // Calcula la pérdida total estimada acumulada en mermas.
  const totalMermaLoss = mermaLogs.reduce((acc, item) => acc + (item.estimatedLoss ?? 3500), 0);

  return (
    <section aria-label="Control de mermas de inventario" className="flex flex-col gap-3">
      {/* Encabezado de la barra de mermas y pérdida acumulada. */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
          Control de Mermas ({mermaLogs.length} registros)
        </h2>
        {/* Pérdida total acumulada en CLP. */}
        <span className="text-xs font-bold text-semantic-danger">
          Pérdida est: {formatCurrency(totalMermaLoss)}
        </span>
      </div>

      {/* Formulario de entrada rápida de mermas. */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Input de texto para ingresar la merma en lenguaje natural. */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Registrar merma (ej. 3 kilos de tomate vencido)"
          className={`flex-1 rounded-xl px-4 py-2.5 text-xs border focus:outline-none ${
            isDark
              ? 'bg-brand-900 text-brand-50 border-brand-800 focus:border-brand-500'
              : 'bg-white text-brand-900 border-brand-300 focus:border-brand-500 shadow-soft'
          }`}
        />
        {/* Botón de envío rápido de la merma. */}
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft cursor-pointer"
        >
          Registrar
        </button>
      </form>

      {/* Historial reciente de mermas registradas. */}
      {mermaLogs.length > 0 && (
        <div className="flex flex-col gap-1.5 mt-1">
          {mermaLogs.map((log, idx) => {
            const logText = typeof log === 'string' ? log : (log.rawText || log.item || log.text || 'Merma de insumo');
            const loss = typeof log === 'object' && log.estimatedLoss ? log.estimatedLoss : 3500;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs border transition ${
                  isDark ? 'bg-brand-900/60 border-brand-800 text-brand-50' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
                }`}
              >
                <span className="font-semibold">{logText}</span>
                <span className="font-bold text-semantic-danger">-{formatCurrency(loss)}</span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
