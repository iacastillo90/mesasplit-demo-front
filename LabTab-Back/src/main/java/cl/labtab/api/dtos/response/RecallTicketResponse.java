package cl.labtab.api.dtos.response;

public record RecallTicketResponse(
        boolean recalled,
        KitchenTicketResponse ticket
) {
}
