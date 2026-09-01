package cl.labtab.api.services;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.dtos.request.KitchenTicketStatusRequest;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.dtos.response.PageResponse;
import cl.labtab.api.dtos.response.RecallTicketResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface KitchenService {

    PageResponse<KitchenTicketResponse> getTickets(List<KitchenTicketStatusEnum> statuses, Pageable pageable);

    KitchenTicketResponse updateTicketStatus(UUID ticketId, KitchenTicketStatusRequest request);

    RecallTicketResponse recallTicket(UUID ticketId);
}
