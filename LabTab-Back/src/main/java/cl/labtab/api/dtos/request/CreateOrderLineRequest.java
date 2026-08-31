package cl.labtab.api.dtos.request;

import cl.labtab.api.common.ModifierOption;
import cl.labtab.api.common.enums.CourseTypeEnum;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderLineRequest(
        @NotNull UUID dishId,
        @Positive int quantity,
        @NotNull @PositiveOrZero BigDecimal unitPrice,
        String itemNotes,
        List<ModifierOption> modifiers,
        CourseTypeEnum courseType,
        UUID dineGuestId
) {
}
