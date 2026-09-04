# Sistema de Diseño y Lineamientos de UI/UX

**Contexto:** Este documento establece las reglas visuales y de interacción estrictas para el frontend. El objetivo es evitar el aspecto de "plantilla genérica generada por IA" y asegurar una percepción de producto B2B Premium (Food-Tech SaaS). Cualquier agente de IA que genere componentes debe respetar estos lineamientos.

## 1. Configuración Estricta de Tailwind CSS

El archivo `tailwind.config.js` debe contener exactamente esta configuración. No se deben utilizar valores hexadecimales sueltos en el código; todo debe referenciar a esta paleta.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  // Asegura que Tailwind escanee todos tus archivos de React buscando clases
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🔹 PALETA BASE: Escala Azul "Food-Tech SaaS"
        brand: {
          50: '#E6F6FF',  // Fondo general modo claro / texto principal sobre oscuro
          100: '#CDECFE', // Fondos secundarios / estados hover en modo claro
          500: '#04A0FB', // CTA principal: botones de acción crítica en TODAS las vistas
          800: '#024064', // Tarjetas y contenedores en modo oscuro (Comandas, Mesas)
          900: '#012032', // Texto principal sobre fondos claros / superficies secundarias oscuras
          950: '#011623', // Fondo modo oscuro estricto (Cocina, Local Admin, Mozo)
        },
        
        // 🚦 COLORES SEMÁNTICOS: Reglas de negocio
        semantic: {
          success: '#10B981', // Verde: Éxito, pago exitoso, plato listo, mesa libre
          warning: '#F59E0B', // Ámbar: Stock crítico, mesa esperando, folios < 50
          urgent: '#FB923C',  // Naranja: Urgencia operativa (Mesa atrasada, cuenta pedida hace rato)
          danger: '#EF4444',  // ROJO PURO: 🚨 RESERVADO SOLO PARA ALERGIAS, EMERGENCIAS Y FOLIOS < 10
        }
      },
      fontFamily: {
        // Tipografías con personalidad (ver sección 2)
        display: ['Clash Display', 'sans-serif'], 
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(1, 32, 50, 0.08)', // Tarjetas en Vista Cliente/POS
        'dark-glow': '0 0 15px rgba(4, 160, 251, 0.15)', // Resplandor botones activos KDS/Mozo
        'danger-glow': '0 0 15px rgba(239, 68, 68, 0.4)', // Resplandor rojo para Escudo Alergias
      }
    },
  },
  plugins: [],
}

2. Tipografía Diferencial (El fin del aspecto genérico)
Prohibido depender exclusivamente de la fuente del sistema (System UI) o Roboto. El producto usará una dupla tipográfica moderna:

Títulos y Números Gigantes (KDS/POS): Clash Display o Outfit.

Uso: Números de mesa, Totales a pagar, Títulos de sección. Tienen cortes modernos que gritan "tecnología de punta".

Cuerpo y Datos Densos: Plus Jakarta Sans o Satoshi.

Uso: Nombres de platos, descripciones, botones, reportes de Local Admin. Son geométricas, hiper-legibles en pantallas pequeñas y lucen nativas como en iOS/Android.

3. Framework de Iconografía (Prohibido FontAwesome)
Para evitar el aspecto anticuado o inconsistente, TODO EL PROYECTO usará Lucide React o Phosphor Icons.

Regla: Los iconos deben tener un grosor de línea constante (strokeWidth={2} en Lucide).

Implementación IA: Si el agente genera un componente, debe importar iconos de la librería lucide-react.

4. Estructura de Componentes UI (Reglas Físicas)
A. Botones Móviles (Mozo / Cliente)
Thumb-Zone Obligatoria: Todo botón de acción (CTA) en dispositivos móviles debe tener un tamaño mínimo de h-14 (56px) para ser tocado fácilmente con un pulgar en movimiento.

Feedback Táctil: No basta con cambiar el color en :hover. Todo botón debe usar :active:scale-95 transition-transform para simular que se "hunde" físicamente al tocarlo.

B. Tarjetas (Cards)
Modo Claro (Cliente, POS): Usar fondos blancos (bg-white), bordes ultra sutiles (border border-brand-100) y sombras suaves (shadow-soft). Esquinas redondeadas orgánicas (rounded-2xl).

Modo Oscuro (KDS, Local Admin, Mozo): Prohibido usar sombras pesadas (se ven sucias en modo oscuro). Separar elementos mediante bordes tenues (border border-brand-800/50) y fondos de la paleta (bg-brand-800).

C. Chips y Modificadores
Para los modificadores de platos (ej. "Sin Cebolla", "Término Medio"), no usar listas planas. Usar estructuras tipo "Píldora" (Chips): rounded-full px-3 py-1 text-sm bg-brand-900 text-brand-50.

5. Micro-interacciones y Framework de Animaciones
El sistema no debe ser rígido. Los cambios de estado deben sentirse orgánicos, justificando la calidad premium del software.

Framer Motion (Transiciones de Estado de React):

Uso obligatorio en: Modales (Bottom Sheets), notificaciones Toast del radar, y el reordenamiento automático de las tarjetas del KDS cuando cambian de estado (Layout Animations).

Regla IA: Si un elemento aparece o desaparece del DOM, debe estar envuelto en un <AnimatePresence> y un <motion.div>.

GSAP + ScrollTrigger (Landing y Catálogo Cliente):

Para la vista del comensal (Catálogo), las categorías que se fijan arriba (sticky header) y la aparición secuencial de los platos al hacer scroll se gestionarán con GSAP, aportando una fluidez cinematográfica a la navegación, similar a landings de alto perfil.

Skeleton Loaders (Prohibido Spinners Genéricos):

Mientras la capa de services/ espera la respuesta del JSON simulado, no mostrar el típico círculo girando. Usar Skeletons (bloques grises con pulso animate-pulse) que repliquen la forma exacta de la tarjeta que va a cargar.