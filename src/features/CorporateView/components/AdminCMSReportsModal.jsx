// src/features/CorporateView/components/AdminCMSReportsModal.jsx — centro de reportes CMS administrativos con descarga a Excel e impresión (fase25-modo-claro-oscuro-y-reportes-cms-admin-excel)
// Permite al área administrativa exportar informes de ventas, tarjetas, deliverys, comensales en local, retiro, asistencia RRHH, inventario y mermas.
// Cumple estrictamente con AGENTS.md: cada línea de código comentada en español.

// Hooks de React.
import { useState } from 'react';
// Utilidad de exportación a CSV / Excel.
import { exportToCsv } from '../../../shared/utils/exportToCsv.js';
// Utilidad de formato de moneda CLP.
import { formatCurrency } from '../../../shared/utils/formatCurrency.js';

// Componente principal del Modal de Reportes CMS Administrativos.
export default function AdminCMSReportsModal({ isOpen, onClose }) {
  // Pestaña de reporte activa ('sales', 'cards', 'deliveries', 'dinein', 'takeout', 'rrhh', 'inventory', 'waste').
  const [activeReport, setActiveReport] = useState('sales');
  // Filtro de búsqueda por texto.
  const [searchTerm, setSearchTerm] = useState('');
  // Sucursal seleccionada para filtrar.
  const [selectedBranch, setSelectedBranch] = useState('Todas');

  if (!isOpen) return null;

  // Datos mock de Reporte de Ventas.
  const salesData = [
    { folio: 'BOL-9182', branch: 'Restô Lo Ovalle', date: '17/08/2026 21:45', waiter: 'Mateo Valenzuela', subtotal: 38000, tip: 3800, total: 41800, payment: 'Tarjeta Débito' },
    { folio: 'BOL-9183', branch: 'Restô Providencia', date: '17/08/2026 22:10', waiter: 'Sofía Morales', subtotal: 52000, tip: 5200, total: 57200, payment: 'Tarjeta Crédito' },
    { folio: 'BOL-9184', branch: 'Restô Vitacura', date: '17/08/2026 22:30', waiter: 'Lucas Silva', subtotal: 89000, tip: 8900, total: 97900, payment: 'Efectivo' },
    { folio: 'BOL-9185', branch: 'Restô Lo Ovalle', date: '17/08/2026 23:00', waiter: 'Camila Rojas', subtotal: 27500, tip: 2750, total: 30250, payment: 'Tarjeta Débito' },
  ];

  // Datos mock de Reporte de Tarjetas & Transbank.
  const cardsData = [
    { authCode: 'TBK-481920', terminal: 'POS Transbank Redelcom #1', branch: 'Restô Lo Ovalle', date: '17/08/2026 21:45', cardType: 'Visa Débito', amount: 41800, status: 'Aprobado ✓' },
    { authCode: 'TBK-481921', terminal: 'POS Transbank Redelcom #2', branch: 'Restô Providencia', date: '17/08/2026 22:10', cardType: 'Mastercard Crédito', amount: 57200, status: 'Aprobado ✓' },
    { authCode: 'TBK-481922', terminal: 'POS Webpay Plus Online', branch: 'Restô Vitacura', date: '17/08/2026 22:45', cardType: 'Visa Crédito 3 Cuotas', amount: 64900, status: 'Aprobado ✓' },
  ];

  // Datos mock de Reporte de Deliverys.
  const deliveryData = [
    { orderId: 'RYA-8819', platform: 'PedidosYa 🛵', branch: 'Restô Providencia', customer: 'Ignacio Fuentes', phone: '+56 9 7711 2233', items: '2 Lomo Lo Ovalle, 1 Pisco Sour', total: 34700, status: 'En Ruta 🛵' },
    { orderId: 'RPI-4091', platform: 'Rappi 🚀', branch: 'Restô Lo Ovalle', customer: 'Valeria Castro', phone: '+56 9 8833 4455', items: '1 Ceviche Mixto, 1 Chicha Morada', total: 18900, status: 'Entregado ✓' },
    { orderId: 'UBR-1204', platform: 'UberEats 🚘', branch: 'Restô Vitacura', customer: 'Martín Araya', phone: '+56 9 9922 1100', items: '1 Volcán de Chocolate, 2 Capuchino', total: 12400, status: 'Entregado ✓' },
  ];

  // Datos mock de Pedidos en Local (Comandas de Mesa).
  const dineInData = [
    { table: 'Mesa 12', branch: 'Restô Lo Ovalle', waiter: 'Mateo Valenzuela', guests: 4, items: 'Lomo Lo Ovalle, Pisco Sour, Papas Rústicas', total: 41800, status: 'Comiendo 🍽️' },
    { table: 'Mesa 05', branch: 'Restô Providencia', waiter: 'Sofía Morales', guests: 2, items: 'Ceviche Mixto, Chardonnay Reserva', total: 28900, status: 'Cuenta Solicitada 💳' },
    { table: 'Mesa 08', branch: 'Restô Vitacura', waiter: 'Lucas Silva', guests: 6, items: 'Asado de Tira, Carmenere, Volcán Chocolate', total: 97900, status: 'Pagado ✓' },
  ];

  // Datos mock de Pedidos para Retiro (Takeout).
  const takeoutData = [
    { orderId: 'TAK-301', branch: 'Restô Lo Ovalle', customer: 'Claudia Navarrete', phone: '+56 9 4455 6677', pickupTime: '21:30 hrs', items: '1 Sushi Promo 40pzs', total: 22900, status: 'Listo para Retiro 🛍️' },
    { orderId: 'TAK-302', branch: 'Restô Providencia', customer: 'Felipe Soto', phone: '+56 9 3322 1144', pickupTime: '22:00 hrs', items: '2 Hamburguesas Restô', total: 16800, status: 'Entregado ✓' },
  ];

  // Datos mock de Planilla de Asistencia & Turnos RRHH.
  const rrhhData = [
    { staff: 'Mateo Valenzuela', rut: '18.942.310-7', role: 'Garzón Principal', branch: 'Restô Lo Ovalle', entry: '15:00', exit: '23:30', hours: '8.5 hrs', previred: 'Cotización Al Día ✓' },
    { staff: 'Sofía Morales', rut: '19.120.449-K', role: 'Garzón / Bartender', branch: 'Restô Providencia', entry: '16:00', exit: '00:00', hours: '8.0 hrs', previred: 'Cotización Al Día ✓' },
    { staff: 'Chef Pedro Alvarado', rut: '15.890.112-3', role: 'Chef Ejecutivo Cocina', branch: 'Restô Vitacura', entry: '11:00', exit: '20:00', hours: '9.0 hrs', previred: 'Cotización Al Día ✓' },
  ];

  // Datos mock de Reporte de Inventario.
  const inventoryData = [
    { item: 'Lomo Vetado Premium Kg', category: 'Carnes', branch: 'Restô Lo Ovalle', stock: 45.5, minStock: 15.0, unit: 'Kg', costUnit: 11500, totalValue: 523250 },
    { item: 'Pisco Reservado 35° 750cc', category: 'Bar & Tragos', branch: 'Restô Providencia', stock: 28, minStock: 10, unit: 'Botellas', costUnit: 6800, totalValue: 190400 },
    { item: 'Chocolate Cobertura 60%', category: 'Repostería', branch: 'Restô Vitacura', stock: 12.0, minStock: 5.0, unit: 'Kg', costUnit: 8900, totalValue: 106800 },
  ];

  // Datos mock de Reporte de Mermas.
  const wasteData = [
    { item: 'Lechuga Hidropónica 3u', reason: 'Deterioro por refrigeración', branch: 'Restô Lo Ovalle', date: '17/08 11:30', costCLP: 3500, responsible: 'Chef Mateo' },
    { item: 'Corte de Salmón 400g', reason: 'Error en comandado de mesa', branch: 'Restô Providencia', date: '17/08 19:40', costCLP: 8900, responsible: 'Garzón Sofía' },
  ];

  // Lista de reportes CMS.
  const reportTabs = [
    { id: 'sales', label: '📊 Reporte de Ventas', data: salesData },
    { id: 'cards', label: '💳 Reporte Tarjetas & Transbank', data: cardsData },
    { id: 'deliveries', label: '🛵 Reporte Deliverys', data: deliveryData },
    { id: 'dinein', label: '🍽️ Pedidos en Local', data: dineInData },
    { id: 'takeout', label: '🛍️ Pedidos para Retiro', data: takeoutData },
    { id: 'rrhh', label: '📋 Planilla Asistencia & RRHH', data: rrhhData },
    { id: 'inventory', label: '📦 Reporte de Inventario', data: inventoryData },
    { id: 'waste', label: '🗑️ Reporte de Mermas', data: wasteData },
  ];

  // Reporte activo actualmente.
  const currentTabObj = reportTabs.find((t) => t.id === activeReport) || reportTabs[0];

  // Filtra los datos según la sucursal seleccionada y el texto de búsqueda.
  const filteredData = (currentTabObj.data || []).filter((item) => {
    const matchesBranch = selectedBranch === 'Todas' || item.branch === selectedBranch;
    const matchesSearch = JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase());
    return matchesBranch && matchesSearch;
  });

  // Exportación a archivo Excel CSV.
  const handleExport = () => {
    const filename = `MesaSplit_Reporte_${activeReport.toUpperCase()}_${new Date().toISOString().slice(0, 10)}`;
    exportToCsv(filename, filteredData);
  };

  // Impresión oficial de informe para RRHH o Administración.
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-950/80 backdrop-blur-md animate-fade-in">
      {/* Contenedor principal del modal CMS */}
      <div className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col border border-brand-200 h-[92vh]">
        {/* Cabecera del CMS con selector de reportes e impresión */}
        <div className="p-5 bg-gradient-to-r from-brand-900 via-brand-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 text-left">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-2xl border border-amber-400/30">
              📊
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-extrabold tracking-tight">Centro de Reportes CMS & Planillas Administrativas</h2>
              <p className="text-xs text-brand-50/70">
                Informes de operación gastronómica listos para exportar a Excel (CSV) y enviar a RRHH o Contabilidad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-1.5"
            >
              <span>📥</span>
              <span>Descargar Excel (CSV)</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-2xl bg-sky-600 hover:bg-sky-700 px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-white/10 hover:bg-white/20 p-2.5 text-xs font-bold text-white transition cursor-pointer"
              aria-label="Cerrar modal de reportes"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Barra de Navegación de Reportes Intuitivos */}
        <div className="flex items-center gap-2 overflow-x-auto p-3 bg-brand-50 border-b border-brand-200 whitespace-nowrap scrollbar-none touch-pan-x shrink-0">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-extrabold transition active:scale-95 border cursor-pointer ${
                activeReport === tab.id
                  ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filtros de Sucursal y Búsqueda por Texto */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Sucursal:</span>
            {['Todas', 'Restô Lo Ovalle', 'Restô Providencia', 'Restô Vitacura'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBranch(b)}
                className={`rounded-xl px-3 py-1 text-xs font-bold transition border cursor-pointer ${
                  selectedBranch === b ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-72">
            <span className="text-xs">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por folio, RUT, garzón..."
              className="w-full rounded-xl bg-white px-3 py-1.5 text-xs font-semibold border border-slate-300 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tabla CMS de Contenido de los Reportes */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-200">
                {activeReport === 'sales' && (
                  <>
                    <th className="p-3">Folio</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Garzón</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-right">Propina 10%</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3">Medio Pago</th>
                  </>
                )}
                {activeReport === 'cards' && (
                  <>
                    <th className="p-3">Cód. Autorización</th>
                    <th className="p-3">Terminal POS</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Tipo Tarjeta</th>
                    <th className="p-3 text-right">Monto Procesado</th>
                    <th className="p-3">Estado SII</th>
                  </>
                )}
                {activeReport === 'deliveries' && (
                  <>
                    <th className="p-3">N° Pedido</th>
                    <th className="p-3">Plataforma</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Detalle Comanda</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3">Estado Delivery</th>
                  </>
                )}
                {activeReport === 'dinein' && (
                  <>
                    <th className="p-3">Mesa</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Garzón</th>
                    <th className="p-3">Comensales</th>
                    <th className="p-3">Consumo en Mesa</th>
                    <th className="p-3 text-right">Total Mesa</th>
                    <th className="p-3">Estado</th>
                  </>
                )}
                {activeReport === 'takeout' && (
                  <>
                    <th className="p-3">Folio Retiro</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Cliente / Teléfono</th>
                    <th className="p-3">Hora Retiro</th>
                    <th className="p-3">Pedido</th>
                    <th className="p-3 text-right">Total</th>
                    <th className="p-3">Estado</th>
                  </>
                )}
                {activeReport === 'rrhh' && (
                  <>
                    <th className="p-3">Colaborador</th>
                    <th className="p-3">RUT</th>
                    <th className="p-3">Cargo Operacional</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Entrada</th>
                    <th className="p-3">Salida</th>
                    <th className="p-3">Horas</th>
                    <th className="p-3">Previred</th>
                  </>
                )}
                {activeReport === 'inventory' && (
                  <>
                    <th className="p-3">Insumo / Producto</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3 text-right">Stock Actual</th>
                    <th className="p-3 text-right">Stock Mínimo</th>
                    <th className="p-3 text-right">Costo Unit.</th>
                    <th className="p-3 text-right">Valorización Total</th>
                  </>
                )}
                {activeReport === 'waste' && (
                  <>
                    <th className="p-3">Insumo Perdido</th>
                    <th className="p-3">Motivo de Merma</th>
                    <th className="p-3">Sucursal</th>
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3 text-right">Costo Merma</th>
                    <th className="p-3">Responsable</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  {activeReport === 'sales' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.folio}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3 text-slate-500">{row.date}</td>
                      <td className="p-3">{row.waiter}</td>
                      <td className="p-3 text-right">{formatCurrency(row.subtotal)}</td>
                      <td className="p-3 text-right text-emerald-600 font-bold">{formatCurrency(row.tip)}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.total)}</td>
                      <td className="p-3">{row.payment}</td>
                    </>
                  )}
                  {activeReport === 'cards' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.authCode}</td>
                      <td className="p-3">{row.terminal}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3 text-slate-500">{row.date}</td>
                      <td className="p-3">{row.cardType}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.amount)}</td>
                      <td className="p-3 text-emerald-600 font-bold">{row.status}</td>
                    </>
                  )}
                  {activeReport === 'deliveries' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.orderId}</td>
                      <td className="p-3 font-extrabold text-sky-600">{row.platform}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3">{row.customer} ({row.phone})</td>
                      <td className="p-3 text-slate-600">{row.items}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.total)}</td>
                      <td className="p-3 font-bold text-emerald-600">{row.status}</td>
                    </>
                  )}
                  {activeReport === 'dinein' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.table}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3">{row.waiter}</td>
                      <td className="p-3">{row.guests} personas</td>
                      <td className="p-3 text-slate-600">{row.items}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.total)}</td>
                      <td className="p-3 font-bold text-sky-600">{row.status}</td>
                    </>
                  )}
                  {activeReport === 'takeout' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.orderId}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3">{row.customer} ({row.phone})</td>
                      <td className="p-3 text-slate-500">{row.pickupTime}</td>
                      <td className="p-3 text-slate-600">{row.items}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.total)}</td>
                      <td className="p-3 font-bold text-emerald-600">{row.status}</td>
                    </>
                  )}
                  {activeReport === 'rrhh' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.staff}</td>
                      <td className="p-3 text-slate-500">{row.rut}</td>
                      <td className="p-3 font-semibold text-sky-700">{row.role}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3">{row.entry}</td>
                      <td className="p-3">{row.exit}</td>
                      <td className="p-3 font-bold">{row.hours}</td>
                      <td className="p-3 text-emerald-600 font-bold">{row.previred}</td>
                    </>
                  )}
                  {activeReport === 'inventory' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.item}</td>
                      <td className="p-3 text-slate-500">{row.category}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3 text-right font-bold">{row.stock} {row.unit}</td>
                      <td className="p-3 text-right text-slate-500">{row.minStock} {row.unit}</td>
                      <td className="p-3 text-right">{formatCurrency(row.costUnit)}</td>
                      <td className="p-3 text-right font-extrabold text-amber-600">{formatCurrency(row.totalValue)}</td>
                    </>
                  )}
                  {activeReport === 'waste' && (
                    <>
                      <td className="p-3 font-bold text-slate-900">{row.item}</td>
                      <td className="p-3 text-rose-600 italic">{row.reason}</td>
                      <td className="p-3">{row.branch}</td>
                      <td className="p-3 text-slate-500">{row.date}</td>
                      <td className="p-3 text-right font-extrabold text-rose-600">{formatCurrency(row.costCLP)}</td>
                      <td className="p-3 font-semibold">{row.responsible}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pie del Modal CMS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Mostrando {filteredData.length} registros en {currentTabObj.label}</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-brand-900 hover:bg-brand-800 px-5 py-2 text-xs font-extrabold text-white transition active:scale-95 cursor-pointer shadow-soft"
          >
            Cerrar Informes
          </button>
        </div>
      </div>
    </div>
  );
}
