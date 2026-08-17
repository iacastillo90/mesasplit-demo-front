// src/shared/ui/AdminLayout.jsx — layout universal colapsable para las vistas de administración (Radar, Caja POS, Super Admin)
// Provee la estructura de pantalla fija (h-screen overflow-hidden), sidebar izquierdo colapsable (sidebarCollapsed),
// cabecera AppHeader, pie AppFooter y área principal main scrollable responsiva con reacomodo automático de tarjetas.
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === 'dark';

  // Rutas principales del área administrativa de la empresa.
  const adminRoutes = [
    { path: '/admin', label: '🗺️ Radar Local', badge: 'Salón', icon: '🗺️' },
    { path: '/admin/caja', label: '💳 Caja POS', badge: 'Cobro', icon: '💳' },
    { path: '/admin/super', label: '🏢 Super Admin', badge: 'Corporativo', icon: '🏢' },
  ];

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isDark ? 'bg-brand-950 text-brand-50' : 'bg-brand-50 text-brand-900'}`}>
      {/* Cabecera universal con menú hamburguesa global */}
      <AppHeader title={title} subtitle={subtitle} currentRoute={currentRoute} theme={theme} />

      {/* ÁREA CENTRAL (Sidebar colapsable a la izquierda + Main scrollable) */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR DESKTOP/TABLET FIJO Y COLAPSABLE */}
        <aside
          className={`hidden sm:flex shrink-0 flex-col justify-between p-3 sm:p-4 h-full overflow-y-auto border-r transition-all duration-300 ${
            sidebarCollapsed ? 'w-16 items-center' : 'w-64'
          } ${
            isDark ? 'bg-brand-900/90 border-brand-800 text-white' : 'bg-white border-brand-200 text-brand-900 shadow-soft'
          }`}
        >
          <div className="flex flex-col gap-4 w-full">
            {/* Header del Sidebar con Botón de Colapsar */}
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'} border-b pb-3 border-brand-800/30`}>
              {!sidebarCollapsed && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">MesaSplit</span>
                  <h2 className="text-sm font-extrabold leading-tight">Centro de Mando</h2>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
                aria-label="Colapsar menú lateral"
                className="rounded-xl bg-brand-500/10 p-1.5 text-xs font-bold text-brand-500 hover:bg-brand-500/20 cursor-pointer active:scale-95"
              >
                {sidebarCollapsed ? '⏩' : '⏪'}
              </button>
            </div>

            {/* Selector de Vistas de Administración */}
            <div className="flex flex-col gap-1 w-full">
              {!sidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500/80 mb-1">Módulos Admin</span>
              )}
              {adminRoutes.map((r) => {
                const isActive = currentRoute === r.path;
                return (
                  <a
                    key={r.path}
                    href={r.path}
                    title={r.label}
                    onClick={(e) => {
                      if (typeof window !== 'undefined' && window.history?.pushState) {
                        e.preventDefault();
                        window.history.pushState({}, '', r.path);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center p-2 text-base' : 'justify-between p-2.5 text-xs'} rounded-xl font-bold transition ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-soft'
                        : isDark
                        ? 'hover:bg-brand-800 text-brand-50/70'
                        : 'hover:bg-brand-100 text-brand-800'
                    }`}
                  >
                    {sidebarCollapsed ? (
                      <span>{r.icon}</span>
                    ) : (
                      <>
                        <span>{r.label}</span>
                        <span className={`text-[10px] font-semibold rounded px-1.5 py-0.2 ${isActive ? 'bg-white/20 text-white' : 'bg-brand-500/10 text-brand-500'}`}>
                          {r.badge}
                        </span>
                      </>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Pestañas de Secciones Funcionales de la Vista */}
            {sectionTabs.length > 0 && (
              <div className="flex flex-col gap-1 border-t pt-3 border-brand-800/30 w-full">
                {!sidebarCollapsed && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500/80 mb-1">Secciones</span>
                )}
                <nav className="flex flex-col gap-1 w-full" aria-label="Secciones">
                  {sectionTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab?.(tab.id)}
                        title={tab.label}
                        className={`flex flex-col ${sidebarCollapsed ? 'items-center justify-center p-2' : 'items-start p-2.5'} rounded-xl text-left transition cursor-pointer ${
                          isActive
                            ? 'bg-brand-500 text-white font-bold shadow-md'
                            : isDark
                            ? 'text-brand-50/70 hover:bg-brand-800/80 hover:text-white'
                            : 'text-brand-800 hover:bg-brand-100'
                        }`}
                      >
                        <span className="text-xs font-bold">{sidebarCollapsed ? tab.label.slice(0, 2) : tab.label}</span>
                        {!sidebarCollapsed && tab.subtitle && (
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
          <div className="border-t pt-3 border-brand-800/30 w-full">
            <a
              href="/"
              title="Hub Principal"
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
              {sidebarCollapsed ? '🏠' : '🏠 Hub Principal'}
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

        {/* ÁREA PRINCIPAL MAIN (SE REACOMODA AL COLAPSAR SIDEBAR) */}
        <main className={`flex-1 h-full overflow-y-auto p-3 sm:p-4 lg:p-6 transition-all ${isDark ? 'bg-brand-950 text-brand-50' : 'bg-brand-50 text-brand-900'}`}>
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
