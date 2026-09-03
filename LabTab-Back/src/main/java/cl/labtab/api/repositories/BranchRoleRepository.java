package cl.labtab.api.repositories;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.models.BranchRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BranchRoleRepository extends JpaRepository<BranchRole, UUID> {

    List<BranchRole> findByBranchIdAndRole(UUID branchId, BranchRoleEnum role);

    List<BranchRole> findByPersonId(UUID personId);
}
