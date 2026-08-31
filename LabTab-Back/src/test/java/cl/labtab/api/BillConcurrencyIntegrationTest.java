package cl.labtab.api;

import cl.labtab.api.common.enums.PaymentMethodEnum;
import cl.labtab.api.dtos.request.CreatePaymentRequest;
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
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

class BillConcurrencyIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    PaymentService paymentService;

    @Test
    void concurrentPayments_oneSucceedsOneFails() throws Exception {
        Branch branch = createBranch("A");
        Person mozo = createPerson("mozo-conc@test.cl");
        DiningTable table = createTable(branch, "qr-conc-" + System.nanoTime());
        DineSession session = createSession(branch, table, mozo);
        Bill bill = createBill(branch, session, "10000");

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);
        List<Exception> errors = new CopyOnWriteArrayList<>();

        Callable<Void> pay = () -> {
            latch.await();
            BranchContextHolder.set(branch.getId());
            try {
                paymentService.processPayment(new CreatePaymentRequest(
                        bill.getId(), new BigDecimal("10000"), BigDecimal.ZERO, new BigDecimal("10000"),
                        PaymentMethodEnum.CASH, "manual", "TB-" + UUID.randomUUID(), "CLP", null));
            } catch (Exception e) {
                errors.add(e);
            } finally {
                BranchContextHolder.clear();
            }
            return null;
        };

        Future<Void> first = executor.submit(pay);
        Future<Void> second = executor.submit(pay);
        latch.countDown();
        first.get();
        second.get();
        executor.shutdown();
        executor.awaitTermination(15, TimeUnit.SECONDS);

        assertThat(errors).hasSize(1);
    }
}
