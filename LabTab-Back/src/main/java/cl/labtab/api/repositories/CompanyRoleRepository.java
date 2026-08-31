package cl.labtab.api.repositories;

import cl.labtab.api.models.CompanyRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRoleRepository extends JpaRepository<CompanyRole, UUID> {

    Optional<CompanyRole> findByCompanyIdAndPersonId(UUID companyId, UUID personId);

    List<CompanyRole> findByPersonId(UUID personId);
}
