package cl.labtab.api.models;

import cl.labtab.api.common.OpeningHoursDTO;
import cl.labtab.api.common.converters.OpeningHoursConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "branch")
public class Branch extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_id", nullable = false)
    private UUID companyId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "city", length = 100)
    private String city = "Santiago";

    @Column(name = "address")
    private String address;

    @Column(name = "phone", length = 50)
    private String phone;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "cuisine_tags", columnDefinition = "text[]")
    private List<String> cuisineTags;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "service_charge_pct", nullable = false, precision = 12, scale = 2)
    private BigDecimal serviceChargePct = new BigDecimal("10.00");

    @Column(name = "timezone", length = 50)
    private String timezone = "America/Santiago";

    @JdbcTypeCode(SqlTypes.JSON)
    @Convert(converter = OpeningHoursConverter.class)
    @Column(name = "opening_hours", columnDefinition = "jsonb")
    private OpeningHoursDTO openingHours;

    @Column(name = "table_grid_rows", nullable = false)
    private int tableGridRows = 4;

    @Column(name = "table_grid_cols", nullable = false)
    private int tableGridCols = 4;

    public UUID getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public void setCompanyId(UUID companyId) {
        this.companyId = companyId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public List<String> getCuisineTags() {
        return cuisineTags;
    }

    public void setCuisineTags(List<String> cuisineTags) {
        this.cuisineTags = cuisineTags;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public BigDecimal getServiceChargePct() {
        return serviceChargePct;
    }

    public void setServiceChargePct(BigDecimal serviceChargePct) {
        this.serviceChargePct = serviceChargePct;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public OpeningHoursDTO getOpeningHours() {
        return openingHours;
    }

    public void setOpeningHours(OpeningHoursDTO openingHours) {
        this.openingHours = openingHours;
    }

    public int getTableGridRows() {
        return tableGridRows;
    }

    public void setTableGridRows(int tableGridRows) {
        this.tableGridRows = tableGridRows;
    }

    public int getTableGridCols() {
        return tableGridCols;
    }

    public void setTableGridCols(int tableGridCols) {
        this.tableGridCols = tableGridCols;
    }
}
