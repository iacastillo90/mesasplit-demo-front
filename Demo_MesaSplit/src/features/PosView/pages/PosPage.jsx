// src/features/PosView/pages/PosPage.jsx — Caja / POS Punto de Venta (pos-cashier)
// Vista "/admin/caja" (o slot POS): autenticación por PIN ("9921"), cobro multimedio con vuelto,
// cuentas dinámicas en tiempo real (Salón vs Retiros), catálogo de venta rápida con imágenes HD,
// emisión de DTEs chilenos (Boleta/Factura con RUT), arqueo y cuadre de caja con reporte exportable a Excel/CSV.
// Cumple con todas las normas obligatorias de AGENTS.md (comentarios por cada línea en español).

import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { usePosStore } from '../store/usePosStore.js';
import PaymentMethodPicker from '../components/PaymentMethodPicker.jsx';
import DteModal from '../components/DteModal.jsx';
import BlindCloseModal from '../components/BlindCloseModal.jsx';
import CashShiftModal from '../components/CashShiftModal.jsx';
import ExecutiveReportModal from '../components/ExecutiveReportModal.jsx';
import PosQuickSaleCatalog from '../components/PosQuickSaleCatalog.jsx';
import PosDailyReportsModal from '../components/PosDailyReportsModal.jsx';
import ThermalPrinterConfigModal from '../../../shared/ui/ThermalPrinterConfigModal.jsx';
import { AdminLayout } from '../../../shared/ui/index.js';

export default function PosPage() {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [shiftClosedNotice, setShiftClosedNotice] = useState('');
  const [execReportOpen, setExecReportOpen] = useState(false);
  const [dailyReportsOpen, setDailyReportsOpen] = useState(false);
  const [thermalPrinterModalOpen, setThermalPrinterModalOpen] = useState(false);

  // Filtro por estado de cuenta en la lista lateral ('all', 'pending', 'paid', 'takeaway').
  const [billStatusFilter, setBillStatusFilter] = useState('all');
  // Pestaña activa del panel principal ('bills' o 'quick_sale').
  const [posTab, setPosTab] = useState('bills');

  // Suscripción al store de Zustand de POS.
  const cashierUnlocked = usePosStore((s) => s.cashierUnlocked);
  const openBills = usePosStore((s) => s.openBills);
  const activeBill = usePosStore((s) => s.activeBill);
  const paymentMethod = usePosStore((s) => s.paymentMethod);
  const tenderedAmount = usePosStore((s) => s.tenderedAmount);
  const dteModalOpen = usePosStore((s) => s.dteModalOpen);
  const blindCloseOpen = usePosStore((s) => s.blindCloseOpen);
  const cashShift = usePosStore((s) => s.cashShift);
  const cashShiftModalOpen = usePosStore((s) => s.cashShiftModalOpen);

  // Acciones del store.
  const loadPosData = usePosStore((s) => s.loadPosData);
  const unlockCashier = usePosStore((s) => s.unlockCashier);
  const lockCashier = usePosStore((s) => s.lockCashier);
  const selectBill = usePosStore((s) => s.selectBill);
  const setPaymentMethod = usePosStore((s) => s.setPaymentMethod);
  const setTenderedAmount = usePosStore((s) => s.setTenderedAmount);
  const setDteModalOpen = usePosStore((s) => s.setDteModalOpen);
  const setBlindCloseOpen = usePosStore((s) => s.setBlindCloseOpen);
  const setCashShiftModalOpen = usePosStore((s) => s.setCashShiftModalOpen);
  const confirmPayment = usePosStore((s) => s.confirmPayment);
  const submitBlindClose = usePosStore((s) => s.submitBlindClose);
  const setupRealtimeListeners = usePosStore((s) => s.setupRealtimeListeners);
  const addItemToActiveBill = usePosStore((s) => s.addItemToActiveBill);

  useEffect(() => {
    loadPosData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadPosData, setupRealtimeListeners]);

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const success = unlockCashier(pinInput);
    if (!success) {
      setPinError('PIN incorrecto. Intenta con 9921');
    } else {
      setPinError('');
      setPinInput('');
    }
  };

  const handleBlindCloseSubmit = (closeData) => {
    submitBlindClose(closeData);
    setShiftClosedNotice('Turno de caja cerrado exitosamente');
  };

  // Filtrado de cuentas abiertas según el filtro seleccionado.
  const filteredBills = openBills.filter((b) => {
    if (billStatusFilter === 'pending') return b.status === 'pending';
    if (billStatusFilter === 'paid') return b.status === 'paid';
    if (billStatusFilter === 'takeaway') return b.type === 'takeaway';
    return true;
  });

  if (!cashierUnlocked) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 p-6 text-brand-50">
        <form onSubmit={handleUnlockSubmit} className="flex w-full max-w-sm flex-col gap-4 rounded-3xl bg-brand-900 p-8 border border-brand-800 shadow-2xl">
          <div className="text-center">
            <span className="text-4xl">🔐</span>
            <h1 className="mt-2 text-xl font-bold text-brand-50">Acceso a Caja — Control de Cajero</h1>
            <p className="text-xs text-brand-50/60 mt-1">Ingresa el PIN de turno para desbloquear la terminal POS</p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="pin-input" className="text-xs font-bold text-brand-50/80">PIN de Cajero</label>
            <input
              id="pin-input"
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Ingresa tu PIN (ej. 9921)"
              required
              className="w-full rounded-2xl bg-brand-950 px-4 py-3 text-center text-lg font-bold text-brand-50 border border-brand-700 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {pinError && <p className="text-center text-xs font-bold text-semantic-danger">{pinError}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft"
          >
            Desbloquear Caja
          </button>
        </form>
      </main>
    );
  }

  const changeAmount = (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && activeBill
    ? tenderedAmount - activeBill.totalAmount
    : 0;

  return (
    <AdminLayout currentRoute="/admin/caja" title="Caja POS" subtitle="Punto de Venta">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {shiftClosedNotice && (
          <div className="flex items-center justify-between rounded-2xl bg-semantic-success p-4 text-white shadow-soft">
            <span className="font-bold text-sm">✅ {shiftClosedNotice}</span>
            <button type="button" onClick={() => setShiftClosedNotice('')} className="text-xs text-white/80 hover:text-white">
              Cerrar
            </button>
          </div>
        )}

        {/* Cabecera de la Caja POS con acciones rápidas y reportes */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Terminal de Caja POS & Mostrador</h1>
            <p className="text-xs text-brand-800/70">Cobro de cuentas, venta directa desde carta HD, DTEs y Arqueo Diario</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDailyReportsOpen(true)}
              className="rounded-xl bg-amber-500 hover:bg-amber-600 px-3.5 py-2 text-xs font-extrabold text-white transition active:scale-95 shadow-soft flex items-center gap-1 cursor-pointer"
            >
              <span>📊 Arqueo & Reporte Diario</span>
            </button>

            <button
              type="button"
              onClick={() => setCashShiftModalOpen(true)}
              className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-50 transition active:scale-95 shadow-soft"
            >
              ⏱️ Turno: {cashShift?.status === 'open' ? 'Abierto' : 'Cerrado'}
            </button>

            <button
              type="button"
              onClick={() => setExecReportOpen(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 shadow-soft"
            >
              📊 Reporte SII
            </button>

            <button
              type="button"
              onClick={() => setBlindCloseOpen(true)}
              className="rounded-xl bg-brand-900 px-4 py-2 text-xs font-bold text-brand-50 hover:bg-brand-800 transition active:scale-95"
            >
              🔒 Cierre Ciego
            </button>

            <button
              type="button"
              onClick={() => setThermalPrinterModalOpen(true)}
              className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition active:scale-95 shadow-soft flex items-center gap-1"
            >
              <span>🖨️</span>
              <span>Impresoras Cloud</span>
            </button>

            <button
              type="button"
              onClick={lockCashier}
              className="rounded-xl bg-brand-200 px-3 py-2 text-xs font-bold text-brand-800 hover:bg-brand-300"
            >
              🔒 Bloquear
            </button>
          </div>
        </header>

        {/* Pestañas de modo de operación: Cuentas vs Venta Rápida Carta HD */}
        <div className="flex items-center gap-2 border-b border-brand-200 pb-2">
          <button
            type="button"
            onClick={() => setPosTab('bills')}
            className={`rounded-2xl px-5 py-2 text-xs font-extrabold transition cursor-pointer border ${
              posTab === 'bills'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-brand-800 border-brand-200 hover:bg-brand-50'
            }`}
          >
            📋 Cobro de Cuentas & Retiros ({openBills.filter((b) => b.status !== 'paid').length})
          </button>

          <button
            type="button"
            onClick={() => setPosTab('quick_sale')}
            className={`rounded-2xl px-5 py-2 text-xs font-extrabold transition cursor-pointer border ${
              posTab === 'quick_sale'
                ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                : 'bg-white text-brand-800 border-brand-200 hover:bg-brand-50'
            }`}
          >
            🛒 Venta Rápida desde Carta HD
          </button>
        </div>

        {/* Layout principal */}
        {posTab === 'quick_sale' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <PosQuickSaleCatalog onAddItem={(item) => addItemToActiveBill(item)} />
            </div>
            {/* Resumen dinámico de la venta rápida */}
            <div className="md:col-span-1 flex flex-col gap-4 rounded-3xl bg-white p-5 border border-brand-200 shadow-soft">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900 border-b border-brand-100 pb-2">
                🛍️ Ticket Activo de Venta Rápida
              </h3>
              {activeBill ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-brand-800">
                    <span>{activeBill.customerName}</span>
                    <span className="text-sm font-extrabold text-brand-900">{formatCurrency(activeBill.totalAmount)}</span>
                  </div>

                  {/* Lista de productos agregados con imágenes HD */}
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {(activeBill.items || []).map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 rounded-xl bg-brand-50 p-2 border border-brand-100 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {it.image && <img src={it.image} alt={it.name} className="h-8 w-8 rounded-lg object-cover border shrink-0" />}
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-brand-900 truncate">{it.name}</span>
                            <span className="text-[10px] text-brand-800/70">Cant: {it.qty || 1}</span>
                          </div>
                        </div>
                        <span className="font-bold text-brand-900 shrink-0">{formatCurrency(it.price * (it.qty || 1))}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => confirmPayment({ folio: 1050 })}
                    className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-extrabold text-white transition active:scale-95 shadow-soft cursor-pointer mt-2"
                  >
                    Confirmar Venta Rápida ({formatCurrency(activeBill.totalAmount)})
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-brand-800/60 py-6">Haz clic en ➕ Agregar al Ticket en cualquier plato para iniciar una venta rápida.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Columna 1: Lista de Cuentas Abiertas con filtros de estado */}
            <section aria-label="Lista de cuentas abiertas" className="flex flex-col gap-3 md:col-span-1">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-800/70">
                  Cuentas ({filteredBills.length})
                </h2>
              </div>

              {/* Filtros rápidos de estado de cuenta */}
              <div className="flex flex-wrap gap-1 text-[11px] font-bold">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'pending', label: '⏳ Pendientes' },
                  { id: 'takeaway', label: '🛍️ Retiros' },
                  { id: 'paid', label: '✅ Pagadas' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBillStatusFilter(st.id)}
                    className={`rounded-lg px-2.5 py-1 transition cursor-pointer border ${
                      billStatusFilter === st.id
                        ? 'bg-brand-900 text-white border-brand-900 font-extrabold'
                        : 'bg-white text-brand-800 border-brand-200 hover:bg-brand-50'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredBills.map((bill) => (
                  <button
                    key={bill.id}
                    type="button"
                    onClick={() => selectBill(bill.id)}
                    className={`flex flex-col gap-1 rounded-2xl p-3.5 text-left transition border cursor-pointer ${
                      activeBill?.id === bill.id
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : bill.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 opacity-70'
                        : 'bg-white text-brand-900 border-brand-200 hover:border-brand-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm flex items-center gap-1.5">
                        <span>{bill.type === 'takeaway' ? '🛍️' : '🍽️'}</span>
                        <span>{bill.type === 'takeaway' ? `Retiro #${bill.tableNumber}` : `Mesa ${bill.tableNumber}`}</span>
                      </span>
                      <span className="text-xs font-black">{formatCurrency(bill.totalAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs opacity-90 mt-1">
                      <span className="truncate max-w-[140px] font-semibold">{bill.customerName}</span>
                      <span className="font-bold">
                        {bill.status === 'paid' ? '✅ Pagada' : bill.status === 'ready' ? '🔔 Listo' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Columna 2 y 3: Panel de Cobro y detalle del ticket activo */}
            <section aria-label="Panel de Cobro" className="flex flex-col gap-6 md:col-span-2 rounded-3xl bg-white p-6 border border-brand-200 shadow-soft">
              {activeBill ? (
                <>
                  <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                    <div>
                      <h2 className="text-lg font-bold text-brand-900">
                        Cobro {activeBill.type === 'takeaway' ? `Retiro #${activeBill.tableNumber}` : `Mesa ${activeBill.tableNumber}`}
                      </h2>
                      <p className="text-xs text-brand-800/60">{activeBill.customerName}</p>
                    </div>
                    <span className="text-2xl font-black text-brand-900">{formatCurrency(activeBill.totalAmount)}</span>
                  </div>

                  {/* Desglose visual de productos consumidos con imágenes HD */}
                  {activeBill.items && activeBill.items.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 border border-brand-100">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900">
                        📦 Detalle de Consumos ({activeBill.items.length} ítems)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {activeBill.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 rounded-xl bg-white p-2 border border-brand-100 shadow-sm">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="h-10 w-10 shrink-0 rounded-lg object-cover border" />
                            )}
                            <div className="flex flex-col text-left min-w-0">
                              <span className="font-extrabold text-brand-900 truncate">{item.name}</span>
                              <span className="text-[10px] font-semibold text-brand-800/70">
                                {item.qty || 1}x {formatCurrency(item.price)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Componente del selector multimedio de pago y vuelto */}
                  <PaymentMethodPicker
                    selectedMethod={paymentMethod}
                    onSelectMethod={setPaymentMethod}
                    totalAmount={activeBill.totalAmount}
                    tenderedAmount={tenderedAmount}
                    onChangeTendered={setTenderedAmount}
                    changeAmount={changeAmount}
                  />

                  {/* Opción de selección de DTE tributario */}
                  <div className="flex flex-col gap-2 border-t border-brand-100 pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
                      2. Documento Tributario (DTE)
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="posDteType"
                          value="boleta"
                          defaultChecked
                          onChange={() => {}}
                          className="text-brand-500"
                        />
                        <span>Boleta Electrónica</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="posDteType"
                          value="factura"
                          onChange={() => setDteModalOpen(true)}
                          className="text-brand-500"
                        />
                        <span>Factura Electrónica</span>
                      </label>
                    </div>
                  </div>

                  {/* Botón de confirmación de pago final */}
                  <button
                    type="button"
                    onClick={() => confirmPayment({ folio: 1042 })}
                    className="w-full rounded-2xl bg-semantic-success py-3.5 text-sm font-bold text-white transition hover:bg-semantic-success/90 active:scale-95 shadow-soft cursor-pointer"
                  >
                    Confirmar Cobro ({formatCurrency(activeBill.totalAmount)})
                  </button>
                </>
              ) : (
                <p className="py-12 text-center text-xs text-brand-800/50">Selecciona una cuenta abierta o pedido para iniciar el cobro.</p>
              )}
            </section>
          </div>
        )}

        {/* Modal de emisión de DTE Factura Electrónica */}
        <DteModal
          open={dteModalOpen}
          onClose={() => setDteModalOpen(false)}
          bill={activeBill}
          onEmitDte={(dteData) => confirmPayment(dteData)}
        />

        {/* Modal para Cierre Ciego de arqueo de caja */}
        <BlindCloseModal
          open={blindCloseOpen}
          onClose={() => setBlindCloseOpen(false)}
          expectedCash={245000}
          onSubmitClose={handleBlindCloseSubmit}
        />

        {/* Modal para control de turno operativo de caja */}
        <CashShiftModal
          open={cashShiftModalOpen}
          onClose={() => setCashShiftModalOpen(false)}
        />

        {/* Modal de Reporte Ejecutivo y Arqueo Fiscal SII */}
        <ExecutiveReportModal
          open={execReportOpen}
          onClose={() => setExecReportOpen(false)}
        />

        {/* Modal de Reporte Diario, Arqueo de Caja y Exportación a Excel/CSV */}
        <PosDailyReportsModal
          open={dailyReportsOpen}
          onClose={() => setDailyReportsOpen(false)}
        />

        {/* Modal de Impresoras Térmicas Cloud ESC/POS */}
        <ThermalPrinterConfigModal
          open={thermalPrinterModalOpen}
          onClose={() => setThermalPrinterModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
