package cl.labtab.api.repositories;

import cl.labtab.api.models.MapZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MapZoneRepository extends JpaRepository<MapZone, UUID> {

    List<MapZone> findByFloorId(UUID floorId);
}
