// src/features/ClientView/components/SharedCartDrawer.jsx — carrito compartido (task 2.5)
// Drawer bottom-sheet del carrito de la mesa: lista las líneas agregadas con
// controles de cantidad y el total. Reutiliza el Modal base de shared/ui
// (regla del proyecto: componentes base NO se duplican, solo se componen).
// "Compartido": el carrito es único por mesa y lo ven todos los comensales.

// Modal base: shell bottom-sheet con overlay (task 2.3, shared/ui).
import { Modal } from '../../../shared/ui/index.js';
// formatCurrency: formato CLP de los montos del carrito.
import { formatCurrency } from '../../../shared/utils/index.js';
// Selectores puros del slice de cliente (total y cantidad de ítems).
import { selectCartCount, selectCartTotal } from '../store/useClientStore.js';

// Drawer del carrito: recibe estado del store y handlers desde la página.
// open/onClose controlan la visibilidad; cart y acciones vienen del store.
export default function SharedCartDrawer({
  open,
  onClose,
  cart,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  // Calcula el total en CLP con el selector puro del slice.
  const total = selectCartTotal(cart);
  // Calcula la cantidad de unidades con el selector puro del slice.
  const count = selectCartCount(cart);
  return (
    // Modal base del proyecto: bottom-sheet con título propio del carrito.
    <Modal open={open} title="Carrito de la mesa" onClose={onClose}>
      {/* Contenido del drawer: lista de líneas o estado vacío. */}
      {cart.length === 0 ? (
        // Mensaje de carrito vacío con sutil sugerencia de acción.
        <p className="py-6 text-center text-brand-800/70">
          Agregá platos desde el menú para armar la cuenta.
        </p>
      ) : (
        // Contenedor de las líneas del carrito con scroll interno.
        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
          {/* Renderiza una línea por ítem del carrito. */}
          {cart.map((item) => (
            // Línea del carrito: nombre, precio unitario y controles de cantidad.
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-brand-50 p-3">
              {/* Bloque de nombre del plato y su precio unitario. */}
              <div className="min-w-0 flex-1">
                {/* Nombre del plato con truncado para líneas largas. */}
                <p className="truncate font-semibold text-brand-900">{item.name}</p>
                {/* Precio unitario del plato en CLP. */}
                <p className="text-xs text-brand-800/60">{formatCurrency(item.price)} c/u</p>
              </div>
              {/* Controles de cantidad: menos, valor y más. */}
              <div className="flex items-center gap-2">
                {/* Botón restar: baja cantidad o elimina la línea al llegar a 0. */}
                <button
                  type="button"
                  aria-label={`Quitar uno de ${item.name}`}
                  onClick={() => onDecrease(item.id)}
                  className="h-9 w-9 rounded-full bg-white text-brand-900 shadow-soft hover:bg-brand-100"
                >
                  −
                </button>
                {/* Cantidad actual de la línea en formato compacto. */}
                <span className="w-6 text-center font-semibold text-brand-900">{item.qty}</span>
                {/* Botón sumar: sube en 1 la cantidad de la línea. */}
                <button
                  type="button"
                  aria-label={`Agregar uno a ${item.name}`}
                  onClick={() => onIncrease(item.id)}
                  className="h-9 w-9 rounded-full bg-brand-500 text-white hover:bg-brand-800"
                >
                  +
                </button>
                {/* Botón quitar línea completa (papelera compacta). */}
                <button
                  type="button"
                  aria-label={`Quitar ${item.name} del carrito`}
                  onClick={() => onRemove(item.id)}
                  className="h-9 w-9 rounded-full bg-white text-semantic-danger shadow-soft hover:bg-semantic-danger/10"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {/* Pie del drawer: total acumulado y acción de cierre. */}
          <div className="mt-2 flex items-center justify-between border-t border-brand-100 pt-4">
            {/* Etiqueta del total con la cantidad de unidades. */}
            <p className="font-semibold text-brand-900">
              Total {count > 0 && <span className="text-brand-800/60">({count} ítems)</span>}
            </p>
            {/* Monto total del carrito en CLP con la marca de CTA. */}
            <p className="text-xl font-bold text-brand-500">{formatCurrency(total)}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
