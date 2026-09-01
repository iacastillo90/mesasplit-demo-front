package cl.labtab.api.services.implement;

import cl.labtab.api.audit.Auditable;
import cl.labtab.api.common.enums.BillLineStatusEnum;
import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.common.enums.OrderLineStatusEnum;
import cl.labtab.api.common.enums.VoidReasonEnum;
import cl.labtab.api.dtos.request.ApplyDiscountRequest;
import cl.labtab.api.dtos.request.CreateBillRequest;
import cl.labtab.api.dtos.response.BillLineResponse;
import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.dtos.response.BillSummaryByGuestResponse;
import cl.labtab.api.dtos.response.GuestBillSummaryResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.BillLineMapper;
import cl.labtab.api.mappers.BillMapper;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.BillLine;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.repositories.BillLineRepository;
import cl.labtab.api.repositories.BillRepository;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.repositories.OrderRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.security.SecurityUtils;
import cl.labtab.api.services.BillService;
import cl.labtab.api.websocket.AlertEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements BillService {

    private final BillRepository billRepository;
    private final BillLineRepository billLineRepository;
    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final DineSessionRepository dineSessionRepository;
    private final PinValidationService pinValidationService;
    private final BillMapper billMapper;
    private final BillLineMapper billLineMapper;
    private final AlertEventPublisher alertEventPublisher;

    public BillServiceImpl(BillRepository billRepository,
                           BillLineRepository billLineRepository,
                           OrderRepository orderRepository,
                           OrderLineRepository orderLineRepository,
                           DineSessionRepository dineSessionRepository,
                           PinValidationService pinValidationService,
                           BillMapper billMapper,
                           BillLineMapper billLineMapper,
                           AlertEventPublisher alertEventPublisher) {
        this.billRepository = billRepository;
        this.billLineRepository = billLineRepository;
        this.orderRepository = orderRepository;
        this.orderLineRepository = orderLineRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.pinValidationService = pinValidationService;
        this.billMapper = billMapper;
        this.billLineMapper = billLineMapper;
        this.alertEventPublisher = alertEventPublisher;
    }

    @Override
    public List<BillResponse> getBills() {
        UUID branchId = BranchContextHolder.get();
        return billRepository.findByBranchIdAndStatus(branchId, BillStatusEnum.OPEN).stream()
                .map(billMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BillResponse createBill(CreateBillRequest request) {
        UUID branchId = BranchContextHolder.get();
        DineSession session = dineSessionRepository.findByIdAndBranchId(request.dineSessionId(), branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));

        List<UUID> orderIds = orderRepository.findByDineSessionIdAndBranchId(session.getId(), branchId).stream()
                .map(Order::getId).toList();
        List<OrderLine> lines = orderLineRepository.findByOrderIdInAndBranchId(orderIds, branchId).stream()
                .filter(l -> l.getStatus() != OrderLineStatusEnum.CANCELLED)
                .toList();

        BigDecimal subtotal = lines.stream().map(OrderLine::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Bill bill = new Bill();
        bill.setDineSessionId(session.getId());
        bill.setBranchId(branchId);
        bill.setStatus(BillStatusEnum.OPEN);
        bill.setServiceChargePct(request.serviceChargePct() != null ? request.serviceChargePct() : new BigDecimal("10.00"));
        bill.setSubtotal(subtotal);
        BigDecimal serviceCharge = subtotal.multiply(bill.getServiceChargePct().divide(BigDecimal.valueOf(100)));
        bill.setServiceChargeAmount(serviceCharge);
        bill.setTotalAmount(subtotal.add(serviceCharge));
        bill.setBalanceDue(bill.getTotalAmount());
        bill = billRepository.save(bill);

        List<BillLine> billLines = new ArrayList<>();
        for (OrderLine line : lines) {
            BillLine billLine = new BillLine();
            billLine.setBillId(bill.getId());
            billLine.setBranchId(branchId);
            billLine.setOrderLineId(line.getId());
            billLine.setDishId(line.getDishId());
            billLine.setDineGuestId(line.getDineGuestId());
            billLine.setName(line.getName());
            billLine.setQuantity(line.getQuantity());
            billLine.setUnitPrice(line.getUnitPrice());
            billLine.setLineTotal(line.getLineTotal());
            billLine.setStatus(BillLineStatusEnum.ACTIVE);
            billLines.add(billLine);
        }
        billLineRepository.saveAll(billLines);

        return billMapper.toResponse(bill);
    }

    @Override
    public BillResponse getBill(UUID billId) {
        Bill bill = billRepository.findByIdAndBranchId(billId, BranchContextHolder.get())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));
        SecurityUtils.enforceGuestSession(bill.getDineSessionId());
        return billMapper.toResponse(bill);
    }

    @Override
    public BillResponse getSessionBill(UUID sessionId) {
        SecurityUtils.enforceGuestSession(sessionId);
        Bill bill = billRepository.findByDineSessionIdAndBranchId(sessionId, BranchContextHolder.get())
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));
        return billMapper.toResponse(bill);
    }

    @Override
    public BillSummaryByGuestResponse getSummaryByGuest(UUID billId) {
        UUID branchId = BranchContextHolder.get();
        Bill bill = billRepository.findByIdAndBranchId(billId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));
        SecurityUtils.enforceGuestSession(bill.getDineSessionId());

        List<BillLine> lines = billLineRepository.findByBillIdAndBranchId(billId, branchId);

        Map<UUID, List<BillLine>> byGuest = lines.stream()
                .filter(l -> l.getDineGuestId() != null)
                .collect(Collectors.groupingBy(BillLine::getDineGuestId));

        List<GuestBillSummaryResponse> guests = byGuest.entrySet().stream()
                .map(entry -> {
                    List<BillLineResponse> guestLines = entry.getValue().stream().map(billLineMapper::toResponse).toList();
                    BigDecimal total = entry.getValue().stream().map(BillLine::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
                    BigDecimal paid = entry.getValue().stream().map(BillLine::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new GuestBillSummaryResponse(entry.getKey(), null, guestLines, total, paid, total.subtract(paid));
                })
                .toList();

        List<BillLineResponse> sharedLines = lines.stream()
                .filter(l -> l.getDineGuestId() == null)
                .map(billLineMapper::toResponse)
                .toList();

        return new BillSummaryByGuestResponse(guests, sharedLines);
    }

    @Override
    @Transactional
    @Auditable(eventType = ExceptionEventTypeEnum.MANUAL_DISCOUNT)
    public BillResponse applyDiscount(UUID billId, ApplyDiscountRequest request) {
        UUID branchId = BranchContextHolder.get();
        Bill bill = billRepository.findByIdAndBranchId(billId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta no encontrada"));

        if (!VoidReasonEnum.isValid(request.reason())) {
            throw new BusinessRuleException("REASON_INVALID", "Motivo fuera de la lista cerrada");
        }

        pinValidationService.validateManagerPin(branchId, request.managerPin());

        if (request.discountAmount().compareTo(bill.getSubtotal()) > 0) {
            throw new BusinessRuleException("DISCOUNT_EXCEEDS_SUBTOTAL", "El descuento supera el subtotal");
        }

        bill.setDiscountAmount(request.discountAmount());
        bill.setTotalAmount(bill.getTotalAmount().subtract(request.discountAmount()));
        bill.setBalanceDue(bill.getBalanceDue().subtract(request.discountAmount()));
        bill = billRepository.save(bill);

        alertEventPublisher.publishFraud(branchId, Map.of(
                "type", "manual_discount",
                "billId", bill.getId(),
                "amount", request.discountAmount(),
                "reason", request.reason()));

        return billMapper.toResponse(bill);
    }
}
