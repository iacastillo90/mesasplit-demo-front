// src/features/WaiterView/pages/WaiterPage.jsx — PWA del Garzón / Mozo (waiter-pwa + sos-waiter-call)
// Pantalla principal del mozo: marcaje de turno e inicio de sesión (Ley 40h), grilla de mesas
// asignadas con semáforos de estado, toma de pedido con una mano y badges de cantidad,
// Escudo de Alergias (#EF4444), Course Control (course.fire), anulación por PIN (alert.fraud),
// liberación de mesa (table.status_changed) y badge de alerta S.O.S. (call.waiter).
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por línea).

// useEffect y useState de React para manejar el marcaje de turno inicial y las alertas S.O.S.
import { useEffect, useState } from 'react';
// Badge y Button compartilhados de UI.
import { Badge, Button } from '../../../shared/ui/index.js';
// Store de estado del garzón.
import { useWaiterStore } from '../store/useWaiterStore.js';
// Componente de la grilla de mesas asignadas.
import TableGrid from '../components/TableGrid.jsx';
// Componente del panel de comanda y catálogo táctil.
import OrderPad from '../components/OrderPad.jsx';
// Bus en tiempo real para suscribirse al evento call.waiter (S.O.S. de cliente).
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';
// Selector puro de rendimiento del garzón (waiter-performance).
import { selectWaiterPerformance } from '../services/performanceService.js';
// Tarjeta presentacional de rendimiento.
import WaiterPerformanceCard from '../components/WaiterPerformanceCard.jsx';
// Store demo global para leer la lista de usuarios.
import { useDemoStore } from '../../../store/useDemoStore.js';

// Instancia del bus de eventos para la vista del garzón.
const bus = createRealtimeBus('mesasplit');

// Componente principal WaiterPage.
// Acepta una prop opcional `bus` (inyección de dependencia) para permitir que los
// tests capten la suscripción al tópico call.waiter sin alterar el comportamiento real.
export default function WaiterPage({ bus: busProp }) {
  // Suscripción a las propiedades del store de garzón.
  const shiftStatus = useWaiterStore((s) => s.shiftStatus);
  const waiterName = useWaiterStore((s) => s.waiterName);
  const tables = useWaiterStore((s) => s.tables);
  const selectedTableId = useWaiterStore((s) => s.selectedTableId);
  const orderDraft = useWaiterStore((s) => s.orderDraft);
  const selectedCourse = useWaiterStore((s) => s.selectedCourse);
  const toastMessage = useWaiterStore((s) => s.toastMessage);

  // Lista de usuarios para el selector de rendimiento.
  const users = useDemoStore((s) => s.users);

  // Acciones expuestas por el store.
  const clockIn = useWaiterStore((s) => s.clockIn);
  const loadTables = useWaiterStore((s) => s.loadTables);
  const selectTable = useWaiterStore((s) => s.selectTable);
  const addToDraft = useWaiterStore((s) => s.addToDraft);
  const toggleAllergyFlag = useWaiterStore((s) => s.toggleAllergyFlag);
  const setCourse = useWaiterStore((s) => s.setCourse);
  const fireCourse = useWaiterStore((s) => s.fireCourse);
  const voidItemWithPin = useWaiterStore((s) => s.voidItemWithPin);
  const releaseTable = useWaiterStore((s) => s.releaseTable);

  // Estado local para el formulario de marcaje de turno con PIN.
  const [pinInput, setPinInput] = useState('');
  // Mensaje de error al fallar el PIN de marcaje.
  const [pinError, setPinError] = useState('');

  // Estado local para el badge de alerta S.O.S. recibido del cliente (call.waiter).
  const [sosAlert, setSosAlert] = useState(null);

  // Carga inicial de mesas si el turno ya estuviera activo.
  useEffect(() => {
    if (shiftStatus === 'clocked_in') {
      loadTables();
    }
  }, [shiftStatus, loadTables]);

  // Suscripción al evento call.waiter del bus en tiempo real (S.O.S. del cliente).
  useEffect(() => {
    // Manejador del evento: guarda la alerta S.O.S. en el estado local.
    const handleSos = (payload) => {
      setSosAlert(payload);
    };

    // Se suscribe al evento call.waiter del bus inyectado (tests) o del bus compartido.
    const unsub = (busProp ?? bus).subscribe('call.waiter', handleSos);

    // Retorna la función de limpieza para desuscribirse al desmontar.
    // busProp como dependencia: si el test inyecta un bus, se re-suscribe al cambiarlo.
    return () => unsub?.();
  }, [busProp]);

  // Manejador del marcaje de turno (Ley 40 Horas).
  const handleClockIn = (e) => {
    e.preventDefault();
    const success = clockIn(pinInput);
    if (!success) {
      setPinError('PIN de garzón inválido. Usa 1234 para demo.');
    } else {
      setPinError('');
    }
  };

  // Obtiene el objeto de la mesa seleccionada actualmente.
  const activeTable = tables.find((t) => t.id === selectedTableId) ?? null;

  // Si el turno no está activo, muestra la pantalla de marcaje (Ley 40 Horas).
  if (shiftStatus === 'clocked_out') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-950 px-6 py-12 text-brand-50">
        {/* Tarjeta modal del control de asistencia y marcaje de turno. */}
        <div className="w-full max-w-md rounded-2xl bg-brand-900 p-6 shadow-2xl border border-brand-800 flex flex-col gap-6">
          {/* Cabecera del control de asistencia. */}
          <div className="flex flex-col gap-1 text-center">
            <span className="text-3xl">⏱️</span>
            <h1 className="text-xl font-bold text-brand-50">Control de Turno — Ley 40 Horas</h1>
            <p className="text-xs text-brand-50/70">
              Ingresa tu PIN de mozo para registrar el marcaje de entrada y desbloquear tus mesas.
            </p>
          </div>

          {/* Formulario de marcaje. */}
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

            {/* Mensaje de error si la validación falla. */}
            {pinError && <p className="text-xs font-bold text-semantic-danger text-center">{pinError}</p>}

            {/* Botón de marcaje de entrada. */}
            <Button variant="primary" type="submit" className="w-full">
              Iniciar Turno
            </Button>
          </form>
        </div>
      </main>
    );
  }

  // Vista activa de la PWA del garzón una vez iniciado el turno.
  return (
    <main className="min-h-screen bg-brand-50 px-6 py-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {/* Cabecera de la vista con identidad del garzón y turno. */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-900">Garzón</h1>
            <p className="text-sm text-brand-800/60">Turno tarde · Salón principal</p>
          </div>
          <Badge variant="brand">{waiterName}</Badge>
        </header>

        {/* Banner de alerta S.O.S. del cliente (call.waiter): aparece cuando un comensal llama. */}
        {sosAlert && (
          <div
            className="flex items-center justify-between rounded-2xl bg-semantic-danger/10 border border-semantic-danger/40 px-4 py-3 shadow-soft"
            data-testid="sos-alert-banner"
          >
            <div className="flex items-center gap-3">
              {/* Ícono de alerta S.O.S. */}
              <span className="text-2xl animate-bounce">🆘</span>
              <div>
                {/* Título de la alerta S.O.S. */}
                <p className="text-xs font-bold text-semantic-danger">
                  S.O.S. — {sosAlert.tableId ?? 'Mesa'}
                </p>
                {/* Motivo de la llamada del comensal. */}
                <p className="text-[11px] text-brand-800/70">{sosAlert.reason}</p>
              </div>
            </div>
            {/* Botón para descartar la alerta S.O.S. */}
            <button
              type="button"
              onClick={() => setSosAlert(null)}
              className="rounded-xl bg-semantic-danger/10 px-3 py-1 text-xs font-bold text-semantic-danger hover:bg-semantic-danger/20"
            >
              Atendido
            </button>
          </div>
        )}

        {/* Grilla de selección de mesa asignada al garzón. */}
        <TableGrid
          tables={tables}
          selectedTableId={selectedTableId}
          onSelectTable={selectTable}
        />

        {/* Tarjeta de rendimiento del garzón en turno (waiter-performance). */}
        <WaiterPerformanceCard
          performance={selectWaiterPerformance('pedro-soto', users, tables)}
        />

        {/* Panel de la comanda y catálogo táctil de la mesa seleccionada. */}
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
      </div>
    </main>
  );
}
