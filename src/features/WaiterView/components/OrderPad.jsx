// src/features/WaiterView/components/OrderPad.jsx — pad de comanda (task 2.6)
// Shell del pad de comanda del garzón (spec: "order pad shell is present").
// Muestra la comanda abierta de la mesa seleccionada con su total y las
// acciones del flujo. Presentacional: recibe la mesa por props.
// NOTA PR3 → PR4: enviar comanda / cerrar cuenta quedan deshabilitados hasta
// que el bus realtime (Phase 3) y la persistencia existan.

// Badge y Button base: estado de la mesa y acciones del pad.
import { Badge, Button } from '../../../shared/ui/index.js';
// formatCurrency: total de la comanda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Pad de comanda: recibe la mesa seleccionada y el handler de cierre.
export default function OrderPad({ table, onClose }) {
  // Si no hay mesa seleccionada, devuelve el estado vacío del shell.
  if (!table) {
    return (
      // Panel del pad con el mensaje de selección pendiente.
      <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-100 p-6 text-center">
        {/* Título del estado vacío del pad. */}
        <p className="font-semibold text-brand-900">Sin mesa seleccionada</p>
        {/* Ayuda: elegir una mesa en la grilla para ver su comanda. */}
        <p className="text-sm text-brand-800/60">
          Elegí una mesa de la grilla para ver su comanda.
        </p>
      </div>
    );
  }

  // Lee la comanda de la mesa (puede ser null si no tiene líneas abiertas).
  const order = table.order;
  // Calcula el total de la comanda sumando precio × cantidad por línea.
  const total = order
    ? // Reduce las líneas acumulando el subtotal de cada una.
      order.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    : // Sin comanda: total cero.
      0;

  return (
    // Panel del pad: tarjeta blanca con la comanda de la mesa elegida.
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft">
      {/* Cabecera del pad: identidad de la mesa + acción de cierre. */}
      <div className="flex items-center justify-between">
        {/* Título con el número de mesa y su zona. */}
        <h3 className="font-bold text-brand-900">
          Mesa {table.number} · {table.zone}
        </h3>
        {/* Botón de cierre del pad (limpia la selección en el store). */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar comanda"
          className="h-9 w-9 rounded-full text-brand-800/60 hover:bg-brand-100"
        >
          ✕
        </button>
      </div>

      {/* Cuerpo del pad: líneas de la comanda o aviso de mesa sin pedido. */}
      {order ? (
        // Lista de líneas de la comanda abierta.
        <ul className="flex flex-col gap-2">
          {/* Renderiza una línea por ítem de la comanda. */}
          {order.items.map((item) => (
            // Línea: nombre, cantidad y subtotal de la línea.
            <li key={item.id} className="flex items-center justify-between gap-2 text-sm">
              {/* Nombre del plato con su cantidad entre paréntesis. */}
              <span className="text-brand-900">
                {item.name} <span className="text-brand-800/50">×{item.qty}</span>
              </span>
              {/* Subtotal de la línea (precio × cantidad) en CLP. */}
              <span className="font-semibold text-brand-900">
                {formatCurrency(item.price * item.qty)}
              </span>
            </li>
          ))}
          {/* Divisor antes del total de la comanda. */}
          <li className="my-1 border-t border-brand-100" aria-hidden="true" />
          {/* Fila del total: etiqueta y monto destacado de la comanda. */}
          <li className="flex items-center justify-between font-bold text-brand-900">
            {/* Etiqueta del total acumulado. */}
            <span>Total</span>
            {/* Monto total de la comanda en CLP. */}
            <span className="text-brand-500">{formatCurrency(total)}</span>
          </li>
        </ul>
      ) : (
        // Mesa sin comanda abierta: estado vacío del pad.
        <p className="py-4 text-center text-sm text-brand-800/60">
          Esta mesa todavía no tiene pedidos.
        </p>
      )}

      {/* Acciones del pad: enviar comanda y cerrar cuenta. */}
      <div className="flex gap-2">
        {/* Estado natural del pedido en píldora (enum de shared/constants). */}
        <Badge variant="brand">{order ? 'Comanda abierta' : 'Sin pedido'}</Badge>
        {/* Cerrar cuenta: acción secundaria (pago real llega en PR 4). */}
        <Button variant="secondary" className="ml-auto h-10 px-4 text-xs" onClick={onClose}>
          Cerrar cuenta
        </Button>
        {/* Enviar comanda: disabled hasta que el bus realtime exista (PR 4). */}
        <Button variant="primary" className="h-10 px-4 text-xs" disabled>
          Enviar comanda
        </Button>
      </div>
    </div>
  );
}
