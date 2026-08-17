// src/features/ClientView/store/useClientStore.js — store del cliente con persistencia (task 2.5 + client-session-reconnect)
// Slice de estado de la Mesa Virtual (patrón FSD docs/03): menú, contexto de mesa y carrito compartido.
// Persiste cart y tableContext en localStorage bajo la clave mesasplit-client.
// Cumple con todas las reglas obligatorias de AGENTS.md (comentarios en español por cada línea).

// create: fábrica de store de Zustand v5.
import { create } from 'zustand';
// createJSONStorage y persist: middleware de persistencia en localStorage.
import { createJSONStorage, persist } from 'zustand/middleware';
// Servicio de la capa de datos del cliente (menú + contexto de mesa).
import { getMenu, getTableContext } from '../services/clientService.js';

// Selector puro: suma la cantidad de ítems del carrito (badge del CTA).
export const selectCartCount = (cart = []) =>
  cart.reduce((total, item) => total + item.qty, 0);

// Selector puro: total en CLP del carrito descontando recompensas de lealtad.
export const selectCartTotal = (cart = [], discountAmount = 0) =>
  Math.max(0, cart.reduce((total, item) => total + item.price * item.qty, 0) - discountAmount);

// Estado inicial del slice.
const initialState = {
  // Lista de ítems del menú cargada desde el servicio.
  menu: [],
  // Contexto de la mesa virtual (número, comensales, código QR).
  tableContext: null,
  // Carrito: arreglo de {id, name, price, qty} agregados por el cliente.
  cart: [],
  // Descuento activo en CLP derivado de recompensas de lealtad.
  activeDiscountAmount: 0,
  // Flag de carga de la primera llamada al servicio.
  loading: true,
  // Controla la visibilidad del drawer del carrito compartido.
  cartOpen: false,
};

// Store del cliente con middleware persist.
export const useClientStore = create(
  persist(
    (set) => ({
      // Estado inicial del slice.
      ...initialState,

      // Carga menú y contexto de mesa desde el servicio.
      loadMenu: async () => {
        const [menu, tableContext] = await Promise.all([getMenu(), getTableContext()]);
        set({ menu, tableContext, loading: false });
      },

      // Agrega un ítem del menú al carrito (o suma 1 si ya estaba).
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((line) => line.id === item.id);
          const cart = existing
            ? state.cart.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line))
            : [...state.cart, { id: item.id, name: item.name, price: item.price, qty: 1 }];
          return { cart };
        }),

      // Sube en 1 la cantidad de una línea del carrito.
      increaseQty: (id) =>
        set((state) => ({
          cart: state.cart.map((line) => (line.id === id ? { ...line, qty: line.qty + 1 } : line)),
        })),

      // Baja en 1 la cantidad; si queda en 0, elimina la línea.
      decreaseQty: (id) =>
        set((state) => ({
          cart: state.cart
            .map((line) => (line.id === id ? { ...line, qty: line.qty - 1 } : line))
            .filter((line) => line.qty > 0),
        })),

      // Elimina una línea completa del carrito.
      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((line) => line.id !== id),
        })),

      // Abre o cierra el drawer del carrito compartido.
      setCartOpen: (cartOpen) => set({ cartOpen }),

      // Aplica un descuento de recompensa en CLP sobre el total del carrito.
      applyRewardDiscount: (amount) => set({ activeDiscountAmount: amount }),

      // Reinicia el slice a su estado inicial y limpia localStorage.
      resetDemo: () => {
        try {
          window.localStorage.removeItem('mesasplit-client');
        } catch {
          // Ignora si localStorage no está disponible.
        }
        set(initialState);
      },
    }),
    {
      // Clave de persistencia en localStorage.
      name: 'mesasplit-client',
      // Almacenamiento JSON seguro en localStorage.
      storage: createJSONStorage(() => localStorage),
      // Selecciona únicamente cart y tableContext para persistencia.
      partialize: (state) => ({
        cart: state.cart,
        tableContext: state.tableContext,
      }),
    },
  ),
);
