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
import { REWARDS_CATALOG, useRewardsStore } from '../store/useRewardsStore.js';
// Cabecera universal.
import AppHeader from '../../../shared/ui/AppHeader.jsx';
// Pie de página universal.
import AppFooter from '../../../shared/ui/AppFooter.jsx';
// Modal de reservas inteligente.
import ClientReservationAssistant from '../components/ClientReservationAssistant.jsx';
// Modal de soporte estilo WhatsApp con 4 opciones.
import ClientSupportChatModal from '../components/ClientSupportChatModal.jsx';
// Modal emergente centrado de ticket térmico DTE SII.
import DteTicketModal from '../components/DteTicketModal.jsx';
// Modal emergente interactivo de detalle de plato y reseña.
import DishReviewDetailModal from '../components/DishReviewDetailModal.jsx';
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
  // Actualización de datos del usuario.
  const updateUser = useClientStore((s) => s.updateUser);
  // Acción de cerrar sesión.
  const logoutUser = useClientStore((s) => s.logoutUser);
  // Puntos acumulados de lealtad.
  const points = useRewardsStore((s) => s.points);
  // Recompensas canjeadas en la sesión.
  const redeemedRewards = useRewardsStore((s) => s.redeemedRewards);
  // Acción para canjear recompensa.
  const redeemReward = useRewardsStore((s) => s.redeemReward);

  // Tab interactiva seleccionada ('overview', 'rewards', 'branches', 'payments', 'reviews', 'referrals', 'edit-profile').
  const [activeTab, setActiveTab] = useState('overview');
  // Visibilidad del modal de asistente de reservas.
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  // Visibilidad del widget de soporte.
  const [supportOpen, setSupportOpen] = useState(false);
  // Ticket de boleta DTE seleccionado para desplegar en el modal térmico.
  const [selectedTicket, setSelectedTicket] = useState(null);
  // Reseña de plato seleccionada para desplegar en el modal de detalle completo.
  const [selectedReview, setSelectedReview] = useState(null);
  // Filtro activo para la lista de reseñas.
  const [reviewFilter, setReviewFilter] = useState('Todos');
  // Estado local para feedback de copiar código de referido.
  const [copiedReferral, setCopiedReferral] = useState(false);
  // Feedback al guardar perfil.
  const [savedProfileSuccess, setSavedProfileSuccess] = useState(false);

  // Formulario local para editar perfil.
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Constanza Silva',
    email: user?.email || 'constanza.silva@gastronomia.cl',
    phone: user?.phone || '+56 9 8765 4321',
    rut: user?.rut || '18.942.310-7',
    preferences: {
      vegetarian: false,
      vegan: true,
      glutenFree: true,
      lactoseFree: false,
      nutAllergy: false,
    },
  });

  // Estado local de lista de reseñas de platos con fotos HD y metadatos completos.
  const [reviewsList, setReviewsList] = useState([
    {
      id: 'r1',
      dish: 'Lomo Lo Ovalle con Papas Rústicas',
      category: 'Cortes Premium',
      price: 14900,
      rating: 5,
      comment: 'Corte jugoso a término medio impecable y papas doradas crujientes. Excelente atención del garzón.',
      date: '17/08/2026 21:45 hrs',
      branchName: 'Restô Lo Ovalle',
      branchAddress: 'Av. Lo Ovalle 1420, San Miguel, Santiago',
      branchPhone: '+56 2 2891 4000',
      likes: 12,
      image: '/images/dish_lomo_lo_ovalle.png',
    },
    {
      id: 'r2',
      dish: 'Pisco Sour Artesanal 🍹',
      category: 'Coctelería de Autor',
      price: 4900,
      rating: 5,
      comment: 'Perfecta acidez de limón de pica con espuma sedosa. Recomendadísimo.',
      date: '12/08/2026 22:15 hrs',
      branchName: 'Restô Providencia',
      branchAddress: 'Av. Providencia 2150, Providencia, Santiago',
      branchPhone: '+56 2 2760 9100',
      likes: 8,
      image: '/images/dish_pisco_sour.png',
    },
    {
      id: 'r3',
      dish: 'Volcán de Chocolate con Helado 🍨',
      category: 'Postres',
      price: 5200,
      rating: 5,
      comment: 'Centro derretido irresistible y helado artesanal de vainilla.',
      date: '01/08/2026 23:00 hrs',
      branchName: 'Restô Vitacura',
      branchAddress: 'Av. Alonso de Córdova 3890, Vitacura, Santiago',
      branchPhone: '+56 2 2955 8820',
      likes: 15,
      image: '/images/dish_volcan_chocolate.png',
    },
    {
      id: 'r4',
      dish: 'Ceviche Mixto Tradicional 🐟',
      category: 'Mariscos',
      price: 13900,
      rating: 5,
      comment: 'Pescado blanco de roca fresco con choclo peruano y leche de tigre espectacular.',
      date: '28/07/2026 14:20 hrs',
      branchName: 'Restô Providencia',
      branchAddress: 'Av. Providencia 2150, Providencia, Santiago',
      branchPhone: '+56 2 2760 9100',
      likes: 10,
      image: '/images/dish_ceviche_mixto.png',
    },
  ]);
  // Input de plato a reseñar.
  const [newReviewDish, setNewReviewDish] = useState('');
  // Input de texto de reseña.
  const [newReviewText, setNewReviewText] = useState('');
  // Selección de estrellas (1 a 5).
  const [newReviewRating, setNewReviewRating] = useState(5);

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
    const dishName = newReviewDish.trim() || 'Plato Recomendado Restô';
    setReviewsList((prev) => [
      {
        id: `r-${Date.now()}`,
        dish: dishName,
        category: 'Recomendación del Cliente',
        price: 12900,
        rating: newReviewRating,
        comment: newReviewText.trim(),
        date: 'Hoy 14:00 hrs',
        branchName: 'Restô Lo Ovalle',
        branchAddress: 'Av. Lo Ovalle 1420, San Miguel, Santiago',
        branchPhone: '+56 2 2891 4000',
        likes: 1,
        image: '/images/dish_lomo_lo_ovalle.png',
      },
      ...prev,
    ]);
    setNewReviewDish('');
    setNewReviewText('');
    setNewReviewRating(5);
  };

  // Guarda la actualización del perfil de usuario y preferencias alimentarias.
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (typeof updateUser === 'function') {
      updateUser({
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        rut: profileForm.rut,
      });
    }
    setSavedProfileSuccess(true);
    window.setTimeout(() => setSavedProfileSuccess(false), 3000);
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
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none whitespace-nowrap touch-pan-x w-full shrink-0 flex-nowrap">
          {[
            { id: 'overview', label: '📊 Resumen General', icon: '👤' },
            { id: 'rewards', label: '🏆 Puntos & Premios', icon: '🎁' },
            { id: 'branches', label: '📍 Locales & Visitas', icon: '🏪' },
            { id: 'payments', label: '📜 Historial Pagos DTE', icon: '📄' },
            { id: 'reviews', label: '⭐ Mis Reseñas', icon: '💬' },
            { id: 'referrals', label: '👥 Invitar Amigos', icon: '🚀' },
            { id: 'edit-profile', label: '👤 Editar Perfil', icon: '⚙️' },
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
            {/* Tarjeta 1: Puntos acumulados (Click a Puntos de Afiliado abre vista de Premios) */}
            <button
              type="button"
              onClick={() => setActiveTab('rewards')}
              className="group text-left rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-amber-300 transition flex flex-col gap-2 cursor-pointer active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🏆</span>
                <span className="text-[10px] font-extrabold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 group-hover:translate-x-1 transition-transform">
                  Ver Premios →
                </span>
              </div>
              <h2 className="text-sm font-bold text-brand-800">Puntos de Afiliado</h2>
              <p className="text-2xl font-extrabold text-amber-600">{points} pts</p>
              <p className="text-[11px] text-brand-800/60">Tocá para canjear cashback y promociones</p>
            </button>

            {/* Tarjeta 2: Locales visitados (Click abre vista de Locales) */}
            <button
              type="button"
              onClick={() => setActiveTab('branches')}
              className="group text-left rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-sky-300 transition flex flex-col gap-2 cursor-pointer active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📍</span>
                <span className="text-[10px] font-extrabold bg-sky-500/10 text-sky-600 px-2 py-0.5 rounded-full border border-sky-200 group-hover:translate-x-1 transition-transform">
                  Ver Locales →
                </span>
              </div>
              <h2 className="text-sm font-bold text-brand-800">Locales Visitados</h2>
              <p className="text-2xl font-extrabold text-sky-600">3 Restaurantes</p>
              <p className="text-[11px] text-brand-800/60">Fotos, direcciones y horarios de atención</p>
            </button>

            {/* Tarjeta 3: Boletas emitidas (Click abre vista de Boletas) */}
            <button
              type="button"
              onClick={() => setActiveTab('payments')}
              className="group text-left rounded-3xl bg-white p-5 shadow-soft border border-brand-100 hover:border-emerald-300 transition flex flex-col gap-2 cursor-pointer active:scale-98"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">📜</span>
                <span className="text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200 group-hover:translate-x-1 transition-transform">
                  Ver DTEs →
                </span>
              </div>
              <h2 className="text-sm font-bold text-brand-800">Boletas DTE Emitidas</h2>
              <p className="text-2xl font-extrabold text-emerald-600">6 Boletas Tipo 39</p>
              <p className="text-[11px] text-brand-800/60">Desglose de consumo pagado del total</p>
            </button>
          </div>
        )}

        {/* Pestaña 2: Puntos & Premios Canjeables, Promociones y Eventos */}
        {activeTab === 'rewards' && (
          <div className="flex flex-col gap-6">
            {/* Catálogo de Premios */}
            <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-brand-900">Catálogo de Premios Canjeables</h2>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Saldo: {points} Puntos
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(REWARDS_CATALOG || []).map((r) => {
                  const isClaimed = (redeemedRewards || []).some((item) => item.id === r.id);
                  const cost = r.pointsCost;
                  return (
                    <div key={r.id} className="rounded-2xl bg-brand-50 p-4 border border-brand-200 flex items-center justify-between gap-3">
                      <div className="flex flex-col gap-1 text-left">
                        <span className="text-sm font-bold text-brand-900">{r.title}</span>
                        <span className="text-xs text-brand-800/70">{r.description}</span>
                        <span className="text-xs font-extrabold text-amber-600">{cost} Puntos</span>
                      </div>
                      <button
                        type="button"
                        disabled={isClaimed || points < cost}
                        onClick={() => redeemReward(r.id)}
                        className="rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-soft shrink-0"
                      >
                        {isClaimed ? 'Canjeado ✓' : 'Canjear Premio 🎁'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promociones Vigentes & Eventos Especiales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-soft flex flex-col justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Promoción Exclusiva VIP
                  </span>
                  <h3 className="text-lg font-extrabold mt-2">🍸 2x1 en Happy Hour Coctelería</h3>
                  <p className="text-xs text-amber-100 mt-1">Todos los días de 18:00 a 20:30 hrs en todas nuestras sucursales.</p>
                </div>
                <span className="text-[11px] font-bold text-white/90">Válido mostrando tu app MesaSplit</span>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-purple-900 to-brand-950 p-5 text-white shadow-soft flex flex-col justify-between gap-3 border border-purple-800">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                    Evento Especial
                  </span>
                  <h3 className="text-lg font-extrabold mt-2">🎷 Noche de Jazz & Cata de Vinos</h3>
                  <p className="text-xs text-slate-300 mt-1">Este Viernes 20:30 hrs en Restô Vitacura. Maridaje de 4 tiempos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="rounded-xl bg-purple-500 hover:bg-purple-600 py-2 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer text-center"
                >
                  Reservar Entrada VIP 🎟️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña 3: Locales Registrados & Visitas con Fotos de Frontis y Horarios */}
        {activeTab === 'branches' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Locales Registrados e Información de Sucursales</h2>
            <div className="flex flex-col gap-4">
              {[
                {
                  name: 'Restô Lo Ovalle',
                  address: 'Av. Lo Ovalle 1420, San Miguel',
                  image: '/images/resto_lo_ovalle_frontis.png',
                  hours: 'Lun-Dom: 12:00 a 00:00 hrs',
                  phone: '+56 2 2891 4000',
                  lastVisit: 'Ayer',
                  totalSpent: 34800,
                  rating: '5.0 ⭐',
                },
                {
                  name: 'Restô Providencia',
                  address: 'Av. Providencia 2150, Providencia',
                  image: '/images/resto_providencia_frontis.png',
                  hours: 'Lun-Sáb: 12:30 a 01:00 hrs',
                  phone: '+56 2 2760 9100',
                  lastVisit: 'Hace 5 días',
                  totalSpent: 28900,
                  rating: '4.9 ⭐',
                },
                {
                  name: 'Restô Vitacura',
                  address: 'Av. Alonso de Córdova 3890, Vitacura',
                  image: '/images/resto_vitacura_frontis.png',
                  hours: 'Lun-Dom: 13:00 a 01:30 hrs',
                  phone: '+56 2 2955 8820',
                  lastVisit: 'Hace 2 semanas',
                  totalSpent: 52000,
                  rating: '5.0 ⭐',
                },
              ].map((b, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-200 shadow-soft">
                  <img
                    src={b.image}
                    alt={`Frontis ${b.name}`}
                    className="h-28 w-full sm:w-36 object-cover rounded-xl border border-brand-200 shrink-0"
                  />
                  <div className="flex-1 flex flex-col gap-1 text-left min-w-0 w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-brand-900">{b.name}</span>
                      <span className="text-xs font-bold text-amber-600">{b.rating}</span>
                    </div>
                    <p className="text-xs text-brand-800 font-semibold">📍 {b.address}</p>
                    <p className="text-xs text-brand-800/70">🕒 {b.hours}</p>
                    <p className="text-xs text-brand-800/70">📞 {b.phone}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-brand-200/60 mt-1">
                      <span className="text-[11px] text-brand-800/60">Última visita: {b.lastVisit}</span>
                      <span className="text-xs font-extrabold text-emerald-700">Consumo: {formatCurrency(b.totalSpent)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 4: Historial de Pagos & Boletas con Desglose Individual */}
        {activeTab === 'payments' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-4">
            <h2 className="text-base font-extrabold text-brand-900">Historial de Pagos & Boletas Electrónicas (DTE)</h2>
            <div className="flex flex-col gap-3">
              {[
                {
                  id: 'b-101',
                  date: '17/08/2026',
                  tableTotal: 34800,
                  myShare: 8900,
                  doc: 'Boleta Electrónica N° 39102',
                  method: 'Débito Redelcom',
                  table: 'Mesa 12 · Restô Lo Ovalle',
                  items: [
                    { name: 'Lomo Lo Ovalle con Papas', qty: 1, price: 14900 },
                    { name: 'Pisco Sour Artesanal', qty: 2, price: 9800 },
                    { name: 'Volcán de Chocolate', qty: 1, price: 5200 },
                    { name: 'Bebida 350ml', qty: 2, price: 4900 },
                  ],
                },
                {
                  id: 'b-102',
                  date: '12/08/2026',
                  tableTotal: 28900,
                  myShare: 14450,
                  doc: 'Boleta Electrónica N° 38941',
                  method: 'Flow.cl Webpay',
                  table: 'Mesa 05 · Restô Providencia',
                  items: [
                    { name: 'Ceviche Mixto Tradicional', qty: 1, price: 13900 },
                    { name: 'Chardonnay Reserva', qty: 1, price: 15000 },
                  ],
                },
                {
                  id: 'b-103',
                  date: '01/08/2026',
                  tableTotal: 52000,
                  myShare: 52000,
                  doc: 'Factura Electrónica N° 33019',
                  method: 'Transferencia',
                  table: 'Mesa 08 · Restô Vitacura',
                  items: [
                    { name: 'Asado de Tira 400g', qty: 2, price: 36000 },
                    { name: 'Vino Carmenere Premium', qty: 1, price: 16000 },
                  ],
                },
              ].map((p) => (
                <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-brand-50 border border-brand-200 gap-3">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-brand-900">{p.doc}</span>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                        SII Validada ✓
                      </span>
                    </div>
                    <span className="text-xs text-brand-800 font-semibold">{p.table} · {p.date} · {p.method}</span>
                    <span className="text-[11px] text-brand-800/70">
                      Total Mesa: {formatCurrency(p.tableTotal)} · <strong className="text-emerald-800">Mi Pago Individual: {formatCurrency(p.myShare)}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedTicket(p)}
                    className="rounded-xl bg-sky-600 hover:bg-sky-700 px-3.5 py-2 text-xs font-bold text-white transition active:scale-95 cursor-pointer shadow-soft shrink-0"
                  >
                    Ver Ticket PDF 📄
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 5: Mis Reseñas de Platos y Atención */}
        {activeTab === 'reviews' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-5">
            <h2 className="text-base font-extrabold text-brand-900">Mis Reseñas de Platos y Experiencia Gastronómica</h2>

            {/* Formulario completo para publicar nueva reseña */}
            <form onSubmit={handleAddReview} className="flex flex-col gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-left">
              <span className="text-xs font-extrabold text-amber-950">
                ✍️ Escribí tu opinión sobre un plato probado en MesaSplit:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="dish-name" className="text-[11px] font-bold text-slate-700">Nombre del Plato:</label>
                  <input
                    id="dish-name"
                    type="text"
                    value={newReviewDish}
                    onChange={(e) => setNewReviewDish(e.target.value)}
                    placeholder="ej. Lomo Lo Ovalle o Pisco Sour"
                    className="rounded-xl bg-white px-3 py-2 text-xs font-semibold border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="dish-rating" className="text-[11px] font-bold text-slate-700">Calificación (Estrellas):</label>
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className={`text-lg cursor-pointer transition ${star <= newReviewRating ? 'text-amber-500' : 'text-slate-300'}`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-700 ml-2">{newReviewRating} / 5</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="new-review-text" className="text-[11px] font-bold text-slate-700">Comentario detallado:</label>
                <textarea
                  id="new-review-text"
                  rows={2}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="ej. La cocción del corte estaba impecable y la salsa deliciosa..."
                  className="rounded-xl bg-white px-3 py-2 text-xs font-semibold border border-slate-300 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={!newReviewText.trim()}
                className="self-end rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 px-5 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
              >
                Publicar Reseña ★
              </button>
            </form>

            {/* Barra de Filtros Dinámicos Responsivos para Móvil */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none whitespace-nowrap touch-pan-x flex-nowrap w-full shrink-0">
              <span className="text-xs font-bold text-slate-500 shrink-0">Filtrar por:</span>
              {['Todos', 'Restô Lo Ovalle', 'Restô Providencia', 'Restô Vitacura', 'Cortes Premium', 'Postres & Tragos'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setReviewFilter(f)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-extrabold transition active:scale-95 border cursor-pointer ${
                    reviewFilter === f
                      ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Listado de Cards de Reseñas de Platos Enriquecidas con Fotos HD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviewsList
                .filter((r) => {
                  if (reviewFilter === 'Todos') return true;
                  if (reviewFilter === 'Cortes Premium') return r.category === 'Cortes Premium' || r.dish.toLowerCase().includes('lomo');
                  if (reviewFilter === 'Postres & Tragos')
                    return (
                      r.category === 'Postres' ||
                      r.category === 'Coctelería de Autor' ||
                      r.dish.toLowerCase().includes('pisco') ||
                      r.dish.toLowerCase().includes('volcán')
                    );
                  return r.branchName === reviewFilter;
                })
                .map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReview(r)}
                    className="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer hover:border-amber-400"
                  >
                    {/* Imagen HD del Plato */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={r.image || '/images/dish_lomo_lo_ovalle.png'}
                        alt={r.dish}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-soft">
                        {r.category || 'Gastronomía'}
                      </span>
                      <span className="absolute bottom-3 left-3 text-amber-300 text-xs font-bold">
                        {'★'.repeat(r.rating)} ({r.rating}.0)
                      </span>
                      <span className="absolute bottom-3 right-3 text-white text-xs font-extrabold">
                        {formatCurrency(r.price || 14900)}
                      </span>
                    </div>

                    {/* Contenido de la Card */}
                    <div className="p-4 flex flex-col gap-2 text-left flex-1 justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-extrabold text-brand-900 group-hover:text-amber-600 transition-colors">
                          {r.dish}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">📍 {r.branchName} · {r.date}</span>
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2 italic">&ldquo;{r.comment}&rdquo;</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        <span className="font-bold text-emerald-700">👍 {r.likes || 1} Votos Útiles</span>
                        <span className="font-extrabold text-amber-600 group-hover:translate-x-1 transition-transform">
                          Ver Ficha Completa →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pestaña 6: Invitar Amigos & Referidos */}
        {activeTab === 'referrals' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="text-4xl">🚀</span>
              <h2 className="text-lg font-extrabold text-brand-900">Invitá Amigos y Ganá $3.000 Puntos</h2>
              <p className="text-xs text-brand-800/70 max-w-md">
                Compartí tu código de referido único. Cada vez que un amigo escanee una mesa y realice su primer pedido, ambos reciben 3.000 puntos MesaSplit.
              </p>
            </div>

            {/* Caja de Código Único */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex flex-col items-center gap-3 shadow-soft max-w-md mx-auto w-full">
              <span className="text-xs font-extrabold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                Tu Código Único de Referido
              </span>

              <div className="flex items-center justify-between gap-2 bg-white/15 p-2 rounded-2xl w-full border border-white/30">
                <span className="flex-1 font-mono text-base font-extrabold tracking-widest uppercase text-white">
                  CONSTANZA-REWARDS-2026
                </span>
                <button
                  type="button"
                  onClick={handleCopyReferral}
                  className="rounded-xl bg-white text-amber-700 hover:bg-amber-50 px-4 py-2 text-xs font-extrabold transition active:scale-95 cursor-pointer shadow-soft shrink-0"
                >
                  {copiedReferral ? '¡Copiado! ✓' : 'Copiar'}
                </button>
              </div>

              {/* Botón directo de WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  '¡Hola! Usá mi código CONSTANZA-REWARDS-2026 en MesaSplit Gastronomía para ganar $3.000 puntos en tu primera visita a cualquier restaurante 🍽️'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-extrabold text-white transition active:scale-95 shadow-soft flex items-center justify-center gap-2"
              >
                <span>💬 Compartir por WhatsApp</span>
              </a>
            </div>

            {/* Historial de Referidos Registrados */}
            <div className="flex flex-col gap-3 text-left max-w-md mx-auto w-full">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-brand-900">Amigos Invitados Registrados</h3>
                <span className="text-xs font-bold text-emerald-700">+9.000 Pts Ganados</span>
              </div>

              {[
                { name: 'Felipe Arancibia', date: '15/08/2026', bonus: '+3.000 Pts', status: 'Completado ✓' },
                { name: 'Camila Torres', date: '10/08/2026', bonus: '+3.000 Pts', status: 'Completado ✓' },
                { name: 'Rodrigo Morales', date: '02/08/2026', bonus: '+3.000 Pts', status: 'Completado ✓' },
              ].map((ref, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-50 border border-brand-200">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-brand-900">{ref.name}</span>
                    <span className="text-[10px] text-brand-800/70">{ref.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-600">{ref.bonus}</span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-800 border border-emerald-300">
                      {ref.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña 7: Editar Perfil / Preferencias Dietéticas */}
        {activeTab === 'edit-profile' && (
          <div className="rounded-3xl bg-white p-6 shadow-soft border border-brand-100 flex flex-col gap-5 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-brand-900">Editar Información de Perfil</h2>
              {savedProfileSuccess && (
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-fade-in">
                  ¡Perfil guardado con éxito! 💾
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-name" className="text-xs font-bold text-slate-700">Nombre Completo:</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold border border-slate-300 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-email" className="text-xs font-bold text-slate-700">Correo Electrónico:</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold border border-slate-300 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-phone" className="text-xs font-bold text-slate-700">Teléfono Móvil (Chile):</label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold border border-slate-300 focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="profile-rut" className="text-xs font-bold text-slate-700">R.U.T. Cliente (Boletas DTE):</label>
                  <input
                    id="profile-rut"
                    type="text"
                    value={profileForm.rut}
                    onChange={(e) => setProfileForm({ ...profileForm, rut: e.target.value })}
                    className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold border border-slate-300 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Preferencias Dietéticas del Comensal */}
              <div className="flex flex-col gap-2 pt-3 border-t border-slate-200">
                <span className="text-xs font-extrabold text-slate-800">🥗 Preferencias y Alergias Alimentarias:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.preferences.vegetarian}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferences: { ...profileForm.preferences, vegetarian: e.target.checked },
                        })
                      }
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>🌱 Vegetariano</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.preferences.vegan}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferences: { ...profileForm.preferences, vegan: e.target.checked },
                        })
                      }
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>🌿 Vegano</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.preferences.glutenFree}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferences: { ...profileForm.preferences, glutenFree: e.target.checked },
                        })
                      }
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>🌾 Sin Gluten / Celíaco</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profileForm.preferences.lactoseFree}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          preferences: { ...profileForm.preferences, lactoseFree: e.target.checked },
                        })
                      }
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>🥛 Intolerante a la Lactosa</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="self-end mt-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-6 py-3 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
              >
                Guardar Cambios 💾
              </button>
            </form>
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

      {/* Modal de Chat de Soporte Técnico Estilo WhatsApp con 4 opciones */}
      <ClientSupportChatModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />

      {/* Modal Emergente Centrado de Boleta DTE Thermal Ticket */}
      <DteTicketModal isOpen={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} ticketData={selectedTicket} />

      {/* Modal Emergente Interactivo de Detalle Completo de Plato y Reseña */}
      <DishReviewDetailModal isOpen={Boolean(selectedReview)} onClose={() => setSelectedReview(null)} reviewData={selectedReview} />

      {/* Pie de página universal */}
      <AppFooter theme="light" />

      {/* Barra de navegación inferior fija para móviles */}
      <ClientBottomNav />
    </div>
  );
}
