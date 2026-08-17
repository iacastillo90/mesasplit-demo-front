// src/features/PosView/components/CfdModal.jsx — modal comprobante CFD demo (pos-cfd)
// Modal para emitir Comprobante CFD (documento fiscal demo distinto de DTE).
// Solicita RUT y Razón Social del cliente, valida el RUT y genera folio demo.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
// Componente Modal de la UI shared.
import { Modal } from '../../../shared/ui/index.js';
// Store de la caja POS.
import { usePosStore } from '../store/usePosStore.js';

export default function CfdModal({ open, bill, onClose }) {
  const issueCfd = usePosStore((s) => s.issueCfd);

  const [rut, setRut] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [error, setError] = useState('');
  const [issuedReceipt, setIssuedReceipt] = useState(null);

  if (!open || !bill) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const res = issueCfd(bill.id, rut, razonSocial);
    if (res.ok) {
      setIssuedReceipt(res.receipt);
    } else {
      setError(res.error ?? 'RUT inválido');
    }
  };

  const handleClose = () => {
    setIssuedReceipt(null);
    setRut('');
    setRazonSocial('');
    setError('');
    onClose?.();
  };

  return (
    // Modal accesible de comprobante CFD.
    <Modal open={open} onClose={handleClose} title="Emisión Comprobante CFD">
      {!issuedReceipt ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          <div className="rounded-xl bg-brand-50 p-3 text-xs text-brand-800 border border-brand-200">
            <p className="font-bold">Comprobante CFD (Comprobante Fiscal Demo)</p>
            <p className="text-brand-800/70">Documento independiente no emitido ante SII</p>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-brand-800">RUT Cliente / Empresa</label>
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              placeholder="11.111.111-1"
              className="rounded-xl border border-brand-200 p-2.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-bold text-brand-800">Razón Social / Nombre</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              placeholder="Empresa Demo SpA"
              className="rounded-xl border border-brand-200 p-2.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              onClick={handleClose}
              className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition active:scale-95 shadow-soft"
            >
              Emitir CFD
            </button>
          </div>
        </form>
      ) : (
        /* VISTA DE DOCUMENTO EMITIDO */
        <div className="flex flex-col gap-4 py-3 text-center">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 flex flex-col gap-2">
            <span className="text-3xl">📄</span>
            <h3 className="text-sm font-extrabold text-emerald-950">
              {issuedReceipt.folio}
            </h3>
            <p className="text-xs font-bold text-brand-900">{issuedReceipt.razonSocial}</p>
            <p className="text-xs text-brand-800/70">RUT: {issuedReceipt.rut}</p>
            <span className="mt-2 text-[10px] font-semibold text-brand-800/50 uppercase">
              DOCUMENTO DEMOSTRATIVO CFD
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="mt-2 rounded-xl bg-brand-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-brand-900 transition"
          >
            Cerrar Comprobante
          </button>
        </div>
      )}
    </Modal>
  );
}
