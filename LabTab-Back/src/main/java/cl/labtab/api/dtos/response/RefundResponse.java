package cl.labtab.api.dtos.response;

import java.math.BigDecimal;

public record RefundResponse(
        boolean refunded,
        BigDecimal refundAmount
) {
}
