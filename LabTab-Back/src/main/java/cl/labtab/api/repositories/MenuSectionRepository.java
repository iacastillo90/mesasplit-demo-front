package cl.labtab.api.repositories;

import cl.labtab.api.models.MenuSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuSectionRepository extends JpaRepository<MenuSection, UUID> {

    List<MenuSection> findByBranchIdOrderByDisplayOrder(UUID branchId);

    Optional<MenuSection> findByIdAndBranchId(UUID id, UUID branchId);
}
