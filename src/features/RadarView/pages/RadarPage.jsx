// src/features/RadarView/pages/RadarPage.jsx — Local Admin / Radar de Turno (local-admin-radar)
// Vista "/admin" del spec local-admin-radar: plano topológico del salón por zonas,
// tarjetas del canal Delivery Omnicanal (Uber Eats, Rappi, PedidosYa), cajón de auditoría (alert.fraud),
// Modo Hora Punta, barra de comando de mermas e insumos vencidos y Botón de Pánico de emergencia.
// Cumple con todas las normas de AGENTS.md (comentarios en español por cada línea).

// useEffect de React para iniciar la carga de mesas y suscripciones real-time.
import { useEffect } from 'react';
// Store de Zustand del RadarView.
import { useRadarStore } from '../store/useRadarStore.js';
// Componentes del slice de Radar.
import TopologicalMap from '../components/TopologicalMap.jsx';
import DeliveryColumn from '../components/DeliveryColumn.jsx';
import ExceptionFeedDrawer from '../components/ExceptionFeedDrawer.jsx';
import MermaBar from '../components/MermaBar.jsx';

// Componente principal de la página del Radar Local Admin.
export default function RadarPage() {
  // Suscripción a las propiedades del store de Radar.
  const tables = useRadarStore((s) => s.tables);
  const activeZone = useRadarStore((s) => s.activeZone);
  const deliveryOrders = useRadarStore((s) => s.deliveryOrders);
  const exceptionLogs = useRadarStore((s) => s.exceptionLogs);
  const exceptionDrawerOpen = useRadarStore((s) => s.exceptionDrawerOpen);
  const focusMode = useRadarStore((s) => s.focusMode);
  const mermaLogs = useRadarStore((s) => s.mermaLogs);
  const panicActive = useRadarStore((s) => s.panicActive);
  const loading = useRadarStore((s) => s.loading);

  // Acciones expuestas por el store.
  const loadRadarData = useRadarStore((s) => s.loadRadarData);
  const setupRealtimeListeners = useRadarStore((s) => s.setupRealtimeListeners);
  const setZone = useRadarStore((s) => s.setZone);
  const setExceptionDrawerOpen = useRadarStore((s) => s.setExceptionDrawerOpen);
  const toggleFocusMode = useRadarStore((s) => s.toggleFocusMode);
  const addMerma = useRadarStore((s) => s.addMerma);
  const triggerPanic = useRadarStore((s) => s.triggerPanic);
  const clearPanic = useRadarStore((s) => s.clearPanic);

  // Carga inicial y listeners en tiempo real al montar la vista.
  useEffect(() => {
    loadRadarData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadRadarData, setupRealtimeListeners]);

  return (
    // Contenedor principal de la vista de supervisión en modo oscuro elegante.
    <main
      data-focus-mode={focusMode ? 'true' : 'false'}
      className={`min-h-screen px-6 py-6 transition-colors ${
        focusMode ? 'bg-brand-950 text-white ring-4 ring-semantic-urgent' : 'bg-brand-950 text-brand-50'
      }`}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Banner parpadeante de alerta máxima si se presiona el Botón de Pánico. */}
        {panicActive && (
          <div className="flex items-center justify-between rounded-2xl bg-semantic-danger p-4 text-white shadow-2xl animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚨</span>
              <div>
                <p className="font-bold text-lg">ALERTA DE EMERGENCIA ACTIVADA</p>
                <p className="text-xs text-white/80">Se emitió un evento alert.panic al centro de mando.</p>
              </div>
            </div>
            {/* Botón para desactivar la alarma. */}
            <button
              type="button"
              onClick={clearPanic}
              className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30"
            >
              Desactivar Alarma
            </button>
          </div>
        )}

        {/* Cabecera del Radar Local Admin con botones de acción global. */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-50">Local Admin</h1>
              {/* Badge indicativo de Modo Hora Punta activado. */}
              {focusMode && (
                <span className="rounded-full bg-semantic-urgent px-3 py-0.5 text-xs font-bold text-white shadow-md animate-pulse">
                  MODO HORA PUNTA
                </span>
              )}
            </div>
            <p className="text-sm text-brand-50/60">Supervisión en vivo · Salón y Canales Digitales</p>
          </div>

          {/* Barra de botones de control directo del supervisor. */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Botón de conmutación de Modo Hora Punta (Focus Mode). */}
            <button
              type="button"
              onClick={toggleFocusMode}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 border ${
                focusMode
                  ? 'bg-semantic-urgent text-white border-semantic-urgent shadow-lg'
                  : 'bg-brand-900 text-brand-50/80 border-brand-800 hover:bg-brand-800'
              }`}
            >
              🔥 Hora Punta {focusMode ? 'ON' : 'OFF'}
            </button>

            {/* Botón para desplegar el cajón de auditoría y excepciones (alert.fraud). */}
            <button
              type="button"
              onClick={() => setExceptionDrawerOpen(true)}
              className="relative rounded-xl bg-brand-900 border border-brand-800 px-3 py-2 text-xs font-bold text-brand-50/80 hover:bg-brand-800 transition active:scale-95"
            >
              📋 Auditoría
              {/* Counter badge con cantidad de excepciones auditadas. */}
              {exceptionLogs.length > 0 && (
                <span className="ml-1.5 rounded-full bg-semantic-danger px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {exceptionLogs.length}
                </span>
              )}
            </button>

            {/* Botón de Pánico de emergencia. */}
            <button
              type="button"
              onClick={triggerPanic}
              className="rounded-xl bg-semantic-danger px-4 py-2 text-xs font-bold text-white shadow-soft transition hover:bg-semantic-danger/90 active:scale-95"
            >
              🚨 BOTÓN DE PÁNICO
            </button>
          </div>
        </header>

        {/* Estado de carga de mesas del plano. */}
        {loading ? (
          <p className="py-12 text-center text-sm text-brand-50/60">Cargando mapa topológico del salón…</p>
        ) : (
          <>
            {/* Plano topológico espacial del salón. */}
            <TopologicalMap
              tables={tables}
              activeZone={activeZone}
              onSelectZone={setZone}
              focusMode={focusMode}
            />

            {/* Fila de módulos secundarios: Delivery Omnicanal y Control de Mermas. */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Columna de delivery omnicanal (Uber Eats, Rappi, PedidosYa). */}
              <DeliveryColumn deliveryOrders={deliveryOrders} />

              {/* Barra de comando de registro de mermas e inventario vencido. */}
              <MermaBar mermaLogs={mermaLogs} onAddMerma={addMerma} />
            </div>
          </>
        )}

        {/* Drawer deslizable de auditoría de excepciones. */}
        <ExceptionFeedDrawer
          open={exceptionDrawerOpen}
          onClose={() => setExceptionDrawerOpen(false)}
          exceptionLogs={exceptionLogs}
        />
      </div>
    </main>
  );
}
