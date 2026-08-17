// src/shared/ui/AppHeader.jsx — cabecera universal con menú hamburguesa (🍔) para switch de vistas
// Componente de navegación global para cambiar de vista con un clic en el menú hamburguesa.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';

export default function AppHeader({ title = 'MesaSplit', subtitle, currentRoute = '/', theme = 'light' }) {
  // Estado local para abrir el menú hamburguesa desplegable.
  const [menuOpen, setMenuOpen] = useState(false);

  // Lista de las 6 vistas operacionales del sistema MesaSplit.
  const routes = [
    { path: '/', label: '🏠 Hub Principal', badge: 'Portal' },
    { path: '/cliente', label: '📱 Mesa Virtual', badge: 'Cliente' },
    { path: '/garzon', label: '🧑‍🍳 Garzón / Mozo', badge: 'Garzón' },
    { path: '/cocina', label: '📺 Cocina KDS', badge: 'KDS' },
    { path: '/admin/caja', label: '💳 Caja POS', badge: 'Caja' },
    { path: '/admin', label: '🗺️ Local Admin Radar', badge: 'Radar' },
    { path: '/admin/super', label: '🏢 Super Admin Corporativo', badge: 'Super Admin' },
  ];

  const isDark = theme === 'dark';

  return (
    <header
      className={`w-full px-4 py-3 border-b flex items-center justify-between transition-colors ${
        isDark ? 'bg-brand-950 border-brand-800 text-brand-50' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
      }`}
    >
      {/* Lado Izquierdo: Identidad de Marca y Título de la Vista */}
      <div className="flex items-center gap-3">
        {/* Botón Hamburguesa Rápido */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú de navegación"
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition active:scale-95 cursor-pointer ${
            isDark
              ? 'bg-brand-900 border-brand-800 text-white hover:bg-brand-800'
              : 'bg-brand-50 border-brand-200 text-brand-900 hover:bg-brand-100'
          }`}
        >
          <span className="text-lg">🍔</span>
        </button>

        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight">MesaSplit</span>
            <span className="rounded-full bg-brand-500/10 px-2 py-0.2 text-[10px] font-bold text-brand-500 border border-brand-500/20">
              Gastronomía
            </span>
          </div>
          {title && <span className="text-xs font-bold text-brand-500/90">{title} {subtitle ? `· ${subtitle}` : ''}</span>}
        </div>
      </div>

      {/* Lado Derecho: Conexión Realtime e Indicador de Estado */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 border border-emerald-500/20">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Realtime Activo
        </span>
      </div>

      {/* Menú Desplegable Hamburguesa (Modal / Overlay) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-start bg-brand-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-2xl p-5 shadow-2xl border flex flex-col gap-4 animate-in slide-in-from-left duration-200 ${
              isDark ? 'bg-brand-900 border-brand-800 text-white' : 'bg-white border-brand-200 text-brand-900'
            }`}
          >
            {/* Cabecera del Menú Hamburguesa */}
            <div className="flex items-center justify-between border-b border-brand-200/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍔</span>
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Navegación de Vistas</h3>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-brand-500/10 p-1.5 text-xs font-bold hover:bg-brand-500/20"
              >
                ✕
              </button>
            </div>

            {/* Lista de Vistas Seleccionables */}
            <div className="flex flex-col gap-1.5">
              {routes.map((r) => {
                const isCurrent = currentRoute === r.path;
                return (
                  <a
                    key={r.path}
                    href={r.path}
                    onClick={(e) => {
                      if (typeof window !== 'undefined' && window.history?.pushState) {
                        e.preventDefault();
                        window.history.pushState({}, '', r.path);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                        setMenuOpen(false);
                      }
                    }}
                    className={`flex items-center justify-between rounded-xl p-3 text-xs font-bold transition ${
                      isCurrent
                        ? 'bg-brand-500 text-white shadow-soft'
                        : isDark
                        ? 'hover:bg-brand-800 text-brand-50/80'
                        : 'hover:bg-brand-100/80 text-brand-900'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className={`text-[10px] font-semibold rounded-md px-2 py-0.5 ${isCurrent ? 'bg-white/20 text-white' : 'bg-brand-500/10 text-brand-500'}`}>
                      {r.badge}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
