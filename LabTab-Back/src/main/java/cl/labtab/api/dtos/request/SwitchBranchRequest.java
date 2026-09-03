package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SwitchBranchRequest(
        @NotNull UUID branchId
) {
}
