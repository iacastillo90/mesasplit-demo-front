package cl.labtab.api.dtos.response;

import java.math.BigDecimal;
import java.util.UUID;

public record BillLineResponse(
        UUID billLineId,
        String name,
        int quantity,
        BigDecimal lineTotal,
        BigDecimal paidAmount
) {
}
