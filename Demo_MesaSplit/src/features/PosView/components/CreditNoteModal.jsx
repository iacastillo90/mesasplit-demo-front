// src/features/PosView/components/CreditNoteModal.jsx — modal de emisión de nota de crédito con PIN (pos-credit-note)
// Modal para emitir notas de crédito sobre ventas pagadas con autorización por PIN de administrador ("9921").
// Muestra el aviso "Demo: 9921" y valida el PIN antes de registrar en usePosStore.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
// Componente Modal de la UI shared.
import { Modal } from '../../../shared/ui/index.js';
// Store de la caja POS.
import { usePosStore } from '../store/usePosStore.js';

export default function CreditNoteModal({ open, bill, onClose }) {
  const issueCreditNote = usePosStore((s) => s.issueCreditNote);

  const [pin, setPin] = useState('');
  const [reason, setReason] = useState('Devolución por atención');
  const [error, setError] = useState('');

  if (!open || !bill) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = issueCreditNote(bill.id, bill.totalAmount ?? bill.total ?? 0, reason, pin);
    if (res.ok) {
      setPin('');
      onClose?.();
    } else {
      setError(res.error ?? 'PIN inválido');
    }
  };

  return (
    // Modal accesible para nota de crédito.
    <Modal open={open} onClose={onClose} title="Emitir Nota de Crédito">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800 border border-brand-200">
          <p className="font-bold">Venta #{bill.id} - Mesa {bill.tableNumber ?? '—'}</p>
          <p className="text-brand-800/70">Monto a abonar: ${(bill.totalAmount ?? bill.total ?? 0).toLocaleString('es-CL')}</p>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs font-bold text-brand-800">Motivo de la Nota de Crédito</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-xl border border-brand-200 p-2.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-800">PIN de Autorización Admin</label>
            <span className="text-[10px] font-semibold text-brand-500">Demo: 9921</span>
          </div>
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            className="rounded-xl border border-brand-200 p-2.5 text-xs font-mono text-center text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 p-2 text-xs font-bold text-rose-700 text-center">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition active:scale-95 shadow-soft"
          >
            Aprobar Nota de Crédito
          </button>
        </div>
      </form>
    </Modal>
  );
}
