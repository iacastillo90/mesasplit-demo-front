// src/shared/ui/AdminLayout.jsx — layout universal para las vistas de administración (Radar, Caja POS, Super Admin)
// Provee la estructura de pantalla fija (h-screen overflow-hidden), sidebar izquierdo fijo (sm:flex),
// cabecera AppHeader, pie AppFooter y área principal main scrollable responsiva.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
import AppHeader from './AppHeader.jsx';
import AppFooter from './AppFooter.jsx';

export default function AdminLayout({
  children,
  currentRoute = '/admin',
  title = 'Local Admin',
  subtitle = 'Supervisión en vivo',
  theme = 'dark',
  sectionTabs = [],
  activeTab,
  onSelectTab,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isDark = theme === 'dark';

  // Rutas principales del área administrativa de la empresa.
  const adminRoutes = [
    { path: '/admin', label: '🗺️ Radar Local', badge: 'Salón' },
    { path: '/admin/caja', label: '💳 Caja POS', badge: 'Cobro' },
    { path: '/admin/super', label: '🏢 Super Admin', badge: 'Corporativo' },
  ];

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? 'bg-brand-950 text-brand-50' : 'bg-brand-50 text-brand-900'}`}>
      {/* Cabecera universal con menú hamburguesa global */}
      <AppHeader title={title} subtitle={subtitle} currentRoute={currentRoute} theme={theme} />

      {/* ÁREA CENTRAL (Sidebar fijo a la izquierda + Main scrollable) */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR DESKTOP/TABLET FIJO (w-64 h-full overflow-y-auto) */}
        <aside
          className={`hidden sm:flex w-64 shrink-0 flex-col justify-between p-4 h-full overflow-y-auto border-r ${
            isDark ? 'bg-brand-900/90 border-brand-800 text-white' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
          }`}
        >
          <div className="flex flex-col gap-5">
            {/* Título del Panel de Control */}
            <div className="flex items-center justify-between border-b pb-3 border-brand-800/30">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">MesaSplit Gastronomía</span>
                <h2 className="text-lg font-bold leading-tight">Centro de Mando</h2>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-extrabold text-emerald-500 border border-emerald-500/20">
                En Vivo
              </span>
            </div>

            {/* Selector de Vistas de Administración */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500/80 mb-1">Módulos Admin</span>
              {adminRoutes.map((r) => {
                const isActive = currentRoute === r.path;
                return (
                  <a
                    key={r.path}
                    href={r.path}
                    onClick={(e) => {
                      if (typeof window !== 'undefined' && window.history?.pushState) {
                        e.preventDefault();
                        window.history.pushState({}, '', r.path);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-soft'
                        : isDark
                        ? 'hover:bg-brand-800 text-brand-50/70'
                        : 'hover:bg-brand-100 text-brand-800'
                    }`}
                  >
                    <span>{r.label}</span>
                    <span className={`text-[10px] font-semibold rounded px-1.5 py-0.2 ${isActive ? 'bg-white/20 text-white' : 'bg-brand-500/10 text-brand-500'}`}>
                      {r.badge}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Pestañas de Secciones Funcionales de la Vista */}
            {sectionTabs.length > 0 && (
              <div className="flex flex-col gap-1 border-t pt-3 border-brand-800/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500/80 mb-1">Secciones de la Vista</span>
                <nav className="flex flex-col gap-1" aria-label="Secciones">
                  {sectionTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab?.(tab.id)}
                        className={`flex flex-col items-start rounded-xl p-2.5 text-left transition cursor-pointer ${
                          isActive
                            ? 'bg-brand-500 text-white font-bold shadow-md'
                            : isDark
                            ? 'text-brand-50/70 hover:bg-brand-800/80 hover:text-white'
                            : 'text-brand-800 hover:bg-brand-100'
                        }`}
                      >
                        <span className="text-xs font-bold">{tab.label}</span>
                        {tab.subtitle && (
                          <span className={`text-[10px] ${isActive ? 'text-white/80' : 'opacity-60'}`}>
                            {tab.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}
          </div>

          {/* Retorno al Hub */}
          <div className="border-t pt-3 border-brand-800/30">
            <a
              href="/"
              onClick={(e) => {
                if (typeof window !== 'undefined' && window.history?.pushState) {
                  e.preventDefault();
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className={`flex items-center justify-center gap-2 rounded-xl p-2 text-xs font-bold transition border ${
                isDark
                  ? 'bg-brand-950 text-brand-50/80 border-brand-800 hover:bg-black'
                  : 'bg-brand-100 text-brand-900 border-brand-200 hover:bg-brand-200'
              }`}
            >
              🏠 Hub Principal
            </a>
          </div>
        </aside>

        {/* SIDEBAR DESPLEGABLE MÓVIL */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 flex bg-brand-950/80 backdrop-blur-xs p-4 animate-in fade-in">
            <div
              className={`w-full max-w-xs rounded-2xl p-5 shadow-2xl border flex flex-col justify-between gap-4 ${
                isDark ? 'bg-brand-900 border-brand-800 text-white' : 'bg-white border-brand-200 text-brand-900'
              }`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-3 border-brand-800/30">
                  <h3 className="font-bold text-sm uppercase">Navegación Admin</h3>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="rounded-xl bg-brand-500/10 px-2 py-1 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Módulos Admin</span>
                  {adminRoutes.map((r) => (
                    <a
                      key={r.path}
                      href={r.path}
                      onClick={(e) => {
                        if (typeof window !== 'undefined' && window.history?.pushState) {
                          e.preventDefault();
                          window.history.pushState({}, '', r.path);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                          setMobileSidebarOpen(false);
                        }
                      }}
                      className={`rounded-xl p-2.5 text-xs font-bold transition ${
                        currentRoute === r.path ? 'bg-brand-500 text-white' : 'hover:bg-brand-500/10'
                      }`}
                    >
                      {r.label}
                    </a>
                  ))}
                </div>

                {sectionTabs.length > 0 && (
                  <div className="flex flex-col gap-1 border-t pt-3 border-brand-800/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Secciones</span>
                    {sectionTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          onSelectTab?.(tab.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`rounded-xl p-2.5 text-left text-xs font-bold transition ${
                          activeTab === tab.id ? 'bg-brand-500 text-white' : 'hover:bg-brand-500/10'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ÁREA PRINCIPAL MAIN (ÚNICA QUE HACE SCROLL VERTICAL) */}
        <main className={`flex-1 h-full overflow-y-auto p-4 lg:p-6 ${isDark ? 'bg-brand-950 text-brand-50' : 'bg-brand-50 text-brand-900'}`}>
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            {/* BOTÓN BARRA MÓVIL */}
            <div className="sm:hidden flex items-center justify-between rounded-xl p-3 border shadow-soft bg-brand-500/10 border-brand-500/20">
              <span className="text-xs font-bold">{title}</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-bold text-white shadow-soft"
              >
                📋 Menú Admin
              </button>
            </div>

            {children}
          </div>
        </main>
      </div>

      {/* PIE DE PÁGINA FIJO */}
      <AppFooter theme={theme} />
    </div>
  );
}
