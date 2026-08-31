package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.PaymentMethodEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID billId,
        @NotNull @Positive BigDecimal amount,
        @PositiveOrZero BigDecimal tipAmount,
        @NotNull @Positive BigDecimal totalAmount,
        @NotNull PaymentMethodEnum method,
        String provider,
        String externalTransactionId,
        String currency,
        UUID dineGuestId
) {
}
