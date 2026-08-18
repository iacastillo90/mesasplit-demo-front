// src/features/ClientView/components/ClientSupportChatModal.jsx — chat de soporte en vivo estilo WhatsApp con 4 opciones predefinidas y preguntas abiertas (fase19-perfil-interactivo-y-chat-soporte-whatsapp)
// Permite al comensal obtener ayuda instantánea sobre división de cuenta, boletas DTE y puntos rewards.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState, useEffect, useRef } from 'react';

// Las 4 opciones predefinidas de consulta para el cliente.
export const PREDEFINED_SUPPORT_OPTIONS = [
  {
    id: 'split',
    label: '💳 ¿Cómo divido la cuenta en la mesa?',
    answer: '¡Es súper fácil! 🍽️ Abrí el botón "Comanda & Carrito", tocá "Dividir Cuenta" y elegí si querés pagar por partes iguales, por consumo individual o pagar por platos específicos.',
  },
  {
    id: 'dte',
    label: '📜 ¿Dónde descargo mi Boleta Electrónica SII?',
    answer: 'En tu "Perfil VIP Gold" > pestaña "Boletas DTE" podés revisar todos tus consumos anteriores y descargar el ticket de Boleta Electrónica Tipo 39 emitido formalmente al SII.',
  },
  {
    id: 'rewards',
    label: '🏆 ¿Cómo canjeo mis Puntos MesaSplit Rewards?',
    answer: 'Cada consumo suma puntos (1 CLP = 1 Punto) ✨. Ingresá a tu "Perfil VIP" > "Puntos & Premios" para canjear tus puntos acumulados por cashback, postres o descuentos directos.',
  },
  {
    id: 'human',
    label: '🙋 Hablar directamente con un ejecutivo humano',
    answer: '¡Te estamos conectando con nuestro equipo de atención en Santiago! 🇨🇱 Un soporte técnico se comunicará contigo en menos de 2 minutos.',
  },
];

// Componente del Modal de Chat de Soporte Técnico Estilo WhatsApp.
export default function ClientSupportChatModal({ isOpen, onClose }) {
  // Historial de mensajes de la conversación.
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'agent',
      text: '¡Hola! 👋 Soy el Asistente de Soporte Técnico MesaSplit Chile. ¿Con qué podemos ayudarte hoy?',
      time: 'Ahora',
    },
  ]);
  // Campo de texto de mensaje libre.
  const [inputMsg, setInputMsg] = useState('');
  // Referencia al final del chat para autoscroll.
  const chatEndRef = useRef(null);

  // Scroll automático al último mensaje con salvaguarda JSDOM.
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

  // Maneja el clic en una de las 4 opciones predefinidas.
  const handleSelectOption = (opt) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: opt.label, time: 'Ahora' },
      { id: Date.now() + 1, sender: 'agent', text: opt.answer, time: 'Ahora' },
    ]);
  };

  // Maneja el envío de una pregunta propia en el chat.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userText = inputMsg.trim();
    setInputMsg('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText, time: 'Ahora' },
    ]);

    // Respuesta simulada del asistente.
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'agent',
          text: `Gracias por tu consulta: "${userText}". Un ejecutivo de soporte MesaSplit ha recibido tu mensaje y te responderá a la brevedad 🟢.`,
          time: 'Ahora',
        },
      ]);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/70 backdrop-blur-sm animate-fade-in">
      {/* Ventana de Chat de Soporte WhatsApp */}
      <div className="w-full max-w-lg rounded-3xl bg-slate-100 shadow-2xl overflow-hidden flex flex-col h-[580px] border border-slate-300">
        {/* Cabecera Verde Esmeralda WhatsApp */}
        <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-xl border border-emerald-500 shadow-inner">
                🎧
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-700" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-extrabold tracking-tight">Soporte MesaSplit 💬</span>
              <span className="text-[11px] text-emerald-200 font-semibold">Atención 24/7 · Chile</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-800/80 hover:bg-emerald-900 p-2 text-xs font-bold text-white transition cursor-pointer"
            aria-label="Cerrar chat de soporte"
          >
            ✕
          </button>
        </div>

        {/* Mensajes del Chat */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
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

          {/* Opciones Predefinidas de Consulta */}
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-[11px] font-extrabold text-slate-600 bg-white/80 px-3 py-1 rounded-full self-center border border-slate-200 shadow-soft">
              Seleccioná una pregunta frecuente o escribí la tuya:
            </span>

            {PREDEFINED_SUPPORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                className="w-full text-left rounded-2xl bg-white p-3 text-xs font-extrabold text-slate-800 border border-slate-200 shadow-soft hover:bg-emerald-50 hover:border-emerald-400 transition cursor-pointer active:scale-98"
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div ref={chatEndRef} />
        </div>

        {/* Input para Escribir Pregunta Propia */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Escribí tu duda o consulta..."
            className="flex-1 rounded-2xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-900 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 p-2.5 text-xs font-bold text-white transition active:scale-95 cursor-pointer shrink-0"
          >
            Enviar 💬
          </button>
        </form>
      </div>
    </div>
  );
}
