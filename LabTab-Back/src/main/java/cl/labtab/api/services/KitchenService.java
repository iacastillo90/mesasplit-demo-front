package cl.labtab.api.services;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.dtos.request.KitchenTicketStatusRequest;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.dtos.response.RecallTicketResponse;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface KitchenService {

    List<KitchenTicketResponse> getTickets(Collection<KitchenTicketStatusEnum> statuses);

    KitchenTicketResponse updateTicketStatus(UUID ticketId, KitchenTicketStatusRequest request);

    RecallTicketResponse recallTicket(UUID ticketId);
}
