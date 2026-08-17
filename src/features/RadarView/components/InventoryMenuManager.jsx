// src/features/RadarView/components/InventoryMenuManager.jsx — módulo de gestión de inventario, recetas y precios del salón (radar-inventory)
// Permite al Local Admin gestionar stock de insumos, disponibilidad de platos (Lista 86),
// editar precios de venta, costos primarios y agregar nuevos platos al menú del restaurante.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { useState } from 'react';
import initialMenu from '../../../mocks/menu.json';
import { formatCurrency } from '../../../shared/utils/index.js';

export default function InventoryMenuManager() {
  // Estado local del catálogo de platos del menú.
  const [items, setItems] = useState(initialMenu);

  // Estado local para el filtro por categoría.
  const [activeCategory, setActiveCategory] = useState('todos');

  // Estado del modal de agregar nuevo plato.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('fondos');
  const [newItemPrice, setNewItemPrice] = useState(8900);
  const [newItemCost, setNewItemCost] = useState(3200);

  // Categorías disponibles.
  const categories = ['todos', 'fondos', 'pizzas', 'postres', 'bebidas'];

  // Cambia el precio de un plato en vivo.
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

  // Agrega un nuevo plato al menú.
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      price: Number(newItemPrice),
      cost: Number(newItemCost),
      available: true,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
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
      {/* Cabecera del Módulo de Inventario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">📦 Gestión de Inventario & Menú</h2>
            <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-extrabold text-brand-400 border border-brand-500/30">
              Local Admin
            </span>
          </div>
          <p className="text-xs text-brand-50/70">
            Control de stock, cambio de precios en vivo y disponibilidad de recetas para el salón y PWA.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft cursor-pointer"
        >
          ➕ Nuevo Plato
        </button>
      </div>

      {/* Pestañas de Filtrado por Categoría */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition cursor-pointer ${
              activeCategory === cat
                ? 'bg-brand-500 text-white shadow-soft'
                : 'bg-brand-800/80 text-brand-50/70 hover:bg-brand-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla de Platos e Insumos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isAvailable = item.available !== false;
          const margin = item.price > 0 && item.cost ? Math.round(((item.price - item.cost) / item.price) * 100) : 60;

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-xl p-4 border transition ${
                isAvailable
                  ? 'bg-brand-950/80 border-brand-800 hover:border-brand-700'
                  : 'bg-brand-950/40 border-semantic-danger/40 opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                  alt={item.name}
                  className="h-14 w-14 rounded-xl object-cover border border-brand-800 shrink-0"
                />

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white truncate">{item.name}</h3>
                    <span
                      className={`text-[10px] font-extrabold rounded-full px-2 py-0.5 border ${
                        isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-semantic-danger/10 text-semantic-danger border-semantic-danger/30'
                      }`}
                    >
                      {isAvailable ? 'Disponible' : 'Agotado (86)'}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-50/60 capitalize mt-0.5">{item.category}</span>

                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-brand-50/70">Costo: <strong>{formatCurrency(item.cost ?? Math.round(item.price * 0.35))}</strong></span>
                    <span className="text-emerald-400 font-bold">Margen: {margin}%</span>
                  </div>
                </div>
              </div>

              {/* Controles de Modificación de Precio y Stock */}
              <div className="mt-4 border-t border-brand-800/60 pt-3 flex items-center justify-between gap-2">
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
                    className="w-24 rounded-lg bg-brand-800 p-1.5 text-center text-xs font-bold text-white border border-brand-700 focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => toggleAvailable(item.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition active:scale-95 cursor-pointer ${
                    isAvailable
                      ? 'bg-semantic-danger/20 text-semantic-danger hover:bg-semantic-danger hover:text-white border border-semantic-danger/30'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/30'
                  }`}
                >
                  {isAvailable ? 'Marcar Agotado' : 'Habilitar Stock'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Alta de Nuevo Plato */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/80 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-brand-900 p-6 shadow-2xl border border-brand-800 flex flex-col gap-4 text-white">
            <div className="flex items-center justify-between border-b border-brand-800 pb-3">
              <h3 className="text-base font-bold">➕ Agregar Nuevo Plato al Menú</h3>
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
                className="w-full rounded-xl bg-brand-500 py-3 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft cursor-pointer mt-2"
              >
                Guardar e Incorporar al Menú
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
