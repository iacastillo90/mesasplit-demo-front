// src/features/RadarView/components/ExceptionFeedDrawer.jsx — cajón de excepciones y auditoría (local-admin-radar)
// Drawer deslizable que audita en tiempo real eventos alert.fraud, anulaciones por PIN y descuentos.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// Modal base compartido.
import { Modal } from '../../../shared/ui/index.js';

// Componente del drawer de excepciones.
export default function ExceptionFeedDrawer({ open, onClose, exceptionLogs }) {
  return (
    // Modal de diálogo envolvente para la auditoría de fraudes y excepciones.
    <Modal
      open={open}
      onClose={onClose}
      title="Registro de Excepciones y Auditoría (alert.fraud)"
      className="bg-brand-900 text-brand-50 border border-brand-800"
    >
      {/* Contenedor del listado de excepciones registradas. */}
      <div className="flex flex-col gap-4 text-brand-50">
        {/* Explicación del feed de seguridad. */}
        <p className="text-xs text-brand-50/70">
          Supervisión de seguridad en tiempo real: registra anulaciones enviadas a cocina, aperturas de caja sin cobro y descuentos manuales.
        </p>

        {/* Lista de eventos de auditoría de excepciones. */}
        <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
          {exceptionLogs.length === 0 ? (
            <p className="py-6 text-center text-xs text-brand-50/50">Sin excepciones registradas en este turno.</p>
          ) : (
            exceptionLogs.map((log) => (
              // Tarjeta individual de evento de excepción.
              <div
                key={log.id}
                className="flex flex-col gap-1 rounded-xl bg-semantic-danger/10 border border-semantic-danger/30 p-3 text-xs text-brand-50"
              >
                {/* Cabecera del evento con ícono de advertencia y marca de tiempo. */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-semantic-danger">
                    🚨 {log.title ?? 'Anulación con PIN'}
                  </span>
                  <span className="text-[10px] text-brand-50/60">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Descripción del evento y motivo registrado. */}
                <p className="text-brand-50/90">{log.description}</p>
                {/* Identificación de la persona/PIN que autorizó la excepción. */}
                <div className="flex items-center justify-between text-[11px] text-brand-50/60 pt-1 border-t border-semantic-danger/20">
                  <span>Autorizó PIN: <strong>{log.adminPin ?? '9921'}</strong></span>
                  <span>Motivo: <strong>{log.reason ?? 'Cortesía'}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
