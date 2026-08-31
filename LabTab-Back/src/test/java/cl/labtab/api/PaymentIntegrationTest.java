package cl.labtab.api;

import cl.labtab.api.common.enums.PaymentMethodEnum;
import cl.labtab.api.dtos.request.CreatePaymentRequest;
import cl.labtab.api.exception.ConflictException;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.PaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaymentIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    PaymentService paymentService;

    @Test
    void duplicateExternalTransactionId_returnsConflict() {
        Branch branch = createBranch("A");
        Person mozo = createPerson("mozo-pay@test.cl");
        DiningTable table = createTable(branch, "qr-pay-" + System.nanoTime());
        DineSession session = createSession(branch, table, mozo);
        Bill bill = createBill(branch, session, "10000");
        BranchContextHolder.set(branch.getId());

        CreatePaymentRequest request = new CreatePaymentRequest(
                bill.getId(), new BigDecimal("5000"), BigDecimal.ZERO, new BigDecimal("5000"),
                PaymentMethodEnum.WEBPAY, "transbank", "TB-123", "CLP", null);

        paymentService.processPayment(request);

        assertThatThrownBy(() -> paymentService.processPayment(request))
                .isInstanceOf(ConflictException.class);
    }
}
