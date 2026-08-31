package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.PaymentMethodEnum;
import cl.labtab.api.common.enums.PaymentStatusEnum;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID billId,
        BigDecimal amount,
        BigDecimal tipAmount,
        BigDecimal totalAmount,
        PaymentMethodEnum method,
        PaymentStatusEnum status,
        Instant paidAt,
        BillResponse bill
) {
}
