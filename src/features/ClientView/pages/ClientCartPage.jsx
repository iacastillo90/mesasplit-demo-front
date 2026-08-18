// src/features/ClientView/pages/ClientCartPage.jsx — Vista dedicada interactiva del carrito y comanda compartida
// Despliega los ítems pedidos en la Mesa Virtual, estado de cocción en KDS, comensales sentados y llamado a la división de cuentas.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para gestionar modales interactivos de evaluación y división.
import { useState } from 'react';
// useNavigate y Link para la navegación fluida.
import { useNavigate, Link } from 'react-router-dom';
// Store del cliente.
import { useClientStore, selectCartTotal, selectCartCount } from '../store/useClientStore.js';
// Store de división de cuenta.
import { useSplitStore } from '../store/useSplitStore.js';
// Utility de formateo de CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Componentes UI reutilizables.
import { Button, Badge } from '../../../shared/ui/index.js';
// Modales de evaluación y división.
import ItemReviewModal from '../components/ItemReviewModal.jsx';
import BillSplitterModal from '../components/BillSplitterModal.jsx';
// Barra de navegación inferior fija para móviles.
import ClientBottomNav from '../components/ClientBottomNav.jsx';

// Componente principal ClientCartPage.
export default function ClientCartPage() {
  // Hook de navegación de React Router.
  const navigate = useNavigate();
  // Estado del carrito y descuento en el store del cliente.
  const { cart, activeDiscountAmount, increaseQty, decreaseQty, removeItem } = useClientStore();
  // Acción para abrir el modal de división.
  const openSplit = useSplitStore((s) => s.openSplit);

  // Totales calculados.
  const totalCount = selectCartCount(cart);
  const netTotal = selectCartTotal(cart, activeDiscountAmount);
  const rawSubtotal = selectCartTotal(cart, 0);

  // Estado local para abrir el modal de reseña de plato.
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  // Estado local para abrir el modal de división.
  const [splitOpen, setSplitOpen] = useState(false);

  // Maneja la apertura de la división de cuentas.
  const handleOpenSplit = () => {
    openSplit(netTotal > 0 ? netTotal : rawSubtotal);
    setSplitOpen(true);
  };

  return (
    // Contenedor principal de la página del carrito.
    <div className="min-h-screen bg-brand-950 text-white p-4 sm:p-6 pb-24">
      {/* Cabecera superior con navegación de retorno. */}
      <div className="max-w-2xl mx-auto flex items-center justify-between border-b border-brand-800 pb-4 mb-6">
        <Link
          to="/cliente"
          className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition"
        >
          <span>← Volver al Menú</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">📍 Mesa 04</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {/* Título de la vista y resumen de comensales sentados. */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>🛒 Mi Comanda Compartida</span>
              <span className="text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                {totalCount} ítems
              </span>
            </h1>
          </div>

          {/* Avatares de los 4 comensales de la mesa. */}
          <div className="flex items-center justify-between bg-brand-900/60 p-3 rounded-2xl border border-brand-800">
            <span className="text-xs font-semibold text-slate-400">Comensales en la mesa:</span>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg">👤 Ignacio (Tú)</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-lg">👤 Valentina</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg">👤 Matías</span>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-lg">👤 Camila</span>
            </div>
          </div>
        </div>

        {/* Estado del pedido si el carrito está vacío. */}
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-brand-900/40 border border-brand-800 gap-3">
            <span className="text-4xl">🍽️</span>
            <h3 className="text-sm font-bold text-slate-200">Tu carrito está vacío</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Añade tus platos favoritos desde el menú de la Mesa Virtual para comenzar a pedir.
            </p>
            <Button onClick={() => navigate('/cliente')} className="mt-2 text-xs font-bold">
              Explorar Menú
            </Button>
          </div>
        ) : (
          /* Listado interactivo de ítems del carrito. */
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
              <span>Detalle de Consumo</span>
              <span>Estado en Cocina (KDS)</span>
            </div>

            {cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl bg-brand-900/80 p-4 border border-brand-800 shadow-soft transition hover:border-brand-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{item.name}</h4>
                    <p className="text-xs font-bold text-sky-400">{formatCurrency(item.price)} c/u</p>
                  </div>

                  {/* Badge de estado en cocina simulado. */}
                  <Badge variant="warning" className="text-[10px] animate-pulse">
                    🍳 En Cocina
                  </Badge>
                </div>

                {/* Controles de cantidad y botón de evaluación por plato. */}
                <div className="flex items-center justify-between pt-2 border-t border-brand-800/60">
                  <div className="flex items-center gap-2">
                    {/* Botón para evaluar plato */}
                    <button
                      type="button"
                      onClick={() => setSelectedReviewItem(item)}
                      className="rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-1 text-[11px] font-bold hover:bg-amber-500/25 transition"
                    >
                      ⭐ Evaluar
                    </button>
                    {/* Botón para eliminar */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] font-semibold text-rose-400 hover:underline ml-1"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Controles + / - */}
                  <div className="flex items-center gap-2 bg-brand-950 p-1 rounded-xl border border-brand-800">
                    <button
                      type="button"
                      onClick={() => decreaseQty(item.id)}
                      className="h-6 w-6 rounded-lg bg-brand-800 text-xs font-bold text-white hover:bg-brand-700 flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-white px-2">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() => increaseQty(item.id)}
                      className="h-6 w-6 rounded-lg bg-brand-800 text-xs font-bold text-white hover:bg-brand-700 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Resumen de totales con descuento si existe. */}
            <div className="flex flex-col gap-2 rounded-2xl bg-brand-900 p-4 border border-brand-800 mt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                <span>Subtotal Consumo:</span>
                <span className="font-bold text-white">{formatCurrency(rawSubtotal)}</span>
              </div>

              {activeDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>Descuento MesaSplit Rewards:</span>
                  <span>-{formatCurrency(activeDiscountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-brand-800">
                <span>Total Boleta Mesa 04:</span>
                <span className="text-base text-sky-400">{formatCurrency(netTotal)}</span>
              </div>
            </div>

            {/* Botones de acción principal. */}
            <div className="flex flex-col gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleOpenSplit}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 px-4 shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>💳 Dividir & Pagar Cuenta ({formatCurrency(netTotal)})</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/cliente')}
                className="w-full rounded-2xl bg-brand-800 hover:bg-brand-700 text-slate-200 font-bold text-xs py-2.5 px-4 transition"
              >
                + Seguir Pidiendo Platos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de evaluación centrado. */}
      {selectedReviewItem && (
        <ItemReviewModal
          open={Boolean(selectedReviewItem)}
          onClose={() => setSelectedReviewItem(null)}
          item={selectedReviewItem}
        />
      )}

      {/* Modal de división de cuenta. */}
      {splitOpen && (
        <BillSplitterModal
          open={splitOpen}
          onClose={() => setSplitOpen(false)}
        />
      )}

      {/* Barra de navegación inferior fija para móviles */}
      <ClientBottomNav />
    </div>
  );
}
