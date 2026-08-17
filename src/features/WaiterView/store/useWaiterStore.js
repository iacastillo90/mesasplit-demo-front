// src/features/WaiterView/store/useWaiterStore.js — store del garzón (waiter-pwa)
// Slice de estado del mozo: marcaje de turno (Ley 40h), mesas asignadas, comanda activa,
// Course Control, Escudo de Alergias, anulación autorizada con PIN y liberación de mesa.
// Emite eventos shift.clock_in, course.fire, alert.fraud y table.status_changed por el bus real-time.

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// Servicio de datos del garzón.
import { fetchAssignedTables } from '../services/waiterService.js';
// Instancia del bus en tiempo real de la aplicación (no hook para uso dentro de Zustand).
import { createRealtimeBus } from '../../../hooks/useRealtimeBus.js';

// Instancia única del bus para las acciones del garzón.
const bus = createRealtimeBus('mesasplit');

// Estado inicial del store de garzón (shiftStatus por defecto 'clocked_in' para navegación fluida).
const initialState = {
  // Estado del turno: 'clocked_in' (activo por defecto en la demo) o 'clocked_out'.
  shiftStatus: 'clocked_in',
  // Garzón en sesión.
  waiterName: 'Pedro Soto',
  // Lista de mesas asignadas al garzón.
  tables: [],
  // ID de la mesa seleccionada actualmente.
  selectedTableId: null,
  // Borrador de la comanda en preparación para la mesa seleccionada.
  orderDraft: [],
  // Curso seleccionado por defecto para los nuevos platos.
  selectedCourse: 'entrada',
  // Estado de carga inicial de mesas.
  loading: true,
  // Toast o notificación de confirmación activa.
  toastMessage: null,
};

// Store de Zustand para el slice de WaiterView.
export const useWaiterStore = create((set, get) => ({
  // Carga el estado inicial.
  ...initialState,

  // Inicia el turno del mozo mediante validación de PIN (Ley 40 Horas).
  clockIn: (pin) => {
    // Valida el PIN de marcaje del mozo (demo: "1234").
    if (pin !== '1234') return false;

    // Cambia el estado del turno a activo.
    set({ shiftStatus: 'clocked_in' });

    // Emite el evento de marcaje de turno por el bus en tiempo real.
    bus.publish('shift.clock_in', {
      waiterName: String(get().waiterName),
      timestamp: Date.now(),
    });

    // Dispara la carga inicial de mesas asignadas.
    get().loadTables();
    return true;
  },

  // Cierra el turno del mozo (pantalla de bloqueo de asistencia).
  clockOut: () => set({ shiftStatus: 'clocked_out' }),

  // Carga la lista de mesas asignadas desde el servicio del garzón.
  loadTables: async () => {
    // Solicita las mesas al servicio mock.
    const tables = await fetchAssignedTables();
    // Guarda las mesas en el estado y finaliza la carga.
    set({ tables, loading: false });
  },

  // Selecciona una mesa de la grilla para trabajar sobre su comanda.
  selectTable: (tableId) => {
    // Garantiza que tableId sea una cadena limpia.
    const cleanId = typeof tableId === 'string' ? tableId : String(tableId ?? 't1');
    // Si no había borrador previo, siembra ítems de prueba para la mesa seleccionada.
    const existingDraft = get().orderDraft;
    const initialDraft =
      existingDraft.length > 0
        ? existingDraft
        : [
            {
              id: 'd1',
              productId: 'm1',
              name: 'Hamburguesa Clásica',
              price: 12500,
              qty: 1,
              allergens: [],
              course: 'entrada',
              sentToKitchen: true,
            },
          ];

    set({ selectedTableId: cleanId, orderDraft: initialDraft });
  },

  // Agrega un ítem del menú al borrador de la comanda de la mesa actual.
  addToDraft: (menuItem) => {
    // Obtiene la lista actual de ítems en el borrador.
    const { orderDraft, selectedCourse } = get();
    // Busca si el plato ya fue agregado en el mismo curso.
    const existingIndex = orderDraft.findIndex(
      (item) => item.productId === menuItem.id && item.course === selectedCourse,
    );

    let updatedDraft;
    if (existingIndex >= 0) {
      // Si el ítem ya está, incrementa su cantidad manteniendo el contador.
      updatedDraft = orderDraft.map((item, idx) =>
        idx === existingIndex ? { ...item, qty: item.qty + 1 } : item,
      );
    } else {
      // Si es nuevo, crea la línea con cantidad 1.
      const newItem = {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: String(menuItem.id),
        name: String(menuItem.name),
        price: Number(menuItem.price),
        qty: 1,
        allergens: menuItem.allergens ? [...menuItem.allergens] : [],
        course: String(selectedCourse),
        sentToKitchen: false,
      };
      updatedDraft = [...orderDraft, newItem];
    }

    // Actualiza el borrador en el store.
    set({ orderDraft: updatedDraft });
  },

  // Alterna o agrega un flag de alergia médica sobre una línea del pedido (Escudo de Alergias).
  toggleAllergyFlag: (itemId, allergen) => {
    // Obtiene el borrador actual.
    const { orderDraft } = get();
    // Recorre y muta el arreglo de alérgenos de la línea correspondiente.
    const updatedDraft = orderDraft.map((line) => {
      if (line.id !== itemId) return line;
      const hasAllergen = line.allergens.includes(allergen);
      const newAllergens = hasAllergen
        ? line.allergens.filter((a) => a !== allergen)
        : [...line.allergens, allergen];
      return { ...line, allergens: newAllergens };
    });
    // Guarda el borrador actualizado.
    set({ orderDraft: updatedDraft });
  },

  // Cambia el tiempo/curso activo seleccionado en el picker.
  setCourse: (selectedCourse) => set({ selectedCourse }),

  // Dispara el evento course.fire para notificar a la cocina que marche los platos de Fondo.
  fireCourse: (courseType = 'fondo') => {
    // Obtiene la mesa activa.
    const { selectedTableId } = get();
    // Define el mensaje de confirmación.
    set({ toastMessage: 'Fondo marchado a cocina' });

    // Emite el evento en tiempo real course.fire por el bus (payload estrictamente primitivo).
    bus.publish('course.fire', {
      tableId: selectedTableId ? String(selectedTableId) : 't1',
      courseType: String(courseType),
      timestamp: Date.now(),
    });

    // Oculta el mensaje a los 2 segundos.
    setTimeout(() => set({ toastMessage: null }), 2000);
  },

  // Anula un ítem enviado a cocina mediante validación de PIN de Administrador (9921).
  voidItemWithPin: (itemId, adminPin, reason) => {
    // Valida el PIN de Administrador.
    if (String(adminPin) !== '9921') return false;

    // Quita la línea del borrador.
    const updatedDraft = get().orderDraft.filter((line) => line.id !== itemId);
    set({ orderDraft: updatedDraft });

    // Emite evento de seguridad y auditoría de fraudes/anulaciones.
    bus.publish('alert.fraud', {
      type: 'item_void_sent_to_kitchen',
      itemId: String(itemId),
      reason: String(reason),
      adminPin: String(adminPin),
      timestamp: Date.now(),
    });

    return true;
  },

  // Cierra y libera la mesa seleccionada restableciendo su estado a libre (free).
  releaseTable: (tableId) => {
    // Lee la lista de mesas.
    const { tables, selectedTableId } = get();
    // Determina la mesa objetivo a liberar.
    const targetId = tableId ?? selectedTableId ?? 't1';
    const cleanId = String(targetId);

    // Actualiza el estado de la mesa a libre ('free').
    const updatedTables = tables.map((t) =>
      t.id === cleanId ? { ...t, status: 'free', guests: 0 } : t,
    );

    // Limpia el borrador y deselecciona la mesa.
    set({ tables: updatedTables, selectedTableId: null, orderDraft: [] });

    // Emite el evento table.status_changed por el bus.
    bus.publish('table.status_changed', {
      tableId: cleanId,
      status: 'free',
      timestamp: Date.now(),
    });
  },

  // Restablece el slice a su estado inicial.
  resetDemo: () => set(initialState),
}));
