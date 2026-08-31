// src/features/ClientView/store/useSplitStore.js — store de división de cuentas (account-split)
// Slice de estado Zustand para la división de cuentas en la Mesa Virtual:
// maneja apertura del modal, total del carrito, número de comensales, modo de división y cuotas por comensal.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// create de Zustand.
import { create } from 'zustand';
// Servicio de cálculo de división.
import { splitByMode } from '../services/splitService.js';
// Instancia del bus en tiempo real.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para la Mesa Virtual.
const bus = createRealtimeBus('mesasplit');

// Estado inicial del store de división de cuenta.
const initialState = {
  // Flag de apertura del modal de división de cuenta.
  open: false,
  // Total a dividir de la mesa.
  cartTotal: 20000,
  // Cantidad de comensales en la mesa.
  guestCount: 2,
  // Modo de división seleccionado ('full' | 'equal' | 'by_item' | 'custom_amount').
  mode: 'full',
  // Lista de cuotas calculadas por comensal.
  guests: [
    { id: 'guest-1', name: 'Comensal 1 (Total)', amount: 20000, status: 'pending' },
  ],
};

// Store de Zustand para useSplitStore.
export const useSplitStore = create((set, get) => ({
  // Carga el estado inicial.
  ...initialState,

  // Abre el modal de división pasando el total actual del carrito.
  openSplit: (cartTotal = 20000) => {
    const { guestCount, mode } = get();
    const derivedGuests = splitByMode(cartTotal, guestCount, mode);
    set({ open: true, cartTotal, guests: derivedGuests });
  },

  // Cierra el modal de división.
  closeSplit: () => set({ open: false }),

  // Cambia el modo de división ('full', 'equal', 'by_item', 'custom_amount').
  setMode: (mode) => {
    const { cartTotal, guestCount } = get();
    const derivedGuests = splitByMode(cartTotal, guestCount, mode);
    set({ mode, guests: derivedGuests });
  },

  // Cambia el número de comensales en la mesa.
  setGuestCount: (guestCount) => {
    const { cartTotal, mode } = get();
    const derivedGuests = splitByMode(cartTotal, guestCount, mode);
    set({ guestCount, guests: derivedGuests });
  },

  // Registra el pago parcial de la cuota de un comensal específico.
  payGuest: (guestId) => {
    const { guests, cartTotal } = get();
    const updatedGuests = guests.map((g) =>
      g.id === guestId ? { ...g, status: 'paid' } : g,
    );

    set({ guests: updatedGuests });

    // Emite el evento payment.split en el bus en tiempo real.
    const paidGuest = guests.find((g) => g.id === guestId);
    bus.publish('payment.split', {
      guestId,
      guestName: paidGuest?.name ?? guestId,
      amount: paidGuest?.amount ?? 0,
      cartTotal,
      timestamp: Date.now(),
    });
  },

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));
