package cl.labtab.api.repositories;

import cl.labtab.api.models.DiningTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, UUID> {

    List<DiningTable> findByBranchId(UUID branchId);

    List<DiningTable> findByFloorIdAndBranchId(UUID floorId, UUID branchId);

    Optional<DiningTable> findByQrTokenAndBranchId(String qrToken, UUID branchId);
}
