package cl.labtab.api.services;

import cl.labtab.api.dtos.request.CreatePaymentRequest;
import cl.labtab.api.dtos.request.RefundRequest;
import cl.labtab.api.dtos.response.PaymentResponse;
import cl.labtab.api.dtos.response.RefundResponse;

import java.util.UUID;

public interface PaymentService {

    PaymentResponse processPayment(CreatePaymentRequest request);

    PaymentResponse getPayment(UUID paymentId);

    RefundResponse refund(UUID paymentId, RefundRequest request);
}
