// src/api/mappers.js — adaptadores del backend LabTab al shape del front.
// El back devuelve DTOs anidados (secciones con platos, mesas con positionX/Y);
// el front espera shapes históricos de la demo (menú plano, mesas con number/
// status/order). Estas funciones traducen el back al contrato del front, para
// que los componentes/stores no cambien al conectar el backend.

// Mapeo de estado de mesa: enum del back → estado del front (Radar/Garzón).
const TABLE_STATUS_MAP = {
  AVAILABLE: 'free',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
};

// mapTable: DiningTableResponse → shape de mesa del front.
export function mapTable(b) {
  // number: se deriva del nombre ("Mesa 4" → 4); si no hay dígitos, 0.
  const number = parseInt(String(b.name).replace(/\D/g, ''), 10) || 0;
  return {
    id: b.id,
    number,
    seats: b.capacity,
    status: TABLE_STATUS_MAP[b.status] || 'free',
    zone: b.zone || 'Salón',
    x: b.positionX,
    y: b.positionY,
    // El endpoint de mesas no trae el detalle del pedido; si hay sesión activa
    // se marca con una orden vacía (el detalle se carga bajo demanda en sprints
    // posteriores).
    order: b.activeSessionId ? { items: [] } : null,
    // activeSessionId: id de la sesión abierta del backend (para reabrir/crear
    // comanda sin duplicar sesión).
    activeSessionId: b.activeSessionId || null,
    waiterId: null,
  };
}

// mapDish: DishResponse + nombre de sección → ítem plano del front.
// Campos que el back no expone en Alfa (cost, popular, alcoholic, spicy) se
// rellenan con defaults neutrales; no rompen la UI y se completan en MVP.
export function mapDish(d, sectionName) {
  // allergens: normaliza a array (el back puede devolver null).
  const allergens = d.allergens || [];
  return {
    id: d.id,
    name: d.name,
    description: d.description || '',
    price: Number(d.price),
    category: sectionName,
    allergens,
    alcoholic: false,
    popular: false,
    glutenFree: !allergens.includes('gluten'),
    spicy: false,
    cost: null,
    image: d.imageUrl || '',
  };
}

// mapMenu: List<MenuSectionResponse> → array plano de ítems del front.
export function mapMenu(sections) {
  // flatMap: aplana cada sección en sus platos (la UI agrupa por category).
  return (sections || []).flatMap((s) =>
    (s.dishes || []).map((d) => mapDish(d, s.name)),
  );
}

// Mapeo de estado de ticket: enum del back → estado del front (KDS).
const TICKET_STATUS_MAP = {
  OPEN: 'pending',
  IN_PROGRESS: 'cooking',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

// mapTicket: KitchenTicketResponse → shape de ticket del front (KDS).
export function mapTicket(t) {
  // tableNumber: se deriva del snapshot tableName ("Mesa 4" → 4).
  const tableNumber = parseInt(String(t.tableName).replace(/\D/g, ''), 10) || 0;
  return {
    id: t.id,
    tableNumber,
    // station: el back no expone ruteo por estación en Alfa (es MVP); se fija
    // una estación genérica para no romper el filtro del KDS.
    station: 'fuego',
    status: TICKET_STATUS_MAP[t.status] || 'pending',
    elapsedSec: t.elapsedSeconds || 0,
    budgetSec: 600,
    // items: mapea las líneas del ticket a ítems con qty y alergias.
    items: (t.lines || []).map((l) => ({
      id: l.orderLineId,
      name: l.name,
      qty: l.quantity,
      allergens: l.allergyFlags || [],
    })),
  };
}

// Mapeo de estado de cuenta: enum del back → estado del front (POS).
const BILL_STATUS_MAP = {
  OPEN: 'pending',
  PAID: 'paid',
  VOID: 'void',
};

// mapBill: BillResponse → shape de cuenta del front (POS).
export function mapBill(b) {
  return {
    id: b.id,
    // tableNumber: BillResponse no trae la mesa; se rellena con 0 y se resuelve
    // en sprints posteriores (join sesión → mesa).
    tableNumber: 0,
    type: 'table',
    customerName: null,
    totalAmount: Number(b.totalAmount),
    status: BILL_STATUS_MAP[b.status] || 'pending',
    items: [],
  };
}

// Título legible por tipo de evento de auditoría (Radar Local Admin).
const EXCEPTION_TITLE_MAP = {
  ITEM_VOID_AFTER_KITCHEN: 'Anulación de plato enviado a cocina',
  MANUAL_DISCOUNT: 'Descuento manual aplicado',
  DRAWER_OPENED_NO_SALE: 'Apertura de gaveta sin venta',
  REFUND_ISSUED: 'Reembolso emitido',
  PIN_AUTH_FAILED: 'Intento de PIN fallido',
};

// mapException: ExceptionLogResponse → shape de excepción del front (Radar).
export function mapException(e) {
  return {
    id: e.id,
    title: EXCEPTION_TITLE_MAP[e.eventType] || 'Evento de auditoría',
    description: e.reason || e.eventType,
    // El back no devuelve el PIN (se guarda hasheado); se deja null.
    adminPin: null,
    reason: e.reason,
    // createdAt es ISO (Instant); se convierte a epoch millis como usa el front.
    timestamp: e.createdAt ? new Date(e.createdAt).getTime() : Date.now(),
  };
}
