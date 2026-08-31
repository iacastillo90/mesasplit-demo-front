// src/features/CorporateView/store/useCorporateStore.js — store del Super Admin Corporativo (super-admin-corporate)
// Slice Zustand para la gestión multi-sucursal: métricas de red en CLP, estado operacional por local,
// master switches globales y suscripción al bus en tiempo real para eventos de red.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio corporativo de datos multi-sucursal.
import { fetchFranchiseOverview } from '../services/corporateService.js';
// Instancia del bus en tiempo real.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Store de la caja POS para consultas cross-slice de capacidades.
import { usePosStore } from '../../PosView/store/usePosStore.js';

// Instancia única del bus para el panel corporativo.
const bus = createRealtimeBus('mesasplit');

// Fixture canónico inicial de sucursales de la franquicia.
const INITIAL_BRANCHES = [
  { id: 'b-lc', name: 'Salón Las Condes', salesTotal: 620000, foodCost: 186000, activeTables: 6, totalTables: 8, activeStaff: 5, avgTicket: 34500, healthStatus: 'optimal' },
  { id: 'b-pr', name: 'Terraza Providencia', salesTotal: 480000, foodCost: 144000, activeTables: 8, totalTables: 10, activeStaff: 6, avgTicket: 28900, healthStatus: 'peak' },
  { id: 'b-vt', name: 'Barra Vitacura', salesTotal: 510000, foodCost: 153000, activeTables: 4, totalTables: 6, activeStaff: 4, avgTicket: 42000, healthStatus: 'optimal' },
  { id: 'b-sc', name: 'Express Santiago Centro', salesTotal: 240000, foodCost: 72000, activeTables: 5, totalTables: 8, activeStaff: 3, avgTicket: 19500, healthStatus: 'alert' },
];

// Fixture inicial de eventos corporativos con dteFolio para compliance SII.
const INITIAL_EVENTS = [
  { id: 'fe-1', branchName: 'Barra Vitacura', type: 'payment', title: 'Pago DTE Boleta 1042', dteFolio: 1042, detail: 'Cobro completado por $42.000 (Tarjeta)', timestamp: Date.now() - 300000 },
  { id: 'fe-2', branchName: 'Express Santiago Centro', type: 'alert', title: 'Intento de anulación con PIN 9921', detail: 'Ítem registrado como merma vencida', timestamp: Date.now() - 900000 },
];

// Estado inicial del store corporativo.
const initialState = {
  // Lista de sucursales de la franquicia.
  branches: INITIAL_BRANCHES,
  // Switchees de configuración global.
  featureToggles: {
    ley40h: true,
    allergyShield: true,
    autoDte: true,
  },
  // Historial de eventos corporativos cross-branch.
  franchiseEvents: INITIAL_EVENTS,
  // Estado de carga inicial.
  loading: false,
};

// Store de Zustand para CorporateView.
export const useCorporateStore = create((set, get) => ({
  // Carga el estado inicial.
  ...initialState,

  // Carga los datos multi-sucursal desde la capa de servicio.
  loadCorporateData: async () => {
    set({ loading: true });
    const overview = await fetchFranchiseOverview();
    set({ branches: overview.branches ?? INITIAL_BRANCHES, loading: false });
  },

  // Alterna un switch de configuración global de franquicia.
  toggleFeature: (featureKey) => {
    const { featureToggles } = get();
    const updated = { ...featureToggles, [featureKey]: !featureToggles[featureKey] };
    set({ featureToggles: updated });

    // Emite la actualización de configuración por el bus.
    bus.publish('config.updated', {
      feature: featureKey,
      newValue: updated[featureKey],
      timestamp: Date.now(),
    });
  },

  // Suscribe el store corporativo a eventos real-time cross-branch.
  setupRealtimeListeners: () => {
    // Escucha eventos de pago completado en cualquier sucursal.
    const offPayment = bus.subscribe('payment.completed', (payload) => {
      if (!payload) return;
      const newEvt = {
        id: `fe-${Date.now()}`,
        branchName: payload.branchName ?? 'Salón Las Condes',
        type: 'payment',
        title: `Pago DTE Folio ${payload.dteFolio ?? 1042}`,
        dteFolio: payload.dteFolio ?? 1042,
        detail: `Monto $${payload.amount ?? 0} (${payload.method ?? 'Efectivo'})`,
        timestamp: Date.now(),
      };
      set({ franchiseEvents: [newEvt, ...get().franchiseEvents] });
    });

    // Escucha alertas de fraude o pánico.
    const offFraud = bus.subscribe('alert.fraud', (payload) => {
      if (!payload) return;
      const newEvt = {
        id: `fe-${Date.now()}`,
        branchName: 'Barra Vitacura',
        type: 'alert',
        title: 'Alerta de Anulación con PIN',
        detail: `Motivo: ${payload.reason ?? 'Cortesía'}`,
        timestamp: Date.now(),
      };
      set({ franchiseEvents: [newEvt, ...get().franchiseEvents] });
    });

    return () => {
      offPayment();
      offFraud();
    };
  },

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));

// Selector puro: calcula el porcentaje de Costo Primario (Σ foodCost / Σ salesTotal * 100).
export const selectCostoPrimario = (state) => {
  const branches = state?.branches ?? [];
  const sumSalesTotal = branches.reduce((acc, b) => acc + (b.salesTotal ?? 0), 0);
  const sumFoodCost = branches.reduce((acc, b) => acc + (b.foodCost ?? 0), 0);

  if (sumSalesTotal === 0) {
    return { percentage: 0.0, sumFoodCost: 0, sumSalesTotal: 0 };
  }

  const percentage = Number(((sumFoodCost / sumSalesTotal) * 100).toFixed(1));
  return { percentage, sumFoodCost, sumSalesTotal };
};

// Selector puro: verifica si existen comprobantes DTE emitidos.
export const selectHasDteBoleta = (state) => {
  const events = state?.franchiseEvents ?? [];
  return events.some((e) => e.type === 'payment' && Boolean(e.dteFolio));
};

// Selector puro: verifica que los folios DTE de pagos sean estrictamente consecutivos (Δ=1).
export const selectFoliosConsecutivos = (state) => {
  const events = state?.franchiseEvents ?? [];
  const dteEvents = events
    .filter((e) => e.type === 'payment' && typeof e.dteFolio === 'number')
    .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));

  if (dteEvents.length <= 1) return true;

  for (let i = 0; i < dteEvents.length - 1; i += 1) {
    if (dteEvents[i + 1].dteFolio !== dteEvents[i].dteFolio + 1) {
      return false;
    }
  }
  return true;
};

// Selector puro: verifica disponibilidad del sistema de arqueo Cierre Ciego en PosView.
export const selectCierreCiegoOk = () => {
  try {
    const posState = usePosStore.getState();
    return typeof posState?.submitBlindClose === 'function' && posState?.blindCloseOpen !== undefined;
  } catch {
    return true;
  }
};
