// src/features/KdsView/services/kdsService.js — servicio de cocina (task 2.7)
// Capa de datos del KDS: entrega los tickets de cocina con sus estaciones.
// Los tickets usan el enum TICKET_STATUS de shared/constants (fuente única).
// NOTA PR3 → PR4: fixtures inline + latencia simulada; PR 4 (task 3.1) crea
// los mocks y este servicio pasa a la capa mockFetch (design).

// Helper local: simula la latencia de red del diseño (~300ms) resolviendo data.
// Mismo contrato que mockFetch (llega en PR 4) para no cambiar la firma luego.
function fakeLatency(data) {
  // Retorna una promesa que resuelve pasada la ventana de 300ms.
  return new Promise((resolve) => {
    // setTimeout aplaza la resolución simulando el viaje de red.
    setTimeout(() => resolve(data), 300);
  });
}

// Tickets demo de la cocina (shapes del dominio, sin backend).
// Cada ticket: id, mesa, estación, estado (TICKET_STATUS), tiempos de espera
// y líneas con alergias declaradas (el escudo sale de acá).
const DEMO_TICKETS = [
  {
    // Identificador estable del ticket.
    id: 'k1',
    // Número de mesa que originó el pedido.
    tableNumber: 1,
    // Estación de cocina que prepara el ticket (filtro por tabs).
    station: 'fuego',
    // Estado del ticket (enum TICKET_STATUS de shared/constants).
    status: 'cooking',
    // Segundos transcurridos desde la recepción del ticket.
    elapsedSec: 300,
    // Presupuesto de espera en segundos (semáforo del TicketCard).
    budgetSec: 600,
    // Líneas del ticket: plato, cantidad y alergias declaradas.
    items: [
      // Hamburguesa en preparación sin alergias declaradas.
      { id: 'i1', name: 'Hamburguesa Clásica', qty: 2, allergens: [] },
      // Acompañamiento de papas sin alergias.
      { id: 'i2', name: 'Papas fritas', qty: 2, allergens: [] },
    ],
  },
  {
    // Identificador estable del ticket.
    id: 'k2',
    // Número de mesa.
    tableNumber: 2,
    // Estación de la plancha.
    station: 'plancha',
    // Ticket recién recibido, aún no comienza su preparación.
    status: 'pending',
    // Tiempo transcurrido (recién ingresado).
    elapsedSec: 0,
    // Presupuesto de espera de la estación.
    budgetSec: 300,
    // Líneas del ticket.
    items: [
      // Sandwich de plancha sin alergias declaradas.
      { id: 'i3', name: 'Sandwich de plancha', qty: 1, allergens: [] },
    ],
  },
  {
    // Identificador estable del ticket.
    id: 'k3',
    // Número de mesa.
    tableNumber: 5,
    // Estación de fuego (cocciones).
    station: 'fuego',
    // Ticket en preparación.
    status: 'cooking',
    // Tiempo transcurrido: SUPERA el presupuesto (semáforo urgente).
    elapsedSec: 700,
    // Presupuesto de espera menor al transcurrido (atrasado).
    budgetSec: 600,
    // Líneas del ticket.
    items: [
      // Carbonara en cocción sin alergias declaradas.
      { id: 'i4', name: 'Carbonara', qty: 3, allergens: [] },
    ],
  },
  {
    // Identificador estable del ticket.
    id: 'k4',
    // Número de mesa.
    tableNumber: 3,
    // Estación de postres.
    station: 'postres',
    // Ticket listo para ser servido (semántica success en la UI).
    status: 'ready',
    // Tiempo transcurrido dentro del presupuesto.
    elapsedSec: 120,
    // Presupuesto de espera de la estación de postres.
    budgetSec: 300,
    // Líneas del ticket.
    items: [
      // Postre DECLARADO con maní: dispara el Escudo de Alergias (danger).
      { id: 'i5', name: 'Brownie con maní', qty: 2, allergens: ['maní'] },
      // Bebida sin alergias.
      { id: 'i6', name: 'Limonada Menta', qty: 2, allergens: [] },
    ],
  },
  {
    // Identificador estable del ticket.
    id: 'k5',
    // Número de mesa.
    tableNumber: 6,
    // Estación de fuego.
    station: 'fuego',
    // Ticket en preparación dentro del presupuesto.
    status: 'cooking',
    // Tiempo transcurrido.
    elapsedSec: 420,
    // Presupuesto de espera.
    budgetSec: 600,
    // Líneas del ticket.
    items: [
      // Plato con alergia a los lácteos: el escudo usa danger.
      { id: 'i7', name: 'Pizza Margherita', qty: 1, allergens: ['lácteos', 'gluten'] },
    ],
  },
];

// Servicio de cocina: devuelve los tickets con latencia simulada.
export function fetchKitchenTickets() {
  // Delega en fakeLatency: el arreglo de tickets como una promesa resuelta.
  return fakeLatency(DEMO_TICKETS);
}
