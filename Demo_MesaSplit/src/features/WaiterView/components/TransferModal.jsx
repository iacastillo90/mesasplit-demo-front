// src/features/WaiterView/components/TransferModal.jsx — modal de unir y ceder mesa (waiter-table-transfer)
// Modal accesible para unir la cuenta de la mesa seleccionada con otra mesa ocupada
// o ceder la gestión de la mesa a otro garzón en turno.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

import { useState } from 'react';
import { Modal } from '../../../shared/ui/index.js';
import { DEMO_WAITERS, useWaiterStore } from '../store/useWaiterStore.js';

export default function TransferModal({ open, mode, originTable, onClose }) {
  // Mode puede ser 'merge' (unir cuenta) o 'transfer' (ceder mesa).
  const mergeBills = useWaiterStore((s) => s.mergeBills);
  const transferTable = useWaiterStore((s) => s.transferTable);
  const tables = useWaiterStore((s) => s.tables);

  // Destino seleccionado (id de mesa para merge, id de garzón para transfer).
  const [selectedTarget, setSelectedTarget] = useState('');
  // Estado de confirmación explícita activa previa a mutar.
  const [isConfirming, setIsConfirming] = useState(false);
  // Mensaje de error si la acción no es válida.
  const [errorMsg, setErrorMsg] = useState('');

  if (!open || !originTable) return null;

  // Mesas candidatas válidas para unir cuenta (ocupadas con orden activa y distintas de la origen).
  const mergeCandidates = tables.filter(
    (t) => t.id !== originTable.id && t.order && t.order.items && t.order.items.length > 0,
  );

  // Garzones candidatos válidos para ceder mesa.
  const waiterCandidates = DEMO_WAITERS.map((wId) => ({
    id: wId,
    name: wId === 'u3' ? 'Camila Torres' : wId,
  }));

  // Maneja la selección del destino y pasa a la pantalla de confirmación.
  const handleSelectTarget = (targetId) => {
    setSelectedTarget(targetId);
    setIsConfirming(true);
    setErrorMsg('');
  };

  // Ejecuta la unión de cuentas tras la confirmación explícita.
  const handleExecuteMerge = () => {
    const res = mergeBills(originTable.id, selectedTarget);
    if (res.ok) {
      onClose?.();
      setIsConfirming(false);
    } else {
      setErrorMsg(res.error ?? 'No se pudo unir la cuenta');
    }
  };

  // Ejecuta la cesión de mesa tras la confirmación explícita.
  const handleExecuteTransfer = () => {
    const res = transferTable(originTable.id, selectedTarget);
    if (res.ok) {
      onClose?.();
      setIsConfirming(false);
    } else {
      setErrorMsg(res.error ?? 'No se pudo ceder la mesa');
    }
  };

  // Nombre de la mesa o garzón destino para la pantalla de confirmación.
  const targetTableObj = tables.find((t) => t.id === selectedTarget);
  const targetWaiterObj = waiterCandidates.find((w) => w.id === selectedTarget);

  return (
    <Modal
      open={open}
      onClose={() => {
        setIsConfirming(false);
        onClose?.();
      }}
      title={mode === 'merge' ? 'Unir Cuenta' : 'Ceder Mesa'}
    >
      <div className="flex flex-col gap-4 py-2">
        {!isConfirming ? (
          <>
            <p className="text-xs text-brand-800/80">
              {mode === 'merge'
                ? `Seleccioná la mesa sobre la cual deseás unir la cuenta de Mesa ${originTable.number}:`
                : `Seleccioná el garzón al cual querés transferir la Mesa ${originTable.number}:`}
            </p>

            {mode === 'merge' ? (
              <div className="flex flex-col gap-2">
                {mergeCandidates.length === 0 ? (
                  <p className="text-xs text-brand-800/60 py-4 text-center">
                    No hay otras mesas ocupadas con cuentas para unir.
                  </p>
                ) : (
                  mergeCandidates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTarget(t.id)}
                      className="flex items-center justify-between rounded-xl border border-brand-200 bg-white p-3 text-left hover:bg-brand-50 transition active:scale-95"
                    >
                      <span className="font-bold text-brand-900">Mesa {t.number}</span>
                      <span className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                        Unir con Mesa {t.number}
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {waiterCandidates.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleSelectTarget(w.id)}
                    className="flex items-center justify-between rounded-xl border border-brand-200 bg-white p-3 text-left hover:bg-brand-50 transition active:scale-95"
                  >
                    <span className="font-bold text-brand-900">{w.name}</span>
                    <span className="rounded-lg bg-brand-100 px-3 py-1 text-xs font-bold text-brand-800">
                      Ceder a {w.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          /* PANTALLA DE CONFIRMACIÓN EXPLÍCITA */
          <div className="flex flex-col gap-4 text-center py-2">
            <h3 className="text-sm font-bold text-brand-900">
              ¿Unir cuentas de Mesa {originTable.number} y{' '}
              {mode === 'merge' ? `Mesa ${targetTableObj?.number}` : targetWaiterObj?.name}?
            </h3>
            <p className="text-xs text-brand-800/60">
              {mode === 'merge'
                ? 'Se preservarán todas las líneas de ambas cuentas sin alteración.'
                : `La mesa ${originTable.number} se transferirá a ${targetWaiterObj?.name}.`}
            </p>

            {errorMsg && (
              <div className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsConfirming(false);
                  onClose?.();
                }}
                className="rounded-xl border border-brand-200 px-4 py-2 text-xs font-bold text-brand-800 hover:bg-brand-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={mode === 'merge' ? handleExecuteMerge : handleExecuteTransfer}
                className="rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white hover:bg-brand-600 transition active:scale-95 shadow-soft"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
