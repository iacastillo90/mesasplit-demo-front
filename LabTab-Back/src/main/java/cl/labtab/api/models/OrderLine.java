package cl.labtab.api.models;

import cl.labtab.api.common.ModifierOption;
import cl.labtab.api.common.enums.CourseStatusEnum;
import cl.labtab.api.common.enums.CourseTypeEnum;
import cl.labtab.api.common.enums.OrderLineStatusEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "order_line")
public class OrderLine extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "order_id", nullable = false)
    private UUID orderId;

    @Column(name = "branch_id", nullable = false)
    private UUID branchId;

    @Column(name = "dish_id", nullable = false)
    private UUID dishId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "item_notes")
    private String itemNotes;

    @Type(JsonType.class)
    @Column(name = "modifiers", columnDefinition = "jsonb")
    private List<ModifierOption> modifiers;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderLineStatusEnum status = OrderLineStatusEnum.QUEUED;

    @Column(name = "dine_guest_id")
    private UUID dineGuestId;

    @Column(name = "paid", nullable = false)
    private boolean paid;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_type", length = 20)
    private CourseTypeEnum courseType;

    @Enumerated(EnumType.STRING)
    @Column(name = "course_status", length = 20)
    private CourseStatusEnum courseStatus;

    public UUID getId() {
        return id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getBranchId() {
        return branchId;
    }

    public void setBranchId(UUID branchId) {
        this.branchId = branchId;
    }

    public UUID getDishId() {
        return dishId;
    }

    public void setDishId(UUID dishId) {
        this.dishId = dishId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }

    public String getItemNotes() {
        return itemNotes;
    }

    public void setItemNotes(String itemNotes) {
        this.itemNotes = itemNotes;
    }

    public List<ModifierOption> getModifiers() {
        return modifiers;
    }

    public void setModifiers(List<ModifierOption> modifiers) {
        this.modifiers = modifiers;
    }

    public OrderLineStatusEnum getStatus() {
        return status;
    }

    public void setStatus(OrderLineStatusEnum status) {
        this.status = status;
    }

    public UUID getDineGuestId() {
        return dineGuestId;
    }

    public void setDineGuestId(UUID dineGuestId) {
        this.dineGuestId = dineGuestId;
    }

    public boolean isPaid() {
        return paid;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public CourseTypeEnum getCourseType() {
        return courseType;
    }

    public void setCourseType(CourseTypeEnum courseType) {
        this.courseType = courseType;
    }

    public CourseStatusEnum getCourseStatus() {
        return courseStatus;
    }

    public void setCourseStatus(CourseStatusEnum courseStatus) {
        this.courseStatus = courseStatus;
    }
}
