package cl.labtab.api.dtos.response;

import java.util.UUID;

public record BranchOptionResponse(UUID branchId, String branchName, String role) {
}
