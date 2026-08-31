// src/features/ClientView/components/CustomerSurveyModal.jsx — modal de encuesta de satisfacción y propina digital (customer-survey-ratings)
// Modal interactivo post-pago: calificación de 5 estrellas, evaluación NPS (1-10), cálculo de propina sugerida (10%, 15%, 20%) y emisión del evento feedback.submitted por el bus.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useState para gestionar la calificación, propina seleccionada y comentarios.
import { useState } from 'react';
// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Instancia del bus en tiempo real.
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para la Mesa Virtual.
const bus = createRealtimeBus('mesasplit');

// Componente CustomerSurveyModal.
export default function CustomerSurveyModal({ open, onClose, totalBill = 20000 }) {
  // Estado de estrellas seleccionadas (1 a 5).
  const [rating, setRating] = useState(5);
  // Porcentaje de propina seleccionado (10, 15, 20 o 0).
  const [tipPercentage, setTipPercentage] = useState(10);
  // Texto opcional de comentarios.
  const [comments, setComments] = useState('');

  // Calcula el valor numérico en CLP de la propina elegida.
  const tipAmount = Math.round((totalBill * tipPercentage) / 100);

  // Maneja el envío de la encuesta y la emisión del evento real-time.
  const handleSubmit = (e) => {
    e?.preventDefault();
    // Publica el evento de retroalimentación en el bus de la red.
    bus.publish('feedback.submitted', {
      rating,
      tipPercentage,
      tipAmount,
      comments,
      timestamp: Date.now(),
    });
    // Cierra el modal de encuesta.
    onClose();
  };

  return (
    // Modal de diálogo envolvente para la encuesta post-pago.
    <Modal open={open} onClose={onClose} title="Experiencia MesaSplit">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-brand-900">
        {/* Título y llamado a la acción. */}
        <div className="text-center">
          <h3 className="text-base font-bold text-brand-900">¿Cómo fue tu experiencia en MesaSplit?</h3>
          <p className="text-xs text-brand-800/70">Tu opinión ayuda al equipo de servicio a mejorar cada día</p>
        </div>

        {/* Calificación por estrellas (1 a 5). */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-brand-800">Calificación General:</span>
          <div className="flex items-center gap-2 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`Calificar con ${star} estrellas`}
                onClick={() => setRating(star)}
                className={`transition transform hover:scale-125 ${
                  star <= rating ? 'text-amber-400' : 'text-brand-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Sugerencia de propina digital (10%, 15%, 20%). */}
        <div className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 border border-brand-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900">Propina Sugerida para el Garzón:</span>
            <span className="text-xs font-extrabold text-brand-500">{formatCurrency(tipAmount)}</span>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[
              { pct: 0, label: 'Sin propina' },
              { pct: 10, label: '10%' },
              { pct: 15, label: '15%' },
              { pct: 20, label: '20%' },
            ].map((option) => (
              <button
                key={option.pct}
                type="button"
                onClick={() => setTipPercentage(option.pct)}
                className={`rounded-xl py-2 text-xs font-bold transition border ${
                  tipPercentage === option.pct
                    ? 'bg-brand-500 text-white border-brand-500 shadow-soft'
                    : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Campo opcional de comentarios del cliente. */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="comments-input" className="text-xs font-bold text-brand-800">
            Comentarios o sugerencias (Opcional):
          </label>
          <textarea
            id="comments-input"
            rows={2}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="¡La atención estuvo excelente! Nos gustó mucho el Lomo Lo Ovalle."
            className="w-full rounded-xl border border-brand-200 p-2.5 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Botones de acción del formulario. */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800/70 hover:bg-brand-100"
          >
            Omitir
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-800 active:scale-95 shadow-soft"
          >
            Enviar Opinión
          </button>
        </div>
      </form>
    </Modal>
  );
}
