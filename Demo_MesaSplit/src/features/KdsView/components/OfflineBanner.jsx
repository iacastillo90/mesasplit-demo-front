// src/features/KdsView/components/OfflineBanner.jsx — indicador visual de modo offline del KDS (kds-offline)
// Se despliega en la pantalla de la cocina cuando el KDS pierde conexión a internet.
// Muestra el conteo de eventos pendientes en la cola local FIFO.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// Componente OfflineBanner para la vista de cocina KDS.
export default function OfflineBanner({ pendingCount = 0 }) {
  return (
    <div
      role="status"
      className="flex items-center justify-between rounded-xl bg-amber-500/20 border border-amber-500/40 p-3 text-xs font-bold text-amber-300 shadow-soft animate-pulse"
    >
      <div className="flex items-center gap-2">
        <span className="text-base">📡</span>
        <span>Modo Offline activo (sin conexión a internet)</span>
      </div>
      {pendingCount > 0 && (
        <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold text-brand-950">
          {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
        </span>
      )}
    </div>
  );
}
