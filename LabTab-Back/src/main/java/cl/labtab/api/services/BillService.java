package cl.labtab.api.services;

import cl.labtab.api.dtos.request.ApplyDiscountRequest;
import cl.labtab.api.dtos.request.CreateBillRequest;
import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.dtos.response.BillSummaryByGuestResponse;
import cl.labtab.api.dtos.response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface BillService {

    PageResponse<BillResponse> getBills(Pageable pageable);

    BillResponse createBill(CreateBillRequest request);

    BillResponse getBill(UUID billId);

    BillResponse getSessionBill(UUID sessionId);

    BillSummaryByGuestResponse getSummaryByGuest(UUID billId);

    BillResponse applyDiscount(UUID billId, ApplyDiscountRequest request);
}
