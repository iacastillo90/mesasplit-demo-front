package cl.labtab.api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "dine_guest")
public class DineGuest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "dine_session_id", nullable = false)
    private UUID dineSessionId;

    @Column(name = "person_id")
    private UUID personId;

    @Column(name = "display_name", length = 255)
    private String displayName;

    @Column(name = "temp_label", length = 100)
    private String tempLabel;

    @Column(name = "merged_into_id")
    private UUID mergedIntoId;

    @Column(name = "joined_at", nullable = false)
    private Instant joinedAt = Instant.now();

    @Column(name = "left_at")
    private Instant leftAt;

    public UUID getId() {
        return id;
    }

    public UUID getDineSessionId() {
        return dineSessionId;
    }

    public void setDineSessionId(UUID dineSessionId) {
        this.dineSessionId = dineSessionId;
    }

    public UUID getPersonId() {
        return personId;
    }

    public void setPersonId(UUID personId) {
        this.personId = personId;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getTempLabel() {
        return tempLabel;
    }

    public void setTempLabel(String tempLabel) {
        this.tempLabel = tempLabel;
    }

    public UUID getMergedIntoId() {
        return mergedIntoId;
    }

    public void setMergedIntoId(UUID mergedIntoId) {
        this.mergedIntoId = mergedIntoId;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }

    public Instant getLeftAt() {
        return leftAt;
    }

    public void setLeftAt(Instant leftAt) {
        this.leftAt = leftAt;
    }
}
