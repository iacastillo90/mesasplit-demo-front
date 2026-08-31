package cl.labtab.api.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        @NotNull UUID dineSessionId,
        String channel,
        String notes,
        @NotEmpty List<@Valid CreateOrderLineRequest> lines
) {
}
