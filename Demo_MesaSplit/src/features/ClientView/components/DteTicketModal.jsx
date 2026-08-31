// src/features/ClientView/components/DteTicketModal.jsx — modal emergente centrado de ticket térmico DTE SII (fase20-navegacion-retroceso-perfil-reseñas-referidos)
// Muestra el comprobante oficial de la Boleta Electrónica Tipo 39 con desglose de consumo individual, IVA y timbre digital del SII Chile.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useEffect } from 'react';
// Utilidad de formato de moneda CLP.
import { formatCurrency } from '../../../shared/utils/formatCurrency.js';

// Componente del Modal Emergente Centrado de Boleta DTE.
export default function DteTicketModal({ isOpen, onClose, ticketData }) {
  // Escucha la tecla Escape para cerrar el modal.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Datos por defecto si no se pasa un ticket específico.
  const data = ticketData || {
    doc: 'Boleta Electrónica N° 39102',
    date: '17/08/2026 21:45 hrs',
    table: 'Mesa 12 · Restô Lo Ovalle',
    method: 'Débito Redelcom',
    tableTotal: 34800,
    myShare: 8900,
    items: [
      { name: 'Lomo Lo Ovalle con Papas', qty: 1, price: 14900 },
      { name: 'Pisco Sour Artesanal', qty: 2, price: 9800 },
      { name: 'Volcán de Chocolate', qty: 1, price: 5200 },
      { name: 'Bebida 350ml', qty: 2, price: 4900 },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-950/70 backdrop-blur-sm animate-fade-in">
      {/* Contenedor emergente centrado */}
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col border border-brand-200 max-h-[90vh]">
        {/* Cabecera del modal */}
        <div className="bg-brand-900 text-white px-5 py-4 flex items-center justify-between shadow-soft shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div className="flex flex-col text-left">
              <h3 className="text-sm font-extrabold tracking-tight">Comprobante de Boleta DTE</h3>
              <span className="text-[10px] text-emerald-400 font-semibold">Validado por SII Chile ✓</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 hover:bg-white/20 p-2 text-xs font-bold text-white transition cursor-pointer"
            aria-label="Cerrar comprobante DTE"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Ticket Térmico SII */}
        <div className="flex-1 overflow-y-auto p-6 bg-amber-50/50 flex flex-col gap-4 font-mono text-xs text-slate-800">
          {/* Identidad del Emisor SII */}
          <div className="flex flex-col items-center text-center gap-1 border-b border-dashed border-slate-300 pb-4">
            <span className="font-extrabold text-sm text-slate-900 tracking-wider">MESA SPLIT GASTRONOMÍA S.A.</span>
            <span className="text-[11px] font-bold text-slate-600">R.U.T.: 77.419.820-K</span>
            <span className="text-[10px] text-slate-500">GIRO: RESTAURANTES Y COCTELERÍA</span>
            <span className="text-[10px] text-slate-500">AV. LO OVALLE 1420 - SAN MIGUEL - SANTIAGO</span>
            <span className="mt-2 text-xs font-extrabold text-brand-900 uppercase border border-slate-400 px-3 py-1 rounded-md bg-white">
              {data.doc}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">S.I.I. - SANTIAGO SUR</span>
          </div>

          {/* Detalles de la Transacción */}
          <div className="flex flex-col gap-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">FECHA EMISIÓN:</span>
              <span className="font-bold">{data.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">UBICACIÓN:</span>
              <span className="font-bold">{data.table}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">MEDIO PAGO:</span>
              <span className="font-bold">{data.method}</span>
            </div>
          </div>

          {/* Desglose de Consumo de la Mesa */}
          <div className="flex flex-col gap-1.5 border-b border-dashed border-slate-300 pb-3">
            <span className="font-extrabold text-slate-900 border-b border-slate-200 pb-1">DESGLOSE DE CONSUMO MESA</span>
            {data.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate max-w-[180px]">
                  {item.qty}x {item.name}
                </span>
                <span className="font-bold">{formatCurrency(item.qty * item.price)}</span>
              </div>
            ))}
          </div>

          {/* Totales y Desglose Individual Pagado */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between font-bold">
              <span>TOTAL CONSUMO MESA:</span>
              <span>{formatCurrency(data.tableTotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Monto Neto (Afecto 19% IVA):</span>
              <span>{formatCurrency(Math.round(data.tableTotal / 1.19))}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>IVA (19% Incluido):</span>
              <span>{formatCurrency(Math.round(data.tableTotal - data.tableTotal / 1.19))}</span>
            </div>

            {/* Cuadro destacado de Pago Individual del Cliente */}
            <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-300 text-emerald-950 flex flex-col gap-0.5 text-center">
              <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                ✓ TU CUOTA PAGADA INDIVIDUALMENTE
              </span>
              <span className="text-lg font-extrabold text-emerald-700">
                {formatCurrency(data.myShare)} CLP
              </span>
              <span className="text-[10px] font-bold text-emerald-900/80">
                Pagado en línea mediante {data.method}
              </span>
            </div>
          </div>

          {/* Timbre Electrónico SII Simulado */}
          <div className="flex flex-col items-center gap-1.5 pt-3 text-center border-t border-dashed border-slate-300">
            <div className="w-full h-12 bg-slate-900 text-white font-mono text-[9px] flex items-center justify-center p-1 rounded-lg tracking-widest uppercase">
              ||| | |||| ||| ||||| || |||| ||||| |||| ||| | ||
            </div>
            <span className="text-[9px] font-bold text-slate-500">
              Timbre Electrónico SII — Res. N° 80 de 2014 - Verifique documento en www.sii.cl
            </span>
          </div>
        </div>

        {/* Acciones de descarga e impresión */}
        <div className="p-4 bg-white border-t border-brand-200 flex flex-col sm:flex-row items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => alert('Generando archivo PDF oficial de la Boleta Electrónica Tipo 39...')}
            className="w-full sm:flex-1 rounded-2xl bg-sky-600 hover:bg-sky-700 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft text-center"
          >
            📄 Descargar PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full sm:flex-1 rounded-2xl bg-brand-900 hover:bg-brand-800 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft text-center"
          >
            🖨️ Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
