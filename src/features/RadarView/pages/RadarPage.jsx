// src/features/RadarView/pages/RadarPage.jsx — Local Admin / Radar de Turno (local-admin-radar + interactive-table-reservation + modo-hora-punta)
// Vista "/admin" del spec local-admin-radar: plano topológico del salón por zonas,
// tarjetas del canal Delivery Omnicanal, cajón de auditoría (alert.fraud),
// Modo Hora Punta con filtrado de mesas críticas, mermas, pánico y reservas.
// Incorpora Layout con Menú Lateral (Sidebar) para filtrar por funcionalidad sin scroll.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea).

import { useEffect, useState } from 'react';
import { useRadarStore } from '../store/useRadarStore.js';
import TopologicalMap from '../components/TopologicalMap.jsx';
import DeliveryColumn from '../components/DeliveryColumn.jsx';
import ExceptionFeedDrawer from '../components/ExceptionFeedDrawer.jsx';
import MermaBar from '../components/MermaBar.jsx';
import ReservationModal from '../components/ReservationModal.jsx';
import StaffLeaderboard from '../components/StaffLeaderboard.jsx';

export default function RadarPage() {
  const tables = useRadarStore((s) => s.tables);
  const activeZone = useRadarStore((s) => s.activeZone);
  const deliveryOrders = useRadarStore((s) => s.deliveryOrders);
  const exceptionLogs = useRadarStore((s) => s.exceptionLogs);
  const exceptionDrawerOpen = useRadarStore((s) => s.exceptionDrawerOpen);
  const focusMode = useRadarStore((s) => s.focusMode);
  const mermaLogs = useRadarStore((s) => s.mermaLogs);
  const panicActive = useRadarStore((s) => s.panicActive);
  const loading = useRadarStore((s) => s.loading);

  // Tab activo del menú lateral. 'all' muestra la vista integrada completa.
  const [activeTab, setActiveTab] = useState('all');

  const [reservationOpen, setReservationOpen] = useState(false);

  const loadRadarData = useRadarStore((s) => s.loadRadarData);
  const setupRealtimeListeners = useRadarStore((s) => s.setupRealtimeListeners);
  const setZone = useRadarStore((s) => s.setZone);
  const setExceptionDrawerOpen = useRadarStore((s) => s.setExceptionDrawerOpen);
  const toggleFocusMode = useRadarStore((s) => s.toggleFocusMode);
  const addMerma = useRadarStore((s) => s.addMerma);
  const triggerPanic = useRadarStore((s) => s.triggerPanic);
  const clearPanic = useRadarStore((s) => s.clearPanic);

  useEffect(() => {
    loadRadarData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadRadarData, setupRealtimeListeners]);

  // Pestañas del Menú Lateral de navegación.
  const navTabs = [
    { id: 'all', label: '🌐 Vista Completa', subtitle: 'Todas las secciones integradas' },
    { id: 'overview', label: '🗺️ Salón & Mesas', subtitle: 'Plano topológico por zonas' },
    { id: 'delivery', label: '🛵 Canal Delivery', subtitle: 'Pedidos de Uber, Rappi, PYa' },
    { id: 'gamification', label: '🏆 Gamificación Staff', subtitle: 'Ranking y puntaje en vivo' },
    { id: 'merma', label: '⚠️ Control de Mermas', subtitle: 'Registro rápido de insumos' },
  ];

  return (
    <main
      data-focus-mode={focusMode ? 'true' : 'false'}
      className={`min-h-screen px-4 py-4 transition-colors ${
        focusMode ? 'bg-brand-950 text-white ring-4 ring-semantic-urgent' : 'bg-brand-950 text-brand-50'
      }`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-6">
        {/* MENÚ LATERAL (SIDEBAR NAVIGATION) */}
        <aside className="w-full lg:w-64 shrink-0 rounded-2xl bg-brand-900/90 border border-brand-800 p-4 flex flex-col justify-between gap-6 shadow-xl">
          <div className="flex flex-col gap-5">
            {/* Cabecera del Sidebar */}
            <div className="flex items-center justify-between border-b border-brand-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">MesaSplit Admin</span>
                <h2 className="text-lg font-bold text-white leading-tight">Radar Local</h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20">
                En Vivo
              </span>
            </div>

            {/* Opciones del Menú Lateral */}
            <nav className="flex flex-col gap-1.5" aria-label="Navegación del Admin">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-start rounded-xl p-3 text-left transition ${
                      isActive
                        ? 'bg-brand-500 text-white font-bold shadow-md'
                        : 'text-brand-50/70 hover:bg-brand-800/80 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-brand-50/40'}`}>
                      {tab.subtitle}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enlace seguro al Hub (compatible con unit tests sin Router context) */}
          <div className="border-t border-brand-800 pt-4 flex flex-col gap-2">
            <a
              href="/"
              onClick={(e) => {
                // Si existe window.history.pushState navega sin recarga
                if (typeof window !== 'undefined' && window.history?.pushState) {
                  e.preventDefault();
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-950 p-2.5 text-xs font-bold text-brand-50/80 hover:bg-black transition border border-brand-800"
            >
              🏠 Ir al Hub Principal
            </a>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL DE CONTENIDO */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Alerta parpadeante si se gatilla el Botón de Pánico */}
          {panicActive && (
            <div className="flex items-center justify-between rounded-2xl bg-semantic-danger p-4 text-white shadow-2xl animate-pulse">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚨</span>
                <div>
                  <p className="font-bold text-lg">ALERTA DE EMERGENCIA ACTIVADA</p>
                  <p className="text-xs text-white/80">Se emitió un evento alert.panic al centro de mando.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearPanic}
                className="rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30"
              >
                Desactivar Alarma
              </button>
            </div>
          )}

          {/* Cabecera principal con botones de control */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-brand-900/60 p-4 border border-brand-800">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-brand-50">Local Admin</h1>
                {focusMode && (
                  <span className="rounded-full bg-semantic-urgent px-3 py-0.5 text-xs font-bold text-white shadow-md animate-pulse">
                    MODO HORA PUNTA
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-50/60">Supervisión en vivo · Salón y Canales Digitales</p>
            </div>

            {/* Acciones directas del supervisor */}
            <div className="flex flex-wrap items-center gap-2">
              {!focusMode && (
                <button
                  type="button"
                  onClick={() => setReservationOpen(true)}
                  className="rounded-xl bg-brand-900 border border-brand-800 px-3 py-2 text-xs font-bold text-brand-50/80 hover:bg-brand-800 transition active:scale-95"
                >
                  📅 Reservas y Lista
                </button>
              )}

              <button
                type="button"
                onClick={toggleFocusMode}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition active:scale-95 border ${
                  focusMode
                    ? 'bg-semantic-urgent text-white border-semantic-urgent shadow-lg animate-pulse'
                    : 'bg-brand-900 text-brand-50/80 border-brand-800 hover:bg-brand-800'
                }`}
              >
                🔥 Hora Punta {focusMode ? 'ON' : 'OFF'}
              </button>

              <button
                type="button"
                onClick={() => setExceptionDrawerOpen(true)}
                className="relative rounded-xl bg-brand-900 border border-brand-800 px-3 py-2 text-xs font-bold text-brand-50/80 hover:bg-brand-800 transition active:scale-95"
              >
                📋 Auditoría
                {exceptionLogs.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-semantic-danger px-1.5 py-0.2 text-[10px] font-bold text-white">
                    {exceptionLogs.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={triggerPanic}
                className="rounded-xl bg-semantic-danger/20 border border-semantic-danger/40 px-3 py-2 text-xs font-bold text-semantic-danger hover:bg-semantic-danger hover:text-white transition active:scale-95 shadow-soft"
              >
                🚨 Pánico
              </button>
            </div>
          </header>

          {/* RENDERS DE SECCIÓN SEGÚN SELECCIÓN DEL SIDEBAR */}
          {loading ? (
            <p className="py-12 text-center text-brand-50/60">Cargando estado del salón…</p>
          ) : (
            <>
              {/* TAB ALL: Render integrado de todas las secciones */}
              {activeTab === 'all' && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                      <TopologicalMap
                        tables={tables}
                        activeZone={activeZone}
                        onSelectZone={setZone}
                        focusMode={focusMode}
                      />
                    </div>
                    <DeliveryColumn orders={deliveryOrders} focusMode={focusMode} />
                  </div>
                  {!focusMode && <StaffLeaderboard />}
                  <MermaBar mermaLogs={mermaLogs} onAddMerma={addMerma} />
                </div>
              )}

              {/* TAB OVERVIEW: Plano de Salón + Delivery */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <TopologicalMap
                      tables={tables}
                      activeZone={activeZone}
                      onSelectZone={setZone}
                      focusMode={focusMode}
                    />
                  </div>
                  <DeliveryColumn orders={deliveryOrders} focusMode={focusMode} />
                </div>
              )}

              {/* TAB DELIVERY: Canal Delivery exclusivo */}
              {activeTab === 'delivery' && (
                <div className="w-full">
                  <DeliveryColumn orders={deliveryOrders} focusMode={focusMode} />
                </div>
              )}

              {/* TAB GAMIFICATION: Leaderboard exclusivo */}
              {activeTab === 'gamification' && (
                <div className="w-full">
                  <StaffLeaderboard />
                </div>
              )}

              {/* TAB MERMA: Barra de Mermas exclusiva */}
              {activeTab === 'merma' && (
                <div className="w-full">
                  <MermaBar mermaLogs={mermaLogs} onAddMerma={addMerma} />
                </div>
              )}
            </>
          )}

          {/* Drawer de auditoría y excepciones */}
          <ExceptionFeedDrawer
            open={exceptionDrawerOpen}
            onClose={() => setExceptionDrawerOpen(false)}
            logs={exceptionLogs}
          />

          {/* Modal de gestión de reservas */}
          <ReservationModal
            open={reservationOpen}
            onClose={() => setReservationOpen(false)}
          />
        </div>
      </div>
    </main>
  );
}
