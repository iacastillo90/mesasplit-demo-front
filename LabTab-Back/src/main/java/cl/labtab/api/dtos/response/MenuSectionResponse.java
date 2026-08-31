package cl.labtab.api.dtos.response;

import java.util.List;
import java.util.UUID;

public record MenuSectionResponse(
        UUID id,
        String name,
        String description,
        int displayOrder,
        List<DishResponse> dishes
) {
}
