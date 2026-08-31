// src/features/Portal/components/BackendLogin.jsx — login real contra el back.
// Formulario que autentica con POST /auth/login (via authService) y avisa al
// Portal la persona autenticada. Visible solo en modo backend.
import { useState } from 'react';
// login: función de authService que autentica y persiste token + persona.
import { login } from '../../../api/authService';

// BackendLogin: form de email + password con estados de carga y error.
export default function BackendLogin({ onLogin }) {
  // Email precargado con el usuario seed demo (mozo) para probar rápido.
  const [email, setEmail] = useState('mozo@labtab.cl');
  // Password precargado con la contraseña del seed (LabTab2026!).
  const [password, setPassword] = useState('LabTab2026!');
  // Mensaje de error del login (credenciales inválidas, red caída, etc.).
  const [error, setError] = useState(null);
  // Flag de carga: deshabilita el botón mientras resuelve el fetch.
  const [loading, setLoading] = useState(false);

  // handleSubmit: autentica y propaga la persona al Portal.
  const handleSubmit = async (e) => {
    // Previene el submit nativo del form (recarga de página).
    e.preventDefault();
    // Activa el estado de carga y limpia errores previos.
    setLoading(true);
    setError(null);
    try {
      // Llama al backend y recibe la persona autenticada.
      const person = await login(email, password);
      // Propaga la persona al Portal (onLogin decide la vista).
      onLogin(person);
    } catch (err) {
      // Muestra el mensaje de error (err.message viene del httpClient).
      setError(err.message);
    } finally {
      // Apaga el estado de carga siempre.
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft border border-brand-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-brand-500">🔐 Conexión al Backend</h2>
        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Modo Backend
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Campo de email. */}
        <label className="flex flex-col gap-1 text-xs font-semibold text-brand-800">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </label>
        {/* Campo de password. */}
        <label className="flex flex-col gap-1 text-xs font-semibold text-brand-800">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-brand-200 px-3 py-2 text-sm text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          />
        </label>
        {/* Mensaje de error (solo si hubo fallo). */}
        {error && <p className="text-xs font-semibold text-red-600">⚠ {error}</p>}
        {/* Botón de envío (deshabilitado mientras carga). */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-600 transition active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Conectando…' : 'Conectar al backend'}
        </button>
      </form>
    </section>
  );
}
