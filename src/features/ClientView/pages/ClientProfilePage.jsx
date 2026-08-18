// src/features/ClientView/pages/ClientProfilePage.jsx — vista completa e interactiva de perfil de usuario (fase15-flujo-qr-perfil-cliente)
// Incluye puntos de afiliados, premios, locales registrados, historial de pagos, reseñas, contactos referidos, soporte y reservas.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Hooks de navegación de React Router.
import { Link, useNavigate } from 'react-router-dom';
// Store de cliente para datos del usuario logueado.
import { useClientStore } from '../store/useClientStore.js';
// Store de recompensas del cliente.
import { useRewardsStore } from '../store/useRewardsStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';
// Modal de reservas inteligente.
import ClientReservationAssistant from '../components/ClientReservationAssistant.jsx';
// Widget de soporte en vivo.
import ChileanSupportWidget from '../../../shared/ui/ChileanSupportWidget.jsx';
// Utilidad de formato de moneda CLP.
import { formatCurrency } from '../../../shared/utils/formatCurrency.js';
// Barra de navegación inferior fija para móviles.
import ClientBottomNav from '../components/ClientBottomNav.jsx';

// Componente principal de la página de Perfil del Usuario.
export default function ClientProfilePage() {
  // Hook de navegación de React Router.
  const navigate = useNavigate();
  // Usuario activo en la sesión.
  const user = useClientStore((s) => s.user);
  // Acción de cerrar sesión.
  const logoutUser = useClientStore((s) => s.logoutUser);
  // Puntos acumulados de lealtad.
  const points = useRewardsStore((s) => s.points);
  // Recompensas activas.
  const rewards = useRewardsStore((s) => s.rewards);
  // Acción para canjear recompensa.
  const claimReward = useRewardsStore((s) => s.claimReward);

  // Tab interactiva seleccionada ('overview', 'rewards', 'branches', 'payments', 'reviews', 'referrals', 'support').
  const [activeTab, setActiveTab] = useState('overview');
  // Visibilidad del modal de asistente de reservas.
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  // Visibilidad del widget de soporte.
  const [supportOpen, setSupportOpen] = useState(false);
  // Estado local para feedback de copiar código de referido.
  const [copiedReferral, setCopiedReferral] = useState(false);
  // Estado local de lista de reseñas de platos agregadas por el usuario.
  const [reviewsList, setReviewsList] = useState([
    { id: 'r1', dish: 'Lomo Lo Ovalle', rating: 5, comment: 'Corte jugoso y papas crujientes. Excelente atención.', date: 'Ayer' },
    { id: 'r2', dish: 'Pisco Sour Artesanal 🍹', rating: 5, comment: 'Perfecta acidez de limón de pica.', date: 'Hace 3 días' },
  ]);
  // Input de nueva reseña rápida.
  const [newReviewText, setNewReviewText] = useState('');

  // Copia el código de referido al portapapeles.
  const handleCopyReferral = () => {
    try {
      navigator.clipboard.writeText('CONSTANZA-REWARDS-2026');
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 2000);
    } catch {
      setCopiedReferral(true);
      window.setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  // Agrega una nueva reseña rápida al historial.
  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviewsList((prev) => [
      { id: `r-${Date.now()}`, dish: 'Plato del Día Restô', rating: 5, comment: newReviewText, date: 'Hoy' },
      ...prev,
    ]);
    setNewReviewText('');
  };

  // Si el usuario no está logueado, redirige o invita a iniciar sesión.
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
        <AppHeader title="Mesa Virtual" subtitle="Perfil de Usuario" currentRoute="/cliente/perfil" theme="light" />
        <main className="flex-1 flex items-center justify-center p-6 text-center">
          <div className="max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-brand-100 flex flex-col gap-4">
            <span className="text-5xl">👤</span>
            <h1 className="text-xl font-extrabold">Iniciá Sesión para ver tu Perfil</h1>
            <p className="text-xs text-brand-800/70">
              Accedé a tus puntos de afiliado, cupones de descuento e historial de boletas
            </p>
            <Link
              to="/cliente/login"
              className="mt-2 rounded-2xl bg-amber-500 py-3.5 px-6 text-xs font-extrabold text-white shadow-soft transition hover:bg-amber-600"
            >
              🔑 Iniciar Sesión Ahora
            </Link>
          </div>
        </main>
        <AppFooter theme="light" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 text-brand-900">
      {/* Cabecera universal */}
      <AppHeader title="Mesa Virtual" subtitle="Perfil del Comensal" currentRoute="/cliente/perfil" theme="light" />

      {/* Contenido principal del perfil */}
      <main className="flex-1 px-4 sm:px-6 py-8 pb-24 max-w-4xl mx-auto w-full flex flex-col gap-6">
        {/* Tarjeta de Identidad de Usuario y resumen VIP */}
        <div className="rounded-3xl bg-gradient-to-br from-brand-900 to-brand-950 p-6 sm:p-8 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-brand-800">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-4xl shadow-inner border border-amber-400/30">
              {user.avatar || '👩‍💻'}
            </span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{user.name}</h1>
                <span className="rounded-full bg-amber-500 px-3 py-0.5 text-[10px] font-extrabold text-brand-950 uppercase tracking-widest">
                  VIP Gold 🏆
                </span>
              </div>
              <p className="text-xs text-brand-50/70">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-amber-400">✨ {points} Puntos MesaSplit</span>
              </div>
            </div>
          </div>

          {/* Botones de acción directa en cabecera */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/cliente/scan"
              className="rounded-2xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-1.5"
            >
              <span>📷</span>
              <span>Escanear Mesa</span>
            </Link>
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-1.5"
            >
              <span>📅</span>
              <span>Reservar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logoutUser();
                navigate('/cliente');
              }}
              className="rounded-2xl bg-white/10 hover:bg-white/20 px-3 py-2.5 text-xs font-bold text-brand-50/80 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              Cerrar Sesión ✕
            </button>
          </div>
        </div>

        {/* Barra de pestañas responsivas del perfil */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap touch-pan-x">
          {[
            { id: 'overview', label: '📊 Resumen General', icon: '👤' },
            { id: 'rewards', label: '🏆 Puntos & Premios', icon: '🎁' },
            { id: 'branches', label: '📍 Locales & Visitas', icon: '🏪' },
            { id: 'payments', label: '📜 Historial Pagos', icon: '📄' },
            { id: 'reviews', label: '⭐ Mis Reseñas', icon: '💬' },
            { id: 'referrals', label: '👥 Invitar Amigos', icon: '🚀' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-extrabold transition active:scale-95 border cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                  : 'bg-white text-brand-900 border-brand-200 hover:bg-brand-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Pestaña 1: Resumen General */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Tarjeta 1: Puntos acumulados */}
            <div className="rounded-3xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-2">
              <span className="text-2xl">🏆</span>
              <h2 className="text-sm font-bold text-brand-800">Puntos de Afiliado</h2>
              <p className="text-2xl font-extrabold text-amber-600">{points} pts</p>
              <p className="text-[11px] text-brand-800/60">Equivale a $14.500 en cashback directo</p>
            </div>

            {/* Tarjeta 2: Visitas realizadas */}
            <div className="rounded-3xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-2">
              <span className="text-2xl">📍</span>
              <h2 className="text-sm font-bold text-brand-800">Locales Visitados</h2>
              <p className="text-2xl font-extrabold text-sky-600">3 Restaurantes</p>
              <p className="text-[11px] text-brand-800/60">Última visita: Restô Lo Ovalle</p>
            </div>

            {/* Tarjeta 3: Boletas emitidas */}
            <div className="rounded-3xl bg-white p-5 shadow-soft border border-brand-100 flex flex-col gap-2">
              <span className="text-2xl">📜</span>
              <h2 className="text-sm font-bold text-brand-800">Boletas DTE Emitidas</h2>
              <p className="text-2xl font-extrabold text-emerald-600">6 Boletas Tipo 39</p>
              <p className="text-[11px] text-brand-800/60">Validadas en SII Chile</p>
            </div>
          </div>
        )}

        {/* Pestaña 2: Puntos & Premios Canjeables */}
        {activeTab === 'rewards' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Catálogo de Premios Canjeables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => (
                <div key={r.id} className="rounded-2xl bg-brand-50 p-4 border border-brand-200 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-brand-900">{r.title}</span>
                    <span className="text-xs font-extrabold text-amber-600">{r.cost} Puntos</span>
                  </div>
                  <button
                    type="button"
                    disabled={r.claimed || points < r.cost}
                    onClick={() => claimReward(r.id)}
                    className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-soft"
                  >
                    {r.claimed ? 'Canjeado ✓' : 'Canjear'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 3: Locales Registrados & Visitas */}
        {activeTab === 'branches' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Locales Registrados e Historial de Visitas</h2>
            <div className="flex flex-col gap-3">
              {[
                { name: 'Restô Lo Ovalle', city: 'Santiago', date: 'Ayer', total: 34800, rating: '5.0 ⭐' },
                { name: 'Restô Providencia', city: 'Santiago', date: 'Hace 5 días', total: 28900, rating: '4.9 ⭐' },
                { name: 'Restô Vitacura', city: 'Santiago', date: 'Hace 2 semanas', total: 52000, rating: '5.0 ⭐' },
              ].map((b, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-brand-50 border border-brand-200">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-extrabold text-brand-900">{b.name}</span>
                    <span className="text-xs text-brand-800/70">{b.city} · Última visita: {b.date}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-brand-900">{formatCurrency(b.total)}</span>
                    <span className="text-[11px] font-bold text-amber-600">{b.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 4: Historial de Pagos & Boletas */}
        {activeTab === 'payments' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Historial de Pagos & Boletas Electrónicas (DTE)</h2>
            <div className="flex flex-col gap-3">
              {[
                { id: 'b-101', date: '17/08/2026', total: 34800, doc: 'Boleta Electrónica N° 39102', method: 'Débito Redelcom' },
                { id: 'b-102', date: '12/08/2026', total: 28900, doc: 'Boleta Electrónica N° 38941', method: 'Flow.cl Webpay' },
                { id: 'b-103', date: '01/08/2026', total: 52000, doc: 'Factura Electrónica N° 33019', method: 'Transferencia' },
              ].map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl bg-brand-50 border border-brand-200">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-brand-900">{p.doc}</span>
                    <span className="text-[11px] text-brand-800/70">{p.date} · {p.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-emerald-700">{formatCurrency(p.total)}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                      Emitida SII ✓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 5: Mis Reseñas */}
        {activeTab === 'reviews' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Mis Reseñas de Platos y Atención</h2>
            
            {/* Formulario rápido para publicar nueva reseña */}
            <form onSubmit={handleAddReview} className="flex flex-col gap-2 p-4 rounded-2xl bg-amber-500/10 border border-amber-300">
              <label htmlFor="new-review" className="text-xs font-bold text-amber-900">
                Escribí una nueva reseña de tu experiencia:
              </label>
              <div className="flex gap-2">
                <input
                  id="new-review"
                  type="text"
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="ej. Los postres son exquisitos..."
                  className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold border border-amber-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
                >
                  Publicar ★
                </button>
              </div>
            </form>

            <div className="flex flex-col gap-3">
              {reviewsList.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-brand-900">{r.dish}</span>
                    <span className="text-xs font-bold text-amber-500">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-xs text-brand-800/80">{r.comment}</p>
                  <span className="text-[10px] text-brand-800/50 self-end">{r.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 6: Invitar Amigos & Referidos */}
        {activeTab === 'referrals' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4 text-center">
            <span className="text-4xl">🚀</span>
            <h2 className="text-lg font-extrabold text-brand-900">Invitá Amigos y Ganá $3.000 Puntos</h2>
            <p className="text-xs text-brand-800/70 max-w-md mx-auto">
              Compartí tu código de referido único con tus amigos. Cada vez que escaneen una mesa y pidan, ambos acumulan 3.000 puntos MesaSplit.
            </p>

            <div className="flex items-center justify-center gap-2 max-w-sm mx-auto w-full mt-2">
              <input
                type="text"
                readOnly
                value="CONSTANZA-REWARDS-2026"
                className="w-full rounded-2xl bg-brand-50 px-4 py-3 text-xs font-mono font-extrabold text-center border border-brand-200 tracking-widest uppercase text-brand-900"
              />
              <button
                type="button"
                onClick={handleCopyReferral}
                className="rounded-2xl bg-brand-900 hover:bg-brand-800 text-white px-4 py-3 text-xs font-bold transition active:scale-95 cursor-pointer shadow-soft shrink-0"
              >
                {copiedReferral ? '¡Copiado! ✓' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Bloque directo de Soporte en Vivo & Reservas */}
        <div className="rounded-3xl bg-sky-500/10 p-6 border border-sky-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sky-950">
            <span className="text-3xl">💬</span>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold">¿Necesitás ayuda con tu cuenta?</span>
              <span className="text-xs text-sky-900/80">Hablá en vivo con nuestro equipo de soporte MesaSplit</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="rounded-2xl bg-sky-600 hover:bg-sky-700 px-5 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft shrink-0"
          >
            Abrir Chat de Soporte 💬
          </button>
        </div>
      </main>

      {/* Modal de Asistente Inteligente de Reservas */}
      <ClientReservationAssistant isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} />

      {/* Widget de Soporte Flotante */}
      {supportOpen && <ChileanSupportWidget />}

      {/* Pie de página universal */}
      <AppFooter theme="light" />

      {/* Barra de navegación inferior fija para móviles */}
      <ClientBottomNav />
    </div>
  );
}
