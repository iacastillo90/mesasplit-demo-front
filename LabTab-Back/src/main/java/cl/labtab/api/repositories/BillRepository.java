package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.models.Bill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByDineSessionIdAndBranchId(UUID dineSessionId, UUID branchId);

    Page<Bill> findByBranchIdAndStatus(UUID branchId, BillStatusEnum status, Pageable pageable);

    Optional<Bill> findByIdAndBranchId(UUID id, UUID branchId);
}
