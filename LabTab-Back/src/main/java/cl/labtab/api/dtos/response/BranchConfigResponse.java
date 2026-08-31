package cl.labtab.api.dtos.response;

import cl.labtab.api.common.OpeningHoursDTO;

import java.math.BigDecimal;
import java.util.UUID;

public record BranchConfigResponse(
        UUID id,
        String name,
        BigDecimal serviceChargePct,
        String timezone,
        OpeningHoursDTO openingHours
) {
}
