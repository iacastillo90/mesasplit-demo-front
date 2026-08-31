package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.dtos.request.KitchenTicketStatusRequest;
import cl.labtab.api.dtos.response.KitchenTicketResponse;
import cl.labtab.api.dtos.response.RecallTicketResponse;
import cl.labtab.api.services.KitchenService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/kitchen")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF','KITCHEN')")
    public ApiResponse<List<KitchenTicketResponse>> getTickets(@RequestParam(required = false) Collection<KitchenTicketStatusEnum> status) {
        Collection<KitchenTicketStatusEnum> statuses = (status != null && !status.isEmpty())
                ? status
                : List.of(KitchenTicketStatusEnum.OPEN, KitchenTicketStatusEnum.IN_PROGRESS);
        return ApiResponse.of(kitchenService.getTickets(statuses));
    }

    @PatchMapping("/tickets/{ticketId}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','KITCHEN')")
    public ApiResponse<KitchenTicketResponse> updateStatus(@PathVariable UUID ticketId, @Valid @RequestBody KitchenTicketStatusRequest request) {
        return ApiResponse.of(kitchenService.updateTicketStatus(ticketId, request));
    }

    @PostMapping("/tickets/{ticketId}/recall")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','KITCHEN')")
    public ApiResponse<RecallTicketResponse> recall(@PathVariable UUID ticketId) {
        return ApiResponse.of(kitchenService.recallTicket(ticketId));
    }
}
