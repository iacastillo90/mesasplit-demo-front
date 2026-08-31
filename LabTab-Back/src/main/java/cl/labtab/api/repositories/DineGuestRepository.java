package cl.labtab.api.repositories;

import cl.labtab.api.models.DineGuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DineGuestRepository extends JpaRepository<DineGuest, UUID> {

    List<DineGuest> findByDineSessionId(UUID dineSessionId);

    long countByDineSessionId(UUID dineSessionId);
}
