package cl.labtab.api.controllers;

import cl.labtab.api.common.ApiResponse;
import cl.labtab.api.dtos.request.TableStatusRequest;
import cl.labtab.api.dtos.response.BranchConfigResponse;
import cl.labtab.api.dtos.response.DiningFloorResponse;
import cl.labtab.api.dtos.response.DiningTableResponse;
import cl.labtab.api.services.BranchService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Sucursal", description = "Configuración, pisos y mesas de la sucursal.")
@RestController
@RequestMapping("/api/v1/branch")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping("/config")
    public ApiResponse<BranchConfigResponse> getConfig() {
        return ApiResponse.of(branchService.getConfig());
    }

    @GetMapping("/floors")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<List<DiningFloorResponse>> getFloors() {
        return ApiResponse.of(branchService.getFloors());
    }

    @GetMapping("/tables")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<List<DiningTableResponse>> getTables() {
        return ApiResponse.of(branchService.getTables());
    }

    @PatchMapping("/tables/{tableId}/status")
    @PreAuthorize("hasAnyRole('SUPERADMIN','OWNER','MANAGER','STAFF')")
    public ApiResponse<DiningTableResponse> updateTableStatus(@PathVariable UUID tableId, @Valid @RequestBody TableStatusRequest request) {
        return ApiResponse.of(branchService.updateTableStatus(tableId, request));
    }
}
