// src/features/CorporateView/components/FranchiseEventStream.jsx — flujo de eventos corporativos en tiempo real (super-admin-corporate)
// Despliega el stream de eventos cross-branch (pagos, alertas de fraude, pánico y cambios de configuración) en vivo.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Componente del registro de auditoría corporativa.
export default function FranchiseEventStream({ franchiseEvents }) {
  return (
    // Sección contenedora del feed de eventos cross-branch.
    <section aria-label="Flujo de Eventos Franquicia" className="flex flex-col gap-3 rounded-3xl bg-brand-950 p-6 text-brand-50 shadow-soft">
      {/* Encabezado con indicador de tiempo real. */}
      <div className="flex items-center justify-between border-b border-brand-800 pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
            Flujo de Eventos Franquicia ({franchiseEvents.length})
          </h2>
          <p className="text-xs text-brand-50/60">Auditoría operacional unificada de todas las sucursales en vivo</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Realtime Bus
        </span>
      </div>

      {/* Listado deslizable de eventos registrados. */}
      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pt-2">
        {franchiseEvents.length === 0 ? (
          <p className="py-6 text-center text-xs text-brand-50/50">Sin eventos recientes registradas en la red.</p>
        ) : (
          franchiseEvents.map((evt) => (
            // Registro individual de evento en la red corporativa.
            <div
              key={evt.id}
              className={`flex items-center justify-between rounded-xl p-3 text-xs border ${
                evt.type === 'alert'
                  ? 'bg-semantic-danger/10 border-semantic-danger/30 text-brand-50'
                  : evt.type === 'payment'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-brand-50'
                  : 'bg-brand-900 border-brand-800 text-brand-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{evt.type === 'alert' ? '🚨' : evt.type === 'payment' ? '💳' : '⚙️'}</span>
                <div>
                  <p className="font-bold text-brand-50">{evt.branchName}: {evt.title}</p>
                  <p className="text-[11px] text-brand-50/70">{evt.detail}</p>
                </div>
              </div>

              {/* Timestamp del evento. */}
              <span className="text-[10px] text-brand-50/50">
                {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
