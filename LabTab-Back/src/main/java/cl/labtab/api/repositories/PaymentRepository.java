package cl.labtab.api.repositories;

import cl.labtab.api.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByExternalTransactionId(String externalTransactionId);

    Optional<Payment> findByIdAndBranchId(UUID id, UUID branchId);
}
