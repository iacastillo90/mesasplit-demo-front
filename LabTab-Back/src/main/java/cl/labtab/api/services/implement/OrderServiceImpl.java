package cl.labtab.api.services.implement;

import cl.labtab.api.audit.Auditable;
import cl.labtab.api.common.enums.CourseStatusEnum;
import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.common.enums.OrderLineStatusEnum;
import cl.labtab.api.common.enums.OrderStatusEnum;
import cl.labtab.api.common.enums.VoidReasonEnum;
import cl.labtab.api.dtos.request.CreateOrderLineRequest;
import cl.labtab.api.dtos.request.CreateOrderRequest;
import cl.labtab.api.dtos.request.FireCourseRequest;
import cl.labtab.api.dtos.request.OrderLineStatusRequest;
import cl.labtab.api.dtos.request.VoidOrderLineRequest;
import cl.labtab.api.dtos.response.FireCourseResponse;
import cl.labtab.api.dtos.response.OrderLineResponse;
import cl.labtab.api.dtos.response.OrderResponse;
import cl.labtab.api.dtos.response.VoidOrderLineResponse;
import cl.labtab.api.exception.BusinessRuleException;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.OrderLineMapper;
import cl.labtab.api.mappers.OrderMapper;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.KitchenTicket;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.repositories.DineSessionRepository;
import cl.labtab.api.repositories.DiningTableRepository;
import cl.labtab.api.repositories.DishRepository;
import cl.labtab.api.repositories.KitchenTicketRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.repositories.OrderRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.security.SecurityUtils;
import cl.labtab.api.services.OrderService;
import cl.labtab.api.websocket.AlertEventPublisher;
import cl.labtab.api.websocket.KitchenEventPublisher;
import cl.labtab.api.websocket.OrderEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderLineRepository orderLineRepository;
    private final DishRepository dishRepository;
    private final DineSessionRepository dineSessionRepository;
    private final DiningTableRepository diningTableRepository;
    private final KitchenTicketRepository kitchenTicketRepository;
    private final PinValidationService pinValidationService;
    private final OrderMapper orderMapper;
    private final OrderLineMapper orderLineMapper;
    private final OrderEventPublisher orderEventPublisher;
    private final KitchenEventPublisher kitchenEventPublisher;
    private final AlertEventPublisher alertEventPublisher;

    public OrderServiceImpl(OrderRepository orderRepository,
                            OrderLineRepository orderLineRepository,
                            DishRepository dishRepository,
                            DineSessionRepository dineSessionRepository,
                            DiningTableRepository diningTableRepository,
                            KitchenTicketRepository kitchenTicketRepository,
                            PinValidationService pinValidationService,
                            OrderMapper orderMapper,
                            OrderLineMapper orderLineMapper,
                            OrderEventPublisher orderEventPublisher,
                            KitchenEventPublisher kitchenEventPublisher,
                            AlertEventPublisher alertEventPublisher) {
        this.orderRepository = orderRepository;
        this.orderLineRepository = orderLineRepository;
        this.dishRepository = dishRepository;
        this.dineSessionRepository = dineSessionRepository;
        this.diningTableRepository = diningTableRepository;
        this.kitchenTicketRepository = kitchenTicketRepository;
        this.pinValidationService = pinValidationService;
        this.orderMapper = orderMapper;
        this.orderLineMapper = orderLineMapper;
        this.orderEventPublisher = orderEventPublisher;
        this.kitchenEventPublisher = kitchenEventPublisher;
        this.alertEventPublisher = alertEventPublisher;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        UUID branchId = BranchContextHolder.get();
        SecurityUtils.enforceGuestSession(request.dineSessionId());
        DineSession session = dineSessionRepository.findByIdAndBranchId(request.dineSessionId(), branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión no encontrada"));

        if (session.getStatus() != DineSessionStatusEnum.OPEN) {
            throw new BusinessRuleException("SESSION_CLOSED", "La sesión está cerrada");
        }

        Order order = new Order();
        order.setBranchId(branchId);
        order.setDineSessionId(session.getId());
        order.setPersonId(SecurityUtils.getCurrentPersonId());
        order.setStatus(OrderStatusEnum.PLACED);
        order.setChannel(request.channel() != null ? request.channel() : "staff");
        order.setNotes(request.notes());
        order = orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        int itemCount = 0;
        List<OrderLineResponse> lineResponses = new ArrayList<>();

        for (CreateOrderLineRequest lineReq : request.lines()) {
            Dish dish = dishRepository.findByIdAndBranchId(lineReq.dishId(), branchId)
                    .orElseThrow(() -> new ResourceNotFoundException("Plato no encontrado"));
            if (!dish.isAvailable()) {
                throw new BusinessRuleException("DISH_UNAVAILABLE", "Plato no disponible (Lista 86)");
            }

            OrderLine line = new OrderLine();
            line.setOrderId(order.getId());
            line.setBranchId(branchId);
            line.setDishId(dish.getId());
            line.setName(dish.getName());
            line.setUnitPrice(dish.getPrice());
            line.setQuantity(lineReq.quantity());
            line.setLineTotal(dish.getPrice().multiply(BigDecimal.valueOf(lineReq.quantity())));
            line.setItemNotes(lineReq.itemNotes());
            line.setModifiers(lineReq.modifiers());
            line.setStatus(OrderLineStatusEnum.QUEUED);
            line.setDineGuestId(lineReq.dineGuestId());
            line.setCourseType(lineReq.courseType());
            line = orderLineRepository.save(line);

            subtotal = subtotal.add(line.getLineTotal());
            itemCount += lineReq.quantity();
            lineResponses.add(orderLineMapper.toResponse(line));
        }

        order.setSubtotal(subtotal);
        order.setTotal(subtotal);
        order.setItemCount(itemCount);
        order = orderRepository.save(order);

        DiningTable table = diningTableRepository.findById(session.getTableId()).orElse(null);
        KitchenTicket ticket = new KitchenTicket();
        ticket.setOrderId(order.getId());
        ticket.setBranchId(branchId);
        ticket.setTableName(table != null ? table.getName() : "Mesa");
        ticket.setStatus(KitchenTicketStatusEnum.OPEN);
        ticket.setItemsSummary(itemCount + " ítems");
        ticket = kitchenTicketRepository.save(ticket);

        orderEventPublisher.publishItemAdded(branchId, Map.of(
                "orderId", order.getId(),
                "tableName", ticket.getTableName(),
                "itemsSummary", ticket.getItemsSummary()));

        return orderMapper.toResponse(order, lineResponses, ticket.getId());
    }

    @Override
    public OrderResponse getOrder(UUID orderId) {
        UUID branchId = BranchContextHolder.get();
        Order order = orderRepository.findByIdAndBranchId(orderId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));
        List<OrderLineResponse> lines = orderLineRepository.findByOrderIdAndBranchId(orderId, branchId).stream()
                .map(orderLineMapper::toResponse).toList();
        return orderMapper.toResponse(order, lines, null);
    }

    @Override
    public List<OrderResponse> getSessionOrders(UUID sessionId) {
        UUID branchId = BranchContextHolder.get();
        SecurityUtils.enforceGuestSession(sessionId);
        List<Order> orders = orderRepository.findByDineSessionIdAndBranchId(sessionId, branchId);
        List<UUID> orderIds = orders.stream().map(Order::getId).toList();
        List<OrderLine> lines = orderLineRepository.findByOrderIdInAndBranchId(orderIds, branchId);

        return orders.stream().map(order -> orderMapper.toResponse(
                order,
                lines.stream().filter(l -> l.getOrderId().equals(order.getId())).map(orderLineMapper::toResponse).toList(),
                null)).toList();
    }

    @Override
    public OrderLineResponse updateOrderLineStatus(UUID orderLineId, OrderLineStatusRequest request) {
        UUID branchId = BranchContextHolder.get();
        OrderLine line = orderLineRepository.findByIdAndBranchId(orderLineId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Línea no encontrada"));
        line.setStatus(request.status());
        line = orderLineRepository.save(line);
        if (request.status() == OrderLineStatusEnum.READY) {
            kitchenEventPublisher.publishItemReady(branchId, Map.of(
                    "orderId", line.getOrderId(),
                    "itemId", line.getId(),
                    "status", "ready"));
        }
        return orderLineMapper.toResponse(line);
    }

    @Override
    @Transactional
    @Auditable(eventType = ExceptionEventTypeEnum.ITEM_VOID_AFTER_KITCHEN)
    public VoidOrderLineResponse voidOrderLine(UUID orderLineId, VoidOrderLineRequest request) {
        UUID branchId = BranchContextHolder.get();
        OrderLine line = orderLineRepository.findByIdAndBranchId(orderLineId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Línea no encontrada"));

        if (!VoidReasonEnum.isValid(request.reason())) {
            throw new BusinessRuleException("REASON_INVALID", "Motivo fuera de la lista cerrada");
        }

        boolean sentToKitchen = line.getStatus() == OrderLineStatusEnum.PREPARING
                || line.getStatus() == OrderLineStatusEnum.READY
                || line.getStatus() == OrderLineStatusEnum.SERVED;
        if (sentToKitchen) {
            pinValidationService.validateManagerPin(branchId, request.managerPin());
        }

        line.setStatus(OrderLineStatusEnum.CANCELLED);
        orderLineRepository.save(line);

        alertEventPublisher.publishFraud(branchId, Map.of(
                "type", "item_void_after_kitchen",
                "orderLineId", line.getId(),
                "reason", request.reason()));

        return new VoidOrderLineResponse(true, null);
    }

    @Override
    @Transactional
    public FireCourseResponse fireCourse(UUID orderId, FireCourseRequest request) {
        UUID branchId = BranchContextHolder.get();
        orderRepository.findByIdAndBranchId(orderId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        List<OrderLine> lines = orderLineRepository.findByOrderIdAndBranchId(orderId, branchId);
        lines.stream()
                .filter(l -> l.getCourseType() == request.courseType())
                .forEach(l -> {
                    l.setCourseStatus(CourseStatusEnum.MARCHING);
                    orderLineRepository.save(l);
                });

        kitchenTicketRepository.findByOrderIdAndBranchId(orderId, branchId)
                .ifPresent(t -> {
                    t.setStatus(KitchenTicketStatusEnum.IN_PROGRESS);
                    kitchenTicketRepository.save(t);
                });

        orderEventPublisher.publishCourseFire(branchId, Map.of(
                "orderId", orderId,
                "courseType", request.courseType()));

        return new FireCourseResponse(true);
    }
}
