package cl.labtab.api.services;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.dtos.response.ExceptionLogResponse;
import cl.labtab.api.dtos.response.PageResponse;
import cl.labtab.api.models.ExceptionLog;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public interface ExceptionLogService {

    PageResponse<ExceptionLogResponse> list(Instant from, Instant to, ExceptionEventTypeEnum eventType, Pageable pageable);

    ExceptionLog createLog(ExceptionEventTypeEnum eventType, String reason, BigDecimal amount, UUID orderLineId, UUID authorizedBy);

    void logFailedPin(UUID branchId);
}
