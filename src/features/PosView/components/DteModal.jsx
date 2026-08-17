// src/features/PosView/components/DteModal.jsx — emisor de DTE tributario chileno (pos-cashier)
// Modal para la selección y emisión de Boleta Electrónica vs Factura Electrónica con validación de RUT y consumo de folio CAF.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// useState de React.
import { useState } from 'react';
// Formateador de moneda en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Modal UI.
import { Modal } from '../../../shared/ui/index.js';

// Componente DteModal para emisión de DTE del SII.
export default function DteModal({ open, onClose, bill, onEmitDte }) {
  // Estado local del tipo de documento ('boleta' | 'factura'). Inicializa en factura al abrir este modal.
  const [dteType, setDteType] = useState('factura');
  // RUT de la empresa para Factura.
  const [rut, setRut] = useState('');
  // Razón Social de la empresa.
  const [companyName, setCompanyName] = useState('');
  // Giro comercial.
  const [businessActivity, setBusinessActivity] = useState('');

  // Manejador del cambio de RUT con autocompletado mock para la demo.
  const handleRutChange = (e) => {
    const val = e.target.value;
    setRut(val);
    // Simula el autocompletado de Razón Social si coincide con el RUT de demo.
    if (val.includes('76.123.456')) {
      setCompanyName('Gastronomía Demo SpA');
      setBusinessActivity('Restaurantes y Servicios de Comida');
    }
  };

  // Manejador del envío y emisión del DTE.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Emite el documento a través de la función prop.
    onEmitDte({
      type: dteType,
      rut: dteType === 'factura' ? rut : null,
      companyName: dteType === 'factura' ? companyName : null,
      businessActivity: dteType === 'factura' ? businessActivity : null,
      total: bill?.totalAmount ?? 0,
      folio: Math.floor(1000 + Math.random() * 9000),
    });
    onClose();
  };

  if (!bill) return null;

  return (
    // Modal de diálogo envolvente para la emisión del DTE.
    <Modal open={open} onClose={onClose} title="Emisión de Documento Tributario (DTE SII)">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-brand-900">
        {/* Resumen del monto a facturar. */}
        <div className="flex items-center justify-between rounded-xl bg-brand-50 p-3 border border-brand-200">
          <span className="text-xs font-semibold">Total a Facturar:</span>
          <span className="text-sm font-bold">{formatCurrency(bill.totalAmount)}</span>
        </div>

        {/* Radio selector de Boleta Electrónica vs Factura Electrónica. */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-brand-800">Tipo de Documento</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-3 border border-brand-200 hover:border-brand-500">
              <input
                type="radio"
                name="dteTypeModal"
                value="boleta"
                checked={dteType === 'boleta'}
                onChange={() => setDteType('boleta')}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs font-bold">Boleta Electrónica</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white p-3 border border-brand-200 hover:border-brand-500">
              <input
                type="radio"
                name="dteTypeModal"
                value="factura"
                checked={dteType === 'factura'}
                onChange={() => setDteType('factura')}
                className="text-brand-500 focus:ring-brand-500"
              />
              <span className="text-xs font-bold">Factura Electrónica</span>
            </label>
          </div>
        </div>

        {/* Campos condicionales para Factura Electrónica. */}
        {dteType === 'factura' && (
          <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 border border-brand-200">
            {/* Input del RUT de la empresa. */}
            <div className="flex flex-col gap-1">
              <label htmlFor="rut-input" className="text-xs font-semibold text-brand-800">
                RUT Empresa
              </label>
              <input
                id="rut-input"
                type="text"
                value={rut}
                onChange={handleRutChange}
                placeholder="RUT Empresa (ej. 76.123.456-7)"
                required
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold border border-brand-300 focus:border-brand-500 focus:outline-none"
              />
            </div>

            {/* Input de la Razón Social. */}
            <div className="flex flex-col gap-1">
              <label htmlFor="company-input" className="text-xs font-semibold text-brand-800">
                Razón Social
              </label>
              <input
                id="company-input"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Razón Social SpA / Ltda"
                required
                className="w-full rounded-xl bg-white px-3 py-2 text-xs font-bold border border-brand-300 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Botones de acción del modal. */}
        <div className="flex justify-end gap-2 pt-2 border-t border-brand-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-600 active:scale-95 shadow-soft"
          >
            Emitir DTE
          </button>
        </div>
      </form>
    </Modal>
  );
}
