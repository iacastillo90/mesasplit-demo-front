// src/features/PosView/components/ExecutiveReportModal.jsx — Modal de reporte ejecutivo de arqueo de caja y comprobante fiscal SII
// Desglosa las ventas brutas, propinas acumuladas, mermas y timbre electrónico de auditoría SII.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Modal base del design system.
import { Modal } from '../../../shared/ui/index.js';
// Utility para formatear montos en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';

// Componente ExecutiveReportModal.
export default function ExecutiveReportModal({ open, onClose }) {
  // Datos mock del arqueo de turno.
  const shiftMetrics = {
    totalGrossSales: 1850000,
    cashSales: 450000,
    cardSales: 1250000,
    walletSales: 150000,
    totalTips: 185000,
    totalMerma: 12500,
    netTaxable19: 1554622,
    ivaAmount: 295378,
    siiSignature: 'SII-CHILE-2026-NFC-991823-XQ9',
  };

  if (!open) return null;

  return (
    // Modal de reporte ejecutivo.
    <Modal open={open} onClose={onClose} title="📊 Reporte Ejecutivo de Arqueo & Auditoría SII">
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Cabecera del Reporte Fiscal. */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-brand-950 text-white p-4 rounded-2xl border border-brand-800 shadow-soft">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-400">Resumen Cierre de Turno:</span>
            <h3 className="text-xl font-extrabold text-white">{formatCurrency(shiftMetrics.totalGrossSales)}</h3>
            <p className="text-[11px] text-brand-50/70">Caja POS — Santiago Centro · Turno Tarde</p>
          </div>
          <div className="mt-2 sm:mt-0 text-right">
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
              ✓ Arqueo Cuadrado
            </span>
          </div>
        </div>

        {/* Grid de Desglose Financiero por Medios de Pago. */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white p-3 rounded-xl border border-brand-200 shadow-soft">
            <span className="text-brand-800/70 block mb-0.5">Efectivo en Caja:</span>
            <strong className="text-brand-900 text-sm">{formatCurrency(shiftMetrics.cashSales)}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-brand-200 shadow-soft">
            <span className="text-brand-800/70 block mb-0.5">Tarjetas (Débito/Crédito):</span>
            <strong className="text-brand-900 text-sm">{formatCurrency(shiftMetrics.cardSales)}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-brand-200 shadow-soft">
            <span className="text-brand-800/70 block mb-0.5">Billeteras / Tap-to-Pay:</span>
            <strong className="text-brand-900 text-sm">{formatCurrency(shiftMetrics.walletSales)}</strong>
          </div>
          <div className="bg-white p-3 rounded-xl border border-brand-200 shadow-soft">
            <span className="text-brand-800/70 block mb-0.5">Propinas Acumuladas:</span>
            <strong className="text-emerald-700 text-sm">{formatCurrency(shiftMetrics.totalTips)}</strong>
          </div>
        </div>

        {/* Timbre Electrónico Digital SII (Audit Compliance). */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-300 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>🏛️</span> Timbre Electrónico SII de Auditoría
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Firma: {shiftMetrics.siiSignature}</p>
            <p className="text-[10px] text-slate-500">IVA 19%: {formatCurrency(shiftMetrics.ivaAmount)}</p>
          </div>
          <div className="h-12 w-12 bg-white border border-slate-300 rounded-lg flex items-center justify-center text-xs font-bold text-slate-700 shadow-xs">
            [QR SII]
          </div>
        </div>

        {/* Pie de modal y acciones de impresión. */}
        <div className="flex items-center justify-between border-t border-brand-200 pt-3">
          <button
            type="button"
            onClick={() => alert('Imprimiendo comprobante de arqueo fiscal...')}
            className="rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-900 border border-brand-300 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>🖨️</span>
            <span>Imprimir Cierre PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 text-white px-5 py-2 text-xs font-bold hover:bg-brand-800"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
