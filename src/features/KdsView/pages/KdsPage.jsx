// src/features/KdsView/pages/KdsPage.jsx — cocina KDS modo oscuro estricto (task 2.7)
// Ruta "/cocina" del spec feature-views: fondo brand-950 (#011623), tickets
// brand-800 (#024064) y texto claro — NINGUNA superficie clara en el slice
// (escenarios "dark surfaces throughout" y "no light-mode leakage").
// Orquesta el servicio (tickets) y el store (filtro por estación) del slice.

// useEffect: dispara la carga de tickets al montar la vista.
import { useEffect, useMemo } from 'react';
// Store de cocina: tickets, estación activa y acciones.
import { STATION_ALL, useKdsStore } from '../store/useKdsStore.js';
// Cabecera oscura del KDS (conteo de tickets en curso).
import KdsHeader from '../components/KdsHeader.jsx';
// Tabs de estación: filtro por zona de cocina (chips oscuros).
import StationFilterTabs from '../components/StationFilterTabs.jsx';
// Tarjeta de ticket en brand-800 con semáforo y escudo de alergias.
import TicketCard from '../components/TicketCard.jsx';

// KdsPage: pantalla de la cocina en modo oscuro estricto.
export default function KdsPage() {
  // Suscripción al store: tickets de cocina cargados.
  const tickets = useKdsStore((s) => s.tickets);
  // Estación activa del filtro (STATION_ALL = ver todas).
  const activeStation = useKdsStore((s) => s.activeStation);
  // Flag de carga de la primera llamada al servicio.
  const loading = useKdsStore((s) => s.loading);
  // Acción de carga inicial de tickets (se dispara una vez abajo).
  const loadTickets = useKdsStore((s) => s.loadTickets);
  // Acción de cambiar la estación activa del filtro.
  const setStation = useKdsStore((s) => s.setStation);

  // Carga los tickets UNA vez al montar la vista.
  useEffect(() => {
    // Invoca la acción del store que resuelve los tickets del servicio.
    loadTickets();
    // Sin deps: solo al montar (los datos del demo no cambian en sesión).
  }, [loadTickets]);

  // Deriva la lista de estaciones disponibles + "Todas" para los tabs.
  const stations = useMemo(() => {
    // Extrae las estaciones únicas de los tickets (Set elimina duplicados).
    const unique = [...new Set(tickets.map((ticket) => ticket.station))];
    // Antepone la opción "todas" al arreglo de estaciones.
    return [STATION_ALL, ...unique];
  }, [tickets]);

  // Filtra los tickets por la estación activa (o devuelve todos).
  const visibleTickets = useMemo(
    // Si el filtro es "todas" muestra todo; si no, solo la estación activa.
    () =>
      activeStation === STATION_ALL ? tickets : tickets.filter((t) => t.station === activeStation),
    // Recalcula cuando cambian los tickets o la estación activa.
    [tickets, activeStation],
  );

  return (
    // Contenedor OSCURO ESTRICTO: fondo brand-950 en toda la vista.
    <main className="min-h-screen bg-brand-950 text-brand-50">
      {/* Cabecera del KDS: título, turno y conteo de tickets activos. */}
      <KdsHeader activeCount={visibleTickets.length} />
      {/* Tabs de estación: filtran los tickets por zona de cocina. */}
      <StationFilterTabs stations={stations} activeStation={activeStation} onChange={setStation} />

      {/* Cuerpo: grilla de tickets o estado de carga inicial. */}
      <div className="px-6 pb-10">
        {/* Estado de carga: texto claro mientras resuelve el servicio. */}
        {loading ? (
          // Mensaje de carga de tickets con tipografía clara legible.
          <p className="py-16 text-center text-brand-50/60">Cargando tickets de cocina…</p>
        ) : visibleTickets.length === 0 ? (
          // Sin tickets para la estación activa: estado vacío oscuro.
          <p className="py-16 text-center text-brand-50/60">No hay tickets en esta estación.</p>
        ) : (
          // Grilla responsiva de tarjetas de ticket (1→4 columnas).
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {/* Renderiza una TicketCard por ticket visible del filtro. */}
            {visibleTickets.map((ticket) => (
              // Key estable del ticket en la grilla.
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
