package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;

public record CreateMenuSectionRequest(
        @NotBlank String name,
        String description,
        int displayOrder
) {
}
