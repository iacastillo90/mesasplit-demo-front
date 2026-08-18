// src/features/ClientView/pages/ClientLoginPage.jsx — vista de Login de comensal (fase14-login-cliente-filtros-responsive)
// Permite al cliente iniciar sesión en la demo ingresando cualquier correo y contraseña.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Hooks de navegación y Router.
import { Link, useNavigate } from 'react-router-dom';
// Store de cliente para acción de login.
import { useClientStore } from '../store/useClientStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';

// Componente principal de la página de Login de cliente.
export default function ClientLoginPage() {
  // Hook de navegación de React Router.
  const navigate = useNavigate();
  // Acción loginUser del store.
  const loginUser = useClientStore((s) => s.loginUser);
  // Estado local para el campo de email.
  const [email, setEmail] = useState('');
  // Estado local para el campo de clave.
  const [password, setPassword] = useState('');

  // Maneja el envío del formulario de inicio de sesión.
  const handleSubmit = (e) => {
    e.preventDefault();
    // Inicia sesión demo con las credenciales ingresadas.
    loginUser({ email, name: email ? email.split('@')[0] : 'Comensal Demo' });
    // Redirige al flujo de escaneo QR de mesa.
    navigate('/cliente/scan');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      {/* Cabecera universal del sistema */}
      <AppHeader title="Mesa Virtual" subtitle="Iniciar Sesión" currentRoute="/cliente/login" theme="light" />

      {/* Contenedor central de login */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-brand-100 flex flex-col gap-6">
          {/* Título de la tarjeta e ícono */}
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl text-amber-600 shadow-soft">
              🔑
            </span>
            <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight">Iniciar Sesión</h1>
            <p className="text-xs text-brand-800/70">
              Ingresá a tu cuenta para acumular puntos MesaSplit Rewards y dividir la cuenta en vivo
            </p>
          </div>

          {/* Banner explicativo del modo demo */}
          <div className="flex items-center gap-3 rounded-2xl bg-sky-500/10 p-3.5 border border-sky-300 text-sky-900">
            <span className="text-xl">💡</span>
            <p className="text-xs font-semibold">
              <strong className="font-extrabold text-sky-950">Modo Demo:</strong> Podés ingresar usando cualquier correo y clave.
            </p>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input de Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-login" className="text-xs font-bold text-brand-800">
                Correo Electrónico
              </label>
              <input
                id="email-login"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. cliente@mesasplit.cl"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-bold border border-brand-200 focus:border-amber-500 focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Input de Clave */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password-login" className="text-xs font-bold text-brand-800">
                Contraseña
              </label>
              <input
                id="password-login"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-bold border border-brand-200 focus:border-amber-500 focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Botón Submit de Ingreso */}
            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-amber-500 py-3.5 text-xs font-extrabold text-white shadow-soft transition hover:bg-amber-600 active:scale-95 cursor-pointer"
            >
              Ingresar a Mesa Virtual 🍽️
            </button>
          </form>

          {/* Acceso a Registro de Usuario o Invitado */}
          <div className="flex flex-col gap-2 pt-4 border-t border-brand-100 text-center text-xs">
            <span className="text-brand-800/70">¿No tenés una cuenta todavía?</span>
            <Link
              to="/cliente/registro"
              className="font-extrabold text-amber-600 hover:text-amber-700 underline underline-offset-4"
            >
              Crear cuenta con Social Login o Formulario
            </Link>

            <Link
              to="/cliente"
              className="mt-2 text-[11px] font-semibold text-brand-800/60 hover:text-brand-900"
            >
              Continuar como invitado sin iniciar sesión →
            </Link>
          </div>
        </div>
      </main>

      {/* Pie de página universal */}
      <AppFooter theme="light" />
    </div>
  );
}
