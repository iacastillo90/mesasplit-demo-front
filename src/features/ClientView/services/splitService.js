// src/features/ClientView/services/splitService.js — servicio de cálculo de división de cuentas (account-split)
// Lógica pura de división de cuenta: calcula cuotas equitativas con algoritmo de resto mayor (Largest Remainder),
// división por platos e ítems consumidos y cuotas personalizadas garantizando el invariante de conservación del total.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Aplica la regla de resto mayor (Largest Remainder) para redondear centavos a enteros CLP exactos.
export function applyLargestRemainder(exactShares, total) {
  if (!exactShares || exactShares.length === 0) return [];
  // Calcula el piso de cada cuota exacta.
  const floors = exactShares.map((s) => Math.floor(s));
  // Suma de los pisos de todas las cuotas.
  const sumFloors = floors.reduce((a, b) => a + b, 0);
  // Resto en CLP a repartir (1 CLP por comensal de mayor fracción sobrante).
  const remainder = Math.round(total - sumFloors);

  // Ordena los índices por la fracción sobrante descendente (con tie-break por índice ascendente).
  const byFraction = exactShares
    .map((s, index) => ({ index, fraction: s - Math.floor(s) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);

  // Copia de los pisos para incrementar 1 CLP a los primeros `remainder` comensales.
  const result = [...floors];
  for (let i = 0; i < remainder; i += 1) {
    if (byFraction[i]) {
      result[byFraction[i].index] += 1;
    }
  }
  return result;
}

// Calcula cuotas iguales con regla de resto mayor (modo equal).
export function calculateEqualShares(total, count) {
  if (count <= 0) return [];
  // Cuotas exactas en números flotantes.
  const exact = Array.from({ length: count }, () => total / count);
  // Redondea con la regla de resto mayor.
  return applyLargestRemainder(exact, total);
}

// Lista de nombres realistas para la experiencia multi-comensal.
const DEMO_GUEST_NAMES = ['Ignacio (Tú)', 'Valentina', 'Matías', 'Camila', 'Sofía', 'Felipe'];

// Deriva los comensales numerados o nombrados.
export function buildGuests(count) {
  const safeCount = Math.max(0, count);
  return Array.from({ length: safeCount }, (_, index) => ({
    id: `guest-${index + 1}`,
    label: DEMO_GUEST_NAMES[index] ?? `Comensal ${index + 1}`,
    name: DEMO_GUEST_NAMES[index] ?? `Comensal ${index + 1}`,
    status: 'pending',
  }));
}

// Suma los montos por comensal según asignaciones de línea completa (modo by_item).
export function calculateByItem(cart, allocations = {}) {
  const totals = {};
  (cart ?? []).forEach((line) => {
    const guestId = allocations[line.id];
    if (guestId) {
      const amount = line.price * line.qty;
      totals[guestId] = (totals[guestId] ?? 0) + amount;
    }
  });
  return totals;
}

// Suma los montos por comensal según fracciones de línea (modo item_fraction).
export function calculateFractions(cart, allocations = {}) {
  const totals = {};
  (cart ?? []).forEach((line) => {
    const shares = allocations[line.id] ?? {};
    if (typeof shares === 'object') {
      Object.entries(shares).forEach(([guestId, qty]) => {
        totals[guestId] = (totals[guestId] ?? 0) + line.price * qty;
      });
    }
  });
  return totals;
}

// Invariante de conservación: suma de partials === total.
export function checkConservation(totals, total) {
  const partialSum = Object.values(totals ?? {}).reduce((sum, v) => sum + v, 0);
  return partialSum === total;
}

// Aplica el pago de la cuota individual de un comensal.
export function applyPayment(guest, amount) {
  return {
    ...guest,
    status: 'paid',
    amountPaid: amount,
  };
}

// Suma total de un arreglo de líneas del carrito.
function cartTotal(cart) {
  return (cart ?? []).reduce((sum, line) => sum + line.price * line.qty, 0);
}

// Servicio principal de cálculo de división de cuenta según el modo seleccionado.
// Soporta ambas firmas:
// 1. splitByMode(mode, cart, allocations, count) -> retorna { totals, total, unassigned }
// 2. splitByMode(total, count, mode) -> retorna Array de { id, name, amount, status }
export function splitByMode(firstArg, secondArg = 2, thirdArg = 'full', fourthArg = 2) {
  // Firma 2 (legacy de useSplitStore): splitByMode(total, count, mode)
  if (typeof firstArg === 'number') {
    const total = firstArg;
    const count = typeof secondArg === 'number' ? secondArg : 2;
    const mode = typeof thirdArg === 'string' ? thirdArg : 'full';

    if (mode === 'full' || count <= 1) {
      return [
        {
          id: 'guest-1',
          name: 'Ignacio (Tú - Total)',
          amount: total,
          status: 'pending',
        },
      ];
    }

    const shares = calculateEqualShares(total, count);
    return shares.map((amount, idx) => ({
      id: `guest-${idx + 1}`,
      name: DEMO_GUEST_NAMES[idx] ?? `Comensal ${idx + 1}`,
      amount,
      status: 'pending',
    }));
  }

  // Firma 1 (design de splitService.test.js): splitByMode(mode, cart, allocations, count)
  const mode = firstArg ?? 'full';
  const cart = Array.isArray(secondArg) ? secondArg : [];
  const allocations = typeof thirdArg === 'object' && thirdArg !== null ? thirdArg : {};
  const count = typeof fourthArg === 'number' ? fourthArg : 2;

  const total = cartTotal(cart);

  if (mode === 'equal') {
    const shares = calculateEqualShares(total, count);
    const totals = {};
    shares.forEach((share, index) => {
      totals[`guest-${index + 1}`] = share;
    });
    return { totals, total, unassigned: [] };
  }

  if (mode === 'by_item') {
    const totals = calculateByItem(cart, allocations);
    const unassigned = cart.filter((line) => !allocations[line.id]);
    return { totals, total, unassigned };
  }

  if (mode === 'item_fraction') {
    const totals = calculateFractions(cart, allocations);
    const unassigned = cart.filter((line) => {
      const shares = allocations[line.id] ?? {};
      const assignedQty = Object.values(shares).reduce((sum, qty) => sum + qty, 0);
      return Math.abs(assignedQty - line.qty) > 0.0001;
    });
    return { totals, total, unassigned };
  }

  // Modo full (default)
  const totals = {};
  for (let i = 1; i <= Math.max(1, count); i += 1) {
    totals[`guest-${i}`] = i === 1 ? total : 0;
  }
  return { totals, total, unassigned: [] };
}
