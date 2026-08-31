package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.CreatePaymentRequest;
import cl.labtab.api.dtos.request.RefundRequest;
import cl.labtab.api.dtos.response.PaymentResponse;
import cl.labtab.api.dtos.response.RefundResponse;
import cl.labtab.api.services.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','GUEST')")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(paymentService.processPayment(request)));
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<PaymentResponse> getPayment(@PathVariable UUID paymentId) {
        return ApiResponse.of(paymentService.getPayment(paymentId));
    }

    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ApiResponse<RefundResponse> refund(@PathVariable UUID paymentId, @Valid @RequestBody RefundRequest request) {
        return ApiResponse.of(paymentService.refund(paymentId, request));
    }
}
