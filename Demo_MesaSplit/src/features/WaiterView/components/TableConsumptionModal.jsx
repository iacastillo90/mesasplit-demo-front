// src/features/WaiterView/components/TableConsumptionModal.jsx
// Modal read-only de consumo de una mesa ocupada (spec waiter-interactive-tables:
// consumption-modal / no-order-no-modal). Muestra las líneas de table.order
// (producto, cantidad y precio) con subtotales y total; NO edita la comanda.
// Se cierra con el botón "Cerrar" o click en el overlay (Modal compartido).

import Modal from '../../../shared/ui/Modal.jsx';
import { formatCurrency } from '../../../shared/utils/index.js';

// Modal de consumo: recibe la mesa con su comanda y la acción de cierre.
export default function TableConsumptionModal({ table, onClose }) {
  // Líneas de la comanda de la mesa (order?.items); si no hay, no abre (capa defensiva).
  const items = table?.order?.items ?? [];

  // Total de la comanda: suma de los subtotales de cada línea (qty × price).
  const total = items.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    // Modal centrado (diálogo) read-only, reutilizando el shell visual compartido.
    <Modal open title={`Consumo Mesa ${table?.number ?? ''}`.trim()} onClose={onClose} position="center">
      {/* Lista de líneas de la comanda: producto, cantidad y subtotal. */}
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          // Fila individual de consumo: cantidad × producto + subtotal calculado.
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3"
          >
            {/* Nombre del producto con la cantidad en negrita (qty×). */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-brand-900">{item.qty}x</span>
              <span className="font-semibold text-brand-900">{item.name}</span>
            </div>
            {/* Subtotal de la línea (precio unitario × cantidad), formato del proyecto. */}
            <span className="font-bold text-brand-900">{formatCurrency(item.qty * item.price)}</span>
          </div>
        ))}

        {/* Pie del modal: total de la comanda en destaque. */}
        <div className="flex items-center justify-between rounded-xl bg-brand-900 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-50/70">Total</span>
          {/* Total absoluto de la comanda (suma de subtotales). */}
          <span className="text-lg font-bold text-brand-50">{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  );
}