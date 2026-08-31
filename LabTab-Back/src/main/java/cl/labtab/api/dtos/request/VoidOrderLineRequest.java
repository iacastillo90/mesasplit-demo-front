package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record VoidOrderLineRequest(
        @NotBlank String reason,
        @NotBlank String managerPin
) {
}
