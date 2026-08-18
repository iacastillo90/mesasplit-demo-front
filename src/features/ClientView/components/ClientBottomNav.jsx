// src/features/ClientView/components/ClientBottomNav.jsx — barra de navegación inferior fija para móviles (fase17-bottom-nav-mobile-layout-cliente)
// Permite al cliente navegar instantáneamente entre Dashboard, Escáner QR, Mesa Virtual, Comanda y Perfil desde cualquier vista.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React para memorización.
import { useMemo } from 'react';
// Hooks de navegación y Router.
import { Link, useLocation } from 'react-router-dom';
// Store de cliente para contador de ítems del carrito.
import { selectCartCount, useClientStore } from '../store/useClientStore.js';

// Componente de la barra de navegación inferior fija para teléfonos móviles.
export default function ClientBottomNav() {
  // Hook para conocer la ruta activa.
  const location = useLocation();
  // Carrito de comanda del cliente.
  const cart = useClientStore((s) => s.cart);
  // Total de ítems acumulados en la comanda.
  const cartCount = useMemo(() => selectCartCount(cart), [cart]);

  // Lista de pestañas principales de la experiencia cliente.
  const navTabs = [
    { path: '/cliente/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/cliente/scan', label: 'Escanear QR', icon: '📷' },
    { path: '/cliente', label: 'Mesa 12', icon: '🍽️' },
    { path: '/cliente/carrito', label: 'Comanda', icon: '🛒', badge: cartCount },
    { path: '/cliente/perfil', label: 'Perfil', icon: '👤' },
  ];

  return (
    <nav
      aria-label="Navegación inferior cliente"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 shadow-2xl py-2 px-2 flex items-center justify-around max-w-4xl mx-auto rounded-t-3xl"
    >
      {navTabs.map((tab) => {
        // Compara si la ruta actual coincide exactamente con la pestaña.
        const isActive = location.pathname === tab.path;

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${
              isActive
                ? 'text-amber-600 font-extrabold scale-105'
                : 'text-brand-800/70 font-semibold hover:text-brand-900'
            }`}
          >
            {/* Ícono de la pestaña con badge opcional de cantidad */}
            <div className="relative">
              <span className="text-xl">{tab.icon}</span>
              {/* Badge de cantidad para el carrito */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-semantic-danger text-[9px] font-extrabold text-white shadow-soft animate-bounce">
                  {tab.badge}
                </span>
              )}
            </div>

            {/* Etiqueta del botón */}
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>

            {/* Punto indicador de pestaña activa */}
            {isActive && (
              <span className="absolute -bottom-1 h-1 w-4 rounded-full bg-amber-500 shadow-soft" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
