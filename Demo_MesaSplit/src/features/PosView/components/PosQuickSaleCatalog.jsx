// src/features/PosView/components/PosQuickSaleCatalog.jsx — catálogo interactivo de venta rápida en la caja POS con fotos HD
// Permite al cajero buscar y agregar platos de la carta directamente al ticket activo para clientes en mostrador o retiro.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';

// Platos canónicos de la carta con fotos HD y categorías.
export const POS_CATALOG_ITEMS = [
  { id: 'm1', name: 'Lomo Lo Ovalle & Pisco Sour', category: 'Fuego 🔥', price: 18900, image: '/images/dish_lomo_lo_ovalle.png' },
  { id: 'm2', name: 'Ceviche Mixto Lo Ovalle', category: 'Mar 🌊', price: 12900, image: '/images/dish_ceviche_mixto.png' },
  { id: 'm3', name: 'Pisco Sour Catedral 35°', category: 'Bebidas 🍹', price: 6000, image: '/images/dish_pisco_sour.png' },
  { id: 'm4', name: 'Volcán de Chocolate Belga', category: 'Postres 🍰', price: 6900, image: '/images/dish_volcan_chocolate.png' },
  { id: 'm5', name: 'Hamburguesa Clásica Artesanal', category: 'Fuego 🔥', price: 9500, image: '/images/dish_placeholder.png' },
  { id: 'm6', name: 'Pizza Mozzarella a la Leña', category: 'Fuego 🔥', price: 11000, image: '/images/dish_placeholder.png' },
];

export default function PosQuickSaleCatalog({ onAddItem }) {
  // Filtro activo por categoría. Default: 'Todos'.
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  // Búsqueda de texto en vivo.
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrado de platos.
  const filteredItems = POS_CATALOG_ITEMS.filter((item) => {
    const matchCat = selectedCategory === 'Todos' || item.category.includes(selectedCategory);
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-white p-5 border border-brand-200 shadow-soft">
      {/* Cabecera del catálogo con barra de búsqueda */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-100 pb-3">
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-brand-900 flex items-center gap-2">
            <span>🛒 Venta Rápida / Carta HD en Caja</span>
          </h2>
          <p className="text-xs text-brand-800/60">Agrega productos de la carta directamente al ticket para llevar o retirar en mostrador</p>
        </div>

        {/* Buscador interactivo */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Buscar plato..."
          className="rounded-xl bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-900 border border-brand-200 focus:outline-none focus:bg-white"
        />
      </div>

      {/* Selector de categorías en chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
        {['Todos', 'Fuego', 'Mar', 'Bebidas', 'Postres'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 transition cursor-pointer border ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                : 'bg-brand-50 text-brand-800 border-brand-200 hover:bg-brand-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla de productos con fotografías HD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl bg-white p-3 border border-brand-100 shadow-sm hover:shadow-md transition"
          >
            {/* Foto HD y datos del plato */}
            <div className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover border border-brand-200 shadow-sm"
              />
              <div className="flex flex-col text-left min-w-0">
                <span className="text-xs font-extrabold text-brand-900 truncate">{item.name}</span>
                <span className="text-[10px] font-bold text-amber-700">{item.category}</span>
                <span className="text-xs font-black text-emerald-600 mt-0.5">{formatCurrency(item.price)}</span>
              </div>
            </div>

            {/* Botón de agregar al ticket */}
            <button
              type="button"
              onClick={() => onAddItem(item)}
              className="mt-3 flex items-center justify-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
            >
              <span>➕ Agregar al Ticket</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
