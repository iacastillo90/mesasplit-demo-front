// src/features/ClientView/components/WelcomeModal.jsx — banner de onboarding de primera visita (client-onboarding)
// Banner flotante no bloqueante para la Mesa Virtual: despliega los 3 pasos clave sin overlay opaco.
// Permite al comensal agregar platos al carrito sin requerir descartar la guía.
// Persiste mesasplit-onboarding=true en localStorage al descartar.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

export default function WelcomeModal({ open, onClose }) {
  if (!open) return null;

  // Manejador del descarte de la guía de primera visita.
  const handleDismiss = () => {
    try {
      window.localStorage.setItem('mesasplit-onboarding', 'true');
    } catch {
      // Ignora si localStorage no está disponible.
    }
    onClose?.();
  };

  return (
    // Banner flotante superior no bloqueante (z-30, sin backdrop overlay inset-0 para no bloquear clicks en el catálogo).
    <div
      role="dialog"
      aria-label="Guía de bienvenida"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-brand-900 border border-brand-700 p-4 text-brand-50 shadow-2xl transition-all"
    >
      {/* Cabecera del banner con título y botón de cierre rápido. */}
      <div className="flex items-center justify-between pb-2 border-b border-brand-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">👋</span>
          <h2 className="text-sm font-bold text-brand-50">¡Bienvenido a MesaSplit!</h2>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Cerrar guía"
          className="rounded-lg px-2 py-1 text-xs font-bold text-brand-50/60 hover:bg-brand-800 hover:text-brand-50"
        >
          ✕
        </button>
      </div>

      {/* Subtítulo explicativo. */}
      <p className="mt-2 text-xs text-brand-50/80">
        Escaneá, pedí y dividí la cuenta directo desde tu mesa sin esperar al mozo.
      </p>

      {/* Pasos rápidos de uso. */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-brand-950/60 p-2 border border-brand-800">
          <span className="block text-base">📖</span>
          <span className="font-bold text-[11px]">1. Elegí</span>
        </div>
        <div className="rounded-xl bg-brand-950/60 p-2 border border-brand-800">
          <span className="block text-base">👨‍🍳</span>
          <span className="font-bold text-[11px]">2. Marchá</span>
        </div>
        <div className="rounded-xl bg-brand-950/60 p-2 border border-brand-800">
          <span className="block text-base">💳</span>
          <span className="font-bold text-[11px]">3. Dividí</span>
        </div>
      </div>

      {/* Botón de descarte principal. */}
      <button
        type="button"
        onClick={handleDismiss}
        className="mt-3 w-full rounded-xl bg-brand-500 py-2 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft"
      >
        Entendido, ¡a comer!
      </button>
    </div>
  );
}
