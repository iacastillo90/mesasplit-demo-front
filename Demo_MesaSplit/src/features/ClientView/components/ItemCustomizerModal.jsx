// src/features/ClientView/components/ItemCustomizerModal.jsx — modal de personalización de opciones y modificadores del plato
// Permite al cliente seleccionar término de cocción, acompañamiento e ingredientes a excluir antes de agregar al carrito.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { Modal } from '../../../shared/ui/index.js';

// Opciones de término de cocción por defecto para carnes/hamburguesas.
const COOKING_POINTS = ['A punto', '3/4 (Jugosa)', 'Bien cocida'];
// Opciones de acompañamientos por defecto.
const SIDE_DISHES = ['Papas rústicas', 'Ensalada fresca', 'Papas fritas tradicionales'];
// Opciones de exclusiones comunes.
const EXCLUSIONS = ['Sin cebolla', 'Sin mayonesa', 'Salsa aparte', 'Sin pepinillos'];

export default function ItemCustomizerModal({ item, open, onClose, onConfirm }) {
  // Estado local del término de cocción seleccionado.
  const [cookingPoint, setCookingPoint] = useState(COOKING_POINTS[1]);
  // Estado local del acompañamiento elegido.
  const [sideDish, setSideDish] = useState(SIDE_DISHES[0]);
  // Estado local de las exclusiones marcadas.
  const [selectedExclusions, setSelectedExclusions] = useState([]);
  // Nota libre adicional escrita por el cliente.
  const [customNote, setCustomNote] = useState('');

  // Si no hay ítem seleccionado, no renderiza.
  if (!item) return null;

  // Maneja la selección/deselección de un ingrediente a excluir.
  const toggleExclusion = (exclusion) => {
    setSelectedExclusions((prev) =>
      prev.includes(exclusion) ? prev.filter((e) => e !== exclusion) : [...prev, exclusion]
    );
  };

  // Maneja la confirmación de agregar el plato personalizado al carrito.
  const handleConfirm = () => {
    // Genera la cadena consolidada de notas del pedido.
    const notesParts = [
      `Cocción: ${cookingPoint}`,
      `Acompañamiento: ${sideDish}`,
      selectedExclusions.length > 0 ? selectedExclusions.join(', ') : '',
      customNote ? `Nota: ${customNote}` : '',
    ].filter(Boolean);

    const notes = notesParts.join(' | ');

    // Invoca el callback enviando el ítem con sus notas personalizadas.
    onConfirm({
      ...item,
      notes,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={`Personalizar: ${item.name}`}>
      <div className="flex flex-col gap-5 text-brand-900">
        {/* Cabecera del plato con foto/icono y precio */}
        <div className="flex items-center justify-between rounded-2xl bg-brand-50 p-4 border border-brand-200">
          <div>
            <h4 className="text-sm font-extrabold text-brand-900">{item.name}</h4>
            <p className="text-xs text-brand-500 font-bold">{formatCurrency(item.price)}</p>
          </div>
          <span className="text-2xl">🍔</span>
        </div>

        {/* 1. Selección de Término de Cocción */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">1. Término de Cocción</label>
          <div className="grid grid-cols-3 gap-2">
            {COOKING_POINTS.map((point) => (
              <button
                key={point}
                type="button"
                onClick={() => setCookingPoint(point)}
                className={`rounded-xl py-2 px-1 text-xs font-bold transition border ${
                  cookingPoint === point
                    ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                    : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                }`}
              >
                {point}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Selección de Acompañamiento */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">2. Acompañamiento</label>
          <div className="flex flex-col gap-1.5">
            {SIDE_DISHES.map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => setSideDish(side)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition border ${
                  sideDish === side
                    ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                    : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                }`}
              >
                <span>{side}</span>
                {sideDish === side && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Exclusiones de Ingredientes */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">3. Exclusión de Ingredientes</label>
          <div className="grid grid-cols-2 gap-2">
            {EXCLUSIONS.map((ex) => {
              const isSelected = selectedExclusions.includes(ex);
              return (
                <button
                  key={ex}
                  type="button"
                  onClick={() => toggleExclusion(ex)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition border ${
                    isSelected
                      ? 'bg-rose-500 text-white border-rose-500 shadow-soft'
                      : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  <span>{isSelected ? '✕' : '🚫'}</span>
                  <span>{ex}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Nota Libre Adicional */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-brand-800">4. Instrucción Adicional para Cocina</label>
          <input
            type="text"
            placeholder="Ej: Servir salsa en recipiente aparte..."
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full rounded-xl border border-brand-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        {/* Acciones del Modal */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-brand-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-100 text-brand-900 px-4 py-2 text-xs font-bold hover:bg-brand-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl bg-brand-500 text-white px-5 py-2 text-xs font-extrabold shadow-soft hover:bg-brand-600 active:scale-95 transition-all"
          >
            ✓ Agregar al Carrito
          </button>
        </div>
      </div>
    </Modal>
  );
}
