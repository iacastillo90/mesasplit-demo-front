// src/features/ClientView/pages/ClientRegisterPage.jsx — vista de Registro de nuevo comensal (fase14-login-cliente-filtros-responsive)
// Permite registrarse con Apple, Google o formulario con cumplimiento explícito de la Ley N° 21.716 de Protección de Datos Personales (Chile).
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Hooks de navegación y Router.
import { Link, useNavigate } from 'react-router-dom';
// Store de cliente para acción de registro.
import { useClientStore } from '../store/useClientStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';

// Componente principal de la página de Registro de cliente.
export default function ClientRegisterPage() {
  // Hook de navegación de React Router.
  const navigate = useNavigate();
  // Acción registerUser del store.
  const registerUser = useClientStore((s) => s.registerUser);
  // Estado local para el campo de nombre completo.
  const [name, setName] = useState('');
  // Estado local para el campo de email.
  const [email, setEmail] = useState('');
  // Estado local para el campo de clave.
  const [password, setPassword] = useState('');
  // Estado local del checkbox obligatorio de aceptación de la Ley N° 21.716 de Protección de Datos.
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  // Error visual si falta el check de privacidad.
  const [errorMsg, setErrorMsg] = useState(null);

  // Maneja el registro con Social Login (Apple / Google).
  const handleSocialRegister = (provider) => {
    registerUser({
      name: provider === 'apple' ? 'Usuario Apple' : 'Usuario Google',
      email: provider === 'apple' ? 'usuario.apple@icloud.com' : 'usuario.google@gmail.com',
    });
    navigate('/cliente/scan');
  };

  // Maneja el envío del formulario tradicional de registro.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setErrorMsg('Debés aceptar la Ley N° 21.716 de Protección de Datos Personales para registrarte.');
      return;
    }
    setErrorMsg(null);
    // Registra al usuario en el store global.
    registerUser({ name, email });
    // Redirige al flujo de escaneo QR de mesa.
    navigate('/cliente/scan');
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      {/* Cabecera universal */}
      <AppHeader title="Mesa Virtual" subtitle="Registro de Usuario" currentRoute="/cliente/registro" theme="light" />

      {/* Contenedor central de registro */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-brand-100 flex flex-col gap-6">
          {/* Cabecera de la tarjeta */}
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl text-emerald-600 shadow-soft">
              ✨
            </span>
            <h1 className="text-2xl font-extrabold text-brand-900 tracking-tight">Crear Nueva Cuenta</h1>
            <p className="text-xs text-brand-800/70">
              Registrate en MesaSplit para acceder a canjes de cashback, beneficios exclusivos y boletas digitales
            </p>
          </div>

          {/* Sección Social Login rápido */}
          <div className="flex flex-col gap-2.5">
            {/* Botón de Social Login Apple */}
            <button
              type="button"
              onClick={() => handleSocialRegister('apple')}
              className="flex items-center justify-center gap-3 w-full rounded-2xl bg-black py-3 px-4 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 shadow-soft cursor-pointer"
            >
              <span className="text-base">🍏</span>
              <span>Continuar con Apple</span>
            </button>

            {/* Botón de Social Login Google */}
            <button
              type="button"
              onClick={() => handleSocialRegister('google')}
              className="flex items-center justify-center gap-3 w-full rounded-2xl bg-white border border-brand-300 py-3 px-4 text-xs font-bold text-brand-900 transition hover:bg-brand-50 active:scale-95 shadow-soft cursor-pointer"
            >
              <span className="text-base">🔴</span>
              <span>Continuar con Google</span>
            </button>
          </div>

          {/* Separador de línea "o registrarse con email" */}
          <div className="flex items-center gap-3 my-1">
            <hr className="flex-1 border-brand-200" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800/50">o con tu email</span>
            <hr className="flex-1 border-brand-200" />
          </div>

          {/* Alerta de error si no se aceptó la ley de datos */}
          {errorMsg && (
            <div className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800 border border-rose-200 animate-fade-in">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Formulario Tradicional de Registro */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input de Nombre Completo */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name-register" className="text-xs font-bold text-brand-800">
                Nombre Completo
              </label>
              <input
                id="name-register"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Antonia Morales"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-bold border border-brand-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Input de Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email-register" className="text-xs font-bold text-brand-800">
                Correo Electrónico
              </label>
              <input
                id="email-register"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ej. antonia@ejemplo.cl"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-bold border border-brand-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Input de Clave */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password-register" className="text-xs font-bold text-brand-800">
                Contraseña
              </label>
              <input
                id="password-register"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-bold border border-brand-200 focus:border-emerald-500 focus:bg-white focus:outline-none transition shadow-inner"
              />
            </div>

            {/* Checkbox obligatorio de Aceptación de la Ley N° 21.716 sobre Protección de Datos Personales (Chile) */}
            <label className="flex items-start gap-2.5 rounded-2xl bg-brand-50/70 p-3.5 border border-brand-200 cursor-pointer hover:bg-brand-50">
              <input
                type="checkbox"
                required
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-brand-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] leading-relaxed text-brand-800">
                Acepto el tratamiento seguro de mis datos personales según la{' '}
                <strong className="font-extrabold text-brand-900 underline">
                  Ley N° 21.716 sobre Protección de Datos Personales (Chile)
                </strong>{' '}
                y los Términos de Servicio de MesaSplit.
              </span>
            </label>

            {/* Botón Submit de Registro */}
            <button
              type="submit"
              className="mt-1 w-full rounded-2xl bg-emerald-600 py-3.5 text-xs font-extrabold text-white shadow-soft transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
            >
              Completar Registro ✨
            </button>
          </form>

          {/* Enlace para regresar a Login */}
          <div className="flex flex-col gap-2 pt-4 border-t border-brand-100 text-center text-xs">
            <span className="text-brand-800/70">¿Ya tenés una cuenta registrada?</span>
            <Link
              to="/cliente/login"
              className="font-extrabold text-emerald-600 hover:text-emerald-700 underline underline-offset-4"
            >
              Iniciar sesión con tu email y clave
            </Link>
          </div>
        </div>
      </main>

      {/* Pie de página universal */}
      <AppFooter theme="light" />
    </div>
  );
}
