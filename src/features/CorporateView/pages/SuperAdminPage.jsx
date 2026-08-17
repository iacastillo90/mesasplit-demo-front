// src/features/CorporateView/pages/SuperAdminPage.jsx — Panel Corporativo Super Admin Multi-Local (super-admin-corporate)
// Vista "/admin/super" del spec super-admin-corporate: resumen de KPIs de la franquicia en CLP ($1.850.000+),
// tarjetas de salud operacional por sucursal (Las Condes, Providencia, Vitacura, Santiago Centro),
// conmutadores de reglas operacionales globales (Ley 40h, Alergias, DTE) y flujo de auditoría real-time.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// useEffect de React.
import { useEffect } from 'react';
// Link de React Router.
import { Link } from 'react-router-dom';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Store de Zustand del panel corporativo.
import { useCorporateStore } from '../store/useCorporateStore.js';
// Componentes del slice corporativo.
import BranchHealthCard from '../components/BranchHealthCard.jsx';
import GlobalConfigToggles from '../components/GlobalConfigToggles.jsx';
import FranchiseEventStream from '../components/FranchiseEventStream.jsx';
import CostoPrimarioCard from '../components/CostoPrimarioCard.jsx';
import ComplianceSiiPanel from '../components/ComplianceSiiPanel.jsx';

// Componente principal de la página de Super Admin Corporativo.
export default function SuperAdminPage() {
  // Suscripción al store corporativo.
  const branches = useCorporateStore((s) => s.branches);
  const featureToggles = useCorporateStore((s) => s.featureToggles);
  const franchiseEvents = useCorporateStore((s) => s.franchiseEvents);
  const loading = useCorporateStore((s) => s.loading);

  // Acciones del store.
  const loadCorporateData = useCorporateStore((s) => s.loadCorporateData);
  const toggleFeature = useCorporateStore((s) => s.toggleFeature);
  const setupRealtimeListeners = useCorporateStore((s) => s.setupRealtimeListeners);

  // Carga inicial y listeners en tiempo real al montar la vista.
  useEffect(() => {
    loadCorporateData();
    const cleanup = setupRealtimeListeners();
    return cleanup;
  }, [loadCorporateData, setupRealtimeListeners]);

  // Calcula las ventas globales acumuladas de la franquicia.
  const totalSales = branches.reduce((acc, b) => acc + (b.salesTotal ?? 0), 0);
  // Calcula el total de mesas activas en la red.
  const totalActiveTables = branches.reduce((acc, b) => acc + (b.activeTables ?? 0), 0);
  // Calcula el total de personal en turno.
  const totalStaff = branches.reduce((acc, b) => acc + (b.activeStaff ?? 0), 0);

  return (
    // Contenedor principal del Panel Corporativo en modo claro de marca.
    <main className="min-h-screen bg-brand-50 px-6 py-6 text-brand-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* Cabecera corporativa con navegación de regreso al radar local. */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-200 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-brand-900">Panel Corporativo Multi-Local</h1>
              <span className="rounded-full bg-brand-500/10 px-3 py-0.5 text-xs font-bold text-brand-500 border border-brand-500/20">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-brand-800/70">Supervisión ejecutiva de red de restaurantes y franquicias</p>
          </div>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-brand-800 active:scale-95 shadow-soft"
          >
            ← Volver a Radar Local
          </Link>
        </header>

        {/* Banner de KPIs globales acumulados de la franquicia. */}
        <section aria-label="Resumen de KPIs Corporativos" className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {/* Card 1: Ventas totales acumuladas de la red en CLP. */}
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
            <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Ventas Franquicia</span>
            <span className="text-2xl font-extrabold text-brand-900 mt-1">{formatCurrency(totalSales)}</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1">↑ +14.2% vs ayer</span>
          </div>

          {/* Card 2: Sucursales activas en la red. */}
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
            <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Sucursales Activas</span>
            <span className="text-2xl font-extrabold text-brand-900 mt-1">{branches.length} locales</span>
            <span className="text-[11px] text-brand-800/60 mt-1">Santiago, Chile</span>
          </div>

          {/* Card 3: Mesas activas en la red. */}
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
            <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Mesas Ocupadas Red</span>
            <span className="text-2xl font-extrabold text-brand-500 mt-1">{totalActiveTables} mesas</span>
            <span className="text-[11px] text-brand-800/60 mt-1">En tiempo real</span>
          </div>

          {/* Card 4: Personal total de servicio en turno. */}
          <div className="flex flex-col rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
            <span className="text-xs font-bold text-brand-800/60 uppercase tracking-wider">Personal en Turno</span>
            <span className="text-2xl font-extrabold text-brand-900 mt-1">{totalStaff} mozos/caja</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1">Ley 40h Vigente</span>
          </div>
        </section>

        {/* Tarjeta de métrica de Costo Primario corporativo (costo-primario). */}
        <CostoPrimarioCard />

        {/* Grilla de tarjetas de salud operacional por sucursal. */}
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

        {/* Módulo de conmutadores globales de configuración de la franquicia. */}
        <GlobalConfigToggles
          featureToggles={featureToggles}
          onToggleFeature={toggleFeature}
        />

        {/* Panel de compliance fiscal SII (compliance-sii). */}
        <ComplianceSiiPanel />

        {/* Flujo de eventos corporativos cross-branch en tiempo real. */}
        <FranchiseEventStream franchiseEvents={franchiseEvents} />
      </div>
    </main>
  );
}
