package cl.labtab.api.services.implement;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.dtos.request.KitchenTicketStatusRequest;
import cl.labtab.api.dtos.response.KitchenTicketLineResponse;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.dtos.response.RecallTicketResponse;
import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.mappers.KitchenTicketMapper;
import cl.labtab.api.models.KitchenTicket;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.repositories.KitchenTicketRepository;
import cl.labtab.api.repositories.OrderLineRepository;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.KitchenService;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
public class KitchenServiceImpl implements KitchenService {

    private final KitchenTicketRepository kitchenTicketRepository;
    private final OrderLineRepository orderLineRepository;
    private final KitchenTicketMapper kitchenTicketMapper;

    public KitchenServiceImpl(KitchenTicketRepository kitchenTicketRepository,
                              OrderLineRepository orderLineRepository,
                              KitchenTicketMapper kitchenTicketMapper) {
        this.kitchenTicketRepository = kitchenTicketRepository;
        this.orderLineRepository = orderLineRepository;
        this.kitchenTicketMapper = kitchenTicketMapper;
    }

    @Override
    public List<KitchenTicketResponse> getTickets(Collection<KitchenTicketStatusEnum> statuses) {
        UUID branchId = BranchContextHolder.get();
        return kitchenTicketRepository.findByBranchIdAndStatusIn(branchId, statuses).stream()
                .map(this::toResponse)
                .toList();
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
