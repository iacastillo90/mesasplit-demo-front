package cl.labtab.api.repositories;

import cl.labtab.api.models.Dish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DishRepository extends JpaRepository<Dish, UUID> {

    List<Dish> findByBranchIdAndAvailableTrueOrderByDisplayOrder(UUID branchId);

    List<Dish> findBySectionIdAndBranchIdOrderByDisplayOrder(UUID sectionId, UUID branchId);

    Optional<Dish> findByIdAndBranchId(UUID id, UUID branchId);
}
