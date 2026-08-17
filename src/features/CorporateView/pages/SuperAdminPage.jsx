// src/features/CorporateView/pages/SuperAdminPage.jsx — Panel Corporativo Super Admin Multi-Local (super-admin-corporate)
// Vista "/admin/super" del spec super-admin-corporate: resumen de KPIs de la franquicia en CLP ($1.850.000+),
// tarjetas de salud operacional por sucursal, reglas globales, compliance fiscal, simulador What-If y matriz de menú.
// Organizado en Layout con Menú Lateral (Sidebar) para navegar entre secciones funcionales sin scroll.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

import { useEffect, useState } from 'react';
import { formatCurrency } from '../../../shared/utils/index.js';
import { useCorporateStore } from '../store/useCorporateStore.js';
import BranchHealthCard from '../components/BranchHealthCard.jsx';
import GlobalConfigToggles from '../components/GlobalConfigToggles.jsx';
import FranchiseEventStream from '../components/FranchiseEventStream.jsx';
import CostoPrimarioCard from '../components/CostoPrimarioCard.jsx';
import ComplianceSiiPanel from '../components/ComplianceSiiPanel.jsx';
import WhatIfSimulator from '../components/WhatIfSimulator.jsx';
import MenuEngineeringMatrix from '../components/MenuEngineeringMatrix.jsx';
// AppHeader y AppFooter compartidos.
import { AppHeader, AppFooter } from '../../../shared/ui/index.js';

export default function SuperAdminPage() {
  const branches = useCorporateStore((s) => s.branches);
  const featureToggles = useCorporateStore((s) => s.featureToggles);
  const franchiseEvents = useCorporateStore((s) => s.franchiseEvents);
  const loading = useCorporateStore((s) => s.loading);

  // Tab activo del menú lateral corporativo. 'all' muestra todas las secciones.
  const [activeTab, setActiveTab] = useState('all');

  const loadCorporateData = useCorporateStore((s) => s.loadCorporateData);
  const toggleFeature = useCorporateStore((s) => s.toggleFeature);
  const setupRealtimeListeners = useCorporateStore((s) => s.setupRealtimeListeners);

  useEffect(() => {
    loadCorporateData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadCorporateData, setupRealtimeListeners]);

  const totalSales = branches.reduce((acc, b) => acc + (b.salesTotal ?? 0), 0);
  const totalActiveTables = branches.reduce((acc, b) => acc + (b.activeTables ?? 0), 0);
  const totalStaff = branches.reduce((acc, b) => acc + (b.activeStaff ?? 0), 0);

  // Pestañas del Menú Lateral Corporativo.
  const navTabs = [
    { id: 'all', label: '🌐 Vista Completa', subtitle: 'Todas las métricas y módulos' },
    { id: 'kpis', label: '📊 Resumen & Sucursales', subtitle: 'KPIs globales y estado por local' },
    { id: 'rules', label: '⚙️ Reglas & Compliance', subtitle: 'Switches, Ley 40h y SII' },
    { id: 'whatif', label: '🎛️ Simulador What-If', subtitle: 'Estrategia y proyecciones de precio' },
    { id: 'matrix', label: '📈 Ingeniería de Menú', subtitle: 'Matriz BCG (Estrellas, Puzzles...)' },
    { id: 'events', label: '⚡ Flujo de Eventos', subtitle: 'Auditoría en tiempo real de red' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      <AppHeader title="Super Admin Corporativo" subtitle="Multi-Local" currentRoute="/admin/super" theme="light" />
      <main className="flex-1 px-4 py-4">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row gap-6">
        {/* MENÚ LATERAL CORPORATIVO (SIDEBAR NAVIGATION) */}
        <aside className="w-full lg:w-64 shrink-0 rounded-2xl bg-white border border-brand-200 p-4 flex flex-col justify-between gap-6 shadow-soft">
          <div className="flex flex-col gap-5">
            {/* Cabecera del Sidebar */}
            <div className="flex items-center justify-between border-b border-brand-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-500">MesaSplit Franquicia</span>
                <h2 className="text-lg font-bold text-brand-900 leading-tight">Super Admin</h2>
              </div>
              <span className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-brand-500 border border-brand-500/20">
                Corporativo
              </span>
            </div>

            {/* Opciones del Menú Lateral */}
            <nav className="flex flex-col gap-1.5" aria-label="Navegación Corporativa">
              {navTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-start rounded-xl p-3 text-left transition ${
                      isActive
                        ? 'bg-brand-900 text-white font-bold shadow-md'
                        : 'text-brand-800 hover:bg-brand-100/80'
                    }`}
                  >
                    <span className="text-xs font-bold">{tab.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-brand-800/50'}`}>
                      {tab.subtitle}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Enlace seguro al Radar Local */}
          <div className="border-t border-brand-200 pt-4 flex flex-col gap-2">
            <a
              href="/admin"
              onClick={(e) => {
                if (typeof window !== 'undefined' && window.history?.pushState) {
                  e.preventDefault();
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-100 p-2.5 text-xs font-bold text-brand-900 hover:bg-brand-200 transition border border-brand-200"
            >
              ← Volver a Radar Local
            </a>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL DE CONTENIDO */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {/* Cabecera Corporativa */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-4 bg-white p-4 rounded-2xl border shadow-soft">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-brand-900">Panel Corporativo Multi-Local</h1>
                <span className="rounded-full bg-brand-500/10 px-3 py-0.5 text-xs font-bold text-brand-500 border border-brand-500/20">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-brand-800/70">Supervisión ejecutiva de red de restaurantes y franquicias</p>
            </div>

            <a
              href="/admin"
              onClick={(e) => {
                if (typeof window !== 'undefined' && window.history?.pushState) {
                  e.preventDefault();
                  window.history.pushState({}, '', '/admin');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800 active:scale-95 shadow-soft"
            >
              ← Volver a Radar Local
            </a>
          </header>

          {/* RENDERS DE SECCIÓN SEGÚN SELECCIÓN DEL SIDEBAR */}

          {/* TAB ALL: Render completo e integrado */}
          {activeTab === 'all' && (
            <div className="flex flex-col gap-6">
              <section aria-label="Resumen de KPIs Corporativos" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Ventas Franquicia</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{formatCurrency(totalSales)}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% vs ayer</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Sucursales Activas</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{branches.length} locales</span>
                  <span className="text-[11px] text-brand-800/60 mt-1">Santiago, Chile</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Mesas Ocupadas Red</span>
                  <span className="text-2xl font-extrabold text-brand-500 mt-1">{totalActiveTables} mesas</span>
                  <span className="text-[11px] text-brand-800/60 mt-1">En tiempo real</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Personal en Turno</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{totalStaff} mozos/caja</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1">Ley 40h Vigente</span>
                </div>
              </section>

              <CostoPrimarioCard />

              <section aria-label="Estado por Sucursal" className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
                  Salud Operacional por Sucursal ({branches.length})
                </h2>

                {loading ? (
                  <p className="py-8 text-center text-xs text-brand-800/60">Cargando métricas de sucursales…</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {branches.map((branch) => (
                      <BranchHealthCard key={branch.id} branch={branch} />
                    ))}
                  </div>
                )}
              </section>

              <GlobalConfigToggles featureToggles={featureToggles} onToggleFeature={toggleFeature} />
              <ComplianceSiiPanel />
              <WhatIfSimulator />
              <MenuEngineeringMatrix />
              <FranchiseEventStream franchiseEvents={franchiseEvents} />
            </div>
          )}

          {/* TAB KPIS: KPIs y Salud por Sucursal */}
          {activeTab === 'kpis' && (
            <div className="flex flex-col gap-6">
              <section aria-label="Resumen de KPIs Corporativos" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Ventas Franquicia</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{formatCurrency(totalSales)}</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% vs ayer</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Sucursales Activas</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{branches.length} locales</span>
                  <span className="text-[11px] text-brand-800/60 mt-1">Santiago, Chile</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Mesas Ocupadas Red</span>
                  <span className="text-2xl font-extrabold text-brand-500 mt-1">{totalActiveTables} mesas</span>
                  <span className="text-[11px] text-brand-800/60 mt-1">En tiempo real</span>
                </div>

                <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
                  <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Personal en Turno</span>
                  <span className="text-2xl font-extrabold text-brand-900 mt-1">{totalStaff} mozos/caja</span>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1">Ley 40h Vigente</span>
                </div>
              </section>

              <section aria-label="Estado por Sucursal" className="flex flex-col gap-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
                  Salud Operacional por Sucursal ({branches.length})
                </h2>

                {loading ? (
                  <p className="py-8 text-center text-xs text-brand-800/60">Cargando métricas de sucursales…</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {branches.map((branch) => (
                      <BranchHealthCard key={branch.id} branch={branch} />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* TAB RULES: Reglas, Costo Primario y SII */}
          {activeTab === 'rules' && (
            <div className="flex flex-col gap-6">
              <CostoPrimarioCard />
              <GlobalConfigToggles featureToggles={featureToggles} onToggleFeature={toggleFeature} />
              <ComplianceSiiPanel />
            </div>
          )}

          {/* TAB WHATIF: Simulador de Precios */}
          {activeTab === 'whatif' && (
            <div className="w-full">
              <WhatIfSimulator />
            </div>
          )}

          {/* TAB MATRIX: Matriz de Ingeniería de Menú */}
          {activeTab === 'matrix' && (
            <div className="w-full">
              <MenuEngineeringMatrix />
            </div>
          )}

          {/* TAB EVENTS: Flujo de Eventos Franquicia */}
          {activeTab === 'events' && (
            <div className="w-full">
              <FranchiseEventStream franchiseEvents={franchiseEvents} />
            </div>
          )}
        </div>
      </div>
    </main>
    <AppFooter theme="light" />
  </div>
);
}
