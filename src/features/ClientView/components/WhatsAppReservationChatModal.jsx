// src/features/ClientView/components/WhatsAppReservationChatModal.jsx — modal de chat interactivo estilo WhatsApp para reservas por sucursal (fase18-asistente-chat-reservas-locales)
// Permite al cliente conversar en tiempo real con el Asistente Gastronómico IA y seleccionar sucursales con foto del frontis, tiempo de espera y mesas libres.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState, useEffect, useRef } from 'react';

// Datos de las 3 sucursales gastronómicas con foto de frontis, dirección, espera y disponibilidad.
export const BRANCHES_DATA = [
  {
    id: 'lo-ovalle',
    name: 'Restô Lo Ovalle',
    address: 'Av. Lo Ovalle 1420, San Miguel',
    image: '/images/resto_lo_ovalle_frontis.png',
    waitTime: '10 min de espera',
    freeTables: '4 mesas disponibles',
    rating: '4.9 ★ (340 reseñas)',
    status: 'Abierto en Vivo',
  },
  {
    id: 'providencia',
    name: 'Restô Providencia',
    address: 'Av. Providencia 2150, Providencia',
    image: '/images/resto_providencia_frontis.png',
    waitTime: '15 min de espera',
    freeTables: '6 mesas disponibles',
    rating: '4.8 ★ (510 reseñas)',
    status: 'Abierto en Vivo',
  },
  {
    id: 'vitacura',
    name: 'Restô Vitacura',
    address: 'Av. Alonso de Córdova 3890, Vitacura',
    image: '/images/resto_vitacura_frontis.png',
    waitTime: 'Sin espera',
    freeTables: '8 mesas disponibles',
    rating: '5.0 ★ (620 reseñas)',
    status: 'Abierto VIP',
  },
];

// Componente principal del modal de chat de reservas estilo WhatsApp.
export default function WhatsAppReservationChatModal({ isOpen, onClose }) {
  // Historial de mensajes en el chat.
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '¡Hola! 🤖 Soy el Asistente Virtual MesaSplit. ¿En qué sucursal te gustaría reservar tu mesa hoy?',
      time: 'Ahora',
    },
  ]);
  // Mensaje en el campo de texto de entrada.
  const [inputMsg, setInputMsg] = useState('');
  // Estado de confirmación de reserva.
  const [reservationConfirmed, setReservationConfirmed] = useState(false);
  // Referencia para scroll automático en el chat.
  const chatEndRef = useRef(null);

  // Scroll automático al último mensaje (con salvaguarda para JSDOM en entorno de tests).
  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Escucha tecla Escape.
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Envío manual de un mensaje en el chat.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    // Agrega el mensaje del usuario.
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText, time: 'Ahora' },
    ]);

    // Respuesta automática simulada del asistente.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: '¡Entendido! Seleccioná a continuación una de nuestras sucursales para asegurar tu mesa al instante 👇',
          time: 'Ahora',
        },
      ]);
    }, 600);
  };

  // Selección de una sucursal para procesar la reserva.
  const handleSelectBranch = (branch) => {
    setReservationConfirmed(true);

    // Registra en el chat la selección.
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'user',
        text: `Quiero reservar en ${branch.name} (${branch.address})`,
        time: 'Ahora',
      },
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: `¡Reserva Confirmada con Éxito! 🎉\n📍 ${branch.name}\n🏠 ${branch.address}\n⏱️ ${branch.waitTime}\n🎫 Ticket N° #RES-${Math.floor(1000 + Math.random() * 9000)}\n¡Te esperamos! Te enviaremos un SMS de recordatorio 📱`,
        time: 'Ahora',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/70 backdrop-blur-sm animate-fade-in">
      {/* Ventana Principal del Chat WhatsApp */}
      <div className="w-full max-w-lg rounded-3xl bg-slate-100 shadow-2xl overflow-hidden flex flex-col h-[600px] border border-slate-300">
        {/* Cabecera estilo WhatsApp (Verde Emerald) */}
        <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-xl border border-emerald-500 shadow-inner">
                🤖
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-700" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold tracking-tight">Asistente MesaSplit 💬</span>
              <span className="text-[11px] text-emerald-200 font-semibold">En línea · Reservas en tiempo real</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-800/80 hover:bg-emerald-900 p-2 text-xs font-bold text-white transition cursor-pointer"
            aria-label="Cerrar ventana de reservas"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo de conversación estilo WhatsApp con Wallpaper */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Renderizado de Mensajes */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div
                className={`rounded-2xl p-3 text-xs leading-relaxed shadow-soft whitespace-pre-line ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-800 font-bold mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {/* Selector Interactivo de Locales con Foto del Frontis */}
          {!reservationConfirmed && (
            <div className="flex flex-col gap-3 mt-2">
              <span className="text-xs font-extrabold text-slate-700 bg-white/90 px-3 py-1.5 rounded-full self-center shadow-soft border border-slate-200">
                🏢 Seleccioná un Local para Tu Reserva:
              </span>

              {BRANCHES_DATA.map((branch) => (
                <div
                  key={branch.id}
                  className="rounded-2xl bg-white p-3 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center gap-3 transition hover:border-emerald-500"
                >
                  {/* Foto del Frontis del Restaurant */}
                  <img
                    src={branch.image}
                    alt={`Frontis ${branch.name}`}
                    className="h-24 w-full sm:w-28 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  {/* Información Detallada del Local */}
                  <div className="flex-1 flex flex-col gap-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{branch.name}</h4>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                        {branch.status}
                      </span>
                    </div>

                    {/* Dirección del local en texto pequeño */}
                    <p className="text-[11px] text-slate-500 font-bold truncate">📍 {branch.address}</p>

                    {/* Tiempo de espera y mesas disponibles */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ⏱️ {branch.waitTime}
                      </span>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                        🪑 {branch.freeTables}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        {branch.rating}
                      </span>
                    </div>

                    {/* Botón interactivo de Reserva */}
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch)}
                      className="mt-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-1.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft text-center"
                    >
                      Reservar en {branch.name} 🥂
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input para Escribir Mensajes estilo WhatsApp */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Escribí un mensaje al asistente..."
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 p-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer shrink-0"
          >
            Enviá 🟢
          </button>
        </form>
      </div>
    </div>
  );
}
