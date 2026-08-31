package cl.labtab.api.repositories;

import cl.labtab.api.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByDineSessionIdAndBranchId(UUID dineSessionId, UUID branchId);

    List<Order> findByBranchId(UUID branchId);

    Optional<Order> findByIdAndBranchId(UUID id, UUID branchId);
}
