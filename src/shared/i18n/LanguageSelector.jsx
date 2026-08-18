// src/shared/i18n/LanguageSelector.jsx — Componente selector dinámico de idioma (i18n)
// Permite alternar la interfaz en tiempo real entre Español (🇨🇱), Inglés (🇺🇸) y Portugués (🇧🇷).
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Store i18n.
import { useI18nStore } from './useI18nStore.js';

// Lista de idiomas soportados con sus banderas de países.
const LANGUAGES = [
  { code: 'es', flag: '🇨🇱', label: 'ES' },
  { code: 'en', flag: '🇺🇸', label: 'EN' },
  { code: 'pt', flag: '🇧🇷', label: 'PT' },
];

// Componente LanguageSelector.
export default function LanguageSelector({ theme = 'light' }) {
  // Suscripción al idioma activo y función de cambio.
  const { lang, setLanguage } = useI18nStore();
  const isDark = theme === 'dark';

  return (
    // Fila de selección de banderas.
    <div
      className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
        isDark ? 'bg-brand-900 border-brand-800' : 'bg-brand-50 border-brand-200'
      }`}
    >
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          onClick={() => setLanguage(item.code)}
          title={`Cambiar idioma a ${item.label}`}
          className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold transition active:scale-95 cursor-pointer ${
            lang === item.code
              ? 'bg-brand-500 text-white shadow-soft font-extrabold'
              : isDark
              ? 'text-brand-100 hover:bg-brand-800'
              : 'text-brand-800 hover:bg-brand-100/80'
          }`}
        >
          <span>{item.flag}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
