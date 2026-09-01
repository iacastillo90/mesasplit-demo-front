// src/features/PosView/services/posService.js — servicio de Caja POS (pos-cashier)
// Capa de integración de datos para la terminal POS: lectura de cuentas por cobrar y pedidos de retiro con fotos HD.
// Cumple con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// http e isBackendMode: cliente real + flag de modo; mapBill: adaptador back→front.
import { http, isBackendMode } from '../../../api/httpClient.js';
import { mapBill } from '../../../api/mappers.js';

export async function fetchOpenBills() {
  // Modo backend: lista las cuentas abiertas del back (GET /bills) y las adapta.
  if (isBackendMode()) {
    return http.get('/api/v1/bills').then((res) => res.content.map(mapBill));
  }
  // Modo demo: fixtures inline de cuentas.
  return [
    {
      id: 'b-1',
      tableNumber: 12,
      type: 'table',
      customerName: 'Constanza Silva (Mesa 12)',
      totalAmount: 37800,
      status: 'pending',
      items: [
        { id: 'm1', name: 'Lomo Lo Ovalle & Pisco Sour', price: 18900, qty: 1, image: '/images/dish_lomo_lo_ovalle.png' },
        { id: 'm2', name: 'Ceviche Mixto Lo Ovalle', price: 12900, qty: 1, image: '/images/dish_ceviche_mixto.png' },
        { id: 'm3', name: 'Pisco Sour Catedral 35°', price: 6000, qty: 1, image: '/images/dish_pisco_sour.png' },
      ],
    },
    {
      id: 'b-2',
      tableNumber: 4,
      type: 'table',
      customerName: 'Mesa Empresa Tech',
      totalAmount: 45700,
      status: 'pending',
      items: [
        { id: 'm2', name: 'Ceviche Mixto Lo Ovalle', price: 12900, qty: 2, image: '/images/dish_ceviche_mixto.png' },
        { id: 'm1', name: 'Lomo Lo Ovalle & Pisco Sour', price: 18900, qty: 1, image: '/images/dish_lomo_lo_ovalle.png' },
        { id: 'm4', name: 'Volcán de Chocolate Belga', price: 6900, qty: 1, image: '/images/dish_volcan_chocolate.png' },
      ],
    },
    {
      id: 'b-3',
      tableNumber: 8,
      type: 'table',
      customerName: 'Pareja Terraza (Mesa 8)',
      totalAmount: 18500,
      status: 'paid',
      items: [
        { id: 'm1', name: 'Lomo Lo Ovalle', price: 12500, qty: 1, image: '/images/dish_lomo_lo_ovalle.png' },
        { id: 'm3', name: 'Pisco Sour Catedral 35°', price: 6000, qty: 1, image: '/images/dish_pisco_sour.png' },
      ],
    },
    {
      id: 'b-4',
      tableNumber: 104,
      type: 'takeaway',
      customerName: 'Retiro UberEats #104 (Ignacio M.)',
      totalAmount: 12900,
      status: 'ready',
      items: [
        { id: 'm2', name: 'Ceviche Mixto Lo Ovalle', price: 12900, qty: 1, image: '/images/dish_ceviche_mixto.png' },
      ],
    },
    {
      id: 'b-5',
      tableNumber: 105,
      type: 'takeaway',
      customerName: 'Retiro PedidosYa #105 (Camila V.)',
      totalAmount: 25800,
      status: 'ready',
      items: [
        { id: 'm1', name: 'Lomo Lo Ovalle & Pisco Sour', price: 18900, qty: 1, image: '/images/dish_lomo_lo_ovalle.png' },
        { id: 'm4', name: 'Volcán de Chocolate Belga', price: 6900, qty: 1, image: '/images/dish_volcan_chocolate.png' },
      ],
    },
  ];
}
