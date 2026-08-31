package cl.labtab.api.repositories;

import cl.labtab.api.models.DiningFloor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DiningFloorRepository extends JpaRepository<DiningFloor, UUID> {

    List<DiningFloor> findByBranchIdOrderByDisplayOrder(UUID branchId);
}
