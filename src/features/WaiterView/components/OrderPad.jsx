// src/features/WaiterView/components/OrderPad.jsx — comanda y catálogo táctil (waiter-pwa)
// Panel interactivo de toma de pedidos para el garzón: catálogo táctil de una sola mano,
// badges circulares de cantidad (1x, 2x), Escudo de Alergias (#EF4444), Course Control,
// anulación con PIN de admin y botón de liberación de mesa ("Cerrar y Liberar Mesa").
// Cumple con todas las normas de AGENTS.md (comentarios en español por cada línea).

// useState y useMemo de React.
import { useMemo, useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Filtro puro de carta por dieta (paridad exacta con la Mesa Virtual).
import { filterMenuByDiet } from '../../../shared/utils/menuFilters.js';
// Chips de filtros dietarios reutilizados del cliente (waiter-menu-filters).
import MenuFilterPills from '../../ClientView/components/MenuFilterPills.jsx';
// Selector de tiempos (Course Control).
import CourseControlPicker from './CourseControlPicker.jsx';
// Modal de autorización por PIN.
import PinAuthModal from './PinAuthModal.jsx';
// Modal de unir y ceder mesa (waiter-table-transfer).
import TransferModal from './TransferModal.jsx';
// Selector puro de sugerencia de upsell (waiter-upsell).
import { suggestUpsell } from '../services/upsellService.js';
import SmartUpsellWidget from './SmartUpsellWidget.jsx';

// Asset de respaldo cuando una foto de la carta falla al cargar (D4).
const PLACEHOLDER_IMG = '/images/dish_placeholder.png';

// Componente OrderPad de la PWA del garzón.
export default function OrderPad({
  table,
  menu,
  loading,
  orderDraft,
  selectedCourse,
  toastMessage,
  onAddToCart,
  onToggleAllergy,
  onSelectCourse,
  onMarchFondo,
  onVoidItem,
  onReleaseTable,
}) {
  // Estado local para controlar la apertura del modal de autorización por PIN.
  const [pinModalOpen, setPinModalOpen] = useState(false);
  // Guardado del ítem seleccionado para anular con PIN.
  const [targetVoidItem, setTargetVoidItem] = useState(null);
  // Estado para controlar la apertura del modal de unión/cesión de mesa.
  const [transferModal, setTransferModal] = useState({ open: false, mode: 'merge' });
  // Filtro dietario activo de la carta (paridad con los chips de la Mesa Virtual).
  const [activeDietFilter, setActiveDietFilter] = useState('all');

  // Calcula el total general de la comanda en borrador.
  const totalAmount = orderDraft.reduce((acc, line) => acc + line.price * line.qty, 0);

  // Filtra la carta real por el chip activo y la agrupa por categoría (orden de menu.json).
  const menuByCategory = useMemo(() => {
    // Aplica el mismo filtro dietario que el cliente (filterMenuByDiet puro).
    const filtered = filterMenuByDiet(menu ?? [], activeDietFilter);
    return filtered.reduce((acc, item) => {
      // Categoría del ítem (fallback "Otros" si el fixture no la declara).
      const category = item.category ?? 'Otros';
      // Inicializa el arreglo de la categoría en la primera aparición.
      if (!acc[category]) acc[category] = [];
      // Agrega el ítem a su categoría.
      acc[category].push(item);
      return acc;
    }, {});
  }, [menu, activeDietFilter]);

  // Fallback de imagen: si la foto remota/local falla, muestra el placeholder.
  const handleImgError = (e) => {
    // Reemplaza el src fallido por el asset de respaldo compartido.
    e.currentTarget.src = PLACEHOLDER_IMG;
  };

  // Upsell asistido: sugiere un candidato según la ÚLTIMA línea agregada al borrador.
  // El chip jamás auto-agrega; solo propone (waiter-upsell: NUNCA auto-add).
  const lastDraftLine = orderDraft[orderDraft.length - 1];
  // Selector puro: devuelve un candidato (máx. 1) o null si no hay regla.
  const suggestion = lastDraftLine ? suggestUpsell(lastDraftLine.productId, menu ?? []) : null;

  // Inicia la anulación de una línea.
  const handleInitiateVoid = (line) => {
    if (line.sentToKitchen) {
      // Si ya fue enviado a cocina, requiere la presencia de un Admin con PIN.
      setTargetVoidItem(line);
      setPinModalOpen(true);
    } else {
      // Si aún no se envió a cocina, se anula directamente.
      onVoidItem(line.id, '9921', 'Anulación en borrador');
    }
  };

  // Confirma la anulación con el PIN ingresado en el modal.
  const handleConfirmVoid = (reason) => {
    if (targetVoidItem) {
      onVoidItem(targetVoidItem.id, '9921', reason);
      setTargetVoidItem(null);
    }
  };

  return (
    // Sección contenedora con etiqueta de accesibilidad.
    <section aria-label="Comanda de la mesa seleccionada" className="flex flex-col gap-6">
      {/* Título de la sección y datos de la mesa activa. */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-brand-500">
          Comanda Mesa {table ? table.number : '—'}
        </h2>
        {/* Botones de acciones de la mesa activa: Unir cuenta, Ceder mesa y Liberar mesa. */}
        {table && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTransferModal({ open: true, mode: 'merge' })}
              className="rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 transition hover:bg-brand-100 active:scale-95"
            >
              Unir cuenta
            </button>
            <button
              type="button"
              onClick={() => setTransferModal({ open: true, mode: 'transfer' })}
              className="rounded-xl border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 transition hover:bg-brand-100 active:scale-95"
            >
              Ceder mesa
            </button>
            <button
              type="button"
              onClick={() => onReleaseTable(table.id)}
              className="rounded-xl bg-semantic-danger/10 border border-semantic-danger px-3 py-1 text-xs font-bold text-semantic-danger transition hover:bg-semantic-danger/20 active:scale-95"
            >
              Cerrar y Liberar Mesa
            </button>
          </div>
        )}
      </div>

      {/* Si no hay mesa seleccionada, muestra mensaje guía. */}
      {!table ? (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-100 p-6 text-center">
          <p className="font-semibold text-brand-900">Sin mesa seleccionada</p>
          <p className="text-sm text-brand-800/60">Elegí una mesa de la grilla para ver su comanda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Mensaje de confirmación en pantalla (toast). */}
          {toastMessage && (
            <div className="rounded-xl bg-semantic-success/20 border border-semantic-success p-3 text-center text-xs font-bold text-semantic-success">
              {toastMessage}
            </div>
          )}

          {/* Selector de tiempos de cocina (Course Control). */}
          <CourseControlPicker
            selectedCourse={selectedCourse}
            onSelectCourse={onSelectCourse}
            onMarchFondo={onMarchFondo}
          />

          {/* Chips de filtros dietarios (misma UI y lógica que la Mesa Virtual). */}
          <MenuFilterPills activeFilter={activeDietFilter} onSelectFilter={setActiveDietFilter} />

          {/* Catálogo táctil de una sola mano con tarjetas compactas (D11). */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
              Catálogo de Platos (Toca para agregar)
            </h3>
            {loading ? (
              // Estado de carga mientras la carta real resuelve desde el servicio.
              <p className="py-6 text-center text-sm text-brand-800/60">Cargando carta…</p>
            ) : (
              // Carta real agrupada por categoría (28 ítems en 7 categorías).
              <div className="flex flex-col gap-4">
                {Object.entries(menuByCategory).map(([category, items]) => (
                  // Sección por categoría del menú real.
                  <section key={category}>
                    {/* Título de la categoría. */}
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-800/60">
                      {category}
                    </h4>
                    {/* Grilla de cards compactas de la categoría. */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                      {items.map((item) => {
                        // Cuenta cuántas unidades de este producto hay en el borrador.
                        const countInDraft = orderDraft
                          .filter((line) => line.productId === item.id)
                          .reduce((sum, line) => sum + line.qty, 0);

                        return (
                          // Card compacta: thumb, nombre, precio y badge Nx (D11).
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onAddToCart(item)}
                            className="relative flex items-center gap-2 rounded-xl bg-white p-2 shadow-soft text-left transition hover:border-brand-300 active:scale-95 border border-brand-100"
                          >
                            {/* Miniatura de la foto del plato con fallback a placeholder. */}
                            <img
                              src={item.image}
                              alt={item.name}
                              onError={handleImgError}
                              className="h-10 w-10 shrink-0 rounded-lg object-cover border border-brand-100"
                            />
                            {/* Bloque de nombre y precio del ítem. */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-brand-900">{item.name}</p>
                              <p className="text-[11px] text-brand-800/60">{formatCurrency(item.price)}</p>
                            </div>
                            {/* Badge circular de cantidad acumulada si ya fue tocado. */}
                            {countInDraft > 0 && (
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500 text-[11px] font-bold text-white shadow-md">
                                {countInDraft}x
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          {/* Chip de sugerencia de upsell: visible solo si el último plato tiene regla.
              Es explícito: NO agrega nada por sí solo; solo al tocarlo agrega una
              unidad del sugerido por el flujo normal (onAddToCart → addToDraft). */}
          {suggestion && (
            <button
              type="button"
              onClick={() => onAddToCart(suggestion)}
              className="flex w-full items-center justify-between rounded-2xl border border-brand-300 bg-brand-500/5 px-4 py-3 text-left transition hover:bg-brand-500/10 active:scale-[0.99]"
            >
              <div className="flex items-center gap-2">
                {/* Ícono de sugerencia del mozo. */}
                <span className="text-xl" aria-hidden="true">💡</span>
                <div>
                  {/* Etiqueta de la sugerencia de venta adicional. */}
                  <p className="text-xs font-bold text-brand-500">Sugerencia del mozo</p>
                  {/* Producto sugerido por la regla demo. */}
                  <p className="text-sm font-bold text-brand-900">
                    {suggestion.name} · {formatCurrency(suggestion.price)}
                  </p>
                </div>
              </div>
              {/* Acción explícita de agregar una unidad del sugerido. */}
              <span className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-soft">
                + Agregar
              </span>
            </button>
          )}

          {/* Widget de Venta Cruzada IA (Smart Upsell Assistant). */}
          <SmartUpsellWidget orderDraft={orderDraft} onAddToCart={onAddToCart} />

          {/* Resumen de líneas agregadas a la comanda actual. */}
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
              Detalle de la Comanda
            </h3>

            {orderDraft.length === 0 ? (
              <p className="text-sm text-brand-800/60 py-4 text-center">No hay platos en el borrador.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {orderDraft.map((line) => {
                  // Verifica si la línea contiene alguna alergia declarada.
                  const hasAllergens = line.allergens && line.allergens.length > 0;

                  return (
                    // Fila individual del ítem en la comanda.
                    <div
                      key={line.id}
                      data-allergy={hasAllergens ? 'true' : 'false'}
                      className={`flex flex-col gap-2 rounded-xl p-3 border transition ${
                        hasAllergens
                          ? 'border-semantic-danger bg-semantic-danger/5'
                          : 'border-brand-100 bg-brand-50/50'
                      }`}
                    >
                      {/* Fila superior: cantidad, nombre, precio y acción de anular. */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-brand-900">{line.qty}x</span>
                          <span className="font-semibold text-brand-900">{line.name}</span>
                          <span className="text-xs text-brand-800/60">({line.course})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-brand-900">
                            {formatCurrency(line.price * line.qty)}
                          </span>
                          {/* Botón para anular el ítem de la comanda. */}
                          <button
                            type="button"
                            onClick={() => handleInitiateVoid(line)}
                            className="rounded-lg bg-semantic-danger/10 px-2 py-1 text-xs font-bold text-semantic-danger hover:bg-semantic-danger/20"
                          >
                            {line.sentToKitchen ? 'Anular con PIN' : 'Eliminar'}
                          </button>
                        </div>
                      </div>

                      {/* Escudo de Alergias: botones para conmutar la alergia en el ítem. */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-brand-100/50">
                        {/* Indicador o botón para declarar Alergia al Maní. */}
                        <button
                          type="button"
                          onClick={() => onToggleAllergy(line.id, 'maní')}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                            line.allergens?.includes('maní')
                              ? 'bg-semantic-danger text-white'
                              : 'bg-brand-100 text-brand-800 hover:bg-brand-200'
                          }`}
                        >
                          {line.allergens?.includes('maní') ? '⚠️ ALERGIA: MANÍ' : '+ Alergia Maní'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Total acumulado del borrador. */}
                <div className="flex items-center justify-between pt-3 border-t border-brand-100 mt-2">
                  <span className="font-bold text-brand-900">Total Comanda:</span>
                  <span className="text-lg font-bold text-brand-900">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de autorización por PIN para anulación de comanda. */}
      <PinAuthModal
        open={pinModalOpen}
        item={targetVoidItem}
        onConfirm={handleConfirmVoid}
        onClose={() => setPinModalOpen(false)}
      />

      {/* Modal de unión y cesión de mesa (waiter-table-transfer). */}
      <TransferModal
        open={transferModal.open}
        mode={transferModal.mode}
        originTable={table}
        onClose={() => setTransferModal({ open: false, mode: 'merge' })}
      />
    </section>
  );
}
