package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.DineSessionStatusEnum;
import cl.labtab.api.models.DineSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DineSessionRepository extends JpaRepository<DineSession, UUID> {

    Optional<DineSession> findByTableIdAndStatus(UUID tableId, DineSessionStatusEnum status);

    List<DineSession> findByBranchIdAndStatus(UUID branchId, DineSessionStatusEnum status);

    Optional<DineSession> findByIdAndBranchId(UUID id, UUID branchId);
}
