// src/features/ClientView/pages/ClientDashboardPage.jsx — Dashboard central del comensal post-login (fase16-dashboard-cliente-menu-hamburguesa)
// Pantalla principal del cliente con centro de mando interactivo, puntos, mesa activa y accesos rápidos a todas las herramientas.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Hooks de navegación y Router.
import { Link } from 'react-router-dom';
// Store de cliente para estado de usuario y mesa.
import { useClientStore } from '../store/useClientStore.js';
// Store de recompensas del cliente.
import { useRewardsStore } from '../store/useRewardsStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';
// Modal de reservas inteligente.
import ClientReservationAssistant from '../components/ClientReservationAssistant.jsx';
// Barra de navegación inferior fija para móviles.
import ClientBottomNav from '../components/ClientBottomNav.jsx';

// Componente principal de la vista Dashboard de Cliente.
export default function ClientDashboardPage() {
  // Usuario logueado en el store.
  const user = useClientStore((s) => s.user);
  // Contexto de mesa virtual activa.
  const tableContext = useClientStore((s) => s.tableContext);
  // Carrito de compras.
  const cart = useClientStore((s) => s.cart);
  // Puntos acumulados de lealtad.
  const points = useRewardsStore((s) => s.points);

  // Estado local para abrir el modal de reservas.
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      {/* Cabecera universal con botón de hamburguesa 🍔 que despliega ClientDrawerMenu */}
      <AppHeader title="Mesa Virtual" subtitle="Dashboard del Comensal" currentRoute="/cliente/dashboard" theme="light" />

      {/* Contenido principal del Dashboard */}
      <main className="flex-1 px-4 sm:px-6 py-8 pb-24 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Banner de Bienvenida Personalizado */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-900 via-brand-950 to-amber-950 p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-brand-800">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-4xl shadow-inner border border-amber-400/30">
              {user?.avatar || '👤'}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">
                  ¡Hola {user ? user.name : 'Comensal'}! 👋
                </h1>
                <span className="rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-extrabold text-brand-950 uppercase tracking-widest">
                  VIP Gold 🏆
                </span>
              </div>
              <p className="text-xs text-brand-50/70">
                Bienvenido a tu centro de mando gastronómico MesaSplit
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs font-bold text-amber-400">✨ {points} Puntos Acumulados</span>
                <span className="text-xs text-emerald-400 font-semibold">● Mesa 12 Activa</span>
              </div>
            </div>
          </div>

          {/* Botones principales de Escaneo QR y Mesa Virtual */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              to="/cliente/scan"
              className="rounded-2xl bg-sky-500 hover:bg-sky-600 px-5 py-3 text-xs font-extrabold text-white transition active:scale-95 shadow-soft flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>📷</span>
              <span>Escanear Mesa</span>
            </Link>
            <Link
              to="/cliente"
              className="rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-3 text-xs font-extrabold text-white transition active:scale-95 shadow-soft flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🍽️</span>
              <span>Ir a Mesa Virtual</span>
            </Link>
          </div>
        </div>

        {/* Banner de Estado de la Mesa Activa */}
        <div className="rounded-3xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-600 border border-emerald-300">
              🍽️
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-brand-900">
                Mesa {tableContext?.number ?? 12} · Restô Lo Ovalle
              </span>
              <span className="text-xs text-brand-800/70">
                {tableContext?.guests ?? 4} comensales en mesa · {cart.length} ítems en comanda
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/cliente/carrito"
              className="rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 px-4 py-2.5 text-xs font-bold text-sky-800 border border-sky-300 transition active:scale-95 cursor-pointer"
            >
              🛒 Ver Comanda ({cart.length})
            </Link>
            <Link
              to="/cliente"
              className="rounded-2xl bg-brand-900 hover:bg-brand-800 px-4 py-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-soft"
            >
              Ver Menú en Vivo →
            </Link>
          </div>
        </div>

        {/* Grilla Principal de Tarjetas de Herramientas Interactivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Tarjeta 1: Escanear Código QR */}
          <Link
            to="/cliente/scan"
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-sky-300 transition flex flex-col justify-between gap-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl text-sky-600 shadow-inner">
                📷
              </span>
              <span className="text-xs font-extrabold text-sky-600 group-hover:translate-x-1 transition-transform">
                Escanear →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Escanear Mesa / QR</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Ingresá a tu mesa leyendo el código QR o escribiendo la clave física.
              </p>
            </div>
          </Link>

          {/* Tarjeta 2: Mi Perfil Completo */}
          <Link
            to="/cliente/perfil"
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-amber-300 transition flex flex-col justify-between gap-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-2xl text-amber-600 shadow-inner">
                👤
              </span>
              <span className="text-xs font-extrabold text-amber-600 group-hover:translate-x-1 transition-transform">
                Ver Perfil →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Mi Perfil VIP Gold</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Puntos Rewards, cupones canjeables e historial de visitas.
              </p>
            </div>
          </Link>

          {/* Tarjeta 3: Asistente de Reservas */}
          <button
            type="button"
            onClick={() => setBookingOpen(true)}
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-emerald-300 transition flex flex-col justify-between gap-4 text-left active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-600 shadow-inner">
                📅
              </span>
              <span className="text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition-transform">
                Reservar →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Asistente de Reservas</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Agendá mesas en cualquier local o sumate a la fila virtual.
              </p>
            </div>
          </button>

          {/* Tarjeta 4: Boletas Electrónicas DTE */}
          <Link
            to="/cliente/perfil"
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-indigo-300 transition flex flex-col justify-between gap-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl text-indigo-600 shadow-inner">
                📜
              </span>
              <span className="text-xs font-extrabold text-indigo-600 group-hover:translate-x-1 transition-transform">
                Ver DTEs →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Historial de Pagos & DTE</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Boletas electrónicas Tipo 39 y Facturas aprobadas por el SII.
              </p>
            </div>
          </Link>

          {/* Tarjeta 5: Mis Reseñas de Platos */}
          <Link
            to="/cliente/perfil"
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-rose-300 transition flex flex-col justify-between gap-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-2xl text-rose-600 shadow-inner">
                ⭐
              </span>
              <span className="text-xs font-extrabold text-rose-600 group-hover:translate-x-1 transition-transform">
                Ver Reseñas →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Mis Reseñas de Platos</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Calificaciones dejadas y opiniones sobre tus platos favoritos.
              </p>
            </div>
          </Link>

          {/* Tarjeta 6: Invitar Amigos */}
          <Link
            to="/cliente/perfil"
            className="group rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-emerald-400 transition flex flex-col justify-between gap-4 active:scale-98 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-2xl text-emerald-600 shadow-inner">
                👥
              </span>
              <span className="text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition-transform">
                +$3.000 →
              </span>
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-brand-900">Invitar Amigos</h2>
              <p className="text-xs text-brand-800/70 mt-0.5">
                Compartí tu enlace único y ganá $3.000 puntos por cada referido.
              </p>
            </div>
          </Link>
        </div>
      </main>

      {/* Modal de Reservas */}
      <ClientReservationAssistant isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />

      {/* Pie de página universal */}
      <AppFooter theme="light" />

      {/* Barra de navegación inferior fija para móviles */}
      <ClientBottomNav />
    </div>
  );
}
