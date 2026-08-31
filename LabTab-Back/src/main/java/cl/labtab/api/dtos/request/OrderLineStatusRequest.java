package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.OrderLineStatusEnum;
import jakarta.validation.constraints.NotNull;

public record OrderLineStatusRequest(
        @NotNull OrderLineStatusEnum status
) {
}
