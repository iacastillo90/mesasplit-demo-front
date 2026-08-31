// src/features/CorporateView/components/WhatIfSimulator.jsx — simulador What-If de precios (corporate-what-if)
// Componente presentacional interactivo (slider de precio) read-only sin persistencia en localStorage.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { simulatePriceChange } from '../services/whatIfService.js';
import { useDemoStore } from '../../../store/useDemoStore.js';

export default function WhatIfSimulator() {
  const menu = useDemoStore((s) => s.menu);

  // Producto seleccionado para la simulación.
  const [selectedProductId, setSelectedProductId] = useState(menu[0]?.id ?? 'm1');
  const selectedProduct = menu.find((p) => p.id === selectedProductId) ?? menu[0];

  // Estado local del slider de precio (sin persistencia en localStorage).
  const [simulatedPrice, setSimulatedPrice] = useState(selectedProduct?.price ?? 12500);

  // Actualiza el producto activo y resetea el precio simulado a su precio base.
  const handleProductChange = (productId) => {
    setSelectedProductId(productId);
    const prod = menu.find((p) => p.id === productId);
    if (prod) {
      setSimulatedPrice(prod.price);
    }
  };

  const simulation = simulatePriceChange(selectedProduct, simulatedPrice);

  return (
    <div aria-label="Simulador What-If de Precios" className="rounded-2xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-brand-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-500">🎛️ Simulador What-If (Estrategia de Precios)</h3>
        <span className="text-[10px] font-semibold text-brand-800/60">Simulación Read-Only (Sin Persistencia)</span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-brand-800">Seleccionar Producto del Menú</label>
          <select
            value={selectedProductId}
            onChange={(e) => handleProductChange(e.target.value)}
            className="rounded-xl border border-brand-200 p-2.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            {menu.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · Precio Actual: {formatCurrency(p.price)}
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="flex flex-col gap-3 rounded-xl bg-brand-50/50 p-4 border border-brand-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-brand-900">Precio Simulado:</span>
              <span className="font-black text-brand-500 text-sm">{formatCurrency(simulatedPrice)}</span>
            </div>

            <input
              type="range"
              min={Math.round((selectedProduct.cost ?? 3000) * 0.8)}
              max={selectedProduct.price * 2}
              step={500}
              value={simulatedPrice}
              onChange={(e) => setSimulatedPrice(Number(e.target.value))}
              className="h-2 w-full accent-brand-500 cursor-pointer"
            />

            {simulation.hasWarning && (
              <div className="rounded-lg bg-rose-50 p-2 text-[11px] font-bold text-rose-700 text-center">
                ⚠️ Alerta: El precio es menor o igual al costo ({formatCurrency(selectedProduct.cost)}). Margen nulo o negativo.
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-brand-800/60 uppercase">Ventas Proyectadas</span>
                <span className="font-bold text-brand-900">{formatCurrency(simulation.projectedSales)}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-brand-800/60 uppercase">Ganancia Proyectada</span>
                <span className="font-bold text-emerald-600">{formatCurrency(simulation.projectedProfit)}</span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-brand-800/60 uppercase">Margen Nuevo</span>
                <span className="font-bold text-brand-900">{simulation.marginPercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
