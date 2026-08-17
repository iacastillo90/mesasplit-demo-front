// src/features/KdsView/components/RecallModal.jsx — modal de recuperación de comandas (Recall)
// Permite al chef/cocinero revisar los últimos 10 tickets marcados como LISTO y restaurarlos a la pantalla.
// Sigue las reglas de AGENTS.md (comentarios en español por cada línea).

// Modal base compartido del sistema de diseño.
import { Modal } from '../../../shared/ui/index.js';
// Botón base reutilizable.
import { Button } from '../../../shared/ui/index.js';

// Componente presentacional del modal de Recall.
export default function RecallModal({ isOpen, onClose, recallStack, onRestore }) {
  return (
    // Renderiza el modal genérico cuando está abierto.
    <Modal open={isOpen} onClose={onClose} title="Historial de Comandas Despachadas (Recall)" className="bg-brand-900 text-brand-50 border border-brand-800">
      {/* Contenedor del historial con tema oscuro. */}
      <div className="flex flex-col gap-4 text-brand-50">
        {/* Leyenda explicativa. */}
        <p className="text-sm text-brand-50/70">
          Últimas comandas despachadas (máximo 10). Puedes restaurar cualquiera de vuelta al monitor.
        </p>

        {/* Verifica si hay comandas en el historial. */}
        {recallStack.length === 0 ? (
          // Mensaje cuando la lista de Recall está vacía.
          <p className="py-8 text-center text-sm text-brand-50/50">No hay comandas despachadas recientemente.</p>
        ) : (
          // Lista de comandas despachadas disponibles para restaurar.
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {recallStack.map((ticket) => (
              // Tarjeta individual de comanda en el modal de Recall.
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-xl bg-brand-800 p-3 border border-brand-800/80"
              >
                {/* Información básica de la mesa e ítems. */}
                <div>
                  {/* Número de mesa de la comanda. */}
                  <p className="font-bold text-brand-50">Mesa {ticket.tableNumber}</p>
                  {/* Resumen breve de los platos contenidos. */}
                  <p className="text-xs text-brand-50/70">
                    {ticket.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
                  </p>
                </div>
                {/* Botón para restaurar la comanda a la grilla activa del KDS. */}
                <Button
                  variant="secondary"
                  className="h-10 text-xs"
                  onClick={() => {
                    // Restaura el ticket objetivo.
                    onRestore(ticket.id);
                    // Cierra el modal de Recall.
                    onClose();
                  }}
                >
                  Restaurar
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
