package cl.labtab.api;

import cl.labtab.api.dtos.request.ApplyDiscountRequest;
import cl.labtab.api.models.Bill;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.BillService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class AuditAspectIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    BillService billService;

    @Test
    void applyDiscount_generatesExceptionLog() {
        Branch branch = createBranch("A");
        Person manager = createPerson("manager-audit@test.cl");
        createManager(branch, manager, "1234");
        Person mozo = createPerson("mozo-audit@test.cl");
        DiningTable table = createTable(branch, "qr-audit-" + System.nanoTime());
        DineSession session = createSession(branch, table, mozo);
        Bill bill = createBill(branch, session, "10000");
        BranchContextHolder.set(branch.getId());

        billService.applyDiscount(bill.getId(), new ApplyDiscountRequest(new BigDecimal("1000"), "Cortesía", "1234"));

        assertThat(exceptionLogRepository.count()).isGreaterThanOrEqualTo(1);
    }
}
