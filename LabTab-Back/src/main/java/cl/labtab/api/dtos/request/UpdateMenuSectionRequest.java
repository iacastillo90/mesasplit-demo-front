package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record UpdateMenuSectionRequest(
        @NotBlank String name,
        String description,
        int displayOrder
) {
}
