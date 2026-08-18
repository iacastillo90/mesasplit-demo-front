// src/features/ClientView/pages/ClientQrScanPage.jsx — vista de simulador de escaneo QR de mesa (fase15-flujo-qr-perfil-cliente)
// Permite al cliente simular el escaneo de un código QR físico en el restaurante o ingresar el código de mesa manualmente.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Hooks de navegación de React Router.
import { Link, useNavigate } from 'react-router-dom';
// Store de cliente para contexto de mesa y sesión.
import { useClientStore } from '../store/useClientStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';
// Barra de navegación inferior fija para móviles.
import ClientBottomNav from '../components/ClientBottomNav.jsx';

// Componente principal del simulador de escaneo QR de mesa.
export default function ClientQrScanPage() {
  // Hook de navegación.
  const navigate = useNavigate();
  // Usuario logueado del store.
  const user = useClientStore((s) => s.user);
  // Contexto de mesa virtual del store.
  const tableContext = useClientStore((s) => s.tableContext);
  // Estado local para el código de mesa ingresado manualmente o detectado por el scanner.
  const [scannedCode, setScannedCode] = useState(tableContext?.code ?? 'M12-A9F');
  // Estado que indica si la mesa fue detectada exitosamente.
  const [isScanned, setIsScanned] = useState(true);
  // Toast visual de confirmación de detección de mesa.
  const [toastMsg, setToastMsg] = useState(null);

  // Simula la lectura automática de la cámara escaneando la mesa 12.
  const handleSimulateScan = (code, tableNum) => {
    setScannedCode(code);
    setIsScanned(true);
    setToastMsg(`¡Mesa ${tableNum} detectada exitosamente! 📷`);
    window.setTimeout(() => setToastMsg(null), 2500);
  };

  // Avanza a la pantalla principal de la Mesa Virtual del cliente.
  const handleNext = () => {
    navigate('/cliente');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      {/* Cabecera universal */}
      <AppHeader title="Mesa Virtual" subtitle="Escaneo QR de Mesa" currentRoute="/cliente/scan" theme="light" />

      {/* Contenedor central */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 pb-24">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-brand-100 flex flex-col gap-6">
          {/* Cabecera de la tarjeta */}
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-3xl text-sky-600 shadow-soft">
              📷
            </span>
            <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight">Escaneá tu Mesa</h1>
            <p className="text-xs text-brand-800/70">
              {user ? `¡Hola ${user.name}! ` : ''}Apuntá con tu cámara al código QR ubicado en tu mesa para abrir la comanda en vivo
            </p>
          </div>

          {/* Visor simulado de cámara con scanner láser animado */}
          <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-6 flex flex-col items-center justify-center gap-4 text-white shadow-2xl border-4 border-brand-800 min-h-[220px]">
            {/* Animación del haz de luz rojo del scanner */}
            <div className="absolute inset-x-0 top-0 h-1 bg-semantic-danger shadow-[0_0_15px_#EF4444] animate-bounce" />

            {/* Marco visor táctil del QR */}
            <div className="relative flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-sky-400/70 bg-sky-950/40 p-2">
              <span className="text-5xl animate-pulse">📱</span>
            </div>

            <p className="text-[11px] font-semibold text-brand-50/70 tracking-wider uppercase">
              Buscando código QR de mesa...
            </p>
          </div>

          {/* Toast de confirmación de detección de QR */}
          {toastMsg && (
            <div className="rounded-2xl bg-emerald-500 text-white p-3 text-xs font-extrabold text-center shadow-soft animate-fade-in">
              {toastMsg}
            </div>
          )}

          {/* Acciones de Simulación de Escaneo */}
          <div className="flex flex-col gap-3">
            {/* Botón de simulación directa de Escaneo Mesa 12 */}
            <button
              type="button"
              onClick={() => handleSimulateScan('M12-A9F', 12)}
              className="w-full rounded-2xl bg-sky-600 hover:bg-sky-700 py-3.5 px-4 text-xs font-extrabold text-white shadow-soft transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>Simular Escaneo Mesa 12 (Restô Lo Ovalle)</span>
            </button>

            {/* Botón de simulación directa de Escaneo Mesa 5 */}
            <button
              type="button"
              onClick={() => handleSimulateScan('M05-B12', 5)}
              className="w-full rounded-2xl bg-brand-100 hover:bg-brand-200 py-2.5 px-4 text-xs font-bold text-brand-900 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📷</span>
              <span>Simular Escaneo Mesa 5 (Terraza)</span>
            </button>
          </div>

          {/* Separador de ingreso manual */}
          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-brand-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800/50">
              o ingresá el código
            </span>
            <hr className="flex-1 border-brand-200" />
          </div>

          {/* Formulario de Código Manual */}
          <div className="flex flex-col gap-2">
            <label htmlFor="qr-code-input" className="text-xs font-bold text-brand-800">
              Código de Mesa
            </label>
            <div className="flex items-center gap-2">
              <input
                id="qr-code-input"
                type="text"
                value={scannedCode}
                onChange={(e) => {
                  setScannedCode(e.target.value.toUpperCase());
                  setIsScanned(true);
                }}
                placeholder="ej. M12-A9F"
                className="flex-1 rounded-2xl bg-brand-50 px-4 py-3 text-xs font-mono font-extrabold border border-brand-200 focus:border-sky-500 focus:bg-white focus:outline-none transition shadow-inner tracking-widest uppercase text-center text-brand-900"
              />
            </div>
          </div>

          {/* Botón Siguiente para entrar a la Mesa Virtual */}
          <button
            type="button"
            disabled={!isScanned || !scannedCode.trim()}
            onClick={handleNext}
            className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 py-4 text-xs font-extrabold text-white shadow-soft transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Siguiente → Ingresar a Mesa Virtual 🍽️</span>
          </button>

          {/* Enlace alternativo para volver */}
          <div className="text-center">
            <Link to="/cliente" className="text-xs font-bold text-brand-800/70 hover:text-brand-900 underline">
              Ingresar directamente a la Mesa Virtual sin escanear →
            </Link>
          </div>
        </div>
      </main>

      {/* Pie de página universal */}
      <AppFooter theme="light" />

      {/* Barra de navegación inferior fija para móviles */}
      <ClientBottomNav />
    </div>
  );
}
