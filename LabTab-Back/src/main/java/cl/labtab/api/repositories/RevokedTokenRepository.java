package cl.labtab.api.repositories;

import cl.labtab.api.models.RevokedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface RevokedTokenRepository extends JpaRepository<RevokedToken, String> {

    long deleteByExpiresAtBefore(Instant before);
}
