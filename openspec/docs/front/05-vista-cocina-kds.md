# Especificación Técnica y UI: Vista Cocina (KDS)

**Contexto:** El Kitchen Display System (KDS) opera en el entorno más hostil del restaurante: luz fluorescente, pantallas táctiles, manos sucias y alta presión. Esta vista implementa un tablero tipo Kanban interactivo en Modo Oscuro estricto. Cualquier componente generado para esta vista debe priorizar la fricción cero y el alto contraste.

## 1. Stack Tecnológico Específico de la Vista

Para lograr el nivel de interacción Premium requerido, esta vista obliga el uso de las siguientes librerías:
*   **Layout y Animaciones:** `framer-motion` (Imprescindible para el reordenamiento mágico de las tarjetas sin saltos bruscos).
*   **Lógica Kanban:** `@dnd-kit/core` y `@dnd-kit/sortable` (Recomendado sobre react-beautiful-dnd por su soporte táctil avanzado) o bien botones de acción masivos que desplacen la tarjeta.
*   **Iconografía:** `lucide-react` (Iconos de trazo grueso y legible).

## 2. Topología del Tablero Kanban

El layout principal es un grid horizontal que ocupa el 100% del viewport (`h-screen`, `w-screen`), bloqueando el scroll de la página (overscroll-none) para comportarse como una app nativa de tablet.

Columnas obligatorias (Estados del Ticket):
1.  **Pendientes (To Do):** Tickets que acaban de entrar.
2.  **En Preparación (Doing):** El cocinero tocó el ticket para indicar que lo está marchando.
3.  **Listos para Despacho (Done):** Platos terminados esperando al mozo (se limpian automáticamente de la pantalla tras 5 segundos o al presionar "Despachar").

*Nota UI:* Las columnas deben usar el color de fondo `bg-brand-950`, separadas sutilmente por bordes `border-brand-900`.

## 3. Especificación del Componente: `<TicketCard />`

Este es el componente más importante del KDS. Su renderizado debe ser manejado por `<motion.div>` de Framer Motion con el prop `layout` activado, para que al cambiar de columna, la tarjeta "vuele" suavemente hacia su nueva posición.

### A. Estilos Base
*   **Fondo:** `bg-brand-800` (Azul oscuro profundo).
*   **Sombra:** Omitir sombras convencionales. Usar bordes sutiles.
*   **Tipografía:** `font-display` para los números de mesa, `font-sans` para los ingredientes. Tamaño de fuente gigante (mínimo `text-lg` para el cuerpo).

### B. El Semáforo de Tiempo (Header del Ticket)
El cronómetro (`04:15`) debe cambiar el color de la cabecera del ticket dinámicamente:
*   `0-10 min:` Fondo `bg-brand-900`, texto `text-brand-50`.
*   `10-20 min:` Fondo `bg-semantic-warning` (Ámbar), texto negro.
*   `+20 min:` Fondo `bg-semantic-urgent` (Naranja), parpadeo sutil con CSS (`animate-pulse`).

### C. Modificadores y Toque Táctil (Body del Ticket)
*   **Modificadores:** Renderizados debajo del plato, con un margen izquierdo (`ml-4`), usando color amarillo suave o `text-brand-100` y viñetas claras.
*   **Tap-to-Cross (Tachar plato):** Al hacer *tap* (clic) sobre un ítem específico dentro del ticket, el texto debe pasar a opacidad 50% (`opacity-50`) y tacharse (`line-through`). Esto permite al chef marcar qué partes del ticket ya hizo.

### D. El Escudo de Alergias (Override Visual)
Si el objeto JSON del ticket trae el flag `hasAllergy: true`:
1.  El fondo del ticket pasa a un tono rojizo muy oscuro (`bg-red-950/40`).
2.  El borde se vuelve grueso y de color puro (`border-2 border-semantic-danger`).
3.  Aplica el resplandor de emergencia definido en Tailwind: `shadow-danger-glow`.
4.  Aparece el ícono `<AlertTriangle />` de Lucide parpadeando junto al nombre del cliente/mesa.

### E. Course Control (Sincronización de Tiempos)
Si el mozo marcó platos "En Espera":
*   Esos ítems se renderizan con `opacity-40` y un ícono `<Lock />`.
*   Cuando el evento WebSocket `course.fire` es recibido, los ítems hacen una transición a `opacity-100` mediante un destello blanco temporal logrado con Framer Motion: `animate={{ backgroundColor: ["#FFFFFF", "transparent"] }}`.

## 4. Comandos de IA para Generación

*Reglas estrictas para el Agente que programe esta vista:*
1.  **NO usar Drag and Drop si complica el tap en tablets:** Es preferible tener un botón gigante `[MARCHAR]` al final de la tarjeta que cambie el estado del ticket y deje que Framer Motion anime el cambio de columna, en lugar de forzar al chef a arrastrar tarjetas con el dedo lleno de harina.
2.  **Skeletons iniciales:** Mientras la vista lee de `src/mocks/orders.json`, muestra 3 tarjetas vacías con `animate-pulse` en la primera columna.
3.  **Layout Animations:** El contenedor del tablero debe ser un `<motion.div layout>` para que cuando un ticket desaparezca (se marque como despachado), los demás tickets suban orgánicamente ocupando su espacio sin "saltar".