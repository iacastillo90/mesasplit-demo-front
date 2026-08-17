// src/features/ClientView/components/ClientPageHero.jsx — Componente Hero Promocional Ultra-Premium para la Mesa Virtual
// Despliega un banner gastronómico de alto impacto visual con diseño glassmorphic, plato estrella del día y beneficios.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Store i18n para resolver traducciones en el hero.
import { useI18nStore } from '../../../shared/i18n/useI18nStore.js';

// Componente ClientPageHero.
export default function ClientPageHero({ onSelectStarDish }) {
  // Suscripción al helper de traducción.
  const t = useI18nStore((s) => s.t);

  return (
    // Contenedor principal con gradiente gastronómico tailored y sombras elevadas.
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-amber-950 p-6 text-white shadow-2xl border border-white/10">
      {/* Fondo decorativo con resplandor difuminado. */}
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-brand-500/20 blur-3xl" />

      {/* Contenido frontal con glassmorphism. */}
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 max-w-lg">
          {/* Badge de recomendación de la casa. */}
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-soft">
              <span>🔥</span>
              <span>Recomendación Chef Providencia</span>
            </span>
            <span className="text-xs text-white/60">• {t('openAccount')}</span>
          </div>

          {/* Título principal del plato del día. */}
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Lomo Lo Ovalle & Pisco Sour Artesanal 🥩🍹
          </h2>
          <p className="text-xs text-brand-100/80">
            Corte magro a las brasas con sal de mar y acompañamiento de papas nativas rústicas.
          </p>
        </div>

        {/* Botón de adición directa al pedido. */}
        <button
          type="button"
          onClick={onSelectStarDish}
          className="self-start sm:self-center rounded-2xl bg-amber-500 hover:bg-amber-400 text-brand-950 px-5 py-3 text-xs font-extrabold transition shadow-lg active:scale-95 flex items-center gap-2 border border-amber-300"
        >
          <span>✨</span>
          <span>Pedir Plato Estrella</span>
        </button>
      </div>
    </div>
  );
}
