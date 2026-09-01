package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.dtos.request.KitchenTicketStatusRequest;
import cl.labtab.api.dtos.response.KitchenTicketLineResponse;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.dtos.response.PageResponse;
import cl.labtab.api.dtos.response.RecallTicketResponse;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.KitchenTicketMapper;
import cl.labtab.api.models.KitchenTicket;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.repositories.KitchenTicketRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.KitchenService;
import cl.labtab.api.websocket.KitchenEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class KitchenServiceImpl implements KitchenService {

    private final KitchenTicketRepository kitchenTicketRepository;
    private final OrderLineRepository orderLineRepository;
    private final KitchenTicketMapper kitchenTicketMapper;
    private final KitchenEventPublisher kitchenEventPublisher;

    public KitchenServiceImpl(KitchenTicketRepository kitchenTicketRepository,
                              OrderLineRepository orderLineRepository,
                              KitchenTicketMapper kitchenTicketMapper,
                              KitchenEventPublisher kitchenEventPublisher) {
        this.kitchenTicketRepository = kitchenTicketRepository;
        this.orderLineRepository = orderLineRepository;
        this.kitchenTicketMapper = kitchenTicketMapper;
        this.kitchenEventPublisher = kitchenEventPublisher;
    }

    @Override
    public PageResponse<KitchenTicketResponse> getTickets(List<KitchenTicketStatusEnum> statuses, Pageable pageable) {
        UUID branchId = BranchContextHolder.get();
        Page<KitchenTicket> page = kitchenTicketRepository.findByBranchIdAndStatusIn(branchId, statuses, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Override
    public KitchenTicketResponse updateTicketStatus(UUID ticketId, KitchenTicketStatusRequest request) {
        UUID branchId = BranchContextHolder.get();
        KitchenTicket ticket = kitchenTicketRepository.findByIdAndBranchId(ticketId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        ticket.setStatus(request.status());
        if (request.status() == KitchenTicketStatusEnum.DONE) {
            ticket.setCompletedAt(Instant.now());
        }
        ticket = kitchenTicketRepository.save(ticket);
        if (request.status() == KitchenTicketStatusEnum.DONE) {
            kitchenEventPublisher.publishItemReady(branchId, Map.of(
                    "ticketId", ticket.getId(),
                    "tableName", ticket.getTableName(),
                    "status", "done"));
        }
        return toResponse(ticket);
    }

    @Override
    public RecallTicketResponse recallTicket(UUID ticketId) {
        UUID branchId = BranchContextHolder.get();
        KitchenTicket ticket = kitchenTicketRepository.findByIdAndBranchId(ticketId, branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));
        ticket.setStatus(KitchenTicketStatusEnum.IN_PROGRESS);
        ticket.setCompletedAt(null);
        ticket = kitchenTicketRepository.save(ticket);
        return new RecallTicketResponse(true, toResponse(ticket));
    }

    private KitchenTicketResponse toResponse(KitchenTicket ticket) {
        List<KitchenTicketLineResponse> lines = orderLineRepository
                .findByOrderIdAndBranchId(ticket.getOrderId(), ticket.getBranchId()).stream()
                .map(this::toLine)
                .toList();
        long elapsed = ticket.getStartedAt() != null
                ? Duration.between(ticket.getStartedAt(), Instant.now()).getSeconds()
                : 0;
        return kitchenTicketMapper.toResponse(ticket, lines, elapsed);
    }

    private KitchenTicketLineResponse toLine(OrderLine line) {
        return new KitchenTicketLineResponse(
                line.getId(),
                line.getName(),
                line.getQuantity(),
                line.getModifiers() != null
                        ? line.getModifiers().stream().map(m -> m.name()).toList()
                        : List.of(),
                List.of(),
                line.getCourseStatus(),
                line.getStatus());
    }
}
