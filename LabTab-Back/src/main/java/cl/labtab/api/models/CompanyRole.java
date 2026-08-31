package cl.labtab.api.models;

import cl.labtab.api.common.enums.CompanyRoleEnum;
import cl.labtab.api.common.enums.CompanyRoleStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "company_role")
public class CompanyRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "person_id", nullable = false)
    private UUID personId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private CompanyRoleEnum role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private CompanyRoleStatusEnum status = CompanyRoleStatusEnum.INVITED;

    public UUID getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public UUID getPersonId() {
        return personId;
    }

    public void setPersonId(UUID personId) {
        this.personId = personId;
    }

    public CompanyRoleEnum getRole() {
        return role;
    }

    public void setRole(CompanyRoleEnum role) {
        this.role = role;
    }

    public CompanyRoleStatusEnum getStatus() {
        return status;
    }

    public void setStatus(CompanyRoleStatusEnum status) {
        this.status = status;
    }
}
