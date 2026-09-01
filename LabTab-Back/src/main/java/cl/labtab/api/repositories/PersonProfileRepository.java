package cl.labtab.api.repositories;

import cl.labtab.api.models.PersonProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonProfileRepository extends JpaRepository<PersonProfile, UUID> {

    Optional<PersonProfile> findByPersonId(UUID personId);

    List<PersonProfile> findAllByPersonIdIn(Collection<UUID> personIds);
}
