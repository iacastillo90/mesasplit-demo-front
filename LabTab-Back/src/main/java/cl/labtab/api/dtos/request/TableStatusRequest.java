package cl.labtab.api.dtos.request;

import cl.labtab.api.common.enums.TableStatusEnum;
import jakarta.validation.constraints.NotNull;

public record TableStatusRequest(
        @NotNull TableStatusEnum status
) {
}
