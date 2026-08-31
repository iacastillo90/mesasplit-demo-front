package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record RefundRequest(
        @NotBlank String reason,
        @NotBlank String managerPin
) {
}
