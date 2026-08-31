package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.models.KitchenTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KitchenTicketRepository extends JpaRepository<KitchenTicket, UUID> {

    List<KitchenTicket> findByBranchIdAndStatusIn(UUID branchId, Collection<KitchenTicketStatusEnum> statuses);

    Optional<KitchenTicket> findByOrderIdAndBranchId(UUID orderId, UUID branchId);

    Optional<KitchenTicket> findByIdAndBranchId(UUID id, UUID branchId);
}
