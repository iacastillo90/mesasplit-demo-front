// src/features/RadarView/components/MermaBar.jsx — barra de comando de registro de mermas (local-admin-radar)
// Campo de entrada rápido para registrar mermas de insumos o alimentos vencidos ("3 kilos de tomate vencido").
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// useState de React.
import { useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Componente MermaBar para el control de inventario gastado/vencido.
export default function MermaBar({ mermaLogs, onAddMerma }) {
  // Estado local para el texto tipeado en la barra de mermas.
  const [textInput, setTextInput] = useState('');

  // Manejador del envío del registro de mermas.
  const handleSubmit = (e) => {
    // Previene el recargo por defecto del formulario.
    e.preventDefault();
    // Cancela si el texto está vacío.
    if (!textInput.trim()) return;

    // Registra la nueva merma en el store del radar.
    onAddMerma(textInput.trim());
    // Limpia el input de entrada.
    setTextInput('');
  };

  // Calcula la pérdida total estimada acumulada en mermas.
  const totalMermaLoss = mermaLogs.reduce((acc, item) => acc + (item.estimatedLoss ?? 3500), 0);

  return (
    // Sección contenedora con accesible label.
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
          className="flex-1 rounded-xl bg-brand-900 px-4 py-2.5 text-xs text-brand-50 border border-brand-800 focus:border-brand-500 focus:outline-none"
        />
        {/* Botón de envío rápido de la merma. */}
        <button
          type="submit"
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft"
        >
          Registrar
        </button>
      </form>

      {/* Historial rápido de mermas registradas en el turno. */}
      {mermaLogs.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto rounded-xl bg-brand-900/50 p-3 border border-brand-800">
          {mermaLogs.map((item) => (
            // Registro individual de merma en la lista.
            <div key={item.id} className="flex items-center justify-between text-xs text-brand-50/80">
              <span>🗑️ {item.description}</span>
              <span className="text-[10px] text-brand-50/50">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
