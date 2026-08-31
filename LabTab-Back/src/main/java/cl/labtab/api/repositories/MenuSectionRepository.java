package cl.labtab.api.repositories;

import cl.labtab.api.models.MenuSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MenuSectionRepository extends JpaRepository<MenuSection, UUID> {

    List<MenuSection> findByBranchIdOrderByDisplayOrder(UUID branchId);
}
