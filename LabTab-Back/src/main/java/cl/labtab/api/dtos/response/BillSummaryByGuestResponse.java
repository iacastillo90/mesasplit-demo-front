package cl.labtab.api.dtos.response;

import java.util.List;

public record BillSummaryByGuestResponse(
        List<GuestBillSummaryResponse> guests,
        List<BillLineResponse> sharedLines
) {
}
