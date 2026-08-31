package cl.labtab.api.models;

import cl.labtab.api.common.enums.BranchRoleEnum;
import cl.labtab.api.common.enums.BranchRoleStatusEnum;
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
@Table(name = "branch_role")
public class BranchRole extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "person_id", nullable = false)
    private UUID personId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private BranchRoleEnum role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private BranchRoleStatusEnum status = BranchRoleStatusEnum.ACTIVE;

    @Column(name = "pin_code", length = 60)
    private String pinCode;

    public UUID getId() {
        return id;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getPersonId() {
        return personId;
    }

    public void setPersonId(UUID personId) {
        this.personId = personId;
    }

    public BranchRoleEnum getRole() {
        return role;
    }

    public void setRole(BranchRoleEnum role) {
        this.role = role;
    }

    public BranchRoleStatusEnum getStatus() {
        return status;
    }

    public void setStatus(BranchRoleStatusEnum status) {
        this.status = status;
    }

    public String getPinCode() {
        return pinCode;
    }

    public void setPinCode(String pinCode) {
        this.pinCode = pinCode;
    }
}
