package cl.labtab.api.dtos.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record GuestBillSummaryResponse(
        UUID guestId,
        String displayName,
        List<BillLineResponse> lines,
        BigDecimal guestTotal,
        BigDecimal guestPaid,
        BigDecimal guestBalance
) {
}
