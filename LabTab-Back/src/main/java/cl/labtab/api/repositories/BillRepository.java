package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.models.Bill;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByDineSessionIdAndBranchId(UUID dineSessionId, UUID branchId);

    List<Bill> findByBranchIdAndStatus(UUID branchId, BillStatusEnum status);

    Optional<Bill> findByIdAndBranchId(UUID id, UUID branchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.id = :id AND b.branchId = :branchId")
    Optional<Bill> findByIdAndBranchIdForUpdate(@Param("id") UUID id, @Param("branchId") UUID branchId);
}
