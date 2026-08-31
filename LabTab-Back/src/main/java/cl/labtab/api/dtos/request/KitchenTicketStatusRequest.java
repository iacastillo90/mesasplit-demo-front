package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import jakarta.validation.constraints.NotNull;

public record KitchenTicketStatusRequest(
        @NotNull KitchenTicketStatusEnum status
) {
}
