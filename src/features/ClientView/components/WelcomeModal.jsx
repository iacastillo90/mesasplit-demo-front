// src/features/ClientView/components/WelcomeModal.jsx — modal de bienvenida para primera visita (client-onboarding)
// Despliega una guía visual rápida con los 3 pasos clave de la Mesa Virtual (Onboarding de primera visita).
// Permite descarte persistente guardando mesasplit-onboarding=true en localStorage.
// Diseñado para no bloquear la interacción con el menú subyacente.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Modal base reutilizable del design system compartido.
import { Modal } from '../../../shared/ui/index.js';

// Componente WelcomeModal: onboarding intuitivo para el comensal.
export default function WelcomeModal({ open, onClose }) {
  // Manejador del descarte: guarda la preferencia en localStorage y llama onClose.
  const handleDismiss = () => {
    try {
      window.localStorage.setItem('mesasplit-onboarding', 'true');
    } catch {
      // Ignora errores de almacenamiento restringido en algunos entornos.
    }
    onClose?.();
  };

  return (
    // Modal envolvente del design system (open controla visibilidad).
    <Modal open={open} onClose={handleDismiss} title="¡Bienvenido a MesaSplit!">
      <div className="flex flex-col gap-5 text-brand-900">
        {/* Subtítulo de bienvenida explicativo. */}
        <p className="text-xs text-brand-800/80">
          Escaneá, pedí y dividí la cuenta directo desde tu mesa sin esperar al mozo.
        </p>

        {/* Pasos rápidos de uso de la Mesa Virtual. */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {/* Paso 1: Explorar menú. */}
          <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-brand-50 p-3 border border-brand-200">
            <span className="text-2xl">📖</span>
            <span className="text-[11px] font-bold text-brand-900">1. Elegí</span>
            <span className="text-[10px] text-brand-800/60">Explorá el menú y agregá tus platos</span>
          </div>

          {/* Paso 2: Pedir a cocina. */}
          <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-brand-50 p-3 border border-brand-200">
            <span className="text-2xl">👨‍🍳</span>
            <span className="text-[11px] font-bold text-brand-900">2. Marchá</span>
            <span className="text-[10px] text-brand-800/60">Enviá tu orden directo a la cocina</span>
          </div>

          {/* Paso 3: Dividir e pagar. */}
          <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-brand-50 p-3 border border-brand-200">
            <span className="text-2xl">💳</span>
            <span className="text-[11px] font-bold text-brand-900">3. Dividí</span>
            <span className="text-[10px] text-brand-800/60">Pagá tu parte como prefieras</span>
          </div>
        </div>

        {/* Botón de confirmación y descarte. */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full rounded-xl bg-brand-500 py-3 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft"
          >
            Entendido, ¡a comer!
          </button>
        </div>
      </div>
    </Modal>
  );
}
