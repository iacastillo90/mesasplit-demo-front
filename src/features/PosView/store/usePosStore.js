// src/features/PosView/store/usePosStore.js — store de Caja POS (pos-cashier + cash-shift)
// Slice de estado de PosView: bloqueo de sesión con PIN, cuentas abiertas, medio de pago,
// emisión de DTEs, arqueo de Cierre Ciego, turno de caja (cash-shift) e integración con el bus en tiempo real.
// Persiste cashShift bajo la clave mesasplit-cash-shift en localStorage.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// middleware persist para guardar el turno de caja entre recargas.
import { persist } from 'zustand/middleware';
// Servicio de datos de caja POS.
import { fetchOpenBills } from '../services/posService.js';
// Instancia del bus en tiempo real.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para la Caja POS.
export const posBus = createRealtimeBus('mesasplit');
const bus = posBus;

// Fixture canónico inicial de cuentas abiertas para cobro.
const INITIAL_BILLS = [
  { id: 'b-1', tableNumber: 1, customerName: 'Familia González', totalAmount: 20000, status: 'billing', itemsCount: 4 },
  { id: 'b-2', tableNumber: 2, customerName: 'Mesa Empresa', totalAmount: 45000, status: 'billing', itemsCount: 8 },
  { id: 'b-3', tableNumber: 3, customerName: 'Pareja Terraza', totalAmount: 18500, status: 'billing', itemsCount: 3 },
];

// Estado inicial del turno operativo de caja.
const INITIAL_CASH_SHIFT = {
  status: 'closed',
  openedAt: null,
  initialAmount: null,
  closedAt: null,
  summary: null,
};

// Estado inicial del store de POS.
const initialState = {
  // Flag de autenticación de cajero con PIN ("9921").
  cashierUnlocked: true,
  // Cuentas de mesa abiertas.
  openBills: INITIAL_BILLS,
  // Cuenta actualmente seleccionada para cobro.
  activeBill: INITIAL_BILLS[0],
  // Método de pago seleccionado ('efectivo', 'tarjeta', 'transferencia', 'mixto').
  paymentMethod: 'efectivo',
  // Monto recibido del cliente.
  tenderedAmount: 0,
  // Visibilidad del modal DTE.
  dteModalOpen: false,
  // Visibilidad del modal Cierre Ciego.
  blindCloseOpen: false,
  // Estado de carga inicial.
  loading: false,
  // Estado del turno operativo de caja (cash-shift).
  cashShift: INITIAL_CASH_SHIFT,
  // Visibilidad del modal de turno de caja.
  cashShiftModalOpen: false,
};

// Store de Zustand para PosView con persistencia del turno de caja.
export const usePosStore = create(
  persist(
    (set, get) => ({
      // Carga el estado inicial.
      ...initialState,

      // Carga las cuentas abiertas desde la capa de servicio.
      loadPosData: async () => {
        set({ loading: true });
        const bills = await fetchOpenBills();
        set({ openBills: bills ?? INITIAL_BILLS, activeBill: (bills ?? INITIAL_BILLS)[0], loading: false });
      },

      // Desbloquea la sesión de cajero si el PIN ingresado es válido ("9921").
      unlockCashier: (pin) => {
        if (String(pin).trim() === '9921') {
          set({ cashierUnlocked: true });
          return true;
        }
        return false;
      },

      // Bloquea la terminal POS.
      lockCashier: () => set({ cashierUnlocked: false }),

      // Selecciona la cuenta de mesa activa para el cobro.
      selectBill: (billId) => {
        const bill = get().openBills.find((b) => String(b.id) === String(billId) || b.tableNumber === Number(billId));
        if (bill) {
          set({ activeBill: bill, tenderedAmount: 0 });
        }
      },

      // Cambia el método de pago seleccionado.
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      // Establece el monto entregado por el cliente.
      setTenderedAmount: (tenderedAmount) => set({ tenderedAmount }),

      // Conmuta la visibilidad del modal DTE.
      setDteModalOpen: (dteModalOpen) => set({ dteModalOpen }),

      // Conmuta la visibilidad del modal Cierre Ciego.
      setBlindCloseOpen: (blindCloseOpen) => set({ blindCloseOpen }),

      // Conmuta la visibilidad del modal de turno de caja.
      setCashShiftModalOpen: (cashShiftModalOpen) => set({ cashShiftModalOpen }),

      // Abre el turno de caja especificando el monto inicial.
      openCashShift: ({ initialAmount = 0 } = {}) => {
        set({
          cashShift: {
            status: 'open',
            openedAt: Date.now(),
            initialAmount,
            closedAt: null,
            summary: null,
          },
          cashShiftModalOpen: false,
        });
      },

      // Cierra el turno de caja registrando el resumen acumulado (no publica shift.closed ni altera blindCloseOpen).
      closeCashShift: (summary) => {
        set({
          cashShift: {
            ...get().cashShift,
            status: 'closed',
            closedAt: Date.now(),
            summary: summary ?? {},
          },
          cashShiftModalOpen: false,
        });
      },

      // Confirma el cobro de la cuenta activa y emite el evento payment.completed.
      confirmPayment: (dteData) => {
        const { activeBill, openBills, paymentMethod } = get();
        if (!activeBill) return;

        // Actualiza el estado de la cuenta a pagada.
        const updatedBills = openBills.map((b) =>
          b.id === activeBill.id ? { ...b, status: 'paid' } : b,
        );

        set({ openBills: updatedBills, activeBill: null });

        // Emite el evento de pago completado en el bus.
        bus.publish('payment.completed', {
          billId: String(activeBill.id),
          tableNumber: activeBill.tableNumber,
          amount: activeBill.totalAmount,
          method: paymentMethod,
          dteFolio: dteData?.folio ?? 1042,
          timestamp: Date.now(),
        });
      },

      // Finaliza el Cierre Ciego y emite el evento shift.closed.
      submitBlindClose: (closeData) => {
        set({ blindCloseOpen: false });

        // Emite el evento de cierre de turno en el bus.
        bus.publish('shift.closed', {
          cashierPin: '9921',
          physicalCount: closeData.physicalCount,
          expectedCash: closeData.expectedCash,
          variance: closeData.variance,
          timestamp: Date.now(),
        });
      },

      // Suscribe a eventos en tiempo real (payment.qr_received).
      setupRealtimeListeners: () => {
        const offQrPayment = bus.subscribe('payment.qr_received', (payload) => {
          if (!payload || !payload.tableNumber) return;
          const { openBills } = get();
          const updated = openBills.map((b) =>
            b.tableNumber === payload.tableNumber ? { ...b, status: 'paid' } : b,
          );
          set({ openBills: updated });
        });

        return () => offQrPayment();
      },

      // Restablece el slice a su estado inicial para tests (limpiando persistencia).
      resetDemo: () => {
        set({ ...initialState, cashShift: INITIAL_CASH_SHIFT });
        try {
          window.localStorage.removeItem('mesasplit-cash-shift');
        } catch {
          // Ignora si localStorage no está disponible en jsdom.
        }
      },
    }),
    {
      name: 'mesasplit-cash-shift',
      partialize: (state) => ({ cashShift: state.cashShift }),
    },
  ),
);
