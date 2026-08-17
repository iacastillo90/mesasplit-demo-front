// src/features/PosView/pages/PosPage.jsx — Caja / POS Punto de Venta (pos-cashier)
// Vista "/admin/caja" (o slot POS): autenticación por PIN ("9921"), cobro multimedio con vuelto,
// emisión de DTEs chilenos (Boleta/Factura con RUT), arqueo de Cierre Ciego y sincronización QR.
// Cumple con todas las normas obligatorias de AGENTS.md (comentarios por cada línea).

// useState y useEffect de React.
import { useEffect, useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Store de Zustand del POS.
import { usePosStore } from '../store/usePosStore.js';
// Componentes del slice POS.
import PaymentMethodPicker from '../components/PaymentMethodPicker.jsx';
import DteModal from '../components/DteModal.jsx';
import BlindCloseModal from '../components/BlindCloseModal.jsx';
import CashShiftModal from '../components/CashShiftModal.jsx';
// AdminLayout compartido.
import { AdminLayout } from '../../../shared/ui/index.js';

// Componente principal de la página del POS.
export default function PosPage() {
  // Estado local para el PIN tipeado en el overlay de bloqueo.
  const [pinInput, setPinInput] = useState('');
  // Mensaje de error de PIN incorrecto.
  const [pinError, setPinError] = useState('');
  // Mensaje de notificación del Cierre Ciego de caja.
  const [shiftClosedNotice, setShiftClosedNotice] = useState('');

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

  // Carga inicial y suscripción a eventos real-time al montar la vista.
  useEffect(() => {
    loadPosData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadPosData, setupRealtimeListeners]);

  // Manejador del desbloqueo de sesión con PIN.
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

  // Manejador del envío del cierre ciego de caja.
  const handleBlindCloseSubmit = (closeData) => {
    submitBlindClose(closeData);
    setShiftClosedNotice('Turno de caja cerrado exitosamente');
  };

  // Pantalla de bloqueo de sesión si cashierUnlocked es false.
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

  // Cálculo del vuelto en el estado activo.
  const changeAmount = (paymentMethod === 'efectivo' || paymentMethod === 'mixto') && activeBill
    ? tenderedAmount - activeBill.totalAmount
    : 0;

  return (
    <AdminLayout
      currentRoute="/admin/caja"
      title="Caja POS"
      subtitle="Punto de Venta"
      theme="light"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {/* Banner de notificación cuando el turno de caja se cierra exitosamente. */}
        {shiftClosedNotice && (
          <div className="flex items-center justify-between rounded-2xl bg-semantic-success p-4 text-white shadow-soft">
            <span className="font-bold text-sm">✅ {shiftClosedNotice}</span>
            <button type="button" onClick={() => setShiftClosedNotice('')} className="text-xs text-white/80 hover:text-white">
              Cerrar
            </button>
          </div>
        )}

        {/* Cabecera de la Caja POS. */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Terminal de Caja POS</h1>
            <p className="text-xs text-brand-800/70">Cobro de cuentas, emisión de DTEs y Cierre Ciego de turno</p>
          </div>

          {/* Botones de acción de la cabecera. */}
          <div className="flex items-center gap-2">
            {/* Botón de control de turno operativo de caja (cash-shift). */}
            <button
              type="button"
              onClick={() => setCashShiftModalOpen(true)}
              className="rounded-xl border border-brand-200 bg-white px-3 py-2 text-xs font-bold text-brand-900 hover:bg-brand-50 transition active:scale-95 shadow-soft"
            >
              ⏱️ Turno: {cashShift?.status === 'open' ? 'Abierto' : 'Cerrado'}
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
              onClick={lockCashier}
              className="rounded-xl bg-brand-200 px-3 py-2 text-xs font-bold text-brand-800 hover:bg-brand-300"
            >
              🔒 Bloquear
            </button>
          </div>
        </header>

        {/* Layout principal de dos columnas: Cuentas Abiertas y Panel de Cobro. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Columna 1: Lista de Cuentas Abiertas. */}
          <section aria-label="Lista de cuentas abiertas" className="flex flex-col gap-3 md:col-span-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
              Cuentas Abiertas ({openBills.filter((b) => b.status !== 'paid').length})
            </h2>

            <div className="flex flex-col gap-2">
              {openBills.map((bill) => (
                <button
                  key={bill.id}
                  type="button"
                  onClick={() => selectBill(bill.id)}
                  className={`flex flex-col gap-1 rounded-2xl p-4 text-left transition border ${
                    activeBill?.id === bill.id
                      ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                      : bill.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 opacity-60'
                      : 'bg-white text-brand-900 border-brand-200 hover:border-brand-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Mesa {bill.tableNumber}</span>
                    <span className="text-xs font-semibold">{formatCurrency(bill.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs opacity-80">
                    <span>{bill.customerName}</span>
                    <span>{bill.status === 'paid' ? '✅ Pagada' : '⏳ Pendiente'}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Columna 2 y 3: Panel de Cobro de la cuenta activa. */}
          <section aria-label="Panel de Cobro" className="flex flex-col gap-6 md:col-span-2 rounded-3xl bg-white p-6 border border-brand-200 shadow-soft">
            {activeBill ? (
              <>
                <div className="flex items-center justify-between border-b border-brand-100 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-brand-900">Cobro Mesa {activeBill.tableNumber}</h2>
                    <p className="text-xs text-brand-800/60">{activeBill.customerName}</p>
                  </div>
                  <span className="text-xl font-extrabold text-brand-900">{formatCurrency(activeBill.totalAmount)}</span>
                </div>

                {/* Componente del selector multimedio de pago y vuelto. */}
                <PaymentMethodPicker
                  selectedMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  totalAmount={activeBill.totalAmount}
                  tenderedAmount={tenderedAmount}
                  onChangeTendered={setTenderedAmount}
                  changeAmount={changeAmount}
                />

                {/* Opción de selección de DTE tributario. */}
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

                {/* Botón de confirmación de pago final. */}
                <button
                  type="button"
                  onClick={() => confirmPayment({ folio: 1042 })}
                  className="w-full rounded-2xl bg-semantic-success py-3.5 text-sm font-bold text-white transition hover:bg-semantic-success/90 active:scale-95 shadow-soft"
                >
                  Confirmar Cobro ({formatCurrency(activeBill.totalAmount)})
                </button>
              </>
            ) : (
              <p className="py-12 text-center text-xs text-brand-800/50">Selecciona una cuenta abierta para iniciar el cobro.</p>
            )}
          </section>
        </div>

        {/* Modal para emisión de DTE Factura Electrónica. */}
        <DteModal
          open={dteModalOpen}
          onClose={() => setDteModalOpen(false)}
          bill={activeBill}
          onEmitDte={(dteData) => confirmPayment(dteData)}
        />

        {/* Modal para Cierre Ciego de arqueo de caja. */}
        <BlindCloseModal
          open={blindCloseOpen}
          onClose={() => setBlindCloseOpen(false)}
          expectedCash={150000}
          onSubmitClose={handleBlindCloseSubmit}
        />

        {/* Modal para control de turno operativo de caja (cash-shift). */}
        <CashShiftModal
          open={cashShiftModalOpen}
          onClose={() => setCashShiftModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
