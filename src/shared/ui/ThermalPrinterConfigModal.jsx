// src/shared/ui/ThermalPrinterConfigModal.jsx — Modal de Gestión e Impresión Cloud ESC/POS (fase12-cobertura-total-20-modulos-saas)
// Permite al usuario administrar hasta 5 impresoras térmicas (Cocina, Bar, Caja, Delivery, Expo),
// realizar pruebas de impresión con simulación de ticket físico ESC/POS y monitorear el estado online/offline.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// React e hooks de estado.
import { useState } from 'react';
// Modal base reutilizable del sistema.
import Modal from './Modal.jsx';

// Lista de impresoras predeterminadas para la demo gastronómica.
const DEFAULT_PRINTERS = [
  { id: 'p1', name: 'Impresora Cocina Principal', type: 'Cocina', ip: '192.168.1.150', port: 9100, status: 'online', paper: '80mm' },
  { id: 'p2', name: 'Impresora Barra & Bebidas', type: 'Barra', ip: '192.168.1.151', port: 9100, status: 'online', paper: '80mm' },
  { id: 'p3', name: 'Impresora Caja Fiscal (POS)', type: 'Caja', ip: '192.168.1.152', port: 9100, status: 'online', paper: '80mm' },
  { id: 'p4', name: 'Impresora Delivery & Dispatch', type: 'Delivery', ip: '192.168.1.153', port: 9100, status: 'offline', paper: '58mm' },
  { id: 'p5', name: 'Impresora Expo Pase', type: 'Expo', ip: '192.168.1.154', port: 9100, status: 'online', paper: '80mm' },
];

// Componente principal de configuración de impresoras cloud ESC/POS.
export default function ThermalPrinterConfigModal({ open, onClose }) {
  // Estado local de la lista de impresoras.
  const [printers, setPrinters] = useState(DEFAULT_PRINTERS);
  // Impresora seleccionada para la simulación de prueba.
  const [activeTestPrinter, setActiveTestPrinter] = useState(null);
  // Estado de envío de la prueba de impresión.
  const [isPrinting, setIsPrinting] = useState(false);
  // Mensaje de notificación del resultado de la prueba.
  const [testResult, setTestResult] = useState(null);

  // Si el modal está cerrado, no renderiza nada.
  if (!open) return null;

  // Maneja la conmutación de estado online/offline de una impresora.
  const handleToggleStatus = (printerId) => {
    // Actualiza inmutablemente el estado de la impresora objetivo.
    setPrinters((prev) =>
      prev.map((p) =>
        p.id === printerId
          ? { ...p, status: p.status === 'online' ? 'offline' : 'online' }
          : p,
      ),
    );
  };

  // Simula la emisión de una comanda de prueba en formato ESC/POS.
  const handleSimulatePrint = (printer) => {
    // Establece la impresora activa para ver el comprobante.
    setActiveTestPrinter(printer);
    // Activa la bandera de animación de impresión.
    setIsPrinting(true);
    // Limpia resultados anteriores.
    setTestResult(null);

    // Simula una latencia de conexión cloud de 1 segundo.
    setTimeout(() => {
      // Finaliza la animación.
      setIsPrinting(false);
      // Notifica el envío exitoso de la trama ESC/POS.
      setTestResult(`¡Comanda enviada a ${printer.name} (${printer.ip}:${printer.port}) vía driver ESC/POS!`);
    }, 1000);
  };

  return (
    <Modal open={open} onClose={onClose} position="center">
      {/* Contenedor principal del modal de impresoras cloud. */}
      <div className="flex flex-col gap-5 p-2 text-brand-900 min-w-[320px] max-w-2xl">
        {/* Cabecera modal con ícono y títulos de la funcionalidad. */}
        <div className="flex items-center justify-between border-b border-brand-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-xl text-amber-600 shadow-soft">
              🖨️
            </span>
            <div>
              <h2 className="text-lg font-bold text-brand-900">
                Impresoras Térmicas Cloud ESC/POS
              </h2>
              <p className="text-xs text-brand-800/70">
                Hasta 5 impresoras configurables por IP/USB con driver directo desde la nube
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de resultado de la prueba de impresión. */}
        {testResult && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-fade-in">
            <span>✅ {testResult}</span>
            <button
              type="button"
              onClick={() => setTestResult(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Grilla con la lista de las 5 impresoras térmicas. */}
        <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-1">
          {printers.map((printer) => (
            <div
              key={printer.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-3.5 shadow-soft hover:border-amber-400/50 transition"
            >
              {/* Información técnica de la impresora. */}
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${printer.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                <div>
                  <h3 className="text-sm font-bold text-brand-900">{printer.name}</h3>
                  <p className="text-xs text-brand-800/60 font-mono">
                    IP: {printer.ip}:{printer.port} · Papel: {printer.paper} · Tipo: {printer.type}
                  </p>
                </div>
              </div>

              {/* Botones de acción: Prueba de Impresión y Conmutador de Estado. */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(printer.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition border ${
                    printer.status === 'online'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  {printer.status === 'online' ? '● En Línea' : '○ Fuera de Línea'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulatePrint(printer)}
                  disabled={isPrinting && activeTestPrinter?.id === printer.id}
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold transition shadow-soft active:scale-95 disabled:opacity-50 flex items-center gap-1"
                >
                  <span>🖨️</span>
                  <span>{isPrinting && activeTestPrinter?.id === printer.id ? 'Imprimiendo...' : 'Probar ESC/POS'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visualizador de ticket térmico ESC/POS simulado. */}
        {activeTestPrinter && (
          <div className="flex flex-col gap-2 rounded-2xl bg-brand-950 p-4 text-emerald-400 font-mono text-xs border border-brand-800 shadow-inner">
            <div className="flex items-center justify-between text-brand-100 border-b border-brand-800 pb-2">
              <span className="font-bold">📄 VISTA PREVIA COMANDA TÉRMICA — {activeTestPrinter.type.toUpperCase()}</span>
              <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">DRV ESC/POS CLOUD</span>
            </div>
            <pre className="whitespace-pre-wrap text-[11px] leading-snug">
{`========================================
             MESASPLIT REPOSIT
         COMANDA DE PRUEBA TECNICA
========================================
FECHA: 17/08/2026 19:45  MESA: #04
GARZON: Ignacio M.        DESTINO: ${activeTestPrinter.type.toUpperCase()}
----------------------------------------
1x  Lomo Lo Ovalle            $14.900
    - Término: Punto Medio
    - Sin Sal Agregada
1x  Pisco Sour Artesanal      $5.500
----------------------------------------
TOTAL ESTIMADO:               $20.400
========================================
     [CODIGO QR VERIFICACION CLOUD]
========================================`}
            </pre>
          </div>
        )}

        {/* Pie del modal con botón de cierre. */}
        <div className="flex items-center justify-between border-t border-brand-100 pt-3">
          <span className="text-xs text-brand-800/60">
            5/5 Puntos de impresión asignados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-brand-900 px-5 py-2 text-xs font-bold text-white hover:bg-brand-800 transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
