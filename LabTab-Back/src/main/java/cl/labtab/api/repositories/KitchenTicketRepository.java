package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.KitchenTicketStatusEnum;
import cl.labtab.api.models.KitchenTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface KitchenTicketRepository extends JpaRepository<KitchenTicket, UUID> {

    Page<KitchenTicket> findByBranchIdAndStatusIn(UUID branchId, List<KitchenTicketStatusEnum> statuses, Pageable pageable);

    Optional<KitchenTicket> findByOrderIdAndBranchId(UUID orderId, UUID branchId);

    Optional<KitchenTicket> findByIdAndBranchId(UUID id, UUID branchId);
}
