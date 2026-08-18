// src/shared/utils/menuFilters.js — helper puro de filtrado de carta por dieta (waiter-menu-filters)
// Paridad EXACTA con el cliente: la misma lógica que ClientPage (L122-130) vive aquí
// para que el mozo filtre la carta real idéntico a la Mesa Virtual (client-identical-filters).
// Sin estado, sin DOM: puro y testeable contra la fuente única menu.json.

// Filtra los ítems del menú según el id del filtro dietario activo.
export function filterMenuByDiet(items, filterId) {
  // Devuelve el array filtrado con el mismo criterio que los chips del cliente.
  return (items ?? []).filter((item) => {
    // Vegano: plato vegetariano o vegano declarado.
    if (filterId === 'vegano') return item.vegetarian || item.vegan;
    // Sin gluten: campo glutenFree del fixture.
    if (filterId === 'gluten_free') return item.glutenFree;
    // Picante: campo spicy del fixture.
    if (filterId === 'spicy') return item.spicy;
    // Popular: campo popular del fixture.
    if (filterId === 'popular') return item.popular;
    // Postres: declarado dulce o pertenece a la categoría Postres.
    if (filterId === 'postres') return item.sweet || item.category === 'Postres';
    // Bebidas: alcohólica o pertenece a la categoría Barra.
    if (filterId === 'bebidas') return item.alcoholic || item.category === 'Barra';
    // Cualquier otro valor (incluido 'all') deja pasar todo el menú.
    return true;
  });
}
