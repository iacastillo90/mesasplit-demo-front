package cl.labtab.api.dtos.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record CreateSessionRequest(
        @NotNull UUID tableId,
        @Positive int guestCount
) {
}
