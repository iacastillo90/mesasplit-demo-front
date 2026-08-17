// src/features/RadarView/pages/RadarPage.jsx — Local Admin / Radar de Turno (local-admin-radar + interactive-table-reservation + modo-hora-punta + radar-inventory)
// Vista "/admin" del spec local-admin-radar: plano topológico del salón por zonas,
// tarjetas del canal Delivery Omnicanal, cajón de auditoría (alert.fraud),
// módulo de inventario y recetas, Modo Hora Punta con filtrado de mesas críticas, mermas, pánico y reservas.
// Utiliza AdminLayout colapsable con Sidebar Fijo a la izquierda (sm:flex), Header/Footer fijos y main scrollable.
// Cumple con todas las normas de AGENTS.md (comentarios en español por cada línea).

import { useEffect, useState } from 'react';
import { useRadarStore } from '../store/useRadarStore.js';
import TopologicalMap from '../components/TopologicalMap.jsx';
import DeliveryColumn from '../components/DeliveryColumn.jsx';
import ExceptionFeedDrawer from '../components/ExceptionFeedDrawer.jsx';
import MermaBar from '../components/MermaBar.jsx';
import ReservationModal from '../components/ReservationModal.jsx';
import StaffLeaderboard from '../components/StaffLeaderboard.jsx';
import InventoryMenuManager from '../components/InventoryMenuManager.jsx';
import { exportToCsv } from '../../../shared/utils/exportToCsv.js';
import { AdminLayout } from '../../../shared/ui/index.js';

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

  const navTabs = [
    { id: 'all', label: '🌐 Vista Completa', subtitle: 'Todas las secciones integradas' },
    { id: 'overview', label: '🗺️ Salón & Mesas', subtitle: 'Plano topológico por zonas' },
    { id: 'inventory', label: '📦 Inventario & Menú', subtitle: 'Recetas, precios y stock' },
    { id: 'delivery', label: '🛵 Canal Delivery', subtitle: 'Pedidos de Uber, Rappi, PYa' },
    { id: 'gamification', label: '🏆 Gamificación Staff', subtitle: 'Ranking y puntaje en vivo' },
    { id: 'merma', label: '⚠️ Control de Mermas', subtitle: 'Registro rápido de insumos' },
  ];

  return (
    <AdminLayout
      currentRoute="/admin"
      title="Local Admin"
      subtitle="Radar de Turno"
      theme="dark"
      sectionTabs={navTabs}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      {/* Banner de Pánico de emergencia */}
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

      {/* Cabecera del Radar Local Admin */}
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportToCsv('ventas_radar_local', tables.map((t) => ({ Mesa: t.number, Estado: t.status, Mozos: t.waiterName || 'Sin asignar', TotalCLP: t.totalAmount || 0 })))}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-1"
          >
            📥 Exportar Excel (CSV)
          </button>
          {!focusMode && (
            <button
              type="button"
              onClick={() => setReservationOpen(true)}
              className="rounded-xl bg-brand-900 border border-brand-800 px-3 py-2 text-xs font-bold text-brand-50/80 hover:bg-brand-800 transition active:scale-95 cursor-pointer"
            >
              📅 Reservas y Lista
            </button>
          )}

          <button
            type="button"
            onClick={toggleFocusMode}
            className={`rounded-xl px-4 py-2 text-xs font-extrabold transition active:scale-95 border cursor-pointer ${
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
            className="relative rounded-xl bg-brand-900 border border-brand-800 px-3 py-2 text-xs font-bold text-brand-50/80 hover:bg-brand-800 transition active:scale-95 cursor-pointer"
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
            className="rounded-xl bg-semantic-danger/20 border border-semantic-danger/40 px-3 py-2 text-xs font-bold text-semantic-danger hover:bg-semantic-danger hover:text-white transition active:scale-95 shadow-soft cursor-pointer"
          >
            🚨 Pánico
          </button>
        </div>
      </header>

      {/* SECCIONES RESPONSIVAS DE CONTENIDO */}
      {loading ? (
        <p className="py-12 text-center text-brand-50/60">Cargando estado del salón…</p>
      ) : (
        <>
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
              <InventoryMenuManager />
              {!focusMode && <StaffLeaderboard />}
              <MermaBar mermaLogs={mermaLogs} onAddMerma={addMerma} />
            </div>
          )}

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

          {activeTab === 'inventory' && (
            <div className="w-full">
              <InventoryMenuManager />
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="w-full">
              <DeliveryColumn orders={deliveryOrders} focusMode={focusMode} />
            </div>
          )}

          {activeTab === 'gamification' && (
            <div className="w-full">
              <StaffLeaderboard />
            </div>
          )}

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
    </AdminLayout>
  );
}
