package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.DineSessionStatusEnum;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SessionResponse(
        UUID id,
        UUID tableId,
        String tableName,
        DineSessionStatusEnum status,
        int guestCount,
        UUID openedBy,
        Instant startedAt,
        Instant endedAt,
        List<GuestResponse> guests,
        UUID activeBillId
) {
}
