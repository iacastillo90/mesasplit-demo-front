package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.DineSessionStatusEnum;
import jakarta.validation.constraints.NotNull;

public record SessionStatusRequest(
        @NotNull DineSessionStatusEnum status
) {
}
