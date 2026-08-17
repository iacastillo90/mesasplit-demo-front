// src/features/ClientView/store/useSplitStore.js — store de división de cuentas (account-split)
// Slice Zustand de la Mesa Virtual siguiendo el design: estado {open, mode, guests,
// allocations, payments, cartSnapshot}, acciones setMode/addGuest/assignItem/
// assignFraction/markPaid/closeSplit/syncWithCart y selectores derivados puros
// (selectGuestTotals, selectUnassigned, selectCanConfirm). Los totals SIEMPRE se
// derivan en vivo desde splitService: el state NUNCA cachea totals (spec MUST).
// Cumple las reglas de AGENTS.md (comentario en español por cada línea).

// create de Zustand (mismo patrón que useClientStore).
import { create } from 'zustand';
// Enums de dominio: modos de división y estado de pago del comensal.
import { GUEST_PAYMENT_STATUS, SPLIT_TYPE } from '../../../shared/constants/index.js';
// Contexto de mesa demo: cantidad de comensales que deriva los guests sin registro.
import { TABLE_CONTEXT } from '../../../mocks/tableContext.js';
// Servicio puro de división de cuenta (cálculo + derivación de totals).
import { applyPayment, buildGuests, splitByMode } from '../services/splitService.js';

// Suma el total del carrito (precio × cantidad) para el snapshot.
function snapshotTotal(cart) {
  // Devuelve 0 si el carrito está vacío (evita NaN en el cálculo).
  return cart.reduce((sum, line) => sum + line.price * line.qty, 0);
}

// Deriva los guests garantizando el shape legado del modal PR2 (name + amount)
// mientras PR2 migra a los selectores: {id, label, name, status, amount}.
function deriveGuests({ mode, cartSnapshot, allocations, guestCount }) {
  // Base de comensales numerados sin registro (spec Guests derived).
  const base = buildGuests(guestCount);
  // Totals derivados en vivo según el modo y las asignaciones actuales.
  const totals = splitByMode(mode, cartSnapshot, allocations, guestCount).totals;
  // Expande cada guest con el alias name y el amount derivado (shim legacy).
  return base.map((guest) => ({
    // Conserva id y estado de pago del guest base.
    ...guest,
    // Alias legado del label (el modal PR2 aún lee guest.name).
    name: guest.label,
    // Monto de la cuota derivado en vivo (cero si el guest no tiene total).
    amount: totals[guest.id] ?? 0,
  }));
}

// Estado inicial del slice: split cerrado, modo full, guests de la mesa y nada asignado.
const initialState = {
  // Flag de apertura del modal de división de cuenta.
  open: false,
  // Modo activo por defecto: full (spec: default full).
  mode: SPLIT_TYPE.FULL,
  // Comensales derivados de TABLE_CONTEXT.guests (4 en el demo).
  guests: [],
  // Asignaciones de líneas: by_item {lineId→guestId}, item_fraction {lineId→{guestId→qty}}.
  allocations: {},
  // Registro de pagos parciales {guestId → monto CLP pagado}.
  payments: {},
  // Snapshot del carrito al abrir el split (D4: base del cálculo).
  cartSnapshot: [],
  // Total del carrito (shim legacy PR2: el modal aún lo lee del state).
  cartTotal: 0,
  // Cantidad de comensales (shim legacy PR2: el modal aún la edita).
  guestCount: TABLE_CONTEXT.guests,
};

// Store de Zustand para useSplitStore (API del design + shim legacy PR2).
export const useSplitStore = create((set, get) => ({
  // Carga el estado inicial del slice.
  ...initialState,

  // Abre el split con el snapshot del carrito (design: openSplit(cart)).
  // Acepta también un total numérico (shim legacy: ClientPage PR2 aún pasa el total).
  openSplit: (cartOrTotal) => {
    // Normaliza el argumento: carrito de líneas o total CLP → snapshot sintético.
    const cart = Array.isArray(cartOrTotal)
      ? cartOrTotal
      : [{ id: 'legacy-total', name: 'Total de la mesa', price: cartOrTotal, qty: 1 }];
    // Conteo de comensales derivado de la mesa (sin registro, spec).
    const guestCount = TABLE_CONTEXT.guests;
    // Total del snapshot (shim legacy del modal PR2).
    const cartTotal = snapshotTotal(cart);
    // Deriva los guests numerados para el modo actual del store.
    const guests = deriveGuests({ mode: get().mode, cartSnapshot: cart, allocations: {}, guestCount });
    // Abre el split: snapshot, guests derivados y asignaciones/pagos en cero.
    set({ open: true, cartSnapshot: cart, cartTotal, guestCount, guests, allocations: {}, payments: {} });
  },

  // Cambia el modo activo (design: setMode(mode)).
  setMode: (mode) => {
    // Reconstruye el contexto para re-derivar los guests al nuevo modo.
    const { cartSnapshot, allocations, guestCount } = get();
    // Deriva los guests bajo el nuevo modo (totals siempre en vivo).
    const guests = deriveGuests({ mode, cartSnapshot, allocations, guestCount });
    // Persiste el modo nuevo y sus guests derivados.
    set({ mode, guests });
  },

  // Agrega un comensal numerado extra a la mesa (extensión del orquestador).
  addGuest: () => {
    // Cantidad actual de comensales y contexto para re-derivar.
    const { guestCount, cartSnapshot, allocations, mode } = get();
    // Incrementa el conteo de comensales en uno.
    const nextCount = guestCount + 1;
    // Deriva los guests con el nuevo conteo (el último queda en $0).
    const guests = deriveGuests({ mode, cartSnapshot, allocations, guestCount: nextCount });
    // Persiste el nuevo conteo y los guests re-derivados.
    set({ guestCount: nextCount, guests });
  },

  // Cambia el número de comensales (shim legacy PR2: el modal lo usa).
  setGuestCount: (guestCount) => {
    // Contexto actual para re-derivar con el conteo indicado.
    const { cartSnapshot, allocations, mode } = get();
    // Sanitiza el conteo a un mínimo de 1 comensal.
    const safeCount = Math.max(1, guestCount);
    // Deriva los guests con el nuevo conteo.
    const guests = deriveGuests({ mode, cartSnapshot, allocations, guestCount: safeCount });
    // Persiste el conteo y los guests re-derivados.
    set({ guestCount: safeCount, guests });
  },

  // Asigna una línea completa a un comensal (design: assignItem, modo by_item).
  assignItem: (guestId, lineId) => {
    // Aplica la asignación {lineId → guestId} sobre las asignaciones actuales.
    const allocations = { ...get().allocations, [lineId]: guestId };
    // Re-deriva los guests con las asignaciones nuevas (totals en vivo).
    const guests = deriveGuests({ ...get(), allocations });
    // Persiste las asignaciones y los totals re-derivados.
    set({ allocations, guests });
  },

  // Asigna una fracción de línea a un comensal (design: assignFraction).
  assignFraction: (guestId, lineId, qty) => {
    // Estado actual para validar la fracción contra la línea del snapshot.
    const state = get();
    // Busca la línea en el snapshot para conocer su cantidad máxima.
    const line = state.cartSnapshot.find((item) => item.id === lineId);
    // Fracción inválida: sin línea o cantidad no positiva → se ignora (spec Over quantity).
    if (!line || line.qty <= 0 || qty <= 0) return;
    // Mapa fraccionario actual de la línea (o vacío si aún no tiene).
    const currentShares = state.allocations[lineId] ?? {};
    // Nueva distribución con la fracción del comensal aplicada.
    const nextShares = { ...currentShares, [guestId]: qty };
    // Suma total de fracciones asignadas a la línea.
    const assignedQty = Object.values(nextShares).reduce((sum, value) => sum + value, 0);
    // Rechaza si se excede la cantidad de la línea (spec Over quantity).
    if (assignedQty > line.qty) return;
    // Aplica las fracciones nuevas a las asignaciones del store.
    const allocations = { ...state.allocations, [lineId]: nextShares };
    // Re-deriva los guests con las fracciones aplicadas.
    const guests = deriveGuests({ ...state, allocations });
    // Persiste asignaciones y guests re-derivados.
    set({ allocations, guests });
  },

  // Registra el pago parcial de la cuota de un comensal (design: markPaid).
  // En PR1 solo actualiza el estado; el publish a payment.split lo hace ClientPage
  // en PR3 (D5: wiring desde la página, no desde el store). Desviación documentada.
  markPaid: (guestId) => {
    // Estado actual para derivar el total del comensal a pagar.
    const state = get();
    // Monto de la cuota del comensal derivado en vivo (design: applyPayment + publish en PR3).
    const totals = splitByMode(state.mode, state.cartSnapshot, state.allocations, state.guests.length).totals;
    // Cuota a abonar por el comensal indicado (0 si no tiene total asignado).
    const amount = totals[guestId] ?? 0;
    // Localiza el guest objetivo en la lista actual.
    const guest = state.guests.find((g) => g.id === guestId);
    // Aplica la transición pending → paid sobre el guest (service puro, inmutable).
    const paidGuest = guest ? applyPayment(guest, amount) : null;
    // Guests con el pagado actualizado (el resto permanece pendiente).
    const guests = paidGuest
      ? state.guests.map((g) => (g.id === guestId ? paidGuest : g))
      : state.guests;
    // Registro de pagos con el monto abonado por el comensal.
    const payments = { ...state.payments, [guestId]: amount };
    // Persiste el estado pagado y el registro del pago parcial.
    set({ guests, payments });
  },

  // Alias legado PR2 del pago parcial (el modal actual llama payGuest).
  payGuest: (guestId) => {
    // Delega en la acción canónica markPaid del design.
    get().markPaid(guestId);
  },

  // Cierra el split (design: closeSplit).
  closeSplit: () => {
    // Solo apaga el flag de apertura (el estado de cálculo se conserva).
    set({ open: false });
  },

  // Sincroniza el snapshot ante cambios del carrito (design: syncWithCart).
  // Reset: las asignaciones por línea y los pagos dejan de valer si cambió el carrito.
  syncWithCart: (cart) => {
    // Conteo de comensales y modo actuales (no cambian con el carrito).
    const { guestCount, mode } = get();
    // Total del nuevo carrito (shim legacy PR2).
    const cartTotal = snapshotTotal(cart);
    // Re-deriva los guests sobre el snapshot nuevo sin asignaciones previas.
    const guests = deriveGuests({ mode, cartSnapshot: cart, allocations: {}, guestCount });
    // Actualiza snapshot, total, guests limpios y borra asignaciones + pagos.
    set({ cartSnapshot: cart, cartTotal, guests, allocations: {}, payments: {} });
  },

  // Restablece el slice al estado inicial (compartido con el test PR2 existente).
  resetDemo: () => {
    // Reemplaza todo el estado con el initialState definido arriba.
    set(initialState);
  },
}));

// Selector puro: totals por comensal derivados SIEMPRE en vivo del servicio.
export function selectGuestTotals(state) {
  // Delega el cálculo en splitService con el estado actual (nunca cachea).
  return splitByMode(state.mode, state.cartSnapshot, state.allocations, state.guests.length).totals;
}

// Selector puro: líneas sin repartir (bloquean la confirmación, spec Unassigned).
export function selectUnassigned(state) {
  // Da las líneas que aún no tienen asignación completa según el modo.
  return splitByMode(state.mode, state.cartSnapshot, state.allocations, state.guests.length).unassigned;
}

// Selector puro: habilita Confirmar solo cuando no queda monto sin repartir.
// En item_fraction con carrito sin fraccionar (todas sin repartir), retorna false
// porque selectUnassigned devuelve todas las líneas → length > 0.
export function selectCanConfirm(state) {
  // Confirmar está habilitado si no hay ninguna línea sin repartir.
  return selectUnassigned(state).length === 0;
}

// Re-exporta el estado inicial para reseteos externos (tests y demo).
export { initialState as splitInitialState };