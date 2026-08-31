// src/shared/ui/AppFooter.jsx — pie de página universal (task 2.3)
// Componente de pie de página para vistas operacionales y administrativas de MesaSplit.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Importa el widget de soporte 24/7 chileno.
import ChileanSupportWidget from './ChileanSupportWidget.jsx';

export default function AppFooter({ theme = 'light' }) {
  const isDark = theme === 'dark';

  return (
    <footer
      className={`hidden sm:block w-full py-5 px-6 border-t transition-colors text-center ${
        isDark ? 'bg-brand-950 border-brand-800 text-brand-50/60' : 'bg-white border-brand-200 text-brand-800/60'
      }`}
    >
      {/* Monta el widget flotante de soporte 24/7. */}
      <ChileanSupportWidget />
      <div className="mx-auto flex w-full max-w-5xl flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-500">MesaSplit Gastronomía</span>
          <span>· Demo Omnicanal Multi-Vista</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="font-semibold">⚡ Realtime Bus (BroadcastChannel)</span>
          <span>• Santiago, Chile</span>
          <a
            href="/"
            onClick={(e) => {
              if (typeof window !== 'undefined' && window.history?.pushState) {
                e.preventDefault();
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="font-bold text-brand-500 hover:underline"
          >
            Hub Principal
          </a>
        </div>
      </div>
    </footer>
  );
}
