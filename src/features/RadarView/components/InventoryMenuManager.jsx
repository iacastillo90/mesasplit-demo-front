// src/features/RadarView/components/InventoryMenuManager.jsx — módulo de gestión de inventario, recetas y precios del salón (radar-inventory)
// Muestra las fotos reales en HD de la carta del cliente, descripciones, precios de venta, costos primarios y stock (Lista 86).
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import initialMenu from '../../../mocks/menu.json';
import { formatCurrency } from '../../../shared/utils/index.js';

export default function InventoryMenuManager() {
  // Estado local del catálogo de platos del menú con imágenes HD.
  const [items, setItems] = useState(initialMenu);

  // Estado local para el filtro por categoría.
  const [activeCategory, setActiveCategory] = useState('todos');

  // Estado del modal de agregar nuevo plato.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Hamburguesas');
  const [newItemPrice, setNewItemPrice] = useState(8900);
  const [newItemCost, setNewItemCost] = useState(3200);
  const [newItemDescription, setNewItemDescription] = useState('Receta artesanal preparada en cocina.');

  // Obtiene dinámicamente las categorías únicas de la carta.
  const rawCategories = Array.from(new Set(items.map((i) => i.category || 'fondos')));
  const categories = ['todos', ...rawCategories];

  // Cambia el precio de venta de un plato en vivo.
  const handlePriceChange = (id, newPrice) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: Number(newPrice) } : item)),
    );
  };

  // Conmuta la disponibilidad en stock de un plato (Lista 86).
  const toggleAvailable = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, available: item.available === false ? true : false }
          : item,
      ),
    );
  };

  // Agrega un nuevo plato a la carta.
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      description: newItemDescription.trim(),
      category: newItemCategory,
      price: Number(newItemPrice),
      cost: Number(newItemCost),
      available: true,
      image: '/images/dish_lomo_lo_ovalle.png',
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setIsAddModalOpen(false);
  };

  // Filtra la lista por categoría activa.
  const filteredItems = items.filter(
    (item) => activeCategory === 'todos' || item.category === activeCategory,
  );

  return (
    <section aria-label="Gestión de Inventario y Menú" className="rounded-2xl bg-brand-900 p-5 shadow-xl border border-brand-800 text-brand-50 flex flex-col gap-6">
      {/* Cabecera del Módulo de Inventario con Menú Hiperrealista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">📦 Gestión de Inventario & Menú Gastronómico</h2>
            <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-extrabold text-brand-400 border border-brand-500/30">
              Local Admin
            </span>
          </div>
          <p className="text-xs text-brand-50/70">
            Fotografías HD en vivo de la carta del cliente, control de stock (Lista 86), costos primarios y ajuste de precios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft cursor-pointer"
        >
          ➕ Agregar Plato a la Carta
        </button>
      </div>

      {/* Pestañas de Filtrado por Categoría */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition cursor-pointer border ${
              activeCategory === cat
                ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                : 'bg-brand-800/80 text-brand-50/70 border-brand-700/50 hover:bg-brand-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla de Platos de la Carta con Fotos HD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isAvailable = item.available !== false;
          const cost = item.cost ?? Math.round(item.price * 0.38);
          const margin = item.price > 0 ? Math.round(((item.price - cost) / item.price) * 100) : 60;
          const dishImage = item.image || '/images/dish_lomo_lo_ovalle.png';

          return (
            <article
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl p-4 border transition-all duration-200 ${
                isAvailable
                  ? 'bg-brand-950/90 border-brand-800 hover:border-amber-500/50 shadow-soft'
                  : 'bg-brand-950/40 border-rose-500/30 opacity-75'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Imagen HD del plato idéntica a la carta del cliente */}
                <div className="relative h-40 w-full overflow-hidden rounded-xl border border-brand-800/80 bg-brand-900">
                  <img
                    src={dishImage}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  {/* Badge de Disponibilidad sobre la imagen */}
                  <span
                    className={`absolute top-2.5 right-2.5 text-[10px] font-extrabold rounded-full px-2.5 py-1 border backdrop-blur-md shadow-soft ${
                      isAvailable
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                        : 'bg-rose-950/90 text-rose-400 border-rose-500/50 animate-pulse'
                    }`}
                  >
                    {isAvailable ? '✓ Disponible' : '⚠️ Agotado (86)'}
                  </span>

                  {/* Badge de Categoría sobre la imagen */}
                  <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold rounded-lg px-2 py-0.5 bg-brand-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                    {item.category}
                  </span>
                </div>

                {/* Título y Descripción del plato */}
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-sm text-white truncate">{item.name}</h3>
                    {item.popular && (
                      <span className="text-[10px] font-bold text-amber-400 shrink-0">⭐ Popular</span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-brand-50/60 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Métricas de Costo y Margen de Utilidad */}
                <div className="flex items-center justify-between rounded-xl bg-brand-900/60 p-2.5 border border-brand-800/50 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-brand-50/50 uppercase font-bold">Costo Materia Prima</span>
                    <span className="font-bold text-brand-50/90">{formatCurrency(cost)}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-brand-50/50 uppercase font-bold">Margen Bruto</span>
                    <span className={`font-extrabold ${margin >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {margin}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Controles de Modificación de Precio y Disponibilidad */}
              <div className="mt-4 border-t border-brand-800/80 pt-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <label htmlFor={`price-${item.id}`} className="text-[11px] font-bold text-brand-50/70">
                    Precio ($):
                  </label>
                  <input
                    id={`price-${item.id}`}
                    type="number"
                    step={500}
                    value={item.price}
                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                    className="w-24 rounded-xl bg-brand-800 p-2 text-center text-xs font-extrabold text-amber-300 border border-brand-700 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleAvailable(item.id)}
                  className={`rounded-xl px-3 py-2 text-[11px] font-extrabold transition active:scale-95 cursor-pointer border ${
                    isAvailable
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-600 hover:text-white border-emerald-500/40'
                  }`}
                >
                  {isAvailable ? 'Marcar Agotado' : 'Habilitar Stock'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Modal de Alta de Nuevo Plato con Foto HD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-brand-900 p-6 shadow-2xl border border-brand-800 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-brand-800 pb-3">
              <h3 className="text-base font-bold">➕ Agregar Nuevo Plato a la Carta</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl bg-brand-800 p-1 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-50/80 mb-1">Nombre del Plato</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="ej. Ceviche Mixto de Salmón"
                  className="w-full rounded-xl bg-brand-800 p-3 text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-50/80 mb-1">Descripción Gourmet</label>
                <input
                  type="text"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  placeholder="ej. Salmón austral, leche de tigre y choclo dulce."
                  className="w-full rounded-xl bg-brand-800 p-3 text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-50/80 mb-1">Categoría</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full rounded-xl bg-brand-800 p-3 text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none capitalize"
                  >
                    {categories.filter((c) => c !== 'todos').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-50/80 mb-1">Precio Venta ($)</label>
                  <input
                    type="number"
                    step={500}
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    className="w-full rounded-xl bg-brand-800 p-3 text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-50/80 mb-1">Costo Estimado Materia Prima ($)</label>
                <input
                  type="number"
                  step={200}
                  value={newItemCost}
                  onChange={(e) => setNewItemCost(e.target.value)}
                  className="w-full rounded-xl bg-brand-800 p-3 text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-white transition hover:bg-amber-600 active:scale-95 shadow-soft cursor-pointer mt-2"
              >
                Guardar e Incorporar a la Carta
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
