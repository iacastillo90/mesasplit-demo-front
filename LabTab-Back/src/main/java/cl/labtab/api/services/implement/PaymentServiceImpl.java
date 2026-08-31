package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.common.enums.PaymentStatusEnum;
import cl.labtab.api.common.enums.VoidReasonEnum;
import cl.labtab.api.dtos.request.CreatePaymentRequest;
import cl.labtab.api.dtos.request.RefundRequest;
import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.dtos.response.PaymentResponse;
import cl.labtab.api.dtos.response.RefundResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.exception.ConflictException;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.Payment;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.PaymentRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.security.SecurityUtils;
import cl.labtab.api.services.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final DineSessionRepository dineSessionRepository;
    private final PinValidationService pinValidationService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              BillRepository billRepository,
                              DineSessionRepository dineSessionRepository,
                              PinValidationService pinValidationService) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.pinValidationService = pinValidationService;
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(CreatePaymentRequest request) {
        UUID branchId = BranchContextHolder.get();

        if (request.externalTransactionId() != null) {
            paymentRepository.findByExternalTransactionId(request.externalTransactionId())
                    .ifPresent(existing -> {
                        throw new ConflictException("PAYMENT_DUPLICATE", "Pago ya procesado", existing.getId());
                    });
        }

        Bill bill = billRepository.findByIdAndBranchId(request.billId(), branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));

        if (request.amount().compareTo(bill.getBalanceDue()) > 0) {
            throw new BusinessRuleException("AMOUNT_EXCEEDS_BALANCE", "El monto supera el saldo pendiente");
        }

        Payment payment = new Payment();
        payment.setBillId(bill.getId());
        payment.setBranchId(branchId);
        payment.setPersonId(SecurityUtils.getCurrentPersonId());
        payment.setAmount(request.amount());
        payment.setTipAmount(request.tipAmount() != null ? request.tipAmount() : BigDecimal.ZERO);
        payment.setTotalAmount(request.totalAmount() != null ? request.totalAmount() : request.amount());
        payment.setMethod(request.method());
        payment.setStatus(PaymentStatusEnum.COMPLETED);
        payment.setProvider(request.provider());
        payment.setExternalTransactionId(request.externalTransactionId());
        payment.setCurrency(request.currency() != null ? request.currency() : "CLP");
        payment.setPaidAt(Instant.now());
        payment = paymentRepository.save(payment);

        bill.setPaidTotal(bill.getPaidTotal().add(request.amount()));
        bill.setBalanceDue(bill.getBalanceDue().subtract(request.amount()));

        if (bill.getBalanceDue().compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatusEnum.PAID);
            closeSession(bill.getDineSessionId(), branchId);
        }

        bill = billRepository.save(bill);

        return new PaymentResponse(
                payment.getId(),
                payment.getBillId(),
                payment.getAmount(),
                payment.getTipAmount(),
                payment.getTotalAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getPaidAt(),
                toBillResponse(bill));
    }

    @Override
    public PaymentResponse getPayment(UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndBranchId(paymentId, BranchContextHolder.get())
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));
        Bill bill = billRepository.findById(payment.getBillId()).orElse(null);
        return new PaymentResponse(
                payment.getId(),
                payment.getBillId(),
                payment.getAmount(),
                payment.getTipAmount(),
                payment.getTotalAmount(),
                payment.getMethod(),
                payment.getStatus(),
                payment.getPaidAt(),
                bill != null ? toBillResponse(bill) : null);
    }

    @Override
    @Transactional
    public RefundResponse refund(UUID paymentId, RefundRequest request) {
        UUID branchId = BranchContextHolder.get();
        Payment payment = paymentRepository.findByIdAndBranchId(paymentId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        if (!VoidReasonEnum.isValid(request.reason())) {
            throw new BusinessRuleException("REASON_INVALID", "Motivo fuera de la lista cerrada");
        }

        pinValidationService.validateManagerPin(branchId, request.managerPin());

        payment.setStatus(PaymentStatusEnum.REFUNDED);
        paymentRepository.save(payment);

        return new RefundResponse(true, payment.getTotalAmount());
    }

    private void closeSession(UUID sessionId, UUID branchId) {
        dineSessionRepository.findByIdAndBranchId(sessionId, branchId)
                .ifPresent(session -> {
                    session.setStatus(DineSessionStatusEnum.CLOSED);
                    session.setEndedAt(Instant.now());
                    dineSessionRepository.save(session);
                });
    }

    private BillResponse toBillResponse(Bill bill) {
        return new BillResponse(
                bill.getId(),
                bill.getDineSessionId(),
                bill.getStatus(),
                bill.getSubtotal(),
                bill.getServiceChargeAmount(),
                bill.getTipTotal(),
                bill.getTotalAmount(),
                bill.getPaidTotal(),
                bill.getBalanceDue(),
                bill.getVersion());
    }
}
