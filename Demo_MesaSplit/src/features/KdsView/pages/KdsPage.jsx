// src/features/KdsView/pages/KdsPage.jsx — pantalla principal KDS de cocina (kds-kitchen + kds-expo-view)
// Orquesta la vista en modo oscuro estricto (`#011623`), filtrado por estaciones, comanda activa,
// modales de Recall y Lista 86, modo exhibición Expo View y suscripciones en tiempo real.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Hooks de React para estado local y efectos secundarios.
import { useEffect, useMemo, useState } from 'react';
// Store central del KDS de cocina.
import { STATION_ALL, useKdsStore } from '../store/useKdsStore.js';
// Hook de bus de eventos en tiempo real.
import { useRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Cabecera superior del KDS.
import KdsHeader from '../components/KdsHeader.jsx';
// Pestañas de filtrado de estación.
import StationFilterTabs from '../components/StationFilterTabs.jsx';
// Tarjeta individual de comanda.
import TicketCard from '../components/TicketCard.jsx';
// Modal de historial de Recall.
import RecallModal from '../components/RecallModal.jsx';
// Modal de gestión de Lista 86.
import Lista86Modal from '../components/Lista86Modal.jsx';
// Indicador visual de modo offline.
import OfflineBanner from '../components/OfflineBanner.jsx';
// Adaptador de conectividad de red.
import { createConnectivityAdapter } from '../services/connectivityService.js';
// Componente de exhibición fullscreen Expo View.
import ExpoDisplay from '../components/ExpoDisplay.jsx';
// Componente de vista agregada por plato (kds-batch-view).
import BatchSummaryView from '../components/BatchSummaryView.jsx';
// Store de RadarView para leer las órdenes de delivery activas.
import { selectActiveDelivery, useRadarStore } from '../../RadarView/store/useRadarStore.js';
// Modal de checklist de empaque delivery (kds-delivery-checklist).
import PackingChecklistModal from '../components/PackingChecklistModal.jsx';
// AppHeader y AppFooter compartidos.
import { AppHeader, AppFooter } from '../../../shared/ui/index.js';

// Componente principal de la página KDS de cocina.
export default function KdsPage() {
  // Suscripción al store de KDS.
  const tickets = useKdsStore((s) => s.tickets);
  const recallStack = useKdsStore((s) => s.recallStack);
  const stock86 = useKdsStore((s) => s.stock86);
  const activeStation = useKdsStore((s) => s.activeStation);
  const isOnline = useKdsStore((s) => s.isOnline);
  const offlineQueue = useKdsStore((s) => s.offlineQueue);
  const expoMode = useKdsStore((s) => s.expoMode);
  const loading = useKdsStore((s) => s.loading);

  // Acciones extraídas del store.
  const loadTickets = useKdsStore((s) => s.loadTickets);
  const setStation = useKdsStore((s) => s.setStation);
  const completeTicket = useKdsStore((s) => s.completeTicket);
  const restoreTicket = useKdsStore((s) => s.restoreTicket);
  const toggleStock86 = useKdsStore((s) => s.toggleStock86);
  const toggleItemPrepared = useKdsStore((s) => s.toggleItemPrepared);
  const fireCourse = useKdsStore((s) => s.fireCourse);
  const setOnlineState = useKdsStore((s) => s.setOnlineState);
  const toggleExpoMode = useKdsStore((s) => s.toggleExpoMode);

  // Estado del bus en tiempo real.
  const bus = useRealtimeBus('mesasplit');

  // Estado local para visibilidad de modales y vista batch.
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [isLista86Open, setIsLista86Open] = useState(false);
  const [isBatchView, setIsBatchView] = useState(false);
  const [selectedPackingOrder, setSelectedPackingOrder] = useState(null);

  // Obtiene las órdenes de delivery activas desde useRadarStore.
  const deliveryOrders = useRadarStore((s) => s.deliveryOrders);
  const activeDeliveryOrders = useMemo(
    () => selectActiveDelivery(deliveryOrders),
    [deliveryOrders],
  );

  // Carga inicial de tickets al montar.
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Suscripción a eventos en tiempo real course.fire desde el bus.
  useEffect(() => {
    const unsubscribe = bus.subscribe('course.fire', (payload) => {
      if (payload && payload.orderId) {
        fireCourse(payload.orderId, payload.courseType);
      }
    });
    return () => unsubscribe();
  }, [bus, fireCourse]);

  // Suscripción al adaptador de conectividad de red (kds-offline).
  useEffect(() => {
    const adapter = createConnectivityAdapter((status) => {
      setOnlineState(status);
    });
    return () => adapter.unsubscribe();
  }, [setOnlineState]);

  // Deriva la lista de estaciones disponibles a partir de las comandas.
  const stations = useMemo(() => {
    const unique = [...new Set(tickets.map((t) => t.station).filter(Boolean))];
    return [STATION_ALL, ...unique];
  }, [tickets]);

  // Filtra los tickets según la pestaña de estación activa.
  const visibleTickets = useMemo(() => {
    if (activeStation === STATION_ALL) return tickets;
    return tickets.filter((t) => t.station === activeStation);
  }, [tickets, activeStation]);

  return (
    <div className="flex flex-col min-h-screen bg-brand-950 text-brand-50">
      <AppHeader title="Cocina KDS" subtitle="Modo Oscuro Estricto" currentRoute="/cocina" theme="dark" />
      {/* Contenedor principal en MODO OSCURO ESTRICTO (#011623). */}
      <main className="flex-1 min-h-screen bg-brand-950 text-brand-50">
      {/* Componente exhibición fullscreen Expo View (kds-expo-view). */}
      {expoMode ? (
        <ExpoDisplay tickets={visibleTickets} onClose={toggleExpoMode} />
      ) : (
        <>
          {/* Cabecera superior KDS con indicador de tickets activos y lanzadores de modales. */}
          <KdsHeader
            activeCount={visibleTickets.length}
            recallCount={recallStack.length}
            deliveryCount={activeDeliveryOrders.length}
            onOpenRecall={() => setIsRecallOpen(true)}
            onOpenLista86={() => setIsLista86Open(true)}
            onOpenPacking={() => setSelectedPackingOrder(activeDeliveryOrders[0] ?? null)}
            onToggleExpo={toggleExpoMode}
            isBatchView={isBatchView}
            onToggleBatch={() => setIsBatchView((prev) => !prev)}
          />

          {/* Barra deslizable de estaciones de cocina. */}
          <StationFilterTabs stations={stations} activeStation={activeStation} onChange={setStation} />

          {/* Indicador visual de modo offline si se perdió la conexión a internet. */}
          {!isOnline && <OfflineBanner pendingCount={offlineQueue.length} />}

          {/* Área principal con grilla responsiva de tarjetas de comanda o resumen batch. */}
          <div className="px-6 pb-10">
            {isBatchView ? (
              <BatchSummaryView tickets={visibleTickets} activeStation={activeStation} />
            ) : loading ? (
              <p className="py-16 text-center text-brand-50/60">Cargando tickets de cocina…</p>
            ) : visibleTickets.length === 0 ? (
              <p className="py-16 text-center text-brand-50/60">No hay tickets activos en esta estación.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onComplete={completeTicket}
                    onTogglePrepared={toggleItemPrepared}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal de Recall de comandas despachadas. */}
          <RecallModal
            isOpen={isRecallOpen}
            onClose={() => setIsRecallOpen(false)}
            recallStack={recallStack}
            onRestore={restoreTicket}
          />

          {/* Modal de Lista 86 (gestión de quiebres de stock). */}
          <Lista86Modal
            isOpen={isLista86Open}
            onClose={() => setIsLista86Open(false)}
            stock86={stock86}
            onToggle86={toggleStock86}
          />

          {/* Modal de checklist de empaque delivery (kds-delivery-checklist). */}
          <PackingChecklistModal
            open={Boolean(selectedPackingOrder)}
            order={selectedPackingOrder}
            onClose={() => setSelectedPackingOrder(null)}
          />
        </>
      )}
      </main>
      <AppFooter theme="dark" />
    </div>
  );
}
