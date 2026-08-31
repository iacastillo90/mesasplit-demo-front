// src/features/ClientView/components/SosModal.jsx — modal S.O.S. de Mesa (sos-waiter-call)
// Permite al comensal llamar al mozo desde la Mesa Virtual seleccionando un motivo.
// Emite el evento call.waiter por el bus en tiempo real según el contrato de openspec/api-contracts/websocket-payloads.md.
// El rojo #EF4444 se usa exclusivamente aquí porque el S.O.S. es una emergencia operativa — regla de oro del design system.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useState para gestionar el motivo seleccionado y el estado de envío.
import { useState } from 'react';
// Modal base reutilizable del design system compartido.
import { Modal } from '../../../shared/ui/index.js';
// Bus en tiempo real: emite el evento call.waiter al mozo.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus de eventos para la Mesa Virtual.
const bus = createRealtimeBus('mesasplit');

// Opciones de motivo de llamada disponibles según el contrato WebSocket.
const REASONS = [
  { id: 'clean', label: 'Limpiar mesa', emoji: '🧹' },
  { id: 'cutlery', label: 'Falta cubierto', emoji: '🍴' },
  { id: 'help', label: 'Ayuda general', emoji: '🙋' },
];

// Componente SosModal: modal de llamada urgente al mozo desde la Mesa Virtual.
// Acepta una prop opcional `bus` (inyección de dependencia) para que los tests
// puedan capturar el payload emitido sin cambiar el comportamiento en el browser.
export default function SosModal({ open, onClose, tableId = 'table-01', bus: busProp }) {
  // Bus real: usa el inyectado por el test (busProp) o la instancia del módulo por defecto.
  const realtimeBus = busProp ?? bus;
  // Estado del motivo actualmente seleccionado por el comensal.
  const [selectedReason, setSelectedReason] = useState(REASONS[0].label);
  // Estado de confirmación: true tras enviar la llamada (muestra "Mozo en camino").
  const [sent, setSent] = useState(false);

  // Maneja el envío de la llamada S.O.S. al bus en tiempo real.
  const handleCall = () => {
    // Emite el evento call.waiter con el payload del contrato WebSocket.
    realtimeBus.publish('call.waiter', {
      tableId,
      reason: selectedReason,
      customerName: 'Cliente',
      timestamp: Date.now(),
    });
    // Cambia el estado a enviado para mostrar el feedback visual.
    setSent(true);

    // Cierra el modal automáticamente tras 2 segundos de confirmación.
    setTimeout(() => {
      setSent(false);
      onClose?.();
    }, 2000);
  };

  return (
    // Modal envolvente reutilizable del design system.
    <Modal open={open} onClose={onClose} title="🆘 Llamar al Mozo">
      <div className="flex flex-col gap-5">
        {/* Estado de éxito: muestra confirmación visual mientras el mozo llega. */}
        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4">
            {/* Ícono de confirmación animado con color verde de éxito. */}
            <span className="text-5xl animate-bounce">🏃</span>
            <p className="text-lg font-bold text-semantic-success text-center">
              Mozo en camino
            </p>
            <p className="text-xs text-brand-800/60 text-center">
              Tu solicitud fue enviada. El mozo llegará en instantes.
            </p>
          </div>
        ) : (
          // Formulario de selección de motivo y confirmación de la llamada.
          <>
            {/* Instrucción breve para el comensal. */}
            <p className="text-xs text-brand-800/70">
              Seleccioná el motivo de tu llamada. Tu mozo será notificado de inmediato.
            </p>

            {/* Grid de botones de motivo (iconos + etiqueta). */}
            <div className="grid grid-cols-3 gap-2">
              {REASONS.map((reason) => (
                // Botón de selección de motivo, resaltado al estar activo.
                <button
                  key={reason.id}
                  type="button"
                  onClick={() => setSelectedReason(reason.label)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center text-xs font-bold transition active:scale-95 ${
                    selectedReason === reason.label
                      ? 'border-semantic-danger bg-semantic-danger/10 text-semantic-danger shadow-soft'
                      : 'border-brand-200 bg-white text-brand-900 hover:border-semantic-danger/40 hover:bg-semantic-danger/5'
                  }`}
                >
                  {/* Emoji representativo del motivo. */}
                  <span className="text-2xl">{reason.emoji}</span>
                  {/* Etiqueta del motivo. */}
                  {reason.label}
                </button>
              ))}
            </div>

            {/* Indicador del motivo activo actualmente. */}
            <p className="text-center text-xs text-brand-800/60">
              Motivo seleccionado:{' '}
              <strong className="text-brand-900">{selectedReason}</strong>
            </p>

            {/* Botones de acción: cancelar y confirmar la llamada. */}
            <div className="flex gap-3 border-t border-brand-200 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-brand-200 py-2.5 text-xs font-bold text-brand-800/60 hover:bg-brand-100"
              >
                Cancelar
              </button>
              {/* Botón de llamada al mozo: rojo reservado para emergencias según design system. */}
              <button
                type="button"
                onClick={handleCall}
                className="flex-1 rounded-xl bg-semantic-danger py-2.5 text-xs font-bold text-white hover:bg-semantic-danger/90 shadow-soft active:scale-95 transition"
              >
                🆘 Llamar
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
