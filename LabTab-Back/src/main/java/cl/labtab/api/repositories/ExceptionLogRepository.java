package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.models.ExceptionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface ExceptionLogRepository extends JpaRepository<ExceptionLog, UUID> {

    Page<ExceptionLog> findByBranchId(UUID branchId, Pageable pageable);

    Page<ExceptionLog> findByBranchIdAndEventType(UUID branchId, ExceptionEventTypeEnum eventType, Pageable pageable);

    Page<ExceptionLog> findByBranchIdAndCreatedAtBetween(UUID branchId, Instant from, Instant to, Pageable pageable);
}
