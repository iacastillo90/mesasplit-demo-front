// src/shared/i18n/useI18nStore.js — Store Zustand de internacionalización (i18n) multi-idioma
// Administra diccionarios de traducción para Español, Inglés y Portugués, permitiendo el cambio reactivo en tiempo real.
// Cumple estrictamente con las reglas obligatorias de AGENTS.md (comentarios en español por cada línea de código).

// Zustand create para instanciar el store global de traducción.
import { create } from 'zustand';

// Diccionario multilingüe para las 3 lenguas soportadas por la demo.
export const TRANSLATIONS = {
  es: {
    hubTitle: 'Hub Principal',
    clientView: 'Mesa Virtual',
    openAccount: 'Cuenta abierta',
    guests: 'comensales',
    seeCart: 'Ver carrito',
    add: 'Agregar',
    rate: '★ Evaluar',
    reservations: '📅 Reservas',
    rateService: '★ Calificar Servicio',
    invoice: '📄 Solicitar Factura',
    sos: '🆘 S.O.S.',
  },
  en: {
    hubTitle: 'Main Hub',
    clientView: 'Virtual Table',
    openAccount: 'Open Tab',
    guests: 'guests',
    seeCart: 'View Cart',
    add: 'Add',
    rate: '★ Rate',
    reservations: '📅 Book Table',
    rateService: '★ Rate Service',
    invoice: '📄 Request Invoice',
    sos: '🆘 S.O.S.',
  },
  pt: {
    hubTitle: 'Hub Principal',
    clientView: 'Mesa Virtual',
    openAccount: 'Conta aberta',
    guests: 'clientes',
    seeCart: 'Ver carrinho',
    add: 'Adicionar',
    rate: '★ Avaliar',
    reservations: '📅 Reservar',
    rateService: '★ Avaliar Serviço',
    invoice: '📄 Pedir Fatura',
    sos: '🆘 S.O.S.',
  },
};

// Store Zustand `useI18nStore`.
export const useI18nStore = create((set, get) => ({
  // Idioma activo ('es' | 'en' | 'pt').
  lang: 'es',

  // Cambia el idioma activo.
  setLanguage: (newLang) => {
    if (TRANSLATIONS[newLang]) {
      set({ lang: newLang });
    }
  },

  // Helper para resolver una clave traducida.
  t: (key) => {
    const currentLang = get().lang;
    return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['es']?.[key] || key;
  },
}));
