// src/features/ClientView/store/useClientStore.js — store del cliente (task 2.5)
// Slice de estado de la Mesa Virtual (patrón FSD docs/03): menú, contexto de
// mesa y carrito compartido. Usa Zustand v5 (design D6) sin persist: el carrito
// es transitorio de sesión. Los datos llegan del servicio (clientService), que
// PR 4 conecta a mocks/mockFetch.
// NOTA: cada slice de feature es dueño de su store; acá NO hay lógica de UI.

// create: fábrica de store de Zustand v5 (hooks de React directos).
import { create } from 'zustand';
// Servicio de la capa de datos del cliente (menú + contexto de mesa).
import { getMenu, getTableContext } from '../services/clientService.js';

// Selector puro: suma la cantidad de ítems del carrito (badge del CTA).
// Recibe el arreglo del carrito y devuelve el total de unidades.
export const selectCartCount = (cart) =>
  // Reduce cada ítem acumulando su cantidad.
  cart.reduce((total, item) => total + item.qty, 0);

// Selector puro: total en CLP del carrito (pie del drawer y del CTA).
// Recibe el arreglo y devuelve la suma de precio × cantidad de cada ítem.
export const selectCartTotal = (cart) =>
  // Reduce cada ítem acumulando precio por cantidad.
  cart.reduce((total, item) => total + item.price * item.qty, 0);

// Estado inicial del slice (se reinicia con resetDemo en PR 4).
const initialState = {
  // Lista de ítems del menú cargada desde el servicio.
  menu: [],
  // Contexto de la mesa virtual (número, comensales, código QR).
  tableContext: null,
  // Carrito: arreglo de {id, name, price, qty} agregados por el cliente.
  cart: [],
  // Flag de carga de la primera llamada al servicio.
  loading: true,
  // Controla la visibilidad del drawer del carrito compartido.
  cartOpen: false,
};

// Store del cliente: estado + acciones que mutan ese estado.
export const useClientStore = create((set) => ({
  // Estado inicial del slice (copiado para no mutar el objeto fuente).
  ...initialState,

  // Carga menú y contexto de mesa desde el servicio (una sola vez al montar).
  loadMenu: async () => {
    // Resuelve en paralelo ambas promesas del servicio (menú y contexto).
    const [menu, tableContext] = await Promise.all([getMenu(), getTableContext()]);
    // Setea menú y contexto y apaga el flag de carga.
    set({ menu, tableContext, loading: false });
  },

  // Agrega un ítem del menú al carrito (o suma 1 si ya estaba).
  addToCart: (item) =>
    set((state) => {
      // Busca si el ítem ya está en el carrito por su id.
      const existing = state.cart.find((line) => line.id === item.id);
      // Si ya existe, sube su cantidad; si no, agrega la línea inicial.
      const cart = existing
        ? // Mapea el carrito subiendo la cantidad del ítem repetido.
          state.cart.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line))
        : // Agrega la línea inicial con cantidad 1 (id, nombre, precio, qty).
          [...state.cart, { id: item.id, name: item.name, price: item.price, qty: 1 }];
      // Devuelve el nuevo carrito como estado.
      return { cart };
    }),

  // Sube en 1 la cantidad de una línea del carrito (botón + del drawer).
  increaseQty: (id) =>
    set((state) => ({
      // Mapea el carrito subiendo la cantidad del id solicitado.
      cart: state.cart.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line)),
    })),

  // Baja en 1 la cantidad; si queda en 0, elimina la línea del carrito.
  decreaseQty: (id) =>
    set((state) => ({
      // Mapea el carrito: baja la cantidad o elimina la línea según el caso.
      cart: state.cart
        // Primero baja la cantidad de la línea indicada.
        .map((line) => (line.id === id ? { ...line, qty: line.qty - 1 } : line))
        // Luego descarta las líneas con cantidad 0 o negativa.
        .filter((line) => line.qty > 0),
    })),

  // Elimina una línea completa del carrito (botón quitar del drawer).
  removeItem: (id) =>
    set((state) => ({
      // Filtra el carrito dejando fuera el id solicitado.
      cart: state.cart.filter((line) => line.id !== id),
    })),

  // Abre o cierra el drawer del carrito compartido.
  setCartOpen: (cartOpen) => set({ cartOpen }),

  // Reinicia el slice a su estado inicial (resetDemo de PR 4 lo coordina).
  resetDemo: () => set(initialState),
}));
