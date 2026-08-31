package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record GuestSessionRequest(
        @NotBlank String qrToken,
        String displayName,
        List<String> allergies
) {
}
