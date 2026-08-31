package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record KitchenTicketResponse(
        UUID id,
        UUID orderId,
        String tableName,
        KitchenTicketStatusEnum status,
        String priority,
        String itemsSummary,
        Instant startedAt,
        long elapsedSeconds,
        List<KitchenTicketLineResponse> lines
) {
}
