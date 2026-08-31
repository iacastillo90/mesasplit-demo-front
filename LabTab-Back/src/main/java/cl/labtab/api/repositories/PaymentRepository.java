package cl.labtab.api.repositories;

import cl.labtab.api.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByExternalTransactionId(String externalTransactionId);

    List<Payment> findByBillIdAndBranchId(UUID billId, UUID branchId);

    Optional<Payment> findByIdAndBranchId(UUID id, UUID branchId);
}
