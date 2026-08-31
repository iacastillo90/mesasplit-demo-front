package cl.labtab.api.services;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.dtos.response.ExceptionLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;

public interface ExceptionLogService {

    Page<ExceptionLogResponse> list(Instant from, Instant to, ExceptionEventTypeEnum eventType, Pageable pageable);
}
