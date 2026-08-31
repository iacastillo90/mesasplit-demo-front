// src/features/KdsView/components/PackingChecklistModal.jsx — modal checklist de empaque delivery (kds-delivery-checklist)
// Modal de verificación obligatoria de ítems de pedidos delivery antes del despacho.
// Lee ítems estructurados o en su defecto itemsSummary como unidad verificable.
// Persiste el estado de verificación en localStorage bajo mesasplit-packing-{orderId}.
// Llama a completeDeliveryOrder en useRadarStore al despachar solo con el 100% verificado.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useEffect, useState } from 'react';
// Store de RadarView para transicionar la orden a 'completed'.
import { useRadarStore } from '../../RadarView/store/useRadarStore.js';
// Componente Modal del barrel shared/ui.
import { Modal } from '../../../shared/ui/index.js';

export default function PackingChecklistModal({ open, order, onClose }) {
  const completeDeliveryOrder = useRadarStore((s) => s.completeDeliveryOrder);

  // Arreglo normalizado de ítems a empaquetar { id, name, qty }.
  const itemsToPack =
    order?.items && order.items.length > 0
      ? order.items
      : order?.itemsSummary
        ? [{ id: 'summary-1', name: order.itemsSummary, qty: 1 }]
        : [];

  // Estado de verificaciones { itemId: boolean }.
  const [checkedState, setCheckedState] = useState({});
  // Mensaje de error si se intenta despachar incompleto.
  const [errorMsg, setErrorMsg] = useState(null);

  // Carga las verificaciones previas desde localStorage al abrir o cambiar de orden.
  useEffect(() => {
    if (!order?.id) return;

    setErrorMsg(null);
    try {
      const stored = window.localStorage.getItem(`mesasplit-packing-${order.id}`);
      if (stored) {
        setCheckedState(JSON.parse(stored));
      } else {
        setCheckedState({});
      }
    } catch {
      setCheckedState({});
    }
  }, [order?.id]);

  if (!open || !order) return null;

  // Manejador del toggle de un ítem.
  const handleToggle = (itemId) => {
    setErrorMsg(null);
    const updated = { ...checkedState, [itemId]: !checkedState[itemId] };
    setCheckedState(updated);

    try {
      window.localStorage.setItem(`mesasplit-packing-${order.id}`, JSON.stringify(updated));
    } catch {
      // Ignora si localStorage no está disponible.
    }
  };

  // Maneja la confirmación de despacho.
  const handleDispatch = () => {
    // Verifica si todos los ítems de la orden están marcados.
    const allChecked =
      itemsToPack.length > 0 &&
      itemsToPack.every((item) => checkedState[item.id ?? item.name]);

    if (!allChecked) {
      setErrorMsg('Faltan ítems por verificar antes de despachar');
      return;
    }

    // Ejecuta la transición de la orden a 'completed' en useRadarStore.
    completeDeliveryOrder(order.id);
    onClose?.();
  };

  return (
    // Modal accesible de empaque delivery.
    <Modal open={open} onClose={onClose} title="Empaque Delivery">
      <div className="flex flex-col gap-4 py-2">
        {/* Banner con información del cliente y la orden. */}
        <div className="flex items-center justify-between rounded-xl bg-brand-900 p-3 text-brand-50 border border-brand-800">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-50">{order.customerName ?? 'Cliente'}</span>
            <span className="text-[11px] text-brand-50/60">Orden #{order.id}</span>
          </div>
          <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-400 border border-brand-500/30">
            🛵 Delivery
          </span>
        </div>

        {/* Texto de instrucción. */}
        <p className="text-xs text-brand-800/80">
          Verificá cada plato/bebida antes de sellar el paquete de despacho:
        </p>

        {/* Lista de checkboxes de ítems a empaquetar. */}
        <div className="flex flex-col gap-2.5">
          {itemsToPack.map((item, idx) => {
            const key = item.id ?? item.name ?? idx;
            const isChecked = Boolean(checkedState[key]);

            return (
              <label
                key={key}
                className={`flex items-center justify-between rounded-xl p-3 border transition cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-white border-brand-200 text-brand-900 hover:bg-brand-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(key)}
                    className="h-4 w-4 rounded border-brand-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-xs font-bold">{item.name}</span>
                </div>
                <span className="rounded-lg bg-brand-100 px-2.5 py-0.5 text-xs font-extrabold text-brand-900">
                  x{item.qty ?? 1}
                </span>
              </label>
            );
          })}
        </div>

        {/* Error si faltan ítems. */}
        {errorMsg && (
          <div className="rounded-xl bg-rose-50 p-2.5 border border-rose-200 text-xs font-bold text-rose-700 text-center">
            {errorMsg}
          </div>
        )}

        {/* Acciones de despacho. */}
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition active:scale-95 shadow-soft"
          >
            Despachar Pedido
          </button>
        </div>
      </div>
    </Modal>
  );
}
