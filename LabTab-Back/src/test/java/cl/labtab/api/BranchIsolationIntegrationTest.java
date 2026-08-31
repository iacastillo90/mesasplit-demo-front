package cl.labtab.api;

import cl.labtab.api.exception.ResourceNotFoundException;
import cl.labtab.api.models.Branch;
import cl.labtab.api.models.DineSession;
import cl.labtab.api.models.DiningTable;
import cl.labtab.api.models.Person;
import cl.labtab.api.security.BranchContextHolder;
import cl.labtab.api.services.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BranchIsolationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    SessionService sessionService;

    @Test
    void userCannotAccessSessionFromAnotherBranch() {
        Branch branchA = createBranch("A");
        Branch branchB = createBranch("B");
        Person mozo = createPerson("mozo-a@test.cl");
        DiningTable tableA = createTable(branchA, "qr-a-" + System.nanoTime());
        DineSession sessionA = createSession(branchA, tableA, mozo);

        BranchContextHolder.set(branchB.getId());

        assertThatThrownBy(() -> sessionService.getSession(sessionA.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
