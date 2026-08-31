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
