// src/features/ClientView/components/OrderTrackingBanner.jsx — banner de tracking de pedido en vivo (client-order-tracking)
// Banner visible en Mesa Virtual con Stepper Tracker animado de 4 etapas cuando existe una orden activa.
// Escucha el evento order.status.change del bus de eventos en tiempo real.
// Mapea los estados según TICKET_STATUS:
// - pending -> "enviado a cocina" (default)
// - in_preparation -> "en preparación"
// - ready -> "listo"
// - delivered -> "entregado"
// Cumple estrictamente con las reglas de AGENTS.md (comentarios por cada línea en español).

import { useEffect, useState } from 'react';
// Hook de bus en tiempo real.
import { createRealtimeBus, TOPICS } from '../../../hooks/useRealtimeBus.js';
// Enum de estados de tickets en cocina.
import { TICKET_STATUS } from '../../../shared/constants/statusEnums.js';

// Definición de las 4 etapas del Stepper de Seguimiento en Tiempo Real.
const STEPS = [
  { id: TICKET_STATUS.PENDING, label: 'Enviado', icon: '📝', desc: 'Enviado a cocina' },
  { id: TICKET_STATUS.IN_PREPARATION, label: 'En Cocción', icon: '🔥', desc: 'En preparación' },
  { id: TICKET_STATUS.READY, label: 'Listo', icon: '🔔', desc: 'Listo en pasaplatos' },
  { id: TICKET_STATUS.DELIVERED, label: 'Entregado', icon: '✅', desc: '¡Entregado a la mesa!' },
];


export default function OrderTrackingBanner({ hasActiveOrder, orderId }) {
  // Estado local del estado actual de la orden. Default: PENDING ("enviado a cocina").
  const [currentStatus, setCurrentStatus] = useState(TICKET_STATUS.PENDING);

  useEffect(() => {
    // Si no hay orden activa, no activa la suscripción.
    if (!hasActiveOrder) return;

    // Obtiene instancia del bus de eventos realtime.
    const bus = createRealtimeBus('mesasplit');

    // Listener para eventos order.status.change.
    const unsubscribe = bus.subscribe(TOPICS.ORDER_STATUS_CHANGE, (payload) => {
      // Si el payload no especifica status, no realiza cambios.
      if (!payload?.status) return;
      // Si se especifica orderId y el payload no coincide, ignora.
      if (orderId && payload.orderId && payload.orderId !== orderId) return;

      // Valida si el status es uno de los TICKET_STATUS conocidos.
      const validStatuses = Object.values(TICKET_STATUS);
      if (validStatuses.includes(payload.status)) {
        setCurrentStatus(payload.status);
      }
    });

    // Limpieza de la suscripción al desmontar o cambiar dependencias.
    return () => {
      unsubscribe();
    };
  }, [hasActiveOrder, orderId]);

  // Si no existe orden activa en la sesión del cliente, oculta el banner.
  if (!hasActiveOrder) return null;

  // Determina el índice de la etapa activa para calcular el progreso de la barra.
  const activeStepIndex = STEPS.findIndex((s) => s.id === currentStatus);
  const currentStep = STEPS[activeStepIndex] ?? STEPS[0];

  return (
    // Contenedor principal con sombra suave y borde redondeado.
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-soft border border-brand-200 transition-all">
      {/* Cabecera del tracker con título e indicador del estado actual */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Icono animado del estado actual */}
          <span className="text-xl animate-bounce">{currentStep.icon}</span>
          <div className="flex flex-col text-left">
            <h3 className="text-xs font-extrabold text-brand-900">Seguimiento de tu Pedido</h3>
            <span className="text-[11px] text-brand-500 font-semibold">{currentStep.desc}</span>
          </div>
        </div>
        {/* Badge del estado actual con color destacado */}
        <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-bold text-brand-500 border border-brand-500/20 capitalize">
          {currentStep.label}
        </span>
      </div>

      {/* Stepper de 4 pasos con conectores e iconos */}
      <div className="relative mt-1">
        {/* Barra de progreso de fondo */}
        <div className="absolute top-3.5 left-4 right-4 h-1 bg-brand-100 -z-0 rounded-full" />
        {/* Barra de avance con color activo proporcional a la etapa */}
        <div
          className="absolute top-3.5 left-4 h-1 bg-brand-500 -z-0 rounded-full transition-all duration-500"
          style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 88}%` }}
        />

        {/* Nodos del Stepper */}
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((step, idx) => {
            // Un paso está completado o activo si su índice es <= al índice actual.
            const isCompleted = idx <= activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div key={step.id} className="flex flex-col items-center gap-1">
                {/* Círculo indicador del nodo */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCurrent
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100 scale-110 shadow-md'
                      : isCompleted
                      ? 'bg-brand-900 text-white'
                      : 'bg-brand-50 text-brand-400 border border-brand-200'
                  }`}
                >
                  {step.icon}
                </div>
                {/* Texto descriptivo del paso */}
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isCurrent ? 'font-bold text-brand-900' : isCompleted ? 'text-brand-800' : 'text-brand-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
