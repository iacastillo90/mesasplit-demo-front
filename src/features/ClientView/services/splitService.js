// src/features/ClientView/services/splitService.js — servicio de cálculo de división de cuentas (account-split)
// Lógica pura de división de cuenta (D1: dominio aislado del UI): calcula cuotas
// equitativas con redondeo de resto mayor (Largest Remainder), división por ítems,
// fracciones por línea y pago parcial por comensal. Garantiza el invariante de
// conservación Σ parciales === total en todos los modos (spec MUST-2).
// Cumple las reglas de AGENTS.md (comentario en español por cada línea).

// Algoritmo de redondeo por resto mayor (Largest Remainder): reparte el residuo
// entero de a $1 CLP a las fracciones con mayor resto, con desempate por índice
// (guest-1..N estable). Nunca inventa ni pierde plata (suma exacta == total).
export function applyLargestRemainder(shares, total) {
  // Piso entero de cada cuota exacta (descarta centavos hacia abajo).
  const floors = shares.map(Math.floor);
  // Diferencia entera entre el total y la suma de pisos (a repartir de a $1).
  const remainder = total - floors.reduce((sum, v) => sum + v, 0);
  // Ordena las fracciones por resto desc; empate va al índice menor (guest id estable).
  const byFraction = shares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  // Copia mutable de los pisos para distribuir los pesos del residuo.
  const result = [...floors];
  // Reparte un peso extra a las `remainder` fracciones mayores (máx. 1 por cuota).
  for (let i = 0; i < remainder; i += 1) {
    // Suma 1 CLP a la cuota con el resto fraccional más alto pendiente.
    result[byFraction[i].index] += 1;
  }
  // Devuelve las cuotas redondeadas cuya suma es exactamente el total.
  return result;
}

// Calcula cuotas iguales con redondeo de resto mayor (modo equal).
export function calculateEqualShares(total, count) {
  // Carrito vacío o sin comensales: no hay cuotas que calcular.
  if (count <= 0) return [];
  // Cuota exacta (con centavos) replicada para cada comensal.
  const exact = Array.from({ length: count }, () => total / count);
  // Redondea las cuotas conservando la suma exacta del total.
  return applyLargestRemainder(exact, total);
}

// Deriva los comensales numerados "Comensal 1..N" con ids estables guest-1..N.
// Spec: guests derivados del conteo de la mesa, sin registro ni resolución de usuario.
export function buildGuests(count) {
  // Cuenta válida mínima vacía (sin comensales negativos).
  const total = Math.max(0, count);
  // Genera un guest por posición con id/label/status pendiente de pago.
  return Array.from({ length: total }, (_, index) => ({
    // Id estable base del tie-break de redondeo y de las asignaciones.
    id: `guest-${index + 1}`,
    // Etiqueta legible "Comensal N" (sin registro, spec Guests derived).
    label: `Comensal ${index + 1}`,
    // Estado de pago inicial: pendiente (GUEST_PAYMENT_STATUS.PENDING).
    status: 'pending',
  }));
}

// Suma los montos por comensal según asignaciones de línea completa (modo by_item).
export function calculateByItem(cart, allocations) {
  // Acumulador final {guestId → monto CLP} de las líneas asignadas.
  const totals = {};
  // Recorre cada línea del carrito para sumar su importe al dueño asignado.
  cart.forEach((line) => {
    // Guest dueño de la línea según las asignaciones (lineId → guestId).
    const guestId = allocations[line.id];
    // Solo suma si la línea tiene un dueño asignado válido.
    if (guestId) {
      // Importe de la línea = precio unitario × cantidad completa.
      const amount = line.price * line.qty;
      // Acumula el importe en el total del comensal dueño.
      totals[guestId] = (totals[guestId] ?? 0) + amount;
    }
  });
  // Devuelve el mapa de montos por comensal.
  return totals;
}

// Suma los montos por comensal según fracciones de línea (modo item_fraction).
export function calculateFractions(cart, allocations) {
  // Acumulador final {guestId → monto CLP} de las fracciones asignadas.
  const totals = {};
  // Recorre cada línea del carrito para prorratear sus fracciones.
  cart.forEach((line) => {
    // Mapa de fracciones de la línea {guestId → qty} (o vacío si ninguna).
    const shares = allocations[line.id] ?? {};
    // Suma el proporcional del precio unitario por cada fracción asignada.
    Object.entries(shares).forEach(([guestId, qty]) => {
      // Monto de la fracción = precio unitario × cantidad fraccionaria.
      totals[guestId] = (totals[guestId] ?? 0) + line.price * qty;
    });
  });
  // Devuelve los montos prorrateados por comensal.
  return totals;
}

// Verifica el invariante de conservación: Σ parciales === total del carrito.
// Devuelve true solo si la suma es EXACTA (spec MUST-2, sin redondeos perdidos).
export function checkConservation(totals, total) {
  // Suma todos los montos por comensal del mapa de parciales.
  const partialSum = Object.values(totals).reduce((sum, value) => sum + value, 0);
  // Conserva solo si la suma coincide exactamente con el total del carrito.
  return partialSum === total;
}

// Aplica el pago parcial de la cuota de un comensal (spec Partial payment).
// Es puro e inmutable: devuelve un nuevo guest sin mutar el original.
export function applyPayment(guest, amount) {
  // Expande el guest original y registra el monto pagado + estado paid.
  return {
    // Conserva id y label del comensal sin alteraciones.
    ...guest,
    // Estado de pago pasa a paid (GUEST_PAYMENT_STATUS.PAID).
    status: 'paid',
    // Monto de la cuota abonada por el comensal (registro del pago).
    amountPaid: amount,
  };
}

// Calcula el total del carrito sumando precio × cantidad de cada línea.
function cartTotal(cart) {
  // Suma acumulada de los importes de todas las líneas del carrito.
  return cart.reduce((sum, line) => sum + line.price * line.qty, 0);
}

// Servicio principal: divide el carrito según el modo y devuelve totals + sin repartir.
// Firma del design: splitByMode(mode, cart, allocations = {}, guestCount = 2).
// El 4to parámetro (guestCount) se agrega como extensión necesaria: el modo equal
// requiere saber cuántos comensales hay, igual que calculateEqualShares(total, count).
export function splitByMode(mode, cart, allocations = {}, guestCount = 2) {
  // Total global del carrito (base del invariante de conservación).
  const total = cartTotal(cart);
  // Conteo de comensales sanitizado (nunca negativo).
  const count = Math.max(0, guestCount);

  // Modo equal: cuotas iguales con redondeo de resto mayor.
  if (mode === 'equal') {
    // Cuotas redondeadas (enteros CLP) para todos los comensales.
    const shares = calculateEqualShares(total, count);
    // Mapa de totals {guest-N → cuota} derivado de las cuotas calculadas.
    const totals = {};
    // Asigna cada cuota al guest según su índice (guest-1..guest-N).
    shares.forEach((share, index) => {
      // Vincula la cuota al id estable del comensal correspondiente.
      totals[`guest-${index + 1}`] = share;
    });
    // En equal nada queda sin repartir (todo el total entra en las cuotas).
    return { totals, total, unassigned: [] };
  }

  // Modo by_item: cada línea completa asignada a un comensal.
  if (mode === 'by_item') {
    // Montos por comensal según las asignaciones de línea.
    const totals = calculateByItem(cart, allocations);
    // Sin repartir = líneas que no tienen dueño asignado (block confirma).
    const unassigned = cart.filter((line) => !allocations[line.id]);
    // Devuelve totals, total y las líneas pendientes de asignación.
    return { totals, total, unassigned };
  }

  // Modo item_fraction: fracciones por línea que deben sumar la cantidad de la línea.
  if (mode === 'item_fraction') {
    // Montos prorrateados por comensal según las fracciones asignadas.
    const totals = calculateFractions(cart, allocations);
    // Filtra las líneas cuya fracción no cubre exactamente su cantidad.
    // Toda línea sin fraccionar (0 < qty) se considera sin repartir por defecto.
    const unassigned = cart.filter((line) => {
      // Fracciones cargadas para esta línea (o vacío si ninguna).
      const shares = allocations[line.id] ?? {};
      // Suma de las cantidades fraccionadas de la línea.
      const assignedQty = Object.values(shares).reduce((sum, qty) => sum + qty, 0);
      // La línea queda sin repartir si no cubre su cantidad exacta (tolerancia float).
      return Math.abs(assignedQty - line.qty) > 0.0001;
    });
    // Devuelve totals, total y las líneas con fracciones incompletas o sin iniciar.
    return { totals, total, unassigned };
  }

  // Modo full (default): el total completo cae en el primer comensal (Comensal 1).
  // Un solo titular por la cuenta completa; el resto queda en $0 sin repartir nada.
  const totals = {};
  // Genera el mapa completo de guests (guest-1..guest-N) con el titular primero.
  for (let i = 1; i <= count; i += 1) {
    // El comensal 1 carga el total; los demás arrancan en $0.
    totals[`guest-${i}`] = i === 1 ? total : 0;
  }
  // En full nada queda sin repartir (default: una sola cuenta al comensal 1).
  return { totals, total, unassigned: [] };
}