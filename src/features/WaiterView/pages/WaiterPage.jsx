// src/features/WaiterView/pages/WaiterPage.jsx — PWA del Garzón / Mozo (waiter-pwa + sos-waiter-call)
// Pantalla principal del mozo: marcaje de turno e inicio de sesión (Ley 40h), grilla de mesas
// asignadas con semáforos de estado, toma de pedido con una mano y badges de cantidad,
// Escudo de Alergias (#EF4444), Course Control (course.fire), anulación por PIN (alert.fraud),
// liberación de mesa (table.status_changed) y badge de alerta S.O.S. (call.waiter).
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por línea).

import { useEffect, useState } from 'react';
import { Badge, Button, AppHeader, AppFooter } from '../../../shared/ui/index.js';
import { useWaiterStore } from '../store/useWaiterStore.js';
import TableGrid from '../components/TableGrid.jsx';
import OrderPad from '../components/OrderPad.jsx';
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
import { selectWaiterPerformance } from '../services/performanceService.js';
import WaiterPerformanceCard from '../components/WaiterPerformanceCard.jsx';
import { useDemoStore } from '../../../store/useDemoStore.js';
import QuickSplitCalculatorModal from '../components/QuickSplitCalculatorModal.jsx';

const bus = createRealtimeBus('mesasplit');

export default function WaiterPage({ bus: busProp }) {
  const shiftStatus = useWaiterStore((s) => s.shiftStatus);
  const waiterName = useWaiterStore((s) => s.waiterName);
  const tables = useWaiterStore((s) => s.tables);
  const selectedTableId = useWaiterStore((s) => s.selectedTableId);
  const orderDraft = useWaiterStore((s) => s.orderDraft);
  const selectedCourse = useWaiterStore((s) => s.selectedCourse);
  const toastMessage = useWaiterStore((s) => s.toastMessage);

  const users = useDemoStore((s) => s.users);

  const clockIn = useWaiterStore((s) => s.clockIn);
  const loadTables = useWaiterStore((s) => s.loadTables);
  const selectTable = useWaiterStore((s) => s.selectTable);
  const addToDraft = useWaiterStore((s) => s.addToDraft);
  const toggleAllergyFlag = useWaiterStore((s) => s.toggleAllergyFlag);
  const setCourse = useWaiterStore((s) => s.setCourse);
  const fireCourse = useWaiterStore((s) => s.fireCourse);
  const voidItemWithPin = useWaiterStore((s) => s.voidItemWithPin);
  const releaseTable = useWaiterStore((s) => s.releaseTable);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [sosAlert, setSosAlert] = useState(null);
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (shiftStatus === 'clocked_in') {
      loadTables();
    }
  }, [shiftStatus, loadTables]);

  useEffect(() => {
    const handleSos = (payload) => {
      setSosAlert(payload);
    };

    const unsub = (busProp ?? bus).subscribe('call.waiter', handleSos);
    return () => unsub?.();
  }, [busProp]);

  const handleClockIn = (e) => {
    e.preventDefault();
    const success = clockIn(pinInput);
    if (!success) {
      setPinError('PIN de garzón inválido. Usa 1234 para demo.');
    } else {
      setPinError('');
    }
  };

  const activeTable = tables.find((t) => t.id === selectedTableId) ?? null;

  // Si el turno no está activo, muestra la pantalla de marcaje (Ley 40 Horas).
  if (shiftStatus === 'clocked_out') {
    return (
      <div className="flex flex-col min-h-screen bg-brand-950 text-brand-50">
        <AppHeader title="Vista Garzón / Mozo" subtitle="Sin Turno" currentRoute="/garzon" theme="dark" />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md rounded-2xl bg-brand-900 p-6 shadow-2xl border border-brand-800 flex flex-col gap-6">
            <div className="flex flex-col gap-1 text-center">
              <span className="text-3xl">⏱️</span>
              <h1 className="text-xl font-bold text-brand-50">Control de Turno — Ley 40 Horas</h1>
              <p className="text-xs text-brand-50/70">
                Ingresa tu PIN de mozo para registrar el marcaje de entrada y desbloquear tus mesas.
              </p>
            </div>

            <form onSubmit={handleClockIn} className="flex flex-col gap-4">
              <div>
                <label htmlFor="garzon-pin" className="block text-xs font-bold text-brand-50/80 mb-1">
                  PIN de Garzón (Demo: 1234)
                </label>
                <input
                  id="garzon-pin"
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Ingresa tu PIN"
                  className="w-full rounded-xl bg-brand-800 p-3 text-center text-2xl font-bold tracking-widest text-brand-50 border border-brand-800 focus:border-brand-500 focus:outline-none"
                />
              </div>

              {pinError && <p className="text-xs font-bold text-semantic-danger text-center">{pinError}</p>}

              <Button variant="primary" type="submit" className="w-full">
                Iniciar Turno
              </Button>
            </form>
          </div>
        </main>
        <AppFooter theme="dark" />
      </div>
    );
  }

  // Vista activa de la PWA del garzón una vez iniciado el turno.
  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      <AppHeader title="Vista Garzón / Mozo" subtitle={waiterName} currentRoute="/garzon" theme="light" />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-900">Garzón</h1>
              <p className="text-sm text-brand-800/60">Turno tarde · Salón principal</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalcOpen(true)}
                className="rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-500/20 border border-emerald-300 transition active:scale-95 flex items-center gap-1"
              >
                🧮 Cobro Rápido
              </button>
              <Badge variant="brand">{waiterName}</Badge>
            </div>
          </header>

          {sosAlert && (
            <div
              className="flex items-center justify-between rounded-2xl bg-semantic-danger/10 border border-semantic-danger/40 px-4 py-3 shadow-soft"
              data-testid="sos-alert-banner"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">🆘</span>
                <div>
                  <p className="text-xs font-bold text-semantic-danger">
                    S.O.S. — {sosAlert.tableId ?? 'Mesa'}
                  </p>
                  <p className="text-[11px] text-brand-800/70">{sosAlert.reason}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSosAlert(null)}
                className="rounded-xl bg-semantic-danger/10 px-3 py-1 text-xs font-bold text-semantic-danger hover:bg-semantic-danger/20"
              >
                Atendido
              </button>
            </div>
          )}

          <TableGrid
            tables={tables}
            selectedTableId={selectedTableId}
            onSelectTable={selectTable}
          />

          <WaiterPerformanceCard
            performance={selectWaiterPerformance('pedro-soto', users, tables)}
          />

          <OrderPad
            table={activeTable}
            orderDraft={orderDraft}
            selectedCourse={selectedCourse}
            toastMessage={toastMessage}
            onAddToCart={addToDraft}
            onToggleAllergy={toggleAllergyFlag}
            onSelectCourse={setCourse}
            onMarchFondo={fireCourse}
            onVoidItem={voidItemWithPin}
            onReleaseTable={releaseTable}
          />

          {/* Modal de calculadora de cobro rápido al paso en mesa */}
          <QuickSplitCalculatorModal
            open={calcOpen}
            onClose={() => setCalcOpen(false)}
            tableNumber={activeTable?.number ?? '04'}
          />
        </div>
      </main>
      <AppFooter theme="light" />
    </div>
  );
}
