# MesaSplit — Ecosistema Gastronómico y Demo App

**MesaSplit** es una solución tecnológica integral para la industria gastronómica en Chile y LATAM. A diferencia de un POS tradicional pasivo, MesaSplit es un motor proactivo impulsado por eventos en tiempo real que sincroniza a todos los actores de un restaurante: clientes, mozos, cocineros, cajeros, administradores de local y gerentes corporativos.

---

## 🍽️ Las 6 Vistas del Ecosistema

1. **📱 Cliente / Mesa Virtual (PWA)**: Carta digital QR, carrito compartido de mesa, Escudo de Alergias, llamado S.O.S., división de la cuenta (pagar todo, partes iguales, por ítem, fraccionar ítem), pago QR (Webpay/Mercado Pago) y boleta/factura electrónica.
2. **🤵 Mozo / Garzón (PWA)**: Marcaje de turno (Ley 40 Horas), mapa del salón "Mis Mesas", toma de pedidos con una sola mano, Lista 86 (agotados), Course Control (entradas vs fondos), anulación protegida por PIN.
3. **🍳 Cocina / KDS (Kitchen Display System)**: Pantalla en modo oscuro estricto (`#011623`), ruteo por estaciones (parrilla, barra, etc.), Expo View, modo batch, cronómetros de urgencia y alerta destacada de alergias en Rojo Puro (`#EF4444`).
4. **💵 Caja / POS**: Sistema de cobranza multi-método en modo claro (`#E6F6FF`), Cierre Ciego de efectivo, emisión de boletas/facturas DTE con RUT, consumo de folios CAF del SII y sincronización de pagos QR.
5. **🛡️ Local Admin / Radar de Turno**: Mapa topológico en tiempo real, integración de plataformas delivery (Uber Eats, Rappi, PedidosYa), feed de excepciones antifraude, Modo Hora Punta, comando rápido de merma y botón de pánico.
6. **📊 Super Admin / Panel Corporativo**: Oráculo financiero — métrica de Costo Primario (Ingredientes + Laboral), proyección de flujo de caja "Día Cero", simulador What-If, Compliance Hub (SII folios + sanitario) y conciliación maestra de ingresos.

---

## 🎨 Brief Visual

La identidad visual de la demo está documentada en [`MesaSplit.md`](MesaSplit.md): paleta azul monocromática, reglas de modo claro (Admin, Garzón, Cliente), modo oscuro (KDS Cocina) y colores semánticos.

---

## 🛠️ Stack Tecnológico Recomendado para la Frontend Demo

- **Core**: React 18 + Vite
- **Estilos**: Tailwind CSS (usando la paleta de tokens definida en [`04-sistema-diseno-y-ui.md`](file:///home/ivan/Desktop/MesaSplit/openspec/docs/architecture/04-sistema-diseno-y-ui.md))
- **Estado**: Zustand (store reactivo con persistencia local)
- **Enrutamiento**: React Router v6 (`createBrowserRouter`)
- **Tiempo Real (Demo)**: `BroadcastChannel` (mismo dispositivo) / Firebase DB o Socket.io (multidispositivo)
