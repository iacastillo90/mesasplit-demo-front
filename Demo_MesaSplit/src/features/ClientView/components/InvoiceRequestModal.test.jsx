// src/features/ClientView/components/InvoiceRequestModal.test.jsx — suite de tests de solicitud de factura (client-factura)
// Cubre el spec client-factura: RUT válido ("12.345.678-5") confirma solicitud sin alterar el carrito o emitir CAF;
// RUT inválido ("12.345.678-9") muestra mensaje de error y no confirma la solicitud; modal no expone giro/razón social/folio.
// Cumple estrictamente con las reglas de AGENTS.md (comentarios en español por cada línea).

// API de Vitest importada explícitamente.
import { beforeEach, describe, expect, it } from 'vitest';
// Testing Library: renderizado y simulación de eventos.
import { fireEvent, render, screen } from '@testing-library/react';
// Store de la Mesa Virtual para asertar inmutabilidad del carrito.
import { useClientStore } from '../store/useClientStore.js';
// Componente InvoiceRequestModal.
import InvoiceRequestModal from './InvoiceRequestModal.jsx';

describe('client-factura: Solicitud de factura demo en Mesa Virtual', () => {
  beforeEach(() => {
    // Restablece el store de la Mesa Virtual antes de cada prueba.
    useClientStore.getState().resetDemo();
  });

  it('Scenario 1: RUT válido ("12.345.678-5") confirma solicitud y mantiene el carrito intacto', async () => {
    // Carga un ítem en el carrito para verificar inmutabilidad.
    useClientStore.setState({ cart: [{ id: 'p1', name: 'Hamburguesa', price: 8500, qty: 1 }] });
    const initialCart = useClientStore.getState().cart;

    // Renderiza el modal de solicitud de factura abierto con total de $8.500.
    render(<InvoiceRequestModal open={true} totalAmount={8500} onClose={() => {}} />);

    // Ingresa un RUT chileno válido.
    const rutInput = screen.getByLabelText(/RUT/i);
    fireEvent.change(rutInput, { target: { value: '12.345.678-5' } });

    // Presiona el botón de envío.
    const submitBtn = screen.getByRole('button', { name: /Solicitar Factura/i });
    fireEvent.click(submitBtn);

    // Debe mostrar la pantalla/mensaje de éxito "Solicitud enviada".
    expect(await screen.findByText(/Solicitud enviada/i)).toBeInTheDocument();

    // El carrito permanece exactamente igual (sin mutaciones).
    expect(useClientStore.getState().cart).toEqual(initialCart);
  });

  it('Scenario 2: RUT inválido ("12.345.678-9") muestra error y no confirma la solicitud', async () => {
    render(<InvoiceRequestModal open={true} totalAmount={12000} onClose={() => {}} />);

    // Ingresa un RUT con digito verificador erróneo.
    const rutInput = screen.getByLabelText(/RUT/i);
    fireEvent.change(rutInput, { target: { value: '12.345.678-9' } });

    // Intenta enviar la solicitud.
    const submitBtn = screen.getByRole('button', { name: /Solicitar Factura/i });
    fireEvent.click(submitBtn);

    // Muestra mensaje de error en pantalla.
    expect(await screen.findByText(/RUT inválido/i)).toBeInTheDocument();
    // No debe mostrar el mensaje de confirmación exitosa.
    expect(screen.queryByText(/Solicitud enviada/i)).not.toBeInTheDocument();
  });

  it('Scenario 3: Modal simplificado no expone campos de giro, razón social ni folios DTE', () => {
    render(<InvoiceRequestModal open={true} totalAmount={5000} onClose={() => {}} />);

    // No debe incluir inputs para giro, razón social ni folio CAF.
    expect(screen.queryByLabelText(/Giro/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Razón Social/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Folio/i)).not.toBeInTheDocument();
  });
});
