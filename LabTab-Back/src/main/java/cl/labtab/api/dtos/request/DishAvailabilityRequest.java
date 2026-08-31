package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotNull;

public record DishAvailabilityRequest(
        @NotNull Boolean isAvailable,
        int remainingUnits
) {
}
