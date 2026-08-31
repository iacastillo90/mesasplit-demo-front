package cl.labtab.api.repositories;

import cl.labtab.api.models.OrderLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderLineRepository extends JpaRepository<OrderLine, UUID> {

    List<OrderLine> findByOrderIdAndBranchId(UUID orderId, UUID branchId);

    List<OrderLine> findByOrderIdInAndBranchId(Collection<UUID> orderIds, UUID branchId);

    Optional<OrderLine> findByIdAndBranchId(UUID id, UUID branchId);
}
