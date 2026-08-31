package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.BillStatusEnum;

import java.math.BigDecimal;
import java.util.UUID;

public record BillResponse(
        UUID id,
        UUID dineSessionId,
        BillStatusEnum status,
        BigDecimal subtotal,
        BigDecimal serviceChargeAmount,
        BigDecimal tipTotal,
        BigDecimal totalAmount,
        BigDecimal paidTotal,
        BigDecimal balanceDue,
        Long version
) {
}
