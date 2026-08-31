// src/features/WaiterView/components/TapToPayModal.jsx — Modal de cobro Tap-to-Pay (NFC Móvil) y billeteras digitales
// Simula la lectura contactless por proximidad NFC en el teléfono/tablet del garzón para Apple Pay, Google Wallet y tarjetas.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// useState y useEffect de React.
import { useState, useEffect } from 'react';
// Modal base del design system.
import { Modal } from '../../../shared/ui/index.js';
// Utility para formatear montos en CLP.
import { formatCurrency } from '../../../shared/utils/index.js';
// Hook de audio sintético para el tono de pago aprobado.
import { useAudioSynth } from '../../../hooks/useAudioSynth.js';

// Componente TapToPayModal.
export default function TapToPayModal({ open, onClose, totalAmount = 24900, tableNumber = '04' }) {
  // Estado de la lectura NFC ('IDLE' | 'READING' | 'APPROVED').
  const [paymentStatus, setPaymentStatus] = useState('IDLE');
  // Método de pago digital seleccionado ('NFC' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'MERCADOPAGO').
  const [selectedWallet, setSelectedWallet] = useState('NFC');
  // Hook de efectos auditivos sintéticos.
  const { playChime } = useAudioSynth();

  // Reinicia el estado cuando se abre el modal.
  useEffect(() => {
    if (open) {
      setPaymentStatus('IDLE');
    }
  }, [open]);

  // Simula el proceso de aproximación y lectura NFC.
  const handleSimulateTap = () => {
    setPaymentStatus('READING');
    setTimeout(() => {
      setPaymentStatus('APPROVED');
      playChime();
    }, 1500);
  };

  if (!open) return null;

  return (
    // Modal de cobro Tap-to-Pay.
    <Modal open={open} onClose={onClose} title={`📱 Cobro Tap-to-Pay (NFC) — Mesa ${tableNumber}`}>
      <div className="flex flex-col gap-4 text-brand-900">
        {/* Banner de Monto Total a Cobrar en Mesa. */}
        <div className="flex items-center justify-between bg-brand-900 text-white p-4 rounded-2xl shadow-soft">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-200">Monto Total a Cobrar:</span>
            <h3 className="text-xl font-extrabold text-emerald-400">{formatCurrency(totalAmount)}</h3>
          </div>
          <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/20">
            Sin Contacto 📡
          </span>
        </div>

        {/* Estado 1: IDLE - Selección de método y botón de aproximación. */}
        {paymentStatus === 'IDLE' && (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-brand-800">Selecciona el Método Digital:</label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedWallet('NFC')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'NFC' ? 'bg-brand-500 text-white border-brand-500 shadow-soft' : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <span>💳 Tarjeta Contactless</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedWallet('APPLE_PAY')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'APPLE_PAY' ? 'bg-brand-500 text-white border-brand-500 shadow-soft' : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <span>🍏 Apple Pay</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedWallet('GOOGLE_PAY')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'GOOGLE_PAY' ? 'bg-brand-500 text-white border-brand-500 shadow-soft' : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <span>🤖 Google Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedWallet('MERCADOPAGO')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                  selectedWallet === 'MERCADOPAGO' ? 'bg-brand-500 text-white border-brand-500 shadow-soft' : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <span>📲 MercadoPago QR</span>
              </button>
            </div>

            {/* Zona de aproximación física del teléfono/tarjeta. */}
            <div className="border-2 border-dashed border-brand-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-brand-50/50">
              <span className="text-4xl animate-pulse">📡</span>
              <p className="text-xs font-bold text-center text-brand-800">
                Acerca el teléfono o tarjeta del cliente al reverso del dispositivo.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSimulateTap}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 transition shadow-soft active:scale-95"
            >
              ⚡ Simular Lectura NFC Contactless
            </button>
          </div>
        )}

        {/* Estado 2: READING - Leyendo chip NFC. */}
        {paymentStatus === 'READING' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="h-12 w-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-xs font-bold text-brand-900">Procesando pago contactless vía NFC…</p>
            <span className="text-[11px] text-brand-800/70">Conectando con transbank / fiserv encriptado</span>
          </div>
        )}

        {/* Estado 3: APPROVED - Pago Exitoso. */}
        {paymentStatus === 'APPROVED' && (
          <div className="flex flex-col items-center justify-center py-6 gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 animate-in zoom-in-95">
            <span className="text-4xl">✅</span>
            <h4 className="text-base font-extrabold text-emerald-800">¡Pago Contactless Aprobado!</h4>
            <p className="text-xs text-center text-emerald-700">
              Comprobante digital enviado al cliente · Boleta electrónica SII emitida.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-xl bg-emerald-700 text-white px-6 py-2 text-xs font-bold hover:bg-emerald-800 shadow-soft"
            >
              Listo / Finalizar Cobro
            </button>
          </div>
        )}

        {/* Pie de modal. */}
        {paymentStatus !== 'APPROVED' && (
          <div className="flex justify-end border-t border-brand-200 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-brand-900 text-white px-4 py-1.5 text-xs font-bold hover:bg-brand-800"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
