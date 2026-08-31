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
// http e isBackendMode: cliente real + flag de modo para conectar al back.
import { http, isBackendMode } from '../../../api/httpClient.js';
// Validación de RUT chileno.
import { validateRut } from '../../../shared/utils/index.js';

// Instancia única del bus para la Caja POS.
export const posBus = createRealtimeBus('mesasplit');
const bus = posBus;

// mapPaymentMethod: método de pago del front → enum PaymentMethodEnum del back.
function mapPaymentMethod(method) {
  return (
    { efectivo: 'CASH', tarjeta: 'CARD', transferencia: 'TRANSFER', qr_webpay: 'WEBPAY' }[method] ||
    'CASH'
  );
}

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
  // Registro de notas de crédito emitidas (pos-credit-note).
  creditNotes: [],
  // Comprobantes CFD emitidos (pos-cfd).
  cfdReceipts: [],
  // Estado de Modo Mostrador para venta rápida sin mesa (pos-counter-mode).
  counterMode: false,
  // Carrito de ítems de la venta de mostrador.
  counterCart: [],
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

      // Agrega un ítem de la carta directamente al ticket activo del POS para venta rápida.
      addItemToActiveBill: (item) => {
        const { activeBill, openBills } = get();
        if (!activeBill) {
          const newTicket = {
            id: `b-${Date.now()}`,
            tableNumber: 200 + openBills.length,
            type: 'takeaway',
            customerName: 'Venta Rápida Mostrador 🛍️',
            totalAmount: item.price,
            status: 'pending',
            items: [{ ...item, qty: 1 }],
          };
          set({ openBills: [newTicket, ...openBills], activeBill: newTicket });
          return;
        }

        const existingItems = activeBill.items || [];
        const existingIndex = existingItems.findIndex((i) => i.id === item.id);
        let updatedItems;
        if (existingIndex >= 0) {
          updatedItems = existingItems.map((i, idx) =>
            idx === existingIndex ? { ...i, qty: (i.qty || 1) + 1 } : i
          );
        } else {
          updatedItems = [...existingItems, { ...item, qty: 1 }];
        }

        const newTotal = updatedItems.reduce((acc, curr) => acc + curr.price * (curr.qty || 1), 0);
        const updatedBill = { ...activeBill, items: updatedItems, totalAmount: newTotal };
        const updatedBills = openBills.map((b) => (b.id === activeBill.id ? updatedBill : b));

        set({ openBills: updatedBills, activeBill: updatedBill });
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
      confirmPayment: async (dteData) => {
        const { activeBill, openBills, paymentMethod } = get();
        if (!activeBill) return;

        // Modo backend: registra el pago (POST /payments); si falla, no marca pagada.
        if (isBackendMode()) {
          try {
            await http.post('/api/v1/payments', {
              billId: activeBill.id,
              amount: activeBill.totalAmount,
              tipAmount: 0,
              totalAmount: activeBill.totalAmount,
              method: mapPaymentMethod(paymentMethod),
              provider: 'manual',
            });
          } catch (err) {
            // Error de pago (regla de negocio o red): lo reporta sin mutar el estado.
            console.error('Pago fallido:', err.message);
            return;
          }
        }

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

      // Emite una nota de crédito autorizada por PIN de admin ("9921") (pos-credit-note).
      issueCreditNote: (billId, amount, reason, pin, customBus) => {
        // Sin id de venta: bloquea (no hay cuenta sobre la que descontar).
        if (!billId) return { ok: false, error: 'No hay venta seleccionada' };

        // Modo backend: dispara el descuento (PATCH apply-discount) sin bloquear la
        // UI; el backend valida el PIN del manager. Se reporta ok optimista.
        if (isBackendMode()) {
          http.patch(`/api/v1/bills/${billId}/apply-discount`, {
            discountAmount: Number(amount),
            reason: String(reason ?? 'Devolución'),
            managerPin: String(pin),
          }).catch((err) => console.error('Descuento fallido:', err.message));
          return { ok: true };
        }

        // Modo demo: validación de PIN local (9921).
        if (pin !== '9921') return { ok: false, error: 'PIN de administrador incorrecto' };

        const newNote = {
          id: `nc-${Date.now()}`,
          billId: String(billId),
          amount: Number(amount),
          reason: String(reason ?? 'Devolución'),
          timestamp: Date.now(),
          approvedBy: 'Admin (9921)',
        };

        set((state) => ({ creditNotes: [newNote, ...(state.creditNotes ?? [])] }));

        // Opcionalmente emite el evento de nota de crédito.
        const targetBus = customBus ?? bus;
        try {
          targetBus.publish('credit.note_issued', newNote);
        } catch {
          // Tolera bus inactivo
        }

        return { ok: true, creditNote: newNote };
      },

      // Emite un comprobante CFD demo con RUT validado (pos-cfd).
      issueCfd: (billId, rut, razonSocial) => {
        if (!billId) return { ok: false, error: 'Sin venta seleccionada' };
        if (!rut || !validateRut(rut)) return { ok: false, error: 'RUT del cliente inválido' };

        const folioNumber = (get().cfdReceipts ?? []).length + 5001;

        const newReceipt = {
          id: `cfd-${Date.now()}`,
          billId: String(billId),
          folio: `CFD-${folioNumber}`,
          rut: String(rut),
          razonSocial: String(razonSocial ?? 'Cliente General'),
          timestamp: Date.now(),
        };

        set((state) => ({ cfdReceipts: [newReceipt, ...(state.cfdReceipts ?? [])] }));
        return { ok: true, receipt: newReceipt };
      },

      // Alterna o establece el modo mostrador (pos-counter-mode).
      setCounterMode: (counterMode) => set({ counterMode: Boolean(counterMode) }),

      // Agrega un ítem al carrito de venta rápida de mostrador.
      addToCounterCart: (item) => {
        const { counterCart } = get();
        const existingIndex = counterCart.findIndex((i) => i.id === item.id);

        if (existingIndex >= 0) {
          const updated = [...counterCart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            qty: (updated[existingIndex].qty ?? 1) + 1,
          };
          set({ counterCart: updated });
        } else {
          set({ counterCart: [...counterCart, { ...item, qty: 1 }] });
        }
      },

      // Procesa el pago del carrito de mostrador y publica payment.completed con tableNumber: null.
      payCounterCart: (paymentMethod = 'efectivo', customBus) => {
        const { counterCart } = get();
        if (!counterCart || counterCart.length === 0) {
          return { ok: false, error: 'Carrito de mostrador vacío' };
        }

        const total = counterCart.reduce((acc, i) => acc + Number(i.price) * Number(i.qty ?? 1), 0);
        const targetBus = customBus ?? bus;

        try {
          targetBus.publish('payment.completed', {
            billId: `counter-${Date.now()}`,
            tableNumber: null,
            amount: total,
            paymentMethod,
            timestamp: Date.now(),
          });
        } catch {
          // Tolera transporte inactivo
        }

        set({ counterCart: [] });
        return { ok: true, total };
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
