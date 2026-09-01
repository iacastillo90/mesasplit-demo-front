package cl.labtab.api.repositories;

import cl.labtab.api.models.BillLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillLineRepository extends JpaRepository<BillLine, UUID> {

    List<BillLine> findByBillIdAndBranchId(UUID billId, UUID branchId);
}
