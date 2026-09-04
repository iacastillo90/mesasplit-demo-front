Ecosistema Gastronómico — Especificación de Vistas

Propósito de este documento: referencia técnica única para que cualquier agente (humano o IA) que trabaje en el frontend/backend entienda qué debe construir en cada vista, qué datos comparte con las demás, y qué reglas de negocio son innegociables. Si una vista se construye sin leer este documento, es probable que rompa la sincronía en tiempo real con el resto del sistema.

Índice

Visión y Filosofía

Sistema de Diseño (Design Tokens)

Mapa del Ecosistema

Vista: Super Admin

Vista: Local Admin

Vista: Mozo (PWA)

Vista: Cocina / KDS

Vista: Caja / POS

Vista: Cliente / Mesa Virtual (PWA)

Contratos de Eventos en Tiempo Real

Reglas de Negocio Transversales

Roadmap por Fases

Glosario (Chile-specific)

Arquitectura de Frontend y Plan de Demo (Sin Backend)

0. Visión y Filosofía

El sistema no es un POS tradicional (tipo Fudo, Toteat, NexoGourmet) con "gráficos y tablas". Es un motor proactivo que:



Empuja información, no la esconde. Ningún usuario debería tener que "ir a buscar" un problema (fraude, folio agotado, mesa atrasada) — el sistema se lo notifica.

Bifurca la cognición por rol. Cada vista muestra estrictamente lo que ese rol necesita para resolver su dolor diario. Nadie ve una pantalla genérica "de admin".

El dato nace una sola vez y viaja solo. Una alergia declarada por el cliente no se vuelve a tipear por el mozo. Un pago QR no se vuelve a cobrar en caja. Esto es lo que hace que el sistema se sienta "mágico" en una demo — y es también lo que previene errores costosos.

Fricción cero para operar, fricción máxima para el fraude. Tomar un pedido debe tomar 3 toques. Anular un ítem ya enviado a cocina debe requerir PIN de un superior.

Todas las vistas comparten el mismo backend de tiempo real (WebSockets) y la misma paleta visual, pero cada una adapta modo claro/oscuro y jerarquía de información a su contexto físico de uso.

1. Sistema de Diseño (Design Tokens)

1.1 Paleta base (escala azul monocromática)

TokenHexUsoAzul 950#011623Fondo modo oscuro (Cocina, Local Admin, Mozo)Azul 900#012032Texto principal sobre fondos claros / superficies oscuras secundariasAzul 800#024064Tarjetas en modo oscuro (comandas, mesas)Azul 500#04A0FBCTA principal — botones de acción crítica en todas las vistasAzul 100#CDECFEFondos secundarios / estados hover en modo claroAzul 50#E6F6FFFondo general modo claro / texto sobre fondo oscuroBlanco#FFFFFFTarjetas y contenedores en modo claro1.2 Colores semánticos (fuera de la escala azul)

ColorHexSignificadoUso permitidoVerde#10B981Éxito / completadoPago exitoso, plato listo, mesa libreÁmbar#F59E0BAlerta media / advertenciaStock crítico, mesa esperando platos, folios < 50Naranja#FB923C (sugerido)Urgencia operativaMesa atrasada / cuenta pedida hace ratoRojo puro#EF4444Reservado exclusivamente para seguridadAlergias, emergencias, botón de pánico, folios < 10Regla de oro — no negociable: el rojo puro (#EF4444) está reservado exclusivamente para alergias/riesgo de salud y emergencias. La urgencia operativa normal (mesa atrasada, cuenta pendiente de cobro) usa naranja, nunca rojo. Si se usa el mismo color para ambos casos, el equipo se desensibiliza al rojo y el Escudo de Alergias pierde su función crítica. Cualquier agente que implemente un nuevo estado de "urgencia" debe usar naranja o ámbar, jamás rojo puro.

1.3 Modo por vista

VistaModoFondo primarioMotivoSuper AdminClaro#E6F6FF / #CDECFETransmite control, se lee en oficina con buena luzLocal AdminOscuro#011623 / #012032Ambientes de salón con luz baja, reduce fatiga visualMozo (PWA)Oscuro#011623Uso móvil constante, ahorra batería, legible en salón oscuroCocina (KDS)Oscuro#011623 / tarjetas #024064Luz fluorescente de cocina, lectura a 1.5 m de distanciaCaja (POS)Claro#E6F6FF / #F8F9FAPrecisión financiera, ambiente de mostrador bien iluminadoCliente (PWA)Claro#E6F6FF / BlancoDeja resaltar las fotos cálidas de los platos2. Mapa del Ecosistema

CLIENTE (PWA) ──┐

├──► COCINA (KDS) ◄──── MOZO (PWA)

│ │ │

│ ▼ ▼

└──► CAJA (POS) ◄──── LOCAL ADMIN

│ │

└────────┬────────┘

▼

SUPER ADMIN

(agrega todo, decide estrategia)

Principio de flujo de datos: la información nace en la capa operativa (Cliente, Mozo, Cocina, Caja) y sube sin fricción hacia la capa de supervisión (Local Admin) y de estrategia (Super Admin). Ninguna vista de administración debe requerir carga manual de datos que ya existen en la capa operativa.

3. Vista: Super Admin

Usuario: dueño / gerente general. Modo: claro. Objetivo: rentabilidad y prevención de crisis legales/financieras — no un visor del pasado, sino un oráculo del futuro.



3.1 Pantallas y componentes

MóduloDescripciónRegla de negocio claveKPI de Costo PrimarioIndicador visual más grande de la pantalla: Costo de Ingredientes + Costo LaboralSi supera 60%, la tarjeta alerta visualmente (naranja/rojo según severidad)Cash Flow / "Día Cero"Proyección a 7/14/30 días cruzando cuentas por pagar y estacionalidadDepende de carga de CxP (manual u OCR) — no prometer integración bancaria automática en V1Simulador "What-If"Sliders para simular cambios de costo de insumos / precio de venta, recalcula Costo Primario y Margen Neto al instanteDepende de fichas técnicas de receta correctamente costeadas — sin esto, el simulador da números falsos con apariencia de precisiónCompliance HubWidget fijo esquina superior derecha, 2 pestañas: SII (Folios CAF) y Sanitario (vencimiento resolución sanitaria, carnés de manipulación, inspecciones)Folios CAF se descuentan en tiempo real desde cada emisión de DTE en CajaAuditoría de Ingeniería de MenúScatter plot: rentabilidad real del plato vs. popularidadPermite seleccionar masivamente "Platos Perro" y eliminarlos del menú QR con un clicConciliación MaestraTabla que cruza lo facturado en POS vs. depósitos Webpay/Mercado PagoColumna roja destacada "Deltas/Discrepancias"Auditoría de Insumos + IANotificaciones push con jerarquía estricta: 🔴 Crítico / 🟠 Urgente / 🔵 InformativoFluctuaciones de proveedores, anomalías en propinas/anulaciones. Requiere 60-90 días de historial mínimo antes de ser confiable — mostrar como "en aprendizaje" antes de eso3.2 Integraciones con otras vistas

Recibe folios CAF descontados en tiempo real desde Caja.

Recibe registros de asistencia (clock-in/out) desde Mozo y Caja para el módulo Ley 40 Horas.

Recibe eventos de anulación/descuento con PIN desde Mozo/Caja para la Auditoría de Insumos.

Recibe cierres de caja (Cierre Ciego) de Caja para la Conciliación Maestra.

4. Vista: Local Admin

Usuario: encargado de salón / jefe de turno. Modo: oscuro. Objetivo: cero fricción durante el servicio, prevención de fraude en tiempo real.



4.1 Pantallas y componentes

MóduloDescripciónRadar de TurnoMapa topológico vía WebSockets. Mesas: 🟢 recién sentadas · 🟡 esperando comida · 🟠 cuenta pendiente/atrasada. Rojo reservado solo para alertas de seguridad.Radar Unificado (Omnicanalidad)Uber Eats / Rappi / PedidosYa como "mesas virtuales" en columna lateral. Recomendado integrar vía agregador (Otter/Deliverect) en vez de 3 integraciones directas.Feed de Alertas (Excepciones)Panel lateral: "Anulación de ticket #402 tras impresión en cocina", "Apertura de gaveta sin venta asociada", etc.Modo Hora Punta (Focus Mode)Toggle gigante en cabecera. Oculta reportes/inventario/configuración; deja solo mesas en 🟠, merma rápida y alertas críticas.Cierre CiegoEl cajero/encargado declara efectivo físico antes de ver la venta teórica del sistema. Elimina oportunidad de manipulación manual.Comando Rápido de MermaBarra estilo consola: "3 kilos de tomate vencido" descuenta inventario al instante sin navegación.Botón de PánicoFlotante, discreto. Escala a: gerencia → seguridad privada contratada → opcionalmente llamada a emergencias. No prometer disparo directo a Carabineros/911 vía API — no es viable legal/técnicamente.Gamificación (Leaderboard)Ranking de meseros por ticket promedio, rotación, propinas. Debe contrapesarse con satisfacción/rating, no solo velocidad.4.2 Integraciones

Recibe eventos de "cuenta pedida" y anulaciones desde Mozo.

Recibe alertas de gaveta/caja desde Caja.

Recibe estado de mesas desde Cocina (Course Control) y Cliente (S.O.S.).

Envía comando de merma hacia el módulo de inventario que consume Super Admin.

5. Vista: Mozo (PWA)

Usuario: mozo/garzón. Modo: oscuro estricto (#011623). Objetivo: operar el salón a una sola mano, sin scrolls infinitos.



5.0 Apertura de Turno

Pantalla de PIN/biometría → botón "Iniciar Turno". Este marcaje alimenta el módulo Ley 40 Horas del Super Admin.

5.1 Home — "Mis Mesas"

Header: avatar + score de gamificación · indicador de conexión (🟢 sincronizado / ☁️ guardando local-offline) · centro de notificaciones push (WebSockets) · botón S.O.S. al encargado.

Cuerpo: grid de tarjetas grandes, solo mesas asignadas. Semáforo: 🟢 recién sentados (con timer sutil) · 🟡 esperando platos · 🟠 cuenta pedida hace +5 min (naranja, no rojo).

Long-press sobre mesa (menú contextual): Unir Mesas · Ceder Mesa (cobertura a un compañero).

5.2 Toma de Pedido

Layout dividido: ¼ superior = resumen del ticket en construcción, ¾ inferior = catálogo.

Categorías en fila horizontal deslizable, sticky.

Tarjetas de plato: tap-to-add. Toques sucesivos muestran contador circular (3x) en vez de abrir modal.

Lista 86: agotado = tarjeta al 50% opacidad, texto tachado, no clickeable. Stock crítico (ámbar): banner diagonal "Quedan 2" — avisa antes del quiebre total.

Upsell asistido: al agregar un plato, modal inferior con borde #04A0FB sugiere maridaje de mayor margen (dato compartido con Auditoría de Ingeniería de Menú del Super Admin).

5.3 Modificadores, Alergias y Course Control

Chips predefinidos en vez de teclado libre: [Sin Cebolla] [Término Medio] [Para Llevar].

Escudo de Alergias: chip [Alergia Maní] tiñe el borde del ítem en rojo puro #EF4444 en el ticket — rompe la paleta a propósito.

Course Control: selector [Entrada – Enviar Ahora] (ícono play verde) / [Fondo – Marchar en 15m] (ícono pausa, atenuado).

Anulación controlada: si el ítem ya fue enviado a cocina, eliminar exige PIN del Local Admin. Si no ha sido enviado, swipe-to-delete simple.

5.4 Pago y Cierre

División rápida en zona del pulgar: Pago Completo · Partes Iguales (÷2 ÷3 ÷4) · Por Ítem.

Propina sugerida 10% (editable), métodos: Efectivo / Tarjeta / Transferencia / Mixto.

Liberación automática: botón "Cerrar y Liberar Mesa" → la mesa desaparece de "Mis Mesas", pasa a "Libre" (gris) en el Radar del Local Admin.

5.5 Integraciones

Envía pedidos a Cocina (KDS) respetando Course Control.

Recibe pushes de Cocina ("Plato Listo") y de Cliente (llamado S.O.S. vía QR).

Envía método de pago exacto a Caja/Conciliación Maestra.

Envía marcaje de turno a Super Admin (Ley 40 Horas).

6. Vista: Cocina / KDS

Usuario: cocineros / chef de línea. Modo: oscuro estricto (#011623, tarjetas #024064). Objetivo: cero recarga de pantalla, alertas en milisegundos, legible a 1.5 m.



6.1 Topología

ComponenteDescripciónRuteo por EstacionesEl pedido se fragmenta automáticamente: Parrilla solo ve carnes, Barra solo bebidas, etc.Expo ViewPantalla maestra del coordinador: consolida el estado de todas las estaciones, alerta cuando todos los componentes de una mesa están listos para salir juntos.Toggle Vista Agregada (Batch)Cambia de "por ticket" a "por producto" (ej. "12 papas fritas pendientes") — clave en hora punta.6.2 Header Global

Indicadores de saturación por estación (ej. "Parrilla: 6 tickets" / "Fría: 1 ticket") para reasignar personal.

Botón Recall: recupera los últimos 10 tickets marcados "Listo" por error.

Gestor de Lista 86: declarar quiebre de stock desde la línea, actualiza instantáneamente Mozo y Cliente.

Reloj central y métricas vivas (tiempo promedio de preparación, tickets en cola).

6.3 Anatomía del Ticket

Cabecera: identificador gigante (MESA 14 / UBER EATS #902) + cronómetro de vida + semáforo de urgencia (azul 0-10min → amarillo 10-20min → rojo parpadeante +20min, este rojo es de urgencia operativa de cocina, contexto distinto al de alergias).

Cuerpo: tipografía enorme alto contraste; modificadores en amarillo mostaza, indentados bajo el plato.

Interacción de un toque: tocar plato individual lo tacha (preparado); botón verde inmenso "MARCHAR/LISTO" al pie.

Diferenciación de origen: íconos/bordes distintos para Salón vs. Delivery.

Checklist de empaque forzado (delivery): el botón "Listo" exige tap individual por cada ítem empacado — previene devoluciones de plataformas.

6.4 Escudo de Alergias

Ticket completo con borde grueso y fondo rojo puro #EF4444, ícono ⚠️ parpadeante sobre el ingrediente riesgoso. Rompe la estética a propósito — no requiere que el chef busque notas en letra chica.

6.5 Course Control

Sección "Marchar Ahora" arriba, máxima opacidad. Sección "En Espera" abajo, 50% opacidad + candado visual. Al recibir el evento course.fire desde Mozo, la sección se ilumina con animación flash.

6.6 Comunicación y Resiliencia

Botones de alerta proactiva ("Demora +8 min") que actualizan cronómetros en Mozo y Local Admin en milisegundos.

Interacción manos libres: soporte para bump bars / pedales.

Modo offline: caché local de cola de pedidos + fallback a impresora térmica si la pantalla falla.

6.7 Integraciones

Recibe pedidos de Mozo y Cliente (si el local permite pedir desde el celular).

Al presionar "Listo": libera el ticket, notifica a Local Admin (columna Despacho), push a Mozo, y actualiza el tracking visible en Cliente.

Declaraciones de Lista 86 se propagan a Mozo y Cliente en tiempo real.

7. Vista: Caja / POS

Usuario: cajero. Modo: claro (#E6F6FF / #F8F9FA). Objetivo: precisión absoluta, prevención de descuadres, trazabilidad legal.



7.0 Control de Accesos y Arqueos

Lock screen: PIN individual obligatorio — no existe "caja genérica", cada transacción queda firmada por usuario.

Apertura de caja: declarar fondo fijo inicial en efectivo.

Traspaso de turno: botón que congela pantalla, hace mini-arqueo ciego de lo transaccionado, exige PIN del cajero entrante.

7.1 Layout (pantalla dividida asimétrica)

Izquierda (30%) — Ticket fiscal en vivo:



Detalle de ítems, subtotal, descuentos.

Propina separada por medio de pago (efectivo vs. tarjeta) — dato vital para liquidación de sueldos.

Módulo DTE: toggle [Boleta] / [Factura]. Factura despliega buscador de RUT con autocompletado.

Derecha (70%) — Motor de pago:



Numpad gigante. Botones: EFECTIVO TARJETA TRANSFERENCIA MIXTO.

Vuelto automático calculado y mostrado en verde gigante.

7.2 Sincronización Híbrida (antifraude)

Radar QR: si la mesa paga desde el celular del cliente, el saldo en caja baja solo, con destello verde. Candado visual bloquea cobro duplicado mientras el pago QR está en curso.

División fraccionada: [÷2] [÷3] [÷4] o selección de ítems por checkbox.

7.3 Prevención de Fraude y Contingencias

Bloqueo por PIN: cualquier descuento manual, anulación de ítem cocinado, o Nota de Crédito Electrónica exige PIN del Local Admin + motivo obligatorio de lista cerrada (Cortesía / Cliente insatisfecho / Error de carga) — nunca texto libre.

Alerta de folios en contexto: indicador de Folios CAF — naranja bajo 50, rojo parpadeante bajo 10.

Modo Contingencia SII: si el SII no responde, el botón cambia a "Imprimir en Contingencia"; los DTE se encolan y se envían al restablecerse el servicio.

7.4 Experiencia de Cliente y Mostrador

Customer-Facing Display (CFD): pantalla espejo hacia el cliente con total, QR alternativo de pago y pregunta de propina.

Cierre digital: [Imprimir] [WhatsApp] [Email].

Modo Mostrador/Takeaway: toggle que reemplaza el numpad por el catálogo de platos; el pedido se inyecta directo al KDS como "Delivery/Retiro".

7.5 Integraciones

Descuenta folios CAF del Compliance Hub del Super Admin en cada emisión.

Cada transacción alimenta la Conciliación Maestra.

Anulaciones/descuentos con PIN alimentan el Feed de Excepciones del Local Admin y la Auditoría de Insumos e IA del Super Admin.

Pedidos de mostrador se inyectan directo al KDS.

8. Vista: Cliente / Mesa Virtual (PWA)

Usuario: comensal. Modo: claro (#E6F6FF / blanco, fotos cálidas de platos). Stack sugerido: React o Vue.js — vistas modulares, estado reactivo para tiempo real, servida como PWA vía QR sin descarga.



8.0 Onboarding

Escaneo de QR → bienvenida con logo del local.

Campo único: nombre/apodo → [Entrar a la Mesa].

Escudo de Alergias directo: checkbox opcional "¿Alguna alergia o restricción?" — el dato se ancla al perfil y viaja a Mozo/KDS en rojo puro sin pasar por intermediarios.

Selector de idioma (globo terráqueo) para zonas turísticas.

Reconexión transparente: si se cierra el navegador, reabrir el QR recupera sesión, nombre y carrito (localStorage/JWT).

8.1 Catálogo

Categorías sticky horizontales. Tarjetas con foto grande, título, descripción, precio.

[+ Agregar] → modal bottom-sheet para modificadores.

Sincronía Lista 86 en vivo: ítem agotado se ve gris/no clickeable en todas las pantallas de clientes simultáneamente.

Verificación de alcohol: al agregar cerveza/vino, candado amarillo "Requiere validación de edad por el mozo" — el pedido llega a cocina pero el mozo recibe push prioritario para confirmar antes de marchar.

8.2 Carrito Vivo ("Mesa Compartida")

Ícono flotante con total acumulado de la mesa.

Dividido en "Mis Pedidos" vs. "Pedidos de la Mesa" (actualización instantánea vía WebSockets entre todos los celulares de la mesa).

Rol de Anfitrión: el primer usuario que escanea es quien controla el envío maestro a cocina, o bien cada quien envía el suyo con ventana de 10s de [Deshacer].

Tracking de pedido (espejo del KDS): 🕒 Recibido → 🍳 En preparación → 🚶 En camino a tu mesa.

8.3 Módulo S.O.S.

Botón flotante [🛎️ Llamar al Mozo] → 3 opciones rápidas (Limpiar mesa / Falta cubierto / Ayuda general).

Feedback inmediato: botón cambia a "✓ Mozo notificado".

Escalación automática: si pasan 3 minutos sin respuesta del mozo, aviso al encargado de salón.

8.4 Checkout

Se bloquea seguir pidiendo; resumen final.

Selección tributaria obligatoria: [🧾 Boleta] / [🏢 Factura] (con RUT/razón social) antes de dividir.

Propina: [10%] [15%] [Otro].

4 escenarios de división: Pagar Todo · Partes Iguales · Pagar Mis Platos · Fraccionar Ítem Compartido (ej. "pagar 1/3 de la pizza").

Redirección a Webpay/Mercado Pago.

Pago fallido: pantalla de reintento clara, sin vaciar carrito ni duplicar orden.

8.5 Post-Pago

Cierre de sesión de mesa: al llegar a $0, la PWA se bloquea ("¡Cuenta Pagada!"), nadie más puede agregar productos — evita mesas fantasma en el Radar.

Calificación flash: 5 estrellas. 5★ alimenta el Leaderboard del mozo; 1-2★ despliega campo de texto para atajar el mal review antes de que llegue a Google Maps.

Captura CRM (opt-in): email a cambio de boleta digital + descuento próxima visita.

8.6 Integraciones

Envía alergias y pedidos directo a Mozo y Cocina.

Consume estado de Lista 86 de Cocina en tiempo real.

Envía pagos QR que Caja refleja automáticamente (Sincronización Híbrida).

Envía boleta/factura al mismo pool de folios que gestiona Caja/Super Admin.

Envía calificación al Leaderboard de gamificación (Local Admin / Mozo).

9. Contratos de Eventos en Tiempo Real

Referencia rápida de los eventos WebSocket más importantes que cruzan vistas. (Nombres sugeridos — ajustar a la convención real del backend.)

EventoOrigenDestino(s)Payload clavetable.status_changedMozo / Caja / ClienteLocal Admin, Mozotable_id, status (verde/amarillo/naranja/libre)order.item_addedMozo / ClienteCocina, Local Adminorder_id, items[], allergy_flags[]course.fireMozoCocinaorder_id, courseType ("ENTRADA"/"FONDO"/"POSTRE")kds.item_readyCocinaMozo, Cliente, Local Adminorder_id, item_idkds.stock_86CocinaMozo, Cliente, Local Adminproduct_id, status (agotado/crítico)payment.qr_receivedCliente (Webpay/MP)Caja, Local Admin, Super Admintable_id, amount, methodalert.fraudMozo / CajaLocal Admin, Super Admintype, reason, authorized_bycall.waiterClienteMozotable_id, reasonpanic.buttonLocal AdminGerencia / Seguridadlocation, timestampshift.clock_in / shift.clock_outMozo / CajaSuper Adminemployee_id, timestampdte.folio_usedCajaSuper Admin (Compliance Hub)folio_type, remaining_count10. Reglas de Negocio Transversales

Estas reglas aplican a todas las vistas y no deben romperse al implementar una funcionalidad nueva:



Rojo puro (#EF4444) = solo seguridad/salud/emergencia. Nunca usarlo para urgencia operativa normal.

Toda anulación de un ítem ya enviado a cocina, o todo descuento manual, requiere PIN del Local Admin + motivo de lista cerrada. Nunca texto libre, nunca sin autorización.

Ningún dato crítico (alergia, método de pago, folio) se vuelve a tipear. Nace una vez en su origen (Cliente, Caja) y viaja a todas las vistas que lo necesiten.

Resiliencia offline es obligatoria en Mozo, Cocina y Caja. Ninguna de estas tres vistas puede quedar inoperable por una caída de wifi durante el servicio.

Cada transacción y cada turno queda firmado por un usuario individual (PIN). No existen sesiones "genéricas" de caja o de mozo compartidas sin identificación.

El Cierre Ciego nunca muestra la venta teórica antes de que el usuario declare el efectivo físico.

El Simulador What-If y cualquier módulo de rentabilidad dependen de que las fichas técnicas de receta estén costeadas correctamente — no se debe mostrar el simulador como confiable si ese dato base no existe.

11. Roadmap por Fases

Fase 1 — MVP (piso operativo, ya diferencia del mercado local)

Cliente: onboarding, catálogo, carrito vivo, envío a cocina, S.O.S., checkout básico (pagar todo / partes iguales), boleta.

Mozo: clock-in, Mis Mesas, toma de pedido, Lista 86, Escudo de Alergias, pago básico, cierre y liberación de mesa.

Cocina: ticket con semáforo de tiempo, Escudo de Alergias, Marchar/Listo, Lista 86, offline básico.

Caja: apertura/cierre de caja, cobro multi-método, DTE boleta, Cierre Ciego.

Local Admin: Radar de mesas, Feed de Excepciones, Cierre Ciego, Comando de Merma.

Super Admin: Costo Primario, Compliance Hub (solo SII), Conciliación Maestra.

Fase 2 — Diferenciación

Cliente: fraccionar ítem compartido, factura, tracking de pedido, verificación de alcohol, reconexión de sesión, calificación flash.

Mozo: Course Control, upsell asistido, unir/ceder mesa, anulación con PIN, "Mi Rendimiento".

Cocina: ruteo por estaciones, Expo View, vista agregada (batch), Recall, checklist de empaque delivery.

Caja: folios en contexto, notas de crédito con PIN, CFD, modo mostrador.

Local Admin: Modo Hora Punta, Radar Unificado de delivery, Gamificación.

Super Admin: Simulador What-If, Compliance sanitario, Auditoría de Ingeniería de Menú.

Fase 3 — Moat / Enterprise

Cliente: multi-idioma, CRM avanzado.

Cocina: manos libres (bump bars/pedales), contingencia con impresora térmica.

Caja: Modo Contingencia SII.

Local Admin: Botón de Pánico integrado.

Super Admin: Cash Flow predictivo ("Día Cero"), detección de anomalías por IA.

12. Glosario (Chile-specific)

TérminoSignificadoSIIServicio de Impuestos Internos — organismo tributario chilenoDTEDocumento Tributario Electrónico (boleta o factura electrónica)Folio CAFCódigo de Autorización de Folios — rango de números habilitado por el SII para emitir DTELey de 40 HorasLey chilena de reducción de jornada laboral, exige control estricto de horas trabajadasTransbankPrincipal operador de pagos con tarjeta (POS físico) en ChileWebpay / Mercado PagoPasarelas de pago online usadas para cobros vía QRCosto PrimarioCosto de Ingredientes + Costo Laboral, métrica clave de rentabilidad en restaurantesCierre Ciego (Blind Close)Proceso de arqueo donde el usuario declara efectivo físico antes de ver la venta teórica del sistema13. Arquitectura de Frontend y Plan de Demo (Sin Backend)

Contexto: mientras el backend real (Java/Spring Boot) no existe, el frontend (React) debe simular el ecosistema completo para una demo funcional frente al cliente. Esta sección define cómo estructurar ese frontend por dominios y cómo simular la "magia" de tiempo real sin servidor.

13.1 Enrutamiento (React Router v6)

Se usa createBrowserRouter con una ruta raíz / que actúa como Portal de Demostración: un hub con botones que abren cada vista en una pestaña nueva (target="_blank"), para poder mostrar 2-3 vistas en paralelo (ej. celular + notebook) durante la reunión comercial.

RutaVista/Portal de Demostración/client/table/:tableIdCliente (mesa dinámica vía parámetro de URL)/waiterMozo/kdsCocina/posCaja/admin/radarLocal Admin/admin/superSuper AdminCada módulo lee sus propios parámetros de URL (ej. tableId vía useParams()) y resuelve su estado internamente — el router nunca debe conocer la lógica interna de un módulo.



13.2 Estructura de Carpetas (Feature-Sliced / por Dominio)

Se adopta modularidad por dominio (Feature-Sliced Design): cada una de las 6 vistas es una feature aislada, con sus propias páginas, componentes y servicios. Esto evita el acoplamiento típico de un CRA/MERN genérico donde todo vive en components/.



src/

├── app/

│ └── App.jsx # Solo monta <RouterProvider>

├── routes/

│ └── index.jsx # createBrowserRouter

├── features/

│ ├── Portal/ # Hub de demostración

│ ├── ClientView/ # Mesa Virtual y catálogo QR

│ ├── WaiterView/ # PWA del Mozo

│ ├── KdsView/ # Pantalla de Cocina

│ ├── PosView/ # Caja y facturación

│ ├── RadarView/ # Local Admin

│ └── CorporateView/ # Super Admin (opcional en fase 1 del demo)

│ └── <cada feature>/

│ ├── pages/ # Componente de página (ej. WaiterPage.jsx)

│ ├── components/ # Componentes propios de ese dominio

│ ├── services/ # Capa de acceso a datos (ver 13.7)

│ └── store/ # Slice de Zustand propio del dominio

├── shared/

│ ├── ui/ # Button, Modal, Toast, Badge — reutilizables entre features

│ └── constants/ # Enums de estado (ej. colores semáforo de mesa)

├── hooks/

│ └── useRealtimeBus.js # Abstracción del "falso WebSocket" (ver 13.3)

├── mocks/

│ ├── menu.json

│ ├── tables.json

│ └── users.json

└── store/

└── useDemoStore.js # Store raíz de Zustand (o índice de slices)

13.3 Sincronización en Tiempo Real para la Demo

Esta es la pieza más crítica: el gancho de venta del sistema es que un evento en una vista aparece instantáneamente en otra. Hay dos escenarios de demo distintos, y cada uno requiere una solución técnica diferente — mezclarlos es el error más común al planificar esto.



Escenario A — Todo en un solo dispositivo (varias pestañas/ventanas del mismo navegador)

BroadcastChannel (o eventos de storage sobre localStorage como fallback en navegadores viejos) funciona perfecto acá, porque ambas pestañas comparten el mismo motor de navegador y origen. Es la opción correcta si vas a presentar dividiendo la pantalla del notebook en dos ventanas.



// src/hooks/useRealtimeBus.js (implementación BroadcastChannel)

const channel = new BroadcastChannel('demo-bus');



export function publish(event, payload) {

channel.postMessage({ event, payload, ts: Date.now() });

}



export function subscribe(event, callback) {

const handler = (msg) => {

if (msg.data.event === event) callback(msg.data.payload);

};

channel.addEventListener('message', handler);

return () => channel.removeEventListener('message', handler);

}

Escenario B — Dos dispositivos físicos distintos (celular + notebook) ⚠️ corrección importante

BroadcastChannel y los eventos de localStorage NO funcionan entre dispositivos distintos, ni siquiera estando en la misma red WiFi — ambas APIs están limitadas al mismo navegador y origen en el mismo equipo. Si el plan de demo es "presiono Marchar en el celular y aparece en el notebook", esa combinación específica de herramientas no va a funcionar y puede fallar justo en la reunión con el cliente.

Para este escenario existen dos caminos, ambos livianos y sin necesitar el backend Java/Spring Boot real:



Firebase Realtime Database o Firestore (recomendado para demo): capa gratuita, tiempo real nativo, ~15-20 minutos de configuración, sin necesidad de mantener un servidor propio corriendo. El celular y el notebook escriben/leen del mismo documento en la nube.

Servidor puente mínimo (Node + socket.io): un servidor Express de 30 líneas que reciba y reemita eventos — no es el backend final, es solo un puente temporal para la demo. Requiere exponer el servidor de desarrollo en la red local.

En ambos casos, además, el servidor de desarrollo de React debe exponerse en la red local para que el celular pueda acceder por IP (no por localhost):



# Vite

npm run dev -- --host



# Create React App

HOST=0.0.0.0 npm start

Recomendación de arquitectura: definir useRealtimeBus.js como una interfaz única (publish, subscribe) con dos implementaciones intercambiables — una sobre BroadcastChannel y otra sobre Firebase/socket.io — seleccionada por una variable de entorno (VITE_DEMO_MODE=same-device | cross-device). Así ninguna feature necesita saber cuál transporte está activo, y el día que llegue el backend real, solo se reemplaza esta capa una vez más (ver 13.7).



13.4 Mocking de Datos (Fixtures)

Carpeta src/mocks/ con JSON realistas: menu.json, tables.json, users.json, orders.json.

Los services/ de cada feature leen estos JSON simulando un delay (300-600 ms) con setTimeout o await new Promise(r => setTimeout(r, 400)), para que se vean los estados de loading/spinner y la demo se sienta "real" en vez de instantánea de forma sospechosa.

Botón "Reiniciar Demo" en el Portal: restaura el store de Zustand y los mocks a su estado inicial sin tener que reiniciar el servidor — imprescindible si vas a repetir la demo varias veces en la misma reunión o el mismo día con distintos clientes.

13.5 Estado Global Simulado (Zustand)

Zustand actúa como el "cerebro" temporal que reemplaza a la base de datos mientras dura la demo. Se recomienda un slice por dominio (useTablesStore, useOrdersStore, useStockStore, useCashierStore) en vez de un store monolítico.

Patrón para evitar loops de eventos: cuando una acción del usuario dispara un cambio (ej. "Marchar pedido"), la acción del store debe (1) actualizar el estado local y (2) publicar el evento vía useRealtimeBus. El listener de las otras pestañas/dispositivos recibe el evento y llama directamente a la acción interna del store (sin volver a publicar), para no generar un eco infinito entre pestañas.

Para que el estado sobreviva a un refresh accidental de página durante la demo, usar el middleware persist de Zustand (zustand/middleware) guardando en localStorage — complementario al botón de "Reiniciar Demo" del punto anterior.



13.6 Configuración de Tailwind (Design Tokens)

Mapear la tabla de colores de la sección 1 directamente en tailwind.config.js, para que ningún componente use valores hex sueltos:



// tailwind.config.js

module.exports = {

theme: {

extend: {

colors: {

brand: {

50: '#E6F6FF',

100: '#CDECFE',

500: '#04A0FB', // CTA principal en todas las vistas

800: '#024064', // Tarjetas modo oscuro (KDS, mesas)

900: '#012032', // Texto principal / superficies oscuras

950: '#011623', // Fondo modo oscuro (KDS, Local Admin, Mozo)

},

success: '#10B981',

warning: '#F59E0B',

urgent: '#FB923C',

danger: '#EF4444', // Reservado exclusivamente para alergias/emergencias — ver regla de oro en sección 1.2

},

},

},

};

Nota: las vistas oscuras (KDS, Local Admin, Mozo) usan un fondo oscuro fijo, no un modo oscuro conmutable por el usuario ni por preferencia del sistema. No es necesario configurar la estrategia darkMode de Tailwind — basta con aplicar bg-brand-950 directamente en el contenedor raíz de esas tres features.



13.7 Capa de Servicios (Patrón Adaptador)

Cada feature debe acceder a sus datos exclusivamente a través de su carpeta services/, nunca leyendo mocks/ directamente desde un componente. Esto permite que el día que exista el backend real, solo se reemplace el contenido interno de services/, sin tocar ningún componente de UI:



// features/WaiterView/services/tablesService.js

export async function getMyTables() {

// HOY: lee de mocks/tables.json con delay simulado

// MAÑANA: fetch(`${API_URL}/api/tables?waiter=me`)

return mockFetch('tables.json');

}

13.8 Checklist Técnico Pre-Demo

[ ] Servidor de desarrollo expuesto en red local (--host) y probado desde un celular real, no solo en el emulador del navegador.

[ ] Transporte de tiempo real correcto según el escenario (13.3): mismo dispositivo → BroadcastChannel; dispositivos distintos → Firebase/socket.io.

[ ] Botón de "Reiniciar Demo" probado — la demo debe poder repetirse sin reiniciar el servidor.

[ ] Los 4 casos del Escudo de Alergias y de anulación con PIN probados end-to-end, ya que son el mayor efecto "wow" del sistema.

[ ] Fallback offline: si el WiFi de la reunión falla, tener un plan B (hotspot del celular, o grabar un video corto de respaldo del flujo cross-device).

Documento vivo — cualquier cambio de regla de negocio o nuevo evento WebSocket debe reflejarse aquí antes de implementarse.

