// src/features/ClientView/store/useReservationStore.js — Store Zustand de gestión de reservas por sucursal y fila virtual
// Administra el catálogo de locales, reservas confirmadas, cola de espera y publicación de eventos en tiempo real.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Zustand create para definir el store global de reservas.
import { create } from 'zustand';
// Instancia del bus en tiempo real para sincronización inter-vistas.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus de eventos para reservas.
const bus = createRealtimeBus('mesasplit');

// Catálogo inicial de sucursales/locales gastronómicos de MesaSplit.
export const INITIAL_BRANCHES = [
  {
    id: 'b-1',
    name: 'Providencia — Terraza & Lounge',
    address: 'Av. Providencia 1234, Providencia',
    city: 'Santiago',
    image: '🍷',
    occupancyPct: 85,
    estimatedWaitMinutes: 15,
    zones: ['Terraza', 'Salón Principal', 'Barra'],
    description: 'Ambiente moderno con terraza climatizada y coctelería de autor.',
  },
  {
    id: 'b-2',
    name: 'Santiago Centro — Salón Histórico',
    address: 'Huérfanos 850, Santiago Centro',
    city: 'Santiago',
    image: '🏛️',
    occupancyPct: 60,
    estimatedWaitMinutes: 0,
    zones: ['Salón Principal', 'Zona Privada'],
    description: 'Gastronomía tradicional en pleno centro cultural e histórico.',
  },
  {
    id: 'b-3',
    name: 'Vitacura — Gourmet & Vinos',
    address: 'Av. Vitacura 3400, Vitacura',
    city: 'Santiago',
    image: '✨',
    occupancyPct: 95,
    estimatedWaitMinutes: 25,
    zones: ['Terraza', 'Salón VIP', 'Cava de Vinos'],
    description: 'Experiencia gastronómica de alta gama con maridaje exclusivo.',
  },
];

// Lista inicial simulada de reservas confirmadas por defecto.
export const INITIAL_STORE_RESERVATIONS = [
  {
    id: 'res-101',
    branchId: 'b-1',
    branchName: 'Providencia — Terraza & Lounge',
    customerName: 'Familia González',
    guests: 4,
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    zone: 'Terraza',
    specialNotes: ['Silla de Bebé 👶', 'Cumpleaños 🎂'],
    status: 'Confirmada',
    code: 'MS-PV-8821',
  },
];

// Store Zustand `useReservationStore`.
export const useReservationStore = create((set, get) => ({
  // Lista de sucursales disponibles.
  branches: INITIAL_BRANCHES,
  // ID de la sucursal seleccionada actualmente por el cliente.
  selectedBranchId: 'b-1',
  // Lista de reservas confirmadas de todas las sucursales.
  reservations: INITIAL_STORE_RESERVATIONS,
  // Lista de espera (fila virtual) activa por sucursal.
  waitlist: [],

  // Cambia la sucursal activa seleccionada por el cliente.
  setSelectedBranchId: (branchId) => {
    // Actualiza el ID de la sucursal activa en el estado del store.
    set({ selectedBranchId: branchId });
  },

  // Registra una nueva reserva confirmada y emite el evento en tiempo real.
  createReservation: (data) => {
    // Obtiene la sucursal seleccionada del estado actual.
    const state = get();
    // Busca los datos de la sucursal correspondiente.
    const branch = state.branches.find((b) => b.id === (data.branchId || state.selectedBranchId)) || state.branches[0];

    // Construye el objeto de reserva consolidado con un código único.
    const newReservation = {
      id: `res-${Date.now()}`,
      branchId: branch.id,
      branchName: branch.name,
      customerName: data.customerName || 'Comensal MesaSplit',
      guests: Number(data.guests) || 2,
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || '20:00',
      zone: data.zone || 'Salón Principal',
      specialNotes: data.specialNotes || [],
      status: 'Confirmada',
      code: `MS-${branch.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
    };

    // Actualiza el estado agregando la nueva reserva al listado.
    set((prev) => ({
      reservations: [newReservation, ...prev.reservations],
    }));

    // Emite el evento por el bus en tiempo real para notificar al Radar Admin.
    bus.publish('reservation.created', {
      ...newReservation,
      timestamp: Date.now(),
    });

    // Retorna el objeto de la nueva reserva recién creada.
    return newReservation;
  },

  // Suma al comensal a la fila virtual de espera si la sucursal está al 100%.
  joinWaitlist: (data) => {
    // Obtiene el estado actual del store.
    const state = get();
    // Identifica la sucursal destino.
    const branch = state.branches.find((b) => b.id === (data.branchId || state.selectedBranchId)) || state.branches[0];

    // Genera el registro de fila virtual con tiempo estimado de espera.
    const newWaitlistEntry = {
      id: `wait-${Date.now()}`,
      branchId: branch.id,
      branchName: branch.name,
      customerName: data.customerName || 'Comensal en Espera',
      guests: Number(data.guests) || 2,
      estimatedWaitMinutes: branch.estimatedWaitMinutes || 15,
      position: state.waitlist.filter((w) => w.branchId === branch.id).length + 1,
      status: 'En Espera',
      code: `WAIT-${branch.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: Date.now(),
    };

    // Actualiza la cola de espera en el estado global.
    set((prev) => ({
      waitlist: [newWaitlistEntry, ...prev.waitlist],
    }));

    // Publica el evento de fila virtual por el bus de tiempo real.
    bus.publish('waitlist.joined', {
      ...newWaitlistEntry,
      timestamp: Date.now(),
    });

    // Retorna la entrada creada en la fila virtual.
    return newWaitlistEntry;
  },

  // Cancela una reserva confirmada por su ID.
  cancelReservation: (id) => {
    // Filtra el estado eliminando la reserva seleccionada.
    set((prev) => ({
      reservations: prev.reservations.filter((r) => r.id !== id),
    }));
  },
}));
