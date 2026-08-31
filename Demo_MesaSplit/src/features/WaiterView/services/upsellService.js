// src/features/WaiterView/services/upsellService.js — upsell asistido (waiter-upsell)
// Lógica pura de sugerencia de venta adicional para el OrderPad del garzón:
// `suggestUpsell(itemId, menu)` devuelve a lo sumo UN candidato (o null) según un
// mapa de reglas demo fijo (hamburguesa → papas fritas; pizza → bebida), keyed por
// id/categoría de producto. El selector NUNCA agrega nada: solo sugiere; el
// agregado lo ejecuta el flujo normal del store (addToDraft) al tocar el chip.

// Mapa de reglas demo del upsell: cada regla dispara por id y/o categoría del
// producto agregado y propone un único sugerido (suggestedId).
export const UPSELL_RULES = [
  // Hamburguesa (por id m1 y categoría Hamburguesas) → papas fritas.
  { triggerIds: ['m1'], triggerCategories: ['Hamburguesas'], suggestedId: 'm2' },
  // Pizza (por categoría Pizzas) → bebida.
  { triggerIds: [], triggerCategories: ['Pizzas'], suggestedId: 'm6' },
];

// Selector puro: sugiere a lo sumo un candidato para el ítem agregado.
// Recibe el id del producto y el menú/catálogo contra el que se resuelve la regla
// (el OrderPad usa su catálogo inline; cualquier otro caller pasa su menú).
export function suggestUpsell(itemId, menu = []) {
  // Normaliza el id a cadena (los fixtures pueden traer números).
  const cleanId = String(itemId ?? '');
  // Busca el producto agregado dentro del menú provisto.
  const item = menu.find((p) => String(p.id) === cleanId);
  // Sin producto en el menú: no hay regla que resolver.
  if (!item) return null;

  // Encuentra la primera regla que matchee por id o por categoría del ítem.
  const rule = UPSELL_RULES.find(
    (r) => r.triggerIds.includes(cleanId) || r.triggerCategories.includes(item.category),
  );
  // Sin regla para el ítem: no hay sugerencia (spec: null).
  if (!rule) return null;

  // Materializa el candidato dentro del menú provisto (máx. 1).
  const suggested = menu.find((p) => String(p.id) === String(rule.suggestedId));
  // Si el sugerido no existe en el menú, degrada a null (sin inventar productos).
  return suggested ?? null;
}
