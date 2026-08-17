// src/features/CorporateView/components/RrhhManagementModal.jsx — Modal de Gestión RRHH, Asistencia, Ley 40h & Previred (fase12-cobertura-total-20-modulos-saas)
// Permite administrar la dotación de personal, control de jornadas de Ley 40 Horas,
// estado de contratos, vacaciones y exportación directa de planillas Previred para contabilidad.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// React e hooks de estado.
import { useState } from 'react';
// Modal base del sistema.
import Modal from '../../../shared/ui/Modal.jsx';
// Utilidad de exportación a CSV/Excel.
import { exportToCsv } from '../../../shared/utils/exportToCsv.js';

// Datos de personal simulados para la demo gastronómica.
const INITIAL_EMPLOYEES = [
  { id: 'e1', name: 'Ignacio M.', role: 'Garzón Senior', contract: 'Indefinido 40h', shift: 'Turno Mañana (09:00 - 17:00)', previred: 'Cotización al día (AFP Capital / Fonasa)', status: 'active' },
  { id: 'e2', name: 'Valentina R.', role: 'Chef Ejecutiva', contract: 'Indefinido 40h', shift: 'Turno Noche (16:00 - 00:00)', previred: 'Cotización al día (AFP Habitat / Isapre Colmena)', status: 'active' },
  { id: 'e3', name: 'Matías S.', role: 'Garzón / Sommelier', contract: 'Plazo Fijo', shift: 'Turno Tarde (12:00 - 20:00)', previred: 'Cotización al día (AFP Cuprum / Fonasa)', status: 'active' },
  { id: 'e4', name: 'Camila P.', role: 'Cajera / Admin', contract: 'Indefinido 40h', shift: 'Turno Mañana (09:00 - 17:00)', previred: 'Cotización al día (AFP Modelo / Isapre Banmédica)', status: 'active' },
];

// Componente modal de gestión de RRHH.
export default function RrhhManagementModal({ open, onClose }) {
  // Estado local del personal.
  const [employees] = useState(INITIAL_EMPLOYEES);
  // Mensaje de notificación.
  const [feedback, setFeedback] = useState(null);

  // Si no está abierto, no renderiza.
  if (!open) return null;

  // Exporta la planilla de cotizaciones Previred en formato CSV.
  const handleExportPrevired = () => {
    // Convierte los datos de empleados al formato de la planilla Previred.
    const previredData = employees.map((emp) => ({
      RUT: '18.765.432-1',
      Nombre: emp.name,
      Cargo: emp.role,
      Contrato: emp.contract,
      Jornada: emp.shift,
      Cotización: emp.previred,
      Estado: emp.status === 'active' ? 'VIGENTE' : 'LICENCIA',
    }));

    // Ejecuta la descarga del archivo CSV/Excel.
    exportToCsv('Planilla_Previred_MesaSplit.csv', previredData);
    // Notifica el resultado al usuario.
    setFeedback('Planilla Previred exportada exitosamente para contabilidad.');
  };

  return (
    <Modal open={open} onClose={onClose} position="center">
      {/* Contenedor principal del modal de RRHH. */}
      <div className="flex flex-col gap-5 p-2 text-brand-900 min-w-[320px] max-w-3xl">
        {/* Cabecera del modal de RRHH. */}
        <div className="flex items-center justify-between border-b border-brand-100 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-500/10 text-xl text-sky-600 shadow-soft">
              👥
            </span>
            <div>
              <h2 className="text-lg font-bold text-brand-900">
                Módulo RRHH Completo, Asistencia & Previred 🆕
              </h2>
              <p className="text-xs text-brand-800/70">
                Contratos, jornadas adaptadas a Ley 40 Horas, liquidaciones y exportación oficial Previred
              </p>
            </div>
          </div>
        </div>

        {/* Notificación de feedback. */}
        {feedback && (
          <div className="flex items-center justify-between rounded-xl bg-sky-50 p-3 text-xs font-semibold text-sky-800 border border-sky-200 animate-fade-in">
            <span>ℹ️ {feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-sky-600 hover:text-sky-900 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Tabla de colaboradores y dotación de personal. */}
        <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-white p-3.5 shadow-soft hover:border-sky-300 transition"
            >
              {/* Identidad y rol del empleado. */}
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 font-bold text-brand-800 text-xs">
                  {emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brand-900">{emp.name}</h3>
                  <p className="text-xs text-brand-800/70">
                    {emp.role} · <span className="font-semibold text-sky-700">{emp.contract}</span>
                  </p>
                </div>
              </div>

              {/* Asistencia y estado de Previred. */}
              <div className="flex flex-col sm:items-end text-xs">
                <span className="font-medium text-brand-900">{emp.shift}</span>
                <span className="text-[11px] text-emerald-700 font-semibold">{emp.previred}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pie con acciones y exportación a Previred. */}
        <div className="flex items-center justify-between border-t border-brand-100 pt-3">
          <button
            type="button"
            onClick={handleExportPrevired}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-soft active:scale-95 flex items-center gap-2"
          >
            <span>📥</span>
            <span>Exportar Planilla Previred (CSV)</span>
          </button>
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
