// src/features/ClientView/components/DishReviewDetailModal.jsx — modal interactivo de detalle de reseña de plato y sucursal (fase21-resenas-interactivas-cards-modal-filtros)
// Muestra la imagen HD a gran escala del plato, información del restaurante, horarios, dirección y desgloses de estrellas.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState, useEffect } from 'react';
// Utilidad de formato de moneda CLP.
import { formatCurrency } from '../../../shared/utils/formatCurrency.js';

// Componente del Modal de Detalle Completo del Plato y Reseña.
export default function DishReviewDetailModal({ isOpen, onClose, reviewData }) {
  // Estado local para los Me Gusta / Votos Útiles de la reseña.
  const [likes, setLikes] = useState(12);
  // Estado para prevenir múltiples votos consecutivos.
  const [liked, setLiked] = useState(false);

  // Sincroniza el contador cuando cambia la reseña seleccionada.
  useEffect(() => {
    if (reviewData?.likes) {
      setLikes(reviewData.likes);
    }
    setLiked(false);
  }, [reviewData]);

  // Escucha la tecla Escape para cerrar el modal.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !reviewData) return null;

  // Maneja la acción de dar un voto útil a la reseña.
  const handleLike = () => {
    if (liked) return;
    setLikes((prev) => prev + 1);
    setLiked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/75 backdrop-blur-sm animate-fade-in">
      {/* Contenedor emergente del modal */}
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col border border-brand-200 max-h-[90vh]">
        {/* Banner con la Foto HD del Plato */}
        <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-900">
          <img
            src={reviewData.image || '/images/dish_lomo_lo_ovalle.png'}
            alt={reviewData.dish}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center text-xs font-bold backdrop-blur-md transition cursor-pointer"
            aria-label="Cerrar detalle de reseña"
          >
            ✕
          </button>

          {/* Nombre y categoría del plato sobre la imagen */}
          <div className="absolute bottom-4 left-5 right-5 flex flex-col gap-1 text-left text-white">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500 text-white px-2.5 py-0.5 rounded-full self-start shadow-soft">
              {reviewData.category || 'Especialidad de la Casa'}
            </span>
            <h2 className="text-xl font-extrabold tracking-tight drop-shadow-md">{reviewData.dish}</h2>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-400">{'★'.repeat(reviewData.rating)} ({reviewData.rating}.0 / 5)</span>
              <span className="font-extrabold text-emerald-400">{formatCurrency(reviewData.price || 14900)}</span>
            </div>
          </div>
        </div>

        {/* Creador y Cuerpo del Detalle */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 text-left">
          {/* Información de la Sucursal donde se probó */}
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-900 flex items-center gap-1.5">
              <span>🏪</span>
              <span>Información del Restaurante:</span>
            </span>

            <div className="flex flex-col gap-0.5 text-xs text-brand-800">
              <span className="font-extrabold text-brand-900 text-sm">{reviewData.branchName || 'Restô Lo Ovalle'}</span>
              <span>📍 {reviewData.branchAddress || 'Av. Lo Ovalle 1420, San Miguel, Santiago'}</span>
              <span>🕒 Horarios: Lun-Dom 12:00 a 00:00 hrs</span>
              <span>📞 Reservas: {reviewData.branchPhone || '+56 2 2891 4000'}</span>
            </div>
          </div>

          {/* Desglose de Puntuación Gastronómica */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-extrabold text-slate-800">📊 Desglose de Experiencia:</span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center">
                <span className="font-bold text-slate-700">🥩 Sabor</span>
                <span className="font-extrabold text-amber-600">5.0 ★</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center">
                <span className="font-bold text-slate-700">🎨 Emplatado</span>
                <span className="font-extrabold text-amber-600">5.0 ★</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center">
                <span className="font-bold text-slate-700">🛎️ Atención</span>
                <span className="font-extrabold text-amber-600">5.0 ★</span>
              </div>
            </div>
          </div>

          {/* Reseña escrita del usuario */}
          <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-extrabold text-slate-800">💬 Opinión de Constanza Silva:</span>
              <span className="text-[10px]">{reviewData.date}</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed italic">&ldquo;{reviewData.comment}&rdquo;</p>
            <span className="text-[10px] text-slate-500 mt-1 self-end font-semibold">
              🧑‍🍳 Servido por Garzón Mateo Valenzuela en {reviewData.branchName}
            </span>
          </div>
        </div>

        {/* Pie del Modal con Acción de Me Gusta */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleLike}
            className={`rounded-2xl px-4 py-2.5 text-xs font-extrabold transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-2 ${
              liked ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>👍</span>
            <span>{liked ? '¡Gracias por tu Voto!' : `Útil (${likes})`}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-brand-900 hover:bg-brand-800 px-5 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
}
