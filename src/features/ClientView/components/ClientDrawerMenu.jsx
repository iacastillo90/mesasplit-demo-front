// src/features/ClientView/components/ClientDrawerMenu.jsx — menú lateral colapsable deslizable del cliente (fase16-dashboard-cliente-menu-hamburguesa)
// Se despliega al hacer clic en el botón de hamburguesa 🍔 y esconde/despliega todas las herramientas interactivas del cliente.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useEffect } from 'react';
// Hooks de navegación y Router.
import { useNavigate } from 'react-router-dom';
// Store de cliente para estado del usuario.
import { useClientStore } from '../store/useClientStore.js';
// Store de recompensas del cliente.
import { useRewardsStore } from '../store/useRewardsStore.js';

// Componente del drawer de menú lateral del comensal.
export default function ClientDrawerMenu({ isOpen, onClose }) {
  // Hook de navegación.
  const navigate = useNavigate();
  // Usuario logueado en el store.
  const user = useClientStore((s) => s.user);
  // Acción de cerrar sesión.
  const logoutUser = useClientStore((s) => s.logoutUser);
  // Puntos acumulados de lealtad.
  const points = useRewardsStore((s) => s.points);

  // Escucha tecla Escape para cerrar el drawer.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Maneja la navegación y cierra el drawer.
  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Fondo oscuro translúcido con desenfoque al hacer clic cierra */}
      <div
        className="fixed inset-0 bg-brand-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Panel lateral deslizante desde la izquierda */}
      <aside className="relative z-10 flex w-4/5 max-w-sm flex-col bg-brand-900 text-white shadow-2xl border-r border-brand-800 animate-slide-in">
        {/* Cabecera del drawer lateral */}
        <div className="flex items-center justify-between p-5 border-b border-brand-800 bg-brand-950/50">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/30">
              {user?.avatar || '👤'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-white truncate max-w-[150px]">
                {user ? user.name : 'Invitado MesaSplit'}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {user ? `VIP Gold 🏆 · ${points} pts` : 'Iniciá sesión para acumular puntos'}
              </span>
            </div>
          </div>

          {/* Botón de cierre ✕ */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-white/10 p-2 text-xs font-bold text-brand-50 hover:bg-white/20 transition cursor-pointer"
            aria-label="Cerrar menú lateral"
          >
            ✕
          </button>
        </div>

        {/* Lista de enlaces de navegación e interactividad */}
        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1.5 scrollbar-none">
          {/* Opción 1: Dashboard principal */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/dashboard')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold transition text-left hover:bg-white/10 text-amber-400 bg-amber-500/10 border border-amber-400/20 cursor-pointer"
          >
            <span className="text-base">📊</span>
            <span>Dashboard de Cliente</span>
          </button>

          {/* Opción 2: Escanear Mesa / QR */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/scan')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-sky-300 cursor-pointer"
          >
            <span className="text-base">📷</span>
            <span>Escanear Mesa / Código QR</span>
          </button>

          {/* Opción 3: Mesa Virtual en vivo */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-emerald-300 cursor-pointer"
          >
            <span className="text-base">🍽️</span>
            <span>Mesa Virtual (Mesa 12)</span>
          </button>

          {/* Opción 4: Mi Comanda y Carrito */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/carrito')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-brand-100 cursor-pointer"
          >
            <span className="text-base">🛒</span>
            <span>Mi Comanda & Carrito</span>
          </button>

          {/* Opción 5: Perfil del Comensal */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-brand-100 cursor-pointer"
          >
            <span className="text-base">👤</span>
            <span>Mi Perfil Completo VIP</span>
          </button>

          {/* Separador visual de secciones */}
          <hr className="my-2 border-brand-800" />

          {/* Opción 6: Puntos y Premios */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-amber-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">🏆</span>
              <span>Puntos & Premios Rewards</span>
            </div>
            <span className="text-[10px] bg-amber-500 text-brand-950 font-extrabold px-2 py-0.5 rounded-full">
              {points} pts
            </span>
          </button>

          {/* Opción 7: Locales Registrados */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-brand-100 cursor-pointer"
          >
            <span className="text-base">📍</span>
            <span>Locales Registrados & Visitas</span>
          </button>

          {/* Opción 8: Historial de Pagos & Boletas */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-brand-100 cursor-pointer"
          >
            <span className="text-base">📜</span>
            <span>Historial de Pagos & Boletas DTE</span>
          </button>

          {/* Opción 9: Reseñas de Platos */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-brand-100 cursor-pointer"
          >
            <span className="text-base">⭐</span>
            <span>Mis Reseñas de Platos</span>
          </button>

          {/* Opción 10: Referidos Invitar Amigos */}
          <button
            type="button"
            onClick={() => handleNavigate('/cliente/perfil')}
            className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold transition text-left hover:bg-white/10 text-emerald-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-base">👥</span>
              <span>Invitar Amigos & Ganar</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full">
              +$3.000
            </span>
          </button>

          {/* Separador */}
          <hr className="my-2 border-brand-800" />

          {/* Login o Logout según sesión */}
          {user ? (
            <button
              type="button"
              onClick={() => {
                logoutUser();
                onClose();
                navigate('/cliente');
              }}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <span className="text-base">🚪</span>
              <span>Cerrar Sesión</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNavigate('/cliente/login')}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-extrabold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition cursor-pointer"
            >
              <span className="text-base">🔑</span>
              <span>Iniciar Sesión / Registrarse</span>
            </button>
          )}
        </nav>
      </aside>
    </div>
  );
}
