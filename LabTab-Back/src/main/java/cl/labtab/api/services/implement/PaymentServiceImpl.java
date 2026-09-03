package cl.labtab.api.services.implement;

import cl.labtab.api.audit.Auditable;
import cl.labtab.api.common.BranchScoping;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.common.enums.PaymentStatusEnum;
import cl.labtab.api.common.enums.VoidReasonEnum;
import cl.labtab.api.dtos.request.CreatePaymentRequest;
import cl.labtab.api.dtos.request.RefundRequest;
import cl.labtab.api.dtos.response.PaymentResponse;
import cl.labtab.api.dtos.response.RefundResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.exception.ConflictException;
import cl.labtab.api.mappers.BillMapper;
import cl.labtab.api.mappers.PaymentMapper;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.Payment;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.PaymentRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.security.SecurityUtils;
import cl.labtab.api.services.PaymentService;
import cl.labtab.api.websocket.AlertEventPublisher;
import cl.labtab.api.websocket.PaymentEventPublisher;
import cl.labtab.api.websocket.TableEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final DineSessionRepository dineSessionRepository;
    private final PinValidationService pinValidationService;
    private final PaymentMapper paymentMapper;
    private final BillMapper billMapper;
    private final PaymentEventPublisher paymentEventPublisher;
    private final TableEventPublisher tableEventPublisher;
    private final AlertEventPublisher alertEventPublisher;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
                              BillRepository billRepository,
                              DineSessionRepository dineSessionRepository,
                              PinValidationService pinValidationService,
                              PaymentMapper paymentMapper,
                              BillMapper billMapper,
                              PaymentEventPublisher paymentEventPublisher,
                              TableEventPublisher tableEventPublisher,
                              AlertEventPublisher alertEventPublisher) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.pinValidationService = pinValidationService;
        this.paymentMapper = paymentMapper;
        this.billMapper = billMapper;
        this.paymentEventPublisher = paymentEventPublisher;
        this.tableEventPublisher = tableEventPublisher;
        this.alertEventPublisher = alertEventPublisher;
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

        Bill bill = BranchScoping.find(billRepository::findByIdAndBranchId, request.billId(), branchId, "Cuenta no encontrada");
        SecurityUtils.enforceGuestSession(bill.getDineSessionId());

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

        bill.applyPayment(request.amount());
        if (bill.isFullyPaid()) {
            closeSession(bill.getDineSessionId(), branchId);
        }

        bill = billRepository.save(bill);

        paymentEventPublisher.publishQrReceived(branchId, Map.of(
                "paymentId", payment.getId(),
                "amount", payment.getAmount(),
                "method", payment.getMethod().name(),
                "status", payment.getStatus().name()));

        return paymentMapper.toResponse(payment, billMapper.toResponse(bill));
    }

    @Override
    public PaymentResponse getPayment(UUID paymentId) {
        Payment payment = BranchScoping.find(paymentRepository::findByIdAndBranchId, paymentId, BranchContextHolder.get(), "Pago no encontrado");
        Bill bill = billRepository.findById(payment.getBillId()).orElse(null);
        return paymentMapper.toResponse(payment, bill != null ? billMapper.toResponse(bill) : null);
    }

    @Override
    @Transactional
    @Auditable(eventType = ExceptionEventTypeEnum.REFUND_ISSUED)
    public RefundResponse refund(UUID paymentId, RefundRequest request) {
        UUID branchId = BranchContextHolder.get();
        Payment payment = BranchScoping.find(paymentRepository::findByIdAndBranchId, paymentId, branchId, "Pago no encontrado");

        if (!VoidReasonEnum.isValid(request.reason())) {
            throw new BusinessRuleException("REASON_INVALID", "Motivo fuera de la lista cerrada");
        }

        pinValidationService.validateManagerPin(branchId, request.managerPin());

        payment.setStatus(PaymentStatusEnum.REFUNDED);
        paymentRepository.save(payment);

        alertEventPublisher.publishFraud(branchId, Map.of(
                "type", "refund_issued",
                "paymentId", payment.getId(),
                "amount", payment.getTotalAmount(),
                "reason", request.reason()));

        return new RefundResponse(true, payment.getTotalAmount());
    }

    private void closeSession(UUID sessionId, UUID branchId) {
        dineSessionRepository.findByIdAndBranchId(sessionId, branchId)
                .ifPresent(session -> {
                    session.setStatus(DineSessionStatusEnum.CLOSED);
                    session.setEndedAt(Instant.now());
                    dineSessionRepository.save(session);
                    tableEventPublisher.publishStatusChanged(branchId, Map.of(
                            "tableId", session.getTableId(),
                            "status", "free"));
                });
    }
}
