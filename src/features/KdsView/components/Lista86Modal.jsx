// src/features/KdsView/components/Lista86Modal.jsx — modal de gestión de quiebre de stock (Lista 86)
// Permite al chef declarar productos como Agotados desde la cocina y notificar a garzones y clientes vía WebSocket.
// Cumple con las reglas de AGENTS.md (comentarios en español por cada línea).

// Modal base compartido.
import { Modal } from '../../../shared/ui/index.js';

// Lista de platos mock representativos del menú para seleccionar agotados.
const MENU_ITEMS = [
  { id: 'm1', name: 'Hamburguesa Clásica', category: 'fuego' },
  { id: 'm2', name: 'Papas fritas', category: 'fuego' },
  { id: 'm3', name: 'Sandwich de plancha', category: 'plancha' },
  { id: 'm4', name: 'Carbonara', category: 'fuego' },
  { id: 'm5', name: 'Brownie con maní', category: 'postres' },
  { id: 'm6', name: 'Limonada Menta', category: 'barra' },
  { id: 'm7', name: 'Pizza Margherita', category: 'fuego' },
];

// Componente modal para administrar Lista 86.
export default function Lista86Modal({ isOpen, onClose, stock86, onToggle86 }) {
  return (
    // Componente modal envuelto con título explicativo.
    <Modal open={isOpen} onClose={onClose} title="Gestión de Lista 86 (Agotados)" className="bg-brand-900 text-brand-50 border border-brand-800">
      {/* Contenedor principal con fondo oscuro. */}
      <div className="flex flex-col gap-4 text-brand-50">
        {/* Leyenda explicativa para el equipo de cocina. */}
        <p className="text-sm text-brand-50/70">
          Haz clic sobre un plato para marcarlo como <strong>Agotado (Lista 86)</strong>. Esto notificará al instante a
          mozos y clientes.
        </p>

        {/* Lista de productos para alternar su disponibilidad. */}
        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
          {MENU_ITEMS.map((item) => {
            // Verifica si el producto actualmente está registrado en Lista 86.
            const isOut = Boolean(stock86[item.id]);

            return (
              // Fila individual interactiva del producto.
              <button
                key={item.id}
                type="button"
                onClick={() => onToggle86(item.id, item.name)}
                className={`flex items-center justify-between rounded-xl p-3 text-left transition active:scale-95 ${
                  isOut ? 'bg-semantic-danger/20 border border-semantic-danger text-white' : 'bg-brand-800 text-brand-50 hover:bg-brand-800/80'
                }`}
              >
                {/* Información del nombre del producto y categoría. */}
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-brand-50/60">Estación: {item.category}</p>
                </div>
                {/* Indicador de estado: AGOTADO en rojo o DISPONIBLE en verde. */}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isOut ? 'bg-semantic-danger text-white' : 'bg-semantic-success/20 text-semantic-success'
                  }`}
                >
                  {isOut ? '🛑 AGOTADO (Lista 86)' : '🟢 DISPONIBLE'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
