// src/features/ClientView/components/ItemReviewModal.jsx — Modal de calificación y feedback granular por plato
// Permite al comensal valorar de 1 a 5 estrellas platos específicos, seleccionar etiquetas de sabor/presentación y enviar notas al chef.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState para gestionar la puntuación de estrellas, etiquetas y comentario del cliente.
import { useState } from 'react';
// Modal base reutilizable.
import { Modal } from '../../../shared/ui/index.js';

// Etiquetas rápidas de cualidades culinarias.
const RATING_TAGS = [
  'Temperatura perfecta 🌡️',
  'Punto de sal 🧂',
  'Crocante 🥓',
  'Presentación impecable 🎨',
  'Porción abundante 🍽️',
  'Ingredientes frescos 🌱',
];

// Componente principal ItemReviewModal.
export default function ItemReviewModal({ open, onClose, item, onSubmitReview }) {
  // Estado de la puntuación en estrellas (1 a 5, por defecto 5).
  const [rating, setRating] = useState(5);
  // Estado de las etiquetas seleccionadas.
  const [selectedTags, setSelectedTags] = useState([]);
  // Estado del comentario libre para el chef.
  const [comment, setComment] = useState('');
  // Estado de confirmación de envío.
  const [submitted, setSubmitted] = useState(false);

  // Alterna la selección de una etiqueta.
  const toggleTag = (tag) => {
    // Si ya existe la quita, si no la agrega.
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  // Envía la reseña formulada por el cliente.
  const handleSubmit = (e) => {
    // Evita recarga del formulario por defecto.
    e?.preventDefault();
    // Si no hay plato seleccionado no procesa.
    if (!item) return;

    // Crea el objeto consolidado de reseña por plato.
    const reviewData = {
      itemId: item.id,
      itemName: item.name,
      rating,
      tags: selectedTags,
      comment,
      createdAt: Date.now(),
    };

    // Invoca el callback de envío si fue proporcionado por el componente padre.
    onSubmitReview?.(reviewData);

    // Muestra pantalla de confirmación.
    setSubmitted(true);
    // Programa el cierre automático tras 1.8s.
    setTimeout(() => {
      setSubmitted(false);
      setRating(5);
      setSelectedTags([]);
      setComment('');
      onClose();
    }, 1800);
  };

  // Si el modal no está abierto o no hay plato, no renderiza.
  if (!open || !item) return null;

  return (
    // Modal envolvente de calificación del plato centrado en el medio de la pantalla.
    <Modal open={open} onClose={onClose} title={`⭐ Evaluar Plato: ${item.name}`} position="center">
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Banner de confirmación al enviar. */}
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold border border-emerald-300">
              ✓
            </div>
            <h4 className="text-sm font-bold text-brand-900">¡Gracias por tu opinión!</h4>
            <p className="text-xs text-brand-800/70">Tu valoración ha sido enviada al chef y a la cocina.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Cabecera del plato a evaluar con foto e información. */}
            <div className="flex items-center gap-3 bg-brand-50 p-3 rounded-2xl border border-brand-200">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover border border-brand-200 shrink-0"
                />
              )}
              <div>
                <h4 className="text-xs font-bold text-brand-900">{item.name}</h4>
                <p className="text-[11px] text-brand-800/70">{item.description}</p>
              </div>
            </div>

            {/* Selector de 1 a 5 estrellas interactivo. */}
            <div className="flex flex-col items-center gap-1.5 py-1">
              <label className="text-xs font-bold text-brand-800">¿Qué tal estuvo este plato?</label>
              <div className="flex items-center gap-2 text-2xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`transition-transform duration-150 transform hover:scale-125 ${
                      star <= rating ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-amber-700">
                {rating === 5 && '¡Excelente! 🔥'}
                {rating === 4 && 'Muy Bueno 👍'}
                {rating === 3 && 'Aceptable 😐'}
                {rating <= 2 && 'Podría mejorar 👎'}
              </span>
            </div>

            {/* Selector de etiquetas rápidas de cualidades. */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-800">Aspectos a destacar:</label>
              <div className="flex gap-1.5 flex-wrap">
                {RATING_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition border ${
                      selectedTags.includes(tag)
                        ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de texto libre para la cocina/chef. */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-brand-800">Comentario para el chef (opcional):</label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej. La carne estuvo en su punto perfecto, felicitaciones."
                className="rounded-xl border border-brand-200 p-2 text-xs text-brand-900 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Pie con botón de envío. */}
            <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800/70 hover:bg-brand-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-semantic-success px-5 py-2 text-xs font-bold text-white hover:bg-semantic-success/90 shadow-soft"
              >
                Enviar Calificación
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
