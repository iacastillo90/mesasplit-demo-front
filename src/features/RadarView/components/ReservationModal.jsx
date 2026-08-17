// src/features/RadarView/components/ReservationModal.jsx — modal de reservas de mesas y lista de espera virtual (interactive-table-reservation)
// Administra reservas de salón y cola de espera con estimación de tiempo y emisión de eventos reservation.created por el bus real-time.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useEffect y useState para gestionar las pestañas y la sincronización en tiempo real.
import { useState, useEffect } from 'react';
// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';
// Instancia del bus en tiempo real.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus de eventos para el Radar.
const bus = createRealtimeBus('mesasplit');

// Lista inicial simulada de reservas activas.
const INITIAL_RESERVATIONS = [
  { id: 'res-1', name: 'Familia González', guests: 4, time: '20:00', table: 'Mesa 12', status: 'Confirmada' },
  { id: 'res-2', name: 'Reserva Ejecutivo', guests: 2, time: '21:15', table: 'Mesa 04', status: 'En Espera' },
];

// Lista inicial simulada de la cola de espera virtual.
const INITIAL_WAITLIST = [
  { id: 'wait-1', name: 'Carolina M.', guests: 3, waitTime: '15 min', status: 'En Espera' },
  { id: 'wait-2', name: 'Roberto S.', guests: 6, waitTime: '30 min', status: 'En Espera' },
];

// Componente ReservationModal.
export default function ReservationModal({ open, onClose }) {
  // Pestaña activa ('reservations' | 'waitlist' | 'new').
  const [tab, setTab] = useState('reservations');
  // Listado de reservas.
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS);
  // Listado de la cola de espera.
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);

  // Escucha los eventos en tiempo real emitidos desde el asistente de reservas del cliente.
  useEffect(() => {
    // Suscripción al evento de creación de reserva.
    const unsubCreated = bus.subscribe('reservation.created', (data) => {
      if (!data) return;
      const formattedRes = {
        id: data.id || `res-${Date.now()}`,
        name: data.customerName || data.name || 'Reserva Cliente',
        guests: data.guests || 2,
        time: data.time || '20:30',
        table: data.table || data.zone || 'Por Asignar',
        status: 'Confirmada',
      };
      setReservations((prev) => [formattedRes, ...prev]);
    });

    // Suscripción al evento de ingreso a la fila virtual.
    const unsubWaitlist = bus.subscribe('waitlist.joined', (data) => {
      if (!data) return;
      const formattedWait = {
        id: data.id || `wait-${Date.now()}`,
        name: data.customerName || 'Comensal en Espera',
        guests: data.guests || 2,
        waitTime: `${data.estimatedWaitMinutes || 15} min`,
        status: 'En Espera',
      };
      setWaitlist((prev) => [formattedWait, ...prev]);
    });

    // Cancela las suscripciones al desmontar el modal.
    return () => {
      unsubCreated();
      unsubWaitlist();
    };
  }, []);

  // Campos del formulario para nueva reserva.
  const [name, setName] = useState('');
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState('20:30');
  const [table, setTable] = useState('Mesa 08');

  // Registra una nueva reserva y emite el evento real-time.
  const handleSaveReservation = (e) => {
    e?.preventDefault();
    if (!name.trim()) return;

    const newRes = {
      id: `res-${Date.now()}`,
      name,
      guests: Number(guests),
      time,
      table,
      status: 'Confirmada',
    };

    const updated = [newRes, ...reservations];
    setReservations(updated);

    // Emite el evento por el bus en tiempo real.
    bus.publish('reservation.created', {
      ...newRes,
      timestamp: Date.now(),
    });

    // Limpia el formulario y vuelve a la lista.
    setName('');
    setTab('reservations');
  };

  return (
    // Modal de diálogo envolvente para la gestión de reservas.
    <Modal open={open} onClose={onClose} title="Gestión de Reservas y Lista de Espera">
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Selector de pestañas: Reservas vs Lista de Espera vs Nueva. */}
        <div className="flex gap-2 border-b border-brand-200 pb-2">
          <button
            type="button"
            onClick={() => setTab('reservations')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
              tab === 'reservations'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
            }`}
          >
            Reservas Confirmadas ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('waitlist')}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
              tab === 'waitlist'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
            }`}
          >
            Lista de Espera ({waitlist.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('new')}
            className={`ml-auto rounded-xl px-3.5 py-1.5 text-xs font-bold transition border ${
              tab === 'new'
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-soft'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            + Nueva Reserva
          </button>
        </div>

        {/* Pestaña 1: Lista de Reservas Confirmadas. */}
        {tab === 'reservations' && (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
            {reservations.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-brand-200 shadow-soft"
              >
                <div>
                  <p className="text-xs font-bold text-brand-900">{res.name}</p>
                  <p className="text-[11px] text-brand-800/70">
                    {res.guests} comensales · {res.time} hrs · {res.table}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-300">
                  {res.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pestaña 2: Cola de Espera Virtual. */}
        {tab === 'waitlist' && (
          <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
            {waitlist.map((wait) => (
              <div
                key={wait.id}
                className="flex items-center justify-between rounded-2xl bg-white p-3.5 border border-brand-200 shadow-soft"
              >
                <div>
                  <p className="text-xs font-bold text-brand-900">{wait.name}</p>
                  <p className="text-[11px] text-brand-800/70">{wait.guests} comensales · Tiempo est: {wait.waitTime}</p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-300">
                  ⏳ En Espera
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pestaña 3: Formulario para crear una nueva reserva. */}
        {tab === 'new' && (
          <form onSubmit={handleSaveReservation} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Nombre del cliente:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del cliente (ej. Familia Pérez)"
                className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-800">Comensales:</label>
                <input
                  type="number"
                  min={1}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-800">Hora:</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-800">Mesa Asignada:</label>
                <input
                  type="text"
                  value={table}
                  onChange={(e) => setTable(e.target.value)}
                  className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
              <button
                type="button"
                onClick={() => setTab('reservations')}
                className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800/70 hover:bg-brand-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-semantic-success px-5 py-2 text-xs font-bold text-white hover:bg-semantic-success/90 shadow-soft"
              >
                Guardar Reserva
              </button>
            </div>
          </form>
        )}

        {/* Pie del modal. */}
        <div className="flex justify-end border-t border-brand-200 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
