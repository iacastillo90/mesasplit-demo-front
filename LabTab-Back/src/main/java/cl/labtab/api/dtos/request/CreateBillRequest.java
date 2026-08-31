package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateBillRequest(
        @NotNull UUID dineSessionId,
        @PositiveOrZero BigDecimal serviceChargePct
) {
}
