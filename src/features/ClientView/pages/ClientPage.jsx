// src/features/ClientView/pages/ClientPage.jsx — Mesa Virtual del cliente (task 2.5 + account-split + customer-survey-ratings + sos-waiter-call)
// Vista "/cliente" del spec feature-views: banner de contexto de mesa, listado
// de menú, affordance visible de carrito, modal de división de cuenta, encuesta de satisfacción post-pago y S.O.S. al mozo.
// Orquesta el servicio (datos) y los stores (useClientStore + useSplitStore).
// Cumple con todas las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useEffect: dispara la carga inicial del menú al montar la vista.
import { useEffect, useMemo, useState } from 'react';
// Toast base: aviso al agregar un plato al carrito (success).
import { Badge, Button, Toast } from '../../../shared/ui/index.js';
// formatCurrency: precio de cada ítem del menú en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Store del slice: estado del menú, carrito y acciones del cliente.
import { selectCartCount, selectCartTotal, useClientStore } from '../store/useClientStore.js';
// Store de división de cuenta (account-split).
import { useSplitStore } from '../store/useSplitStore.js';
// Drawer bottom-sheet del carrito compartido de la mesa.
import SharedCartDrawer from '../components/SharedCartDrawer.jsx';
// Modal bottom-sheet de división de cuenta.
import BillSplitterModal from '../components/BillSplitterModal.jsx';
// Modal de encuesta de satisfacción y propina (customer-survey-ratings).
import CustomerSurveyModal from '../components/CustomerSurveyModal.jsx';
// Modal S.O.S. de llamada urgente al mozo (sos-waiter-call).
import SosModal from '../components/SosModal.jsx';
// Modal de bienvenida para onboarding de primera visita (client-onboarding).
import WelcomeModal from '../components/WelcomeModal.jsx';
// Modal de solicitud de factura demo (client-factura).
import InvoiceRequestModal from '../components/InvoiceRequestModal.jsx';
// Banner de seguimiento de pedido en tiempo real (client-order-tracking).
import OrderTrackingBanner from '../components/OrderTrackingBanner.jsx';
// Modal de verificación de mayoría de edad (client-alcohol-verification).
import AgeVerificationModal from '../components/AgeVerificationModal.jsx';

// ClientPage: pantalla principal de la Mesa Virtual del comensal.
export default function ClientPage() {
  // Suscripción al store: estado del menú, contexto, carrito y acciones.
  const menu = useClientStore((s) => s.menu);
  // Contexto de la mesa virtual (número, comensales, código QR).
  const tableContext = useClientStore((s) => s.tableContext);
  // Carrito: líneas {id, name, price, qty} agregadas por el comensal.
  const cart = useClientStore((s) => s.cart);
  // Flag de carga de la primera llamada al servicio de menú.
  const loading = useClientStore((s) => s.loading);
  // Flag de visibilidad del drawer del carrito.
  const cartOpen = useClientStore((s) => s.cartOpen);
  // Acción de carga inicial del menú (se dispara una vez abajo).
  const loadMenu = useClientStore((s) => s.loadMenu);
  // Acción de agregar un plato al carrito desde el menú.
  const addToCart = useClientStore((s) => s.addToCart);
  // Acciones de cantidad/eliminación dentro del drawer del carrito.
  const increaseQty = useClientStore((s) => s.increaseQty);
  // Acción de bajar cantidad de una línea del carrito.
  const decreaseQty = useClientStore((s) => s.decreaseQty);
  // Acción de eliminar una línea completa del carrito.
  const removeItem = useClientStore((s) => s.removeItem);
  // Acción de abrir/cerrar el drawer del carrito.
  const setCartOpen = useClientStore((s) => s.setCartOpen);
  // Acción de descartar el aviso "agregado" tras unos segundos (toast local).
  const [toastVisible, setToastVisible] = useState(false);
  // Estado local para abrir la encuesta de experiencia post-pago.
  const [surveyOpen, setSurveyOpen] = useState(false);
  // Estado local para abrir el modal S.O.S. de llamada al mozo.
  const [sosOpen, setSosOpen] = useState(false);
  // Estado local para controlar el modal de bienvenida de primera visita (client-onboarding).
  const [welcomeOpen, setWelcomeOpen] = useState(() => {
    try {
      return !window.localStorage.getItem('mesasplit-onboarding');
    } catch {
      return true;
    }
  });
  // Estado local para el modal de solicitud de factura (client-factura).
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  // Estado local para el ítem alcohólico pendiente de verificación de edad (client-alcohol-verification).
  const [pendingAlcoholItem, setPendingAlcoholItem] = useState(null);

  // Store de división de cuenta (account-split).
  const splitOpen = useSplitStore((s) => s.open);
  const openSplit = useSplitStore((s) => s.openSplit);
  const closeSplit = useSplitStore((s) => s.closeSplit);

  // Carga el menú y el contexto de mesa UNA vez al montar la vista.
  useEffect(() => {
    // Invoca la acción del store que resuelve menu + contexto del servicio.
    loadMenu();
    // Sin deps: solo al montar (los datos del demo no cambian en sesión).
  }, [loadMenu]);

  // Agrupa el menú por categoría para ordenarlo en secciones leíbles.
  const menuByCategory = useMemo(() => {
    // Reduce el menú plano a un mapa {categoría → ítems}.
    return menu.reduce((groups, item) => {
      // Lee la categoría del ítem o usa "Otros" como grupo por defecto.
      const key = item.category ?? 'Otros';
      // Crea el arreglo del grupo si no existe aún.
      groups[key] = groups[key] ?? [];
      // Agrega el ítem al grupo correspondiente.
      groups[key].push(item);
      // Devuelve el mapa acumulado para la siguiente iteración.
      return groups;
      // Objeto vacío: acumulador inicial del reduce.
    }, {});
  }, [menu]);

  // Derivados del carrito para el CTA flotante (badge y total).
  const cartCount = useMemo(() => selectCartCount(cart), [cart]);
  // Total en CLP del carrito para el CTA flotante.
  const cartTotal = useMemo(() => selectCartTotal(cart), [cart]);

  // Handler de agregado: suma al carrito y muestra el toast informativo.
  const handleAdd = (item) => {
    // Si el ítem es alcohólico, requiere confirmación previa de mayoría de edad.
    if (item?.alcoholic) {
      setPendingAlcoholItem(item);
      return;
    }
    // Delega en la acción del store (suma o incrementa la línea).
    addToCart(item);
    // Enciende el toast de confirmación.
    setToastVisible(true);
    // Programa su ocultamiento a los 1.8s (auto-cierre del demo).
    window.setTimeout(() => setToastVisible(false), 1800);
  };

  // Handler de confirmación de mayoría de edad para ítem alcohólico.
  const handleConfirmAlcohol = () => {
    if (pendingAlcoholItem) {
      addToCart(pendingAlcoholItem);
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 1800);
    }
    setPendingAlcoholItem(null);
  };

  // Handler para gatillar la división de cuenta desde el carrito.
  const handleOpenSplitModal = (total) => {
    setCartOpen(false);
    openSplit(total);
  };

  return (
    // Contenedor claro de la vista cliente (docs/04: fondo brand-50).
    <main className="min-h-screen bg-brand-50 px-6 pb-32 pt-6">
      {/* Contenido centrado con ancho máximo de lectura cómoda. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Banner de contexto de mesa: identidad de la sesión del comensal. */}
        <header className="rounded-2xl bg-white p-5 shadow-soft">
          {/* Fila superior del banner: número de mesa y badge de sesión. */}
          <div className="flex items-center justify-between">
            {/* Título del banner con el número de mesa destacado. */}
            <h1 className="text-xl font-bold text-brand-900">Mesa {tableContext?.number ?? '—'}</h1>
            <div className="flex items-center gap-2">
              {/* Botón S.O.S. de llamada urgente al mozo (spec: siempre visible, rojo puro #EF4444 por ser emergencia). */}
              <button
                type="button"
                onClick={() => setSosOpen(true)}
                className="relative rounded-full bg-semantic-danger/10 px-3 py-1 text-xs font-bold text-semantic-danger border border-semantic-danger/40 hover:bg-semantic-danger/20 transition active:scale-95 animate-pulse"
              >
                🆘 S.O.S.
              </button>
              {/* Botón para abrir la encuesta de satisfacción. */}
              <button
                type="button"
                onClick={() => setSurveyOpen(true)}
                className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-500/20 border border-amber-300"
              >
                ★ Calificar Servicio
              </button>
              {/* Botón para solicitar factura electrónica demo (client-factura). */}
              <button
                type="button"
                onClick={() => setInvoiceOpen(true)}
                className="rounded-full bg-brand-900/10 px-3 py-1 text-xs font-bold text-brand-900 hover:bg-brand-900/20 border border-brand-900/30 transition active:scale-95"
              >
                📄 Solicitar Factura
              </button>
              {/* Badge con el código QR de la sesión (identidad de la mesa). */}
              <Badge variant="brand">Código {tableContext?.code ?? '••••'}</Badge>
            </div>
          </div>
          {/* Detalle de comensales y estado de la cuenta. */}
          <p className="mt-1 text-sm text-brand-800/70">
            {/* Cantidad de comensales sentados en la mesa. */}
            {tableContext?.guests ?? 0} comensales · Cuenta abierta
          </p>
        </header>

        {/* Banner de seguimiento de pedido en tiempo real (client-order-tracking). */}
        <OrderTrackingBanner hasActiveOrder={cart.length > 0} />

        {/* Sección de menú: itera las categorías agrupadas del useMemo. */}
        {loading ? (
          // Estado de carga: mensaje neutro mientras resuelve el servicio.
          <p className="py-10 text-center text-brand-800/60">Cargando menú…</p>
        ) : (
          // Lista de categorías del menú agrupadas.
          Object.entries(menuByCategory).map(([category, items]) => (
            // Bloque por categoría: título más los ítems del grupo.
            <section key={category}>
              {/* Título de la categoría del menú. */}
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-500">
                {category}
              </h2>
              {/* Lista de ítems de la categoría (tarjetas blancas). */}
              <div className="flex flex-col gap-3">
                {/* Renderiza una tarjeta por plato de la categoría. */}
                {items.map((item) => (
                  // Tarjeta de plato: datos del ítem + acción de agregar.
                  <article key={item.id} className="rounded-2xl bg-white p-4 shadow-soft">
                    {/* Fila del plato: info a la izquierda, acción a la derecha. */}
                    <div className="flex items-start gap-3">
                      {/* Bloque de nombre, descripción y alergias del plato. */}
                      <div className="min-w-0 flex-1">
                        {/* Nombre del plato con truncado para títulos largos. */}
                        <h3 className="font-semibold text-brand-900">{item.name}</h3>
                        {/* Descripción corta del plato (segunda línea). */}
                        <p className="text-sm text-brand-800/60">{item.description}</p>
                        {/* Chips de alergias: solo si el plato declara alguna. */}
                        {(item.allergens ?? []).length > 0 && (
                          // Fila de chips de alergia del plato.
                          <div className="mt-2 flex flex-wrap gap-1">
                            {/* Renderiza un chip por alergia declarada. */}
                            {item.allergens.map((allergen) => (
                              // Chip rojo: salud/seguridad, el rojo es reservado.
                              <span
                                key={allergen}
                                className="rounded-full bg-semantic-danger/10 px-2 py-0.5 text-[11px] font-semibold text-semantic-danger"
                              >
                                {/* Nombre de la alergia en el chip. */}
                                {allergen}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Columna derecha: precio y botón de agregado. */}
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        {/* Precio del plato en CLP con la marca de CTA. */}
                        <p className="font-bold text-brand-900">{formatCurrency(item.price)}</p>
                        {/* Botón agregar al carrito (CTA compacto de marca). */}
                        <button
                          type="button"
                          onClick={() => handleAdd(item)}
                          className="rounded-xl border border-brand-500 px-4 py-2 text-sm font-semibold text-brand-500 transition hover:bg-brand-500 hover:text-white active:scale-95"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}

        {/* Drawer del carrito compartido (bottom-sheet reutiliza Modal base). */}
        <SharedCartDrawer
          // Visibilidad controlada por el store del slice.
          open={cartOpen}
          // Cierra el drawer desde el overlay o el botón ✕.
          onClose={() => setCartOpen(false)}
          // Líneas actuales del carrito para listar.
          cart={cart}
          // Sube cantidad de una línea.
          onIncrease={increaseQty}
          // Baja cantidad de una línea.
          onDecrease={decreaseQty}
          // Elimina una línea completa.
          onRemove={removeItem}
          // Abre el modal de división de cuenta (account-split).
          onOpenSplit={handleOpenSplitModal}
        />

        {/* Modal de división de cuenta de la Mesa Virtual (account-split). */}
        <BillSplitterModal open={splitOpen} onClose={closeSplit} />

        {/* Modal de encuesta de satisfacción y propina digital (customer-survey-ratings). */}
        <CustomerSurveyModal
          open={surveyOpen}
          onClose={() => setSurveyOpen(false)}
          totalBill={cartTotal > 0 ? cartTotal : 20000}
        />

        {/* Modal S.O.S. de llamada urgente al mozo (sos-waiter-call). */}
        <SosModal
          open={sosOpen}
          onClose={() => setSosOpen(false)}
          tableId={tableContext?.id ?? 'table-01'}
        />

        {/* Modal de bienvenida de primera visita (client-onboarding). */}
        <WelcomeModal
          open={welcomeOpen}
          onClose={() => setWelcomeOpen(false)}
        />

        {/* Modal de solicitud de factura demo (client-factura). */}
        <InvoiceRequestModal
          open={invoiceOpen}
          totalAmount={cartTotal}
          onClose={() => setInvoiceOpen(false)}
        />

        {/* Modal de verificación de mayoría de edad para ítems alcohólicos (client-alcohol-verification). */}
        <AgeVerificationModal
          open={Boolean(pendingAlcoholItem)}
          item={pendingAlcoholItem}
          onConfirm={handleConfirmAlcohol}
          onClose={() => setPendingAlcoholItem(null)}
        />

        {/* Toast de confirmación al agregar un plato (base shared/ui). */}
        {toastVisible && <Toast variant="success" message="Plato agregado al carrito" />}
      </div>

      {/* CTA flotante del carrito: affordance SIEMPRE visible (spec). */}
      <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-6">
        {/* Botón del carrito: badge de unidades + total, abre el drawer. */}
        <Button variant="primary" className="w-full max-w-3xl" onClick={() => setCartOpen(true)}>
          {/* Etiqueta del botón con la cantidad de ítems del carrito. */}
          <span>Ver carrito</span>
          {/* Chip con la cantidad de unidades (visible cuando hay ítems). */}
          {cartCount > 0 && (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
              {/* Valor numérico de unidades del carrito. */}
              {cartCount}
            </span>
          )}
          {/* Total acumulado del carrito en CLP. */}
          <span className="ml-auto">{formatCurrency(cartTotal)}</span>
        </Button>
      </div>
    </main>
  );
}
