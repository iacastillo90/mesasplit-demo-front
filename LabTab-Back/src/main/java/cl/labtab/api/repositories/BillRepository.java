package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.BillStatusEnum;
import cl.labtab.api.models.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByDineSessionIdAndBranchId(UUID dineSessionId, UUID branchId);

    List<Bill> findByBranchIdAndStatus(UUID branchId, BillStatusEnum status);

    Optional<Bill> findByIdAndBranchId(UUID id, UUID branchId);
}
