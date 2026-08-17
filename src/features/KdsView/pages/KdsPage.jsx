// src/features/KdsView/pages/KdsPage.jsx — pantalla principal KDS de cocina (kds-kitchen)
// Orquesta la vista en modo oscuro estricto (`#011623`), filtrado por estaciones, comanda activa,
// modales de Recall y Lista 86, y suscripciones en tiempo real a useRealtimeBus (eventos course.fire).
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

// Componente principal de la página KDS de cocina.
export default function KdsPage() {
  // Suscripción al store de KDS.
  const tickets = useKdsStore((s) => s.tickets);
  const recallStack = useKdsStore((s) => s.recallStack);
  const stock86 = useKdsStore((s) => s.stock86);
  const activeStation = useKdsStore((s) => s.activeStation);
  const isOnline = useKdsStore((s) => s.isOnline);
  const offlineQueue = useKdsStore((s) => s.offlineQueue);
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

  // Estado del bus en tiempo real.
  const bus = useRealtimeBus('mesasplit');

  // Estado local para visibilidad de modales.
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [isLista86Open, setIsLista86Open] = useState(false);

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
    // Contenedor principal en MODO OSCURO ESTRICTO (#011623).
    <main className="min-h-screen bg-brand-950 text-brand-50">
      {/* Cabecera superior KDS con indicador de tickets activos y lanzadores de modales. */}
      <KdsHeader
        activeCount={visibleTickets.length}
        recallCount={recallStack.length}
        onOpenRecall={() => setIsRecallOpen(true)}
        onOpenLista86={() => setIsLista86Open(true)}
      />

      {/* Barra deslizable de estaciones de cocina. */}
      <StationFilterTabs stations={stations} activeStation={activeStation} onChange={setStation} />

      {/* Indicador visual de modo offline si se perdió la conexión a internet. */}
      {!isOnline && <OfflineBanner pendingCount={offlineQueue.length} />}

      {/* Área principal con grilla responsiva de tarjetas de comanda. */}
      <div className="px-6 pb-10">
        {loading ? (
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

      {/* Modal de gestión de Lista 86 (Agotados). */}
      <Lista86Modal
        isOpen={isLista86Open}
        onClose={() => setIsLista86Open(false)}
        stock86={stock86}
        onToggle86={toggleStock86}
      />
    </main>
  );
}
