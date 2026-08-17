// src/features/KdsView/components/KdsHeader.jsx — cabecera KDS de cocina (kds-kitchen + kds-expo-view)
// Cabecera superior en modo oscuro con métricas en vivo, botón Expo View y disparadores de los modales de Recall y Lista 86.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

// Componente presentacional de la cabecera de cocina KDS.
export default function KdsHeader({ activeCount, recallCount, onOpenRecall, onOpenLista86, onToggleExpo }) {
  return (
    // Header principal con fondo oscuro y borde inferior.
    <header className="flex flex-wrap items-center justify-between border-b border-brand-800/60 px-6 py-4 gap-4">
      {/* Título de la vista de cocina y subtítulo operativo. */}
      <div>
        {/* Título de la pantalla KDS (mantiene el rol de heading 'Cocina' para la suite de routing). */}
        <h1 className="text-2xl font-bold text-brand-50">Cocina</h1>
        {/* Información del turno actual. */}
        <p className="text-sm text-brand-50/60">Turno tarde · Control de línea en vivo</p>
      </div>

      {/* Acciones de la cabecera: indicador de tickets, botones Expo View, Lista 86 y Recall. */}
      <div className="flex items-center gap-3">
        {/* Indicador visual de la cantidad de comandas activas en pantalla. */}
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-3 py-1.5 text-sm font-semibold text-brand-50">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-semantic-success" />
          {activeCount} tickets
        </span>

        {/* Botón para activar el modo exhibición Expo View fullscreen (kds-expo-view). */}
        <button
          type="button"
          onClick={onToggleExpo}
          className="rounded-xl bg-amber-500/20 px-4 py-2 text-sm font-semibold text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition active:scale-95"
        >
          📺 Expo View
        </button>

        {/* Botón para abrir el modal de gestión de quiebre de stock (Lista 86). */}
        <button
          type="button"
          onClick={onOpenLista86}
          className="rounded-xl bg-brand-800 px-4 py-2 text-sm font-semibold text-brand-50 hover:bg-brand-800/80 transition active:scale-95 border border-brand-800/60"
        >
          🛑 Lista 86
        </button>

        {/* Botón para abrir el historial de Recall de comandes despachadas. */}
        <button
          type="button"
          onClick={onOpenRecall}
          className="relative rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-dark-glow hover:bg-brand-500/90 transition active:scale-95"
        >
          🔄 Recall
          {/* Badge flotante con el conteo de comandas en la pila de Recall. */}
          {recallCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-semantic-warning text-xs font-bold text-brand-950">
              {recallCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
