package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.ApplyDiscountRequest;
import cl.labtab.api.dtos.request.CreateBillRequest;
import cl.labtab.api.dtos.response.BillResponse;
import cl.labtab.api.dtos.response.BillSummaryByGuestResponse;
import cl.labtab.api.services.BillService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Cuentas", description = "Cuentas, división por comensal y descuentos con PIN.")
@RestController
@RequestMapping("/api/v1")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/bills")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<BillResponse>> createBill(@Valid @RequestBody CreateBillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.of(billService.createBill(request)));
    }

    @GetMapping("/bills/{billId}")
    public ApiResponse<BillResponse> getBill(@PathVariable UUID billId) {
        return ApiResponse.of(billService.getBill(billId));
    }

    @GetMapping("/sessions/{sessionId}/bill")
    public ApiResponse<BillResponse> getSessionBill(@PathVariable UUID sessionId) {
        return ApiResponse.of(billService.getSessionBill(sessionId));
    }

    @GetMapping("/bills/{billId}/summary-by-guest")
    public ApiResponse<BillSummaryByGuestResponse> getSummaryByGuest(@PathVariable UUID billId) {
        return ApiResponse.of(billService.getSummaryByGuest(billId));
    }

    @PatchMapping("/bills/{billId}/apply-discount")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER')")
    public ApiResponse<BillResponse> applyDiscount(@PathVariable UUID billId, @Valid @RequestBody ApplyDiscountRequest request) {
        return ApiResponse.of(billService.applyDiscount(billId, request));
    }
}
