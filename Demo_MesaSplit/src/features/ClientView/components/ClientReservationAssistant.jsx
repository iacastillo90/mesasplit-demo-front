// src/features/ClientView/components/ClientReservationAssistant.jsx — Asistente interactivo guiado de reservas por local y fila virtual
// Permite a los clientes seleccionar sucursal, ambiente, horario, comensales y requerimientos especiales con generación de voucher QR.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para controlar los pasos del asistente wizard y el formulario.
import { useState } from 'react';
// Hook del store de reservas por sucursal.
import { useReservationStore } from '../store/useReservationStore.js';
// Modal base del design system.
import { Modal } from '../../../shared/ui/index.js';

// Etiquetas rápidas de requerimientos especiales disponibles.
const SPECIAL_TAGS = [
  'Cumpleaños 🎂',
  'Silla de Bebé 👶',
  'Accesibilidad ♿',
  'Mascota / Pet Friendly 🐾',
  'Aniversario 💍',
];

// Componente principal ClientReservationAssistant.
export default function ClientReservationAssistant({ open, onClose }) {
  // Conecta el store de reservas.
  const {
    branches,
    selectedBranchId,
    setSelectedBranchId,
    createReservation,
    joinWaitlist,
  } = useReservationStore();

  // Paso actual del asistente (1: Sucursal, 2: Formulario/Detalles, 3: Voucher Confirmación).
  const [step, setStep] = useState(1);
  // Estado local para los campos de reserva.
  const [customerName, setCustomerName] = useState('');
  const [guests, setGuests] = useState(2);
  const [time, setTime] = useState('20:30');
  const [zone, setZone] = useState('Terraza');
  const [selectedNotes, setSelectedNotes] = useState([]);
  // Guarda el resultado de la reserva o fila virtual creada para el voucher.
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  // Estado del mensaje de confirmación copiada al portapapeles.
  const [copied, setCopied] = useState(false);

  // Sucursal seleccionada actualmente.
  const currentBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Alterna la selección de una nota/etiqueta especial.
  const toggleTag = (tag) => {
    // Si ya existe la quita, si no existe la agrega al array.
    setSelectedNotes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Procesa la confirmación directa de la reserva.
  const handleConfirmBooking = (e) => {
    // Evita la recarga de formulario por defecto.
    e?.preventDefault();
    // Valida que el nombre no esté vacío.
    if (!customerName.trim()) return;

    // Crea la reserva en el store global.
    const res = createReservation({
      branchId: currentBranch.id,
      customerName,
      guests,
      time,
      zone,
      specialNotes: selectedNotes,
    });

    // Guarda el objeto resultante para mostrar en el voucher final.
    setConfirmedBooking({ ...res, isWaitlist: false });
    // Avanza al paso 3 (Voucher).
    setStep(3);
  };

  // Procesa el unirse a la fila virtual si no hay disponibilidad o se prefiere esperar.
  const handleJoinWaitlist = () => {
    // Valida el nombre antes de unirse.
    if (!customerName.trim()) return;

    // Registra la entrada en la cola de espera virtual.
    const wait = joinWaitlist({
      branchId: currentBranch.id,
      customerName,
      guests,
    });

    // Guarda el objeto de fila virtual para el voucher.
    setConfirmedBooking({ ...wait, isWaitlist: true });
    // Avanza al paso 3 (Voucher).
    setStep(3);
  };

  // Copia el código y resumen al portapapeles.
  const handleCopySummary = () => {
    // Si no hay reserva confirmada finaliza.
    if (!confirmedBooking) return;
    // Formatea el resumen técnico.
    const summary = `Reserva MesaSplit #${confirmedBooking.code} | Local: ${confirmedBooking.branchName} | Cliente: ${confirmedBooking.customerName} (${confirmedBooking.guests} personas) | Hora: ${confirmedBooking.time || 'En Espera'}`;
    // Escribe en la API de portapapeles del navegador.
    navigator.clipboard?.writeText(summary);
    // Activa la bandera de copiado.
    setCopied(true);
    // Oculta la confirmación tras 2 segundos.
    setTimeout(() => setCopied(false), 2000);
  };

  // Reinicia el asistente al cerrar.
  const handleCloseAssistant = () => {
    // Vuelve al paso 1.
    setStep(1);
    // Limpia la reserva confirmada.
    setConfirmedBooking(null);
    // Ejecuta la función onClose del padre.
    onClose();
  };

  return (
    // Modal envolvente del asistente de reservas.
    <Modal open={open} onClose={handleCloseAssistant} title="🤖 Asistente Inteligente de Reservas">
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Barra de progreso de los 3 pasos del wizard. */}
        <div className="flex items-center justify-between border-b border-brand-200 pb-3 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-full border ${step === 1 ? 'bg-brand-500 text-white border-brand-500 font-bold' : 'bg-brand-50 text-brand-800 border-brand-200'}`}>
            1. Sucursal
          </span>
          <span className="text-brand-300">➔</span>
          <span className={`px-2.5 py-1 rounded-full border ${step === 2 ? 'bg-brand-500 text-white border-brand-500 font-bold' : 'bg-brand-50 text-brand-800 border-brand-200'}`}>
            2. Detalles
          </span>
          <span className="text-brand-300">➔</span>
          <span className={`px-2.5 py-1 rounded-full border ${step === 3 ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-brand-50 text-brand-800 border-brand-200'}`}>
            3. Voucher QR
          </span>
        </div>

        {/* PASO 1: Selección de Sucursal / Local Gastronómico. */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-brand-800/80">
              Seleccioná el local de **MesaSplit** donde deseas reservar o unirte a la fila virtual:
            </p>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto">
              {branches.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setSelectedBranchId(b.id);
                    setStep(2);
                  }}
                  className={`flex flex-col gap-1.5 p-3.5 rounded-2xl border text-left transition duration-200 transform hover:scale-[1.01] ${
                    selectedBranchId === b.id
                      ? 'bg-brand-50 border-brand-500 shadow-soft ring-2 ring-brand-500/20'
                      : 'bg-white border-brand-200 hover:bg-brand-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{b.image}</span>
                      <h4 className="text-xs font-bold text-brand-900">{b.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        b.occupancyPct >= 90
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {b.occupancyPct}% ocupado {b.estimatedWaitMinutes > 0 ? `(Wait ~${b.estimatedWaitMinutes}m)` : '(Cupo Libre)'}
                    </span>
                  </div>

                  <p className="text-[11px] text-brand-800/70">{b.address}</p>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {b.zones.map((z) => (
                      <span key={z} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-medium">
                        📍 {z}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PASO 2: Formulario de Detalles, Horario y Requerimientos. */}
        {step === 2 && (
          <form onSubmit={handleConfirmBooking} className="flex flex-col gap-3.5">
            {/* Banner de sucursal seleccionada. */}
            <div className="flex items-center justify-between bg-brand-50 p-2.5 rounded-xl border border-brand-200">
              <div className="flex items-center gap-2 text-xs font-bold text-brand-900">
                <span>{currentBranch.image}</span>
                <span>{currentBranch.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[11px] font-semibold text-brand-600 hover:underline"
              >
                Cambiar local
              </button>
            </div>

            {/* Campo Nombre del Cliente. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Nombre de la reserva:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej. Carmen Gloria Tapia"
                className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>

            {/* Fila de Comensales y Horarios. */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-800">N° de Personas:</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>
                      👥 {n} {n === 1 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-800">Hora sugerida:</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
                >
                  {['19:30', '20:00', '20:30', '21:00', '21:30', '22:00'].map((t) => (
                    <option key={t} value={t}>
                      ⏰ {t} hrs
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Ambiente / Zona elegida. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Ambiente Preferido:</label>
              <div className="flex gap-2 flex-wrap">
                {currentBranch.zones.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => setZone(z)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition border ${
                      zone === z
                        ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                        : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
                    }`}
                  >
                    📍 {z}
                  </button>
                ))}
              </div>
            </div>

            {/* Requerimientos Especiales (Chips). */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Requerimientos o Celebración:</label>
              <div className="flex gap-1.5 flex-wrap">
                {SPECIAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition border ${
                      selectedNotes.includes(tag)
                        ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones del formulario: Fila Virtual vs Reserva Confirmada. */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-brand-200">
              {currentBranch.occupancyPct >= 90 && (
                <button
                  type="button"
                  onClick={handleJoinWaitlist}
                  className="flex-1 rounded-xl bg-amber-500 text-white p-2.5 text-xs font-bold hover:bg-amber-600 transition shadow-soft"
                >
                  ⏳ Fila Virtual (~{currentBranch.estimatedWaitMinutes} min)
                </button>
              )}

              <button
                type="submit"
                className="flex-1 rounded-xl bg-semantic-success text-white p-2.5 text-xs font-bold hover:bg-semantic-success/90 transition shadow-soft"
              >
                ✓ Confirmar Reserva
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: Voucher QR de Confirmación y Resumen. */}
        {step === 3 && confirmedBooking && (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            {/* Icono de verificación o reloj según el tipo. */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold border border-emerald-300">
              {confirmedBooking.isWaitlist ? '⏳' : '✓'}
            </div>

            <h3 className="text-sm font-bold text-brand-900">
              {confirmedBooking.isWaitlist ? '¡Estás en la Fila Virtual!' : '¡Reserva Confirmada con Éxito!'}
            </h3>

            {/* Tarjeta de Resumen con QR simulado. */}
            <div className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-xl border border-slate-700 flex flex-col gap-2 font-mono text-left">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-[11px] text-sky-400 font-bold uppercase tracking-wider">Voucher MesaSplit</span>
                <span className="text-xs font-bold bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-600/50">
                  #{confirmedBooking.code}
                </span>
              </div>

              <div className="text-xs flex flex-col gap-1 pt-1 text-slate-200">
                <p><strong>Local:</strong> {confirmedBooking.branchName}</p>
                <p><strong>Comensal:</strong> {confirmedBooking.customerName} ({confirmedBooking.guests} personas)</p>
                <p><strong>Ambiente:</strong> {confirmedBooking.zone || 'Asignado al llegar'}</p>
                <p><strong>Horario:</strong> {confirmedBooking.time || 'Fila Virtual (Esperando Turno)'}</p>
                {confirmedBooking.specialNotes?.length > 0 && (
                  <p><strong>Notas:</strong> {confirmedBooking.specialNotes.join(', ')}</p>
                )}
              </div>

              {/* Simulación visual de código QR de la reserva. */}
              <div className="flex items-center justify-center p-3 bg-white rounded-xl mt-2">
                <div className="w-24 h-24 bg-slate-900 rounded-lg flex flex-col items-center justify-center p-2 text-white font-mono text-[9px] text-center border border-slate-700">
                  <span className="text-xl mb-1">📱</span>
                  <span>{confirmedBooking.code}</span>
                  <span className="text-[7px] text-slate-400">ESCANEAR AL LLEGAR</span>
                </div>
              </div>
            </div>

            {/* Botones de acción del voucher. */}
            <div className="flex items-center justify-between w-full gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopySummary}
                className="flex-1 rounded-xl bg-brand-100 hover:bg-brand-200 text-brand-900 p-2 text-xs font-bold border border-brand-300 transition"
              >
                {copied ? '✓ Copiado al portapapeles' : '📋 Copiar Resumen'}
              </button>

              <button
                type="button"
                onClick={handleCloseAssistant}
                className="rounded-xl bg-brand-900 hover:bg-brand-800 text-white px-5 p-2 text-xs font-bold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
