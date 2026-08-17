// src/features/WaiterView/components/CourseControlPicker.jsx — selector de tiempos de cocina (waiter-pwa)
// Permite al mozo definir si los platos de la comanda entran inmediatamente a cocina (Entrada)
// o quedan retenidos en espera (Fondo) hasta presionar "Marchar Fondo".
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

// Componente selector de tiempos (Course Control).
export default function CourseControlPicker({ selectedCourse, onSelectCourse, onMarchFondo }) {
  return (
    // Contenedor principal del selector de tiempos de cocina.
    <div className="flex flex-col gap-2 rounded-2xl bg-brand-800 p-4 border border-brand-800">
      {/* Etiqueta y título del bloque de control de marcha. */}
      <div className="flex items-center justify-between">
        {/* Título explicativo de la sección. */}
        <span className="text-xs font-bold uppercase tracking-wider text-brand-50/70">
          Control de Tiempos (Course Control)
        </span>
        {/* Indicador del tiempo seleccionado actualmente. */}
        <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs font-semibold text-brand-500">
          {selectedCourse === 'entrada' ? 'Entradas listas' : 'Fondos retenidos 🔒'}
        </span>
      </div>

      {/* Botones de conmutación de curso de la comanda. */}
      <div className="grid grid-cols-2 gap-2">
        {/* Opción Entrada: marcha de forma inmediata a la cocina. */}
        <button
          type="button"
          onClick={() => onSelectCourse('entrada')}
          className={`rounded-xl py-2.5 px-3 text-xs font-bold transition active:scale-95 ${
            selectedCourse === 'entrada'
              ? 'bg-brand-500 text-white shadow-md'
              : 'bg-brand-900 text-brand-50/70 hover:bg-brand-900/80'
          }`}
        >
          ⚡ Entrada (Enviar Ahora)
        </button>

        {/* Opción Fondo: queda retenido hasta disparar el evento course.fire. */}
        <button
          type="button"
          onClick={() => onSelectCourse('fondo')}
          className={`rounded-xl py-2.5 px-3 text-xs font-bold transition active:scale-95 ${
            selectedCourse === 'fondo'
              ? 'bg-semantic-warning text-brand-950 shadow-md'
              : 'bg-brand-900 text-brand-50/70 hover:bg-brand-900/80'
          }`}
        >
          🔒 Fondo (En Espera)
        </button>
      </div>

      {/* Botón para disparar inmediatamente la marcha de platos de Fondo. */}
      {selectedCourse === 'fondo' && (
        <button
          type="button"
          onClick={onMarchFondo}
          className="mt-1 w-full rounded-xl bg-semantic-warning/20 border border-semantic-warning py-2 text-xs font-bold text-semantic-warning transition hover:bg-semantic-warning/30 active:scale-95"
        >
          🔔 Marchar Fondo (Notificar Cocina)
        </button>
      )}
    </div>
  );
}
