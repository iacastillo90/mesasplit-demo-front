package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;

public record UpdateDishRequest(
        @NotBlank String name,
        String description,
        @PositiveOrZero BigDecimal price,
        String imageUrl,
        Boolean isAvailable,
        List<String> tags,
        List<String> allergens,
        int displayOrder
) {
}
