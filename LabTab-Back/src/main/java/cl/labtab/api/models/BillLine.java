package cl.labtab.api.models;

import cl.labtab.api.common.ModifierOption;
import cl.labtab.api.common.converters.ModifierOptionListConverter;
import cl.labtab.api.common.enums.BillLineStatusEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bill_line")
public class BillLine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "bill_id", nullable = false)
    private UUID billId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "order_line_id", nullable = false)
    private UUID orderLineId;

    @Column(name = "dish_id", nullable = false)
    private UUID dishId;

    @Column(name = "dine_guest_id")
    private UUID dineGuestId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "paid_qty", nullable = false, precision = 12, scale = 4)
    private BigDecimal paidQty = BigDecimal.ZERO;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private BillLineStatusEnum status = BillLineStatusEnum.ACTIVE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Convert(converter = ModifierOptionListConverter.class)
    @Column(name = "modifiers", columnDefinition = "jsonb")
    private List<ModifierOption> modifiers = new ArrayList<>();

    @Column(name = "notes")
    private String notes;

    public UUID getId() {
        return id;
    }

    public UUID getBillId() {
        return billId;
    }

    public void setBillId(UUID billId) {
        this.billId = billId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getOrderLineId() {
        return orderLineId;
    }

    public void setOrderLineId(UUID orderLineId) {
        this.orderLineId = orderLineId;
    }

    public UUID getDishId() {
        return dishId;
    }

    public void setDishId(UUID dishId) {
        this.dishId = dishId;
    }

    public UUID getDineGuestId() {
        return dineGuestId;
    }

    public void setDineGuestId(UUID dineGuestId) {
        this.dineGuestId = dineGuestId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }

    public BigDecimal getPaidQty() {
        return paidQty;
    }

    public void setPaidQty(BigDecimal paidQty) {
        this.paidQty = paidQty;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BillLineStatusEnum getStatus() {
        return status;
    }

    public void setStatus(BillLineStatusEnum status) {
        this.status = status;
    }

    public List<ModifierOption> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<ModifierOption> modifiers) {
        this.modifiers = modifiers;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
