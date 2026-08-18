// src/features/PosView/components/PosDailyReportsModal.jsx — modal de reportes diarios, arqueo, cuadre de caja y desglose DTE
// Permite al cajero/administrador consultar ventas diarias por medio de pago, DTEs (Boletas vs Facturas), realizar cuadre físico de caja y exportar a Excel.
// Cumple estrictamente con AGENTS.md: cada línea comentada en español.

import { useState } from 'react';
import { formatCurrency, exportToCsv } from '../../../shared/utils/index.js';

export default function PosDailyReportsModal({ open, onClose }) {
  // Conteo físico de efectivo ingresado por el cajero para el cuadre. Default: 245000 (cuadre perfecto).
  const [physicalCashCount, setPhysicalCashCount] = useState('245000');

  if (!open) return null;

  // Datos financieros simulados en tiempo real.
  const openingFloat = 100000;
  const cashSales = 145000;
  const cardSales = 320000;
  const transferSales = 85000;
  const totalSales = cashSales + cardSales + transferSales; // 550.000

  // Desglose DTE.
  const boletasCount = 42;
  const boletasAmount = 420000;
  const facturasCount = 8;
  const facturasAmount = 130000;

  // Cuadre de caja.
  const expectedCashInDrawer = openingFloat + cashSales; // 245.000
  const physicalCashNum = Number(physicalCashCount) || 0;
  const variance = physicalCashNum - expectedCashInDrawer;

  // Manejador de exportación a Excel / CSV.
  const handleExportCsv = () => {
    const reportData = [
      { Concepto: 'Fondo Apertura Caja', Monto: openingFloat, Unidades: 1 },
      { Concepto: 'Ventas en Efectivo', Monto: cashSales, Unidades: 18 },
      { Concepto: 'Ventas con Tarjeta (Débito/Crédito)', Monto: cardSales, Unidades: 26 },
      { Concepto: 'Ventas por Transferencia / QR', Monto: transferSales, Unidades: 6 },
      { Concepto: 'TOTAL RECAUDADO DÍA', Monto: totalSales, Unidades: 50 },
      { Concepto: 'DTE Boletas Electrónicas', Monto: boletasAmount, Unidades: boletasCount },
      { Concepto: 'DTE Facturas Electrónicas con RUT', Monto: facturasAmount, Unidades: facturasCount },
      { Concepto: 'Conteo Físico Efectivo', Monto: physicalCashNum, Unidades: 1 },
      { Concepto: 'Diferencia / Cuadre Caja', Monto: variance, Unidades: 1 },
    ];

    exportToCsv(`Reporte_Diario_Caja_MesaSplit_${new Date().toISOString().slice(0, 10)}.csv`, reportData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex w-full max-w-2xl flex-col gap-5 rounded-3xl bg-white p-6 shadow-2xl border border-brand-200 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del modal */}
        <div className="flex items-center justify-between border-b border-brand-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h2 className="text-lg font-extrabold text-brand-900">Reporte Diario & Cuadre de Caja</h2>
              <p className="text-xs text-brand-800/60">Balance diario de ventas, DTEs (Boletas vs Facturas) y arqueo de efectivo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-brand-400 hover:bg-brand-50 hover:text-brand-900 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Resumen de Ventas Diarias por Medio de Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">💵 Efectivo Recaudado</span>
            <p className="text-lg font-black text-emerald-700 mt-1">{formatCurrency(cashSales)}</p>
            <span className="text-[10px] font-semibold text-emerald-600">18 Transacciones</span>
          </div>

          <div className="rounded-2xl bg-sky-50 p-4 border border-sky-200">
            <span className="text-xs font-bold text-sky-800 uppercase tracking-wider">💳 Tarjetas (Transbank)</span>
            <p className="text-lg font-black text-sky-700 mt-1">{formatCurrency(cardSales)}</p>
            <span className="text-[10px] font-semibold text-sky-600">26 Transacciones</span>
          </div>

          <div className="rounded-2xl bg-purple-50 p-4 border border-purple-200">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">📱 Transferencias / MP</span>
            <p className="text-lg font-black text-purple-700 mt-1">{formatCurrency(transferSales)}</p>
            <span className="text-[10px] font-semibold text-purple-600">6 Transacciones</span>
          </div>
        </div>

        {/* Desglose Tributario DTE SII */}
        <div className="rounded-2xl bg-brand-50 p-4 border border-brand-200 flex flex-col gap-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-900 flex items-center gap-1">
            <span>📄 Desglose de Documentos Tributarios (DTE)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-brand-100 shadow-sm">
              <div>
                <span className="font-extrabold text-brand-900">🧾 Boletas Electrónicas</span>
                <p className="text-[10px] text-brand-800/60">{boletasCount} boletas emitidas</p>
              </div>
              <span className="font-black text-brand-900">{formatCurrency(boletasAmount)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-brand-100 shadow-sm">
              <div>
                <span className="font-extrabold text-amber-900">🏢 Facturas Electrónicas (RUT)</span>
                <p className="text-[10px] text-amber-800/60">{facturasCount} facturas emitidas</p>
              </div>
              <span className="font-black text-amber-900">{formatCurrency(facturasAmount)}</span>
            </div>
          </div>
        </div>

        {/* Sección de Arqueo y Cuadre de Caja */}
        <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-300/60 flex flex-col gap-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
            🔒 Arqueo Físico de Gaveta de Caja
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs">
            <div>
              <span className="text-brand-800/70 font-semibold">Esperado en Gaveta:</span>
              <p className="font-extrabold text-brand-900 text-sm">{formatCurrency(expectedCashInDrawer)}</p>
              <span className="text-[10px] text-brand-800/60">($100k inicio + $145k ventas)</span>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="physical-cash-input" className="font-bold text-amber-900">
                Conteo Físico Real:
              </label>
              <input
                id="physical-cash-input"
                type="number"
                value={physicalCashCount}
                onChange={(e) => setPhysicalCashCount(e.target.value)}
                className="rounded-xl bg-white px-3 py-1.5 font-bold text-brand-900 border border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <span className="text-brand-800/70 font-semibold">Cuadre / Diferencia:</span>
              <p className={`font-extrabold text-sm ${variance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {variance === 0 ? '✅ Sin Diferencia ($0)' : formatCurrency(variance)}
              </p>
            </div>
          </div>
        </div>

        {/* Botón de exportación a Excel / CSV y cierre */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="w-full sm:w-auto rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center justify-center gap-2"
          >
            <span>📥 Exportar Reporte a Excel (CSV)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-2xl bg-brand-900 hover:bg-brand-950 px-6 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>
    </div>
  );
}
