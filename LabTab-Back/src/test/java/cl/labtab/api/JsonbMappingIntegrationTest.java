package cl.labtab.api;

import cl.labtab.api.common.ModifierOption;
import cl.labtab.api.common.OpeningHoursDTO;
import cl.labtab.api.common.enums.ExceptionEventTypeEnum;
import cl.labtab.api.common.enums.PaymentMethodEnum;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.BillLine;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningFloor;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Dish;
import cl.labtab.api.models.ExceptionLog;
import cl.labtab.api.models.Order;
import cl.labtab.api.models.OrderLine;
import cl.labtab.api.models.Payment;
import cl.labtab.api.models.Person;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class JsonbMappingIntegrationTest extends AbstractIntegrationTest {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Test
    void jsonbFieldsRoundTrip() throws Exception {
        Branch branch = createBranch("JSONB");

        OpeningHoursDTO openingHours = new OpeningHoursDTO(
                Map.of("monday", new OpeningHoursDTO.DaySchedule("10:00", "23:00")));
        branch.setOpeningHours(openingHours);
        branch = branchRepository.saveAndFlush(branch);

        Branch reloadedBranch = branchRepository.findById(branch.getId()).orElseThrow();
        assertThat(reloadedBranch.getOpeningHours().days())
                .containsEntry("monday", new OpeningHoursDTO.DaySchedule("10:00", "23:00"));

        List<ModifierOption> modifiers = List.of(
                new ModifierOption("opt1", "Extra queso", new BigDecimal("500")));

        Dish dish = createDish(branch, "Pizza", "9000");
        DiningTable table = createTable(branch, "qr-jsonb-" + System.nanoTime());
        Person mozo = createPerson("jsonb-mozo-" + System.nanoTime() + "@test.cl");
        DineSession session = createSession(branch, table, mozo);

        Order order = new Order();
        order.setBranchId(branch.getId());
        order.setDineSessionId(session.getId());
        order.setPersonId(mozo.getId());
        order = orderRepository.saveAndFlush(order);

        OrderLine orderLine = new OrderLine();
        orderLine.setOrderId(order.getId());
        orderLine.setBranchId(branch.getId());
        orderLine.setDishId(dish.getId());
        orderLine.setName("Pizza");
        orderLine.setUnitPrice(new BigDecimal("9000"));
        orderLine.setQuantity(1);
        orderLine.setLineTotal(new BigDecimal("9000"));
        orderLine.setModifiers(modifiers);
        orderLine = orderLineRepository.saveAndFlush(orderLine);

        OrderLine reloadedOrderLine = orderLineRepository.findById(orderLine.getId()).orElseThrow();
        assertThat(reloadedOrderLine.getModifiers()).containsExactlyElementsOf(modifiers);

        Bill bill = createBill(branch, session, "9000");

        BillLine billLine = new BillLine();
        billLine.setBillId(bill.getId());
        billLine.setBranchId(branch.getId());
        billLine.setOrderLineId(orderLine.getId());
        billLine.setDishId(dish.getId());
        billLine.setName("Pizza");
        billLine.setQuantity(1);
        billLine.setUnitPrice(new BigDecimal("9000"));
        billLine.setLineTotal(new BigDecimal("9000"));
        billLine.setModifiers(modifiers);
        billLine = billLineRepository.saveAndFlush(billLine);

        BillLine reloadedBillLine = billLineRepository.findById(billLine.getId()).orElseThrow();
        assertThat(reloadedBillLine.getModifiers()).containsExactlyElementsOf(modifiers);

        DiningFloor floor = new DiningFloor();
        floor.setBranchId(branch.getId());
        JsonNode layout = OBJECT_MAPPER.readTree("{\"tables\":[{\"id\":\"t1\",\"x\":0,\"y\":0}]}");
        floor.setLayout(layout);
        floor = diningFloorRepository.saveAndFlush(floor);

        DiningFloor reloadedFloor = diningFloorRepository.findById(floor.getId()).orElseThrow();
        assertThat(reloadedFloor.getLayout()).isEqualTo(layout);

        Payment payment = new Payment();
        payment.setBillId(bill.getId());
        payment.setBranchId(branch.getId());
        payment.setAmount(new BigDecimal("9000"));
        payment.setTotalAmount(new BigDecimal("9000"));
        payment.setMethod(PaymentMethodEnum.WEBPAY);
        JsonNode gatewayResponse = OBJECT_MAPPER.readTree("{\"vci\":\"TSY\",\"amount\":9000}");
        payment.setGatewayResponseJson(gatewayResponse);
        payment = paymentRepository.saveAndFlush(payment);

        Payment reloadedPayment = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(reloadedPayment.getGatewayResponseJson()).isEqualTo(gatewayResponse);

        ExceptionLog log = new ExceptionLog();
        log.setBranchId(branch.getId());
        log.setEventType(ExceptionEventTypeEnum.MANUAL_DISCOUNT);
        JsonNode metadata = OBJECT_MAPPER.readTree("{\"amount\":\"100\",\"reason\":\"test\"}");
        log.setMetadata(metadata);
        log = exceptionLogRepository.saveAndFlush(log);

        ExceptionLog reloadedLog = exceptionLogRepository.findById(log.getId()).orElseThrow();
        assertThat(reloadedLog.getMetadata()).isEqualTo(metadata);
    }
}
