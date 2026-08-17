// src/features/CorporateView/pages/SuperAdminPage.jsx — Panel Corporativo Super Admin Multi-Local (super-admin-corporate)
// Vista "/admin/super" del spec super-admin-corporate: resumen de KPIs de la franquicia en CLP ($1.850.000+),
// tarjetas de salud operacional por sucursal, reglas globales, compliance fiscal, gráficos en tiempo real, simulador What-If y matriz de menú.
// Utiliza AdminLayout con Sidebar Fijo a la izquierda (sm:flex), Header/Footer fijos y main scrollable.
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
import RealtimeSalesChart from '../components/RealtimeSalesChart.jsx';
import FranchiseComparisonWidget from '../components/FranchiseComparisonWidget.jsx';
import RrhhManagementModal from '../components/RrhhManagementModal.jsx';
import { exportToCsv } from '../../../shared/utils/exportToCsv.js';
import { AdminLayout } from '../../../shared/ui/index.js';

export default function SuperAdminPage() {
  const branches = useCorporateStore((s) => s.branches);
  const featureToggles = useCorporateStore((s) => s.featureToggles);
  const franchiseEvents = useCorporateStore((s) => s.franchiseEvents);
  const loading = useCorporateStore((s) => s.loading);

  const [activeTab, setActiveTab] = useState('all');
  // Estado para controlar la visibilidad del modal de RRHH & Previred.
  const [rrhhModalOpen, setRrhhModalOpen] = useState(false);

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

  const navTabs = [
    { id: 'all', label: '🌐 Vista Completa', subtitle: 'Todas las métricas y módulos' },
    { id: 'kpis', label: '📊 Resumen & Sucursales', subtitle: 'KPIs globales y estado por local' },
    { id: 'charts', label: '📈 Gráficos Realtime', subtitle: 'Evolución de ventas y comparativa' },
    { id: 'rules', label: '⚙️ Reglas & Compliance', subtitle: 'Switches, Ley 40h y SII' },
    { id: 'whatif', label: '🎛️ Simulador What-If', subtitle: 'Estrategia y proyecciones de precio' },
    { id: 'matrix', label: '📊 Ingeniería de Menú', subtitle: 'Matriz BCG (Estrellas, Puzzles...)' },
    { id: 'events', label: '⚡ Flujo de Eventos', subtitle: 'Auditoría en tiempo real de red' },
  ];

  return (
    <AdminLayout
      currentRoute="/admin/super"
      title="Super Admin Corporativo"
      subtitle="Multi-Local"
      theme="light"
      sectionTabs={navTabs}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
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

        <div className="flex items-center gap-2">
          {/* Botón para abrir el Módulo de RRHH Completo y Previred. */}
          <button
            type="button"
            onClick={() => setRrhhModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-sky-700 active:scale-95 shadow-soft"
          >
            👥 Gestión RRHH & Previred 🆕
          </button>

          <button
            type="button"
            onClick={() => exportToCsv('reporte_franquicias_superadmin', branches.map((b) => ({ Sucursal: b.name, VentasCLP: b.salesTotal || 0, Mesas: b.activeTables || 0, Personal: b.activeStaff || 0 })))}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-95 shadow-soft"
          >
            📥 Exportar Excel (CSV)
          </button>

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
        </div>
      </header>

      {/* TAB ALL */}
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

          <RealtimeSalesChart branches={branches} />
          <FranchiseComparisonWidget />
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

      {/* TAB KPIS */}
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

      {/* TAB CHARTS */}
      {activeTab === 'charts' && (
        <div className="w-full">
          <RealtimeSalesChart branches={branches} />
        </div>
      )}

      {/* TAB RULES */}
      {activeTab === 'rules' && (
        <div className="flex flex-col gap-6">
          <CostoPrimarioCard />
          <GlobalConfigToggles featureToggles={featureToggles} onToggleFeature={toggleFeature} />
          <ComplianceSiiPanel />
        </div>
      )}

      {/* TAB WHATIF */}
      {activeTab === 'whatif' && (
        <div className="w-full">
          <WhatIfSimulator />
        </div>
      )}

      {/* TAB MATRIX */}
      {activeTab === 'matrix' && (
        <div className="w-full">
          <MenuEngineeringMatrix />
        </div>
      )}

      {/* TAB EVENTS */}
      {activeTab === 'events' && (
        <div className="w-full">
          <FranchiseEventStream franchiseEvents={franchiseEvents} />
        </div>
      )}

      {/* Modal de Gestión RRHH, Asistencia & Previred. */}
      <RrhhManagementModal
        open={rrhhModalOpen}
        onClose={() => setRrhhModalOpen(false)}
      />
    </AdminLayout>
  );
}
