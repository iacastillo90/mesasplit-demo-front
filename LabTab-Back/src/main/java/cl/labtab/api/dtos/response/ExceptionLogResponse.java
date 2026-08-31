package cl.labtab.api.dtos.response;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ExceptionLogResponse(
        UUID id,
        ExceptionEventTypeEnum eventType,
        String reason,
        BigDecimal amount,
        String personName,
        String authorizedByName,
        UUID orderId,
        String orderLineName,
        Instant createdAt
) {
}
