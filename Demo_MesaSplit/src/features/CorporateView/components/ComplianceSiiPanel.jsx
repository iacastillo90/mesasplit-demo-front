// src/features/CorporateView/components/ComplianceSiiPanel.jsx — panel de compliance fiscal SII (compliance-sii)
// Panel read-only para el Super Admin Corporativo que valida 3 verificaciones clave del SII:
// 1. Emisión DTE Boleta/Factura.
// 2. Correlativo de Folios Consecutivos (SII).
// 3. Sistema de Arqueo y Cierre Ciego de Caja.
// No muta los stores corporativo ni POS.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios por cada línea).

// Store corporativo y selectores puros de compliance.
import {
  selectCierreCiegoOk,
  selectFoliosConsecutivos,
  selectHasDteBoleta,
  useCorporateStore,
} from '../store/useCorporateStore.js';

// Componente ComplianceSiiPanel.
export default function ComplianceSiiPanel() {
  // Evaluaciones de los 3 checks de compliance fiscal SII.
  const hasDte = useCorporateStore(selectHasDteBoleta);
  const foliosOk = useCorporateStore(selectFoliosConsecutivos);
  const cierreCiegoOk = useCorporateStore(selectCierreCiegoOk);

  return (
    // Sección contenedora del panel de cumplimiento fiscal.
    <section aria-label="Compliance Fiscal SII" className="flex flex-col gap-3">
      {/* Título de la sección de compliance. */}
      <h2 className="text-xs font-bold uppercase tracking-wider text-brand-800/70">
        Compliance Fiscal SII & Auditoría
      </h2>

      {/* Grilla de 3 tarjetas de verificación fiscal. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Check 1: Emisión DTE Boleta/Factura. */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-brand-200 shadow-soft">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-900">Emisión DTE Boleta</span>
            <span className="text-[11px] text-brand-800/60">Integración DTE Activa</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              hasDte
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {hasDte ? '✅ OK' : '⚠️ Pendiente'}
          </span>
        </div>

        {/* Check 2: Secuencia de Folios SII Consecutivos. */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-brand-200 shadow-soft">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-900">Secuencia de Folios SII</span>
            <span className="text-[11px] text-brand-800/60">Correlativo sin salteos</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              foliosOk
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {foliosOk ? '✅ OK' : '🚨 Riesgo'}
          </span>
        </div>

        {/* Check 3: Arqueo y Cierre Ciego de Caja. */}
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 border border-brand-200 shadow-soft">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-brand-900">Arqueo Cierre Ciego</span>
            <span className="text-[11px] text-brand-800/60">Auditoría con PIN activo</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              cierreCiegoOk
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {cierreCiegoOk ? '✅ OK' : '⚠️ Sin Arqueo'}
          </span>
        </div>
      </div>
    </section>
  );
}
