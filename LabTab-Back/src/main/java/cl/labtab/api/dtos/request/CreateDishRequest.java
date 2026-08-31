package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateDishRequest(
        @NotNull UUID sectionId,
        @NotBlank String name,
        String description,
        @NotNull @PositiveOrZero BigDecimal price,
        String imageUrl,
        List<String> tags,
        List<String> allergens,
        int displayOrder
) {
}
