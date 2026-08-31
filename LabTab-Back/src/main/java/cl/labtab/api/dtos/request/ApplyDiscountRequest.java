package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ApplyDiscountRequest(
        @NotNull @Positive BigDecimal discountAmount,
        @NotBlank String reason,
        @NotBlank String managerPin
) {
}
