package cl.labtab.api;

import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.common.enums.OrderLineStatusEnum;
import cl.labtab.api.common.enums.OrderStatusEnum;
import cl.labtab.api.dtos.request.VoidOrderLineRequest;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.ExceptionLog;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class VoidOrderLineAuditIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    OrderService orderService;

    @Test
    void queuedLine_void_recordsPreKitchenEvent() {
        Branch branch = createBranch("C");
        Person mozo = createPerson("mozo-void@test.cl");
        DiningTable table = createTable(branch, "qr-void-" + System.nanoTime());
        DineSession session = createSession(branch, table, mozo);
        Dish dish = createDish(branch, "Plato", "5000");

        Order order = new Order();
        order.setBranchId(branch.getId());
        order.setDineSessionId(session.getId());
        order.setPersonId(mozo.getId());
        order.setStatus(OrderStatusEnum.PLACED);
        orderRepository.save(order);

        OrderLine line = new OrderLine();
        line.setOrderId(order.getId());
        line.setBranchId(branch.getId());
        line.setDishId(dish.getId());
        line.setName("Plato");
        line.setUnitPrice(new BigDecimal("5000"));
        line.setQuantity(1);
        line.setLineTotal(new BigDecimal("5000"));
        line.setStatus(OrderLineStatusEnum.QUEUED);
        orderLineRepository.save(line);

        BranchContextHolder.set(branch.getId());

        orderService.voidOrderLine(line.getId(), new VoidOrderLineRequest("Cortesía", "1234"));

        List<ExceptionLog> logs = exceptionLogRepository.findAll();
        assertThat(logs).extracting(ExceptionLog::getEventType)
                .containsExactly(ExceptionEventTypeEnum.ITEM_VOID_PRE_KITCHEN);
    }
}
